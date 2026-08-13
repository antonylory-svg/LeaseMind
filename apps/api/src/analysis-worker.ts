import { randomUUID } from 'node:crypto';
import { loadAnalysisWorkerDatabaseUrl } from './config.js';
import { createPool } from './db.js';
import {
  DATABASE_PRIVILEGE_VIOLATION_CODE,
  DatabasePrivilegeViolation,
  verifyRuntimeAnalysisWorkerPrivileges
} from './dbPrivilegePolicy.js';
import { runPostLaunchRefreshWorkerCycle } from './db/postLaunchRefreshWorker.js';
import { enforceRuntimeSafetyGate, RuntimeSafetyViolation } from './runtimePolicy.js';

const POLL_INTERVAL_MS = 1_000;
const WORKER_STARTUP_ERROR_CODE = 'ANALYSIS_WORKER_STARTUP_FAILED';
const WORKER_CYCLE_ERROR_CODE = 'ANALYSIS_WORKER_CYCLE_FAILED';

type SafeWorkerEvent =
  | { event: string }
  | { event: string; safe_error_code: string }
  | {
      event: string;
      claimed: number;
      completed: number;
      failed: number;
      sla_breaches_marked: number;
    };

function logWorkerEvent(write: (line: string) => void, event: SafeWorkerEvent): void {
  write(JSON.stringify(event));
}

function delay(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function main(): Promise<void> {
  try {
    enforceRuntimeSafetyGate();
  } catch (error) {
    logWorkerEvent(line => console.error(line), {
      event: 'analysis_worker_startup_refused',
      safe_error_code: error instanceof RuntimeSafetyViolation
        ? error.message
        : 'RUNTIME_SAFETY_VIOLATION'
    });
    process.exit(1);
  }

  let databaseUrl: string;
  try {
    databaseUrl = loadAnalysisWorkerDatabaseUrl();
  } catch {
    logWorkerEvent(line => console.error(line), {
      event: 'analysis_worker_startup_refused',
      safe_error_code: WORKER_STARTUP_ERROR_CODE
    });
    process.exit(1);
  }

  const pool = createPool(databaseUrl);
  try {
    await verifyRuntimeAnalysisWorkerPrivileges(pool);
  } catch (error) {
    logWorkerEvent(line => console.error(line), {
      event: 'analysis_worker_startup_refused',
      safe_error_code: error instanceof DatabasePrivilegeViolation
        ? error.message
        : DATABASE_PRIVILEGE_VIOLATION_CODE
    });
    await pool.end().catch(() => {});
    process.exit(1);
  }

  const workerId = `analysis-worker:${randomUUID()}`;
  let shuttingDown = false;
  const requestShutdown = (signal: 'SIGINT' | 'SIGTERM'): void => {
    if (shuttingDown) return;
    shuttingDown = true;
    logWorkerEvent(line => console.log(line), {
      event: signal === 'SIGINT'
        ? 'analysis_worker_shutdown_initiated_sigint'
        : 'analysis_worker_shutdown_initiated_sigterm'
    });
  };
  process.on('SIGINT', () => requestShutdown('SIGINT'));
  process.on('SIGTERM', () => requestShutdown('SIGTERM'));
  logWorkerEvent(line => console.log(line), { event: 'analysis_worker_started' });

  while (!shuttingDown) {
    try {
      const result = await runPostLaunchRefreshWorkerCycle(pool, workerId);
      if (result.claimed > 0) {
        logWorkerEvent(line => console.log(line), {
          event: 'analysis_worker_cycle_completed',
          claimed: result.claimed,
          completed: result.completed,
          failed: result.failed,
          sla_breaches_marked: result.slaBreachesMarked
        });
      }
    } catch {
      logWorkerEvent(line => console.error(line), {
        event: 'analysis_worker_cycle_failed',
        safe_error_code: WORKER_CYCLE_ERROR_CODE
      });
    }
    if (!shuttingDown) await delay(POLL_INTERVAL_MS);
  }

  try {
    await pool.end();
    logWorkerEvent(line => console.log(line), { event: 'analysis_worker_shutdown_completed' });
  } catch {
    logWorkerEvent(line => console.error(line), {
      event: 'analysis_worker_shutdown_failed',
      safe_error_code: WORKER_CYCLE_ERROR_CODE
    });
    process.exit(1);
  }
}

void main();
