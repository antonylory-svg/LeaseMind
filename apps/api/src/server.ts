import { loadConfig, loadCommandDatabaseUrl, loadTechnicalAssignmentDatabaseUrl } from './config.js';
import { createPool } from './db.js';
import { buildApp } from './app.js';
import { enforceRuntimeSafetyGate, RuntimeSafetyViolation } from './runtimePolicy.js';
import {
  verifyRuntimeDatabasePrivileges,
  verifyRuntimeCommandPrivileges,
  verifyRuntimeTechnicalAssignmentPrivileges,
  DatabasePrivilegeViolation,
  DATABASE_PRIVILEGE_VIOLATION_CODE
} from './dbPrivilegePolicy.js';

// Structured JSON for the pre-Fastify lifecycle, before the allowlisted,
// server-owned-request-id logger (apps/api/src/observability/logging.ts)
// exists. Always exactly { event, safe_error_code? } -- never a raw error,
// DATABASE_URL, password or stack trace. See
// 03_ARCHITECTURE/decisions/ADR-0006-secure-application-observability-boundary.md.
function logStartupEvent(write: (line: string) => void, event: string, safeErrorCode?: string): void {
  write(JSON.stringify(safeErrorCode ? { event, safe_error_code: safeErrorCode } : { event }));
}

async function main(): Promise<void> {
  try {
    enforceRuntimeSafetyGate();
  } catch (error) {
    // Never touch app.log here: the Fastify instance does not exist yet,
    // and this must run before any PostgreSQL connection or port bind.
    logStartupEvent(
      line => console.error(line),
      'startup_refused',
      error instanceof RuntimeSafetyViolation ? error.message : 'RUNTIME_SAFETY_VIOLATION'
    );
    process.exit(1);
  }

  const config = loadConfig();
  const commandDatabaseUrl = loadCommandDatabaseUrl();
  const technicalAssignmentDatabaseUrl = loadTechnicalAssignmentDatabaseUrl();
  const pool = createPool(config.databaseUrl);
  const commandPool = createPool(commandDatabaseUrl);
  const technicalAssignmentPool = createPool(technicalAssignmentDatabaseUrl);

  try {
    await verifyRuntimeDatabasePrivileges(pool);
    await verifyRuntimeCommandPrivileges(commandPool);
    await verifyRuntimeTechnicalAssignmentPrivileges(technicalAssignmentPool);
  } catch (error) {
    // Never log the pool, config or the underlying error: only the stable
    // code is safe to print. The port must never open after this point.
    logStartupEvent(
      line => console.error(line),
      'startup_refused',
      error instanceof DatabasePrivilegeViolation ? error.message : DATABASE_PRIVILEGE_VIOLATION_CODE
    );
    await pool.end().catch(() => {});
    await commandPool.end().catch(() => {});
    await technicalAssignmentPool.end().catch(() => {});
    process.exit(1);
  }

  const app = buildApp({ pool, commandPool, technicalAssignmentPool });

  let shuttingDown = false;
  const shutdown = (signal: 'SIGINT' | 'SIGTERM'): void => {
    if (shuttingDown) return;
    shuttingDown = true;
    app.log.info({ event: signal === 'SIGINT' ? 'shutdown_initiated_sigint' : 'shutdown_initiated_sigterm' });
    app
      .close()
      .then(() => {
        app.log.info({ event: 'shutdown_completed' });
        process.exit(0);
      })
      .catch(() => {
        app.log.error({ event: 'shutdown_failed' });
        process.exit(1);
      });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  try {
    // Fastify's own listen() unconditionally logs "Server listening at
    // <address>" as a raw string (app.log.info(text) inside
    // fastify/lib/server.js), bypassing SafeLogController entirely since
    // it isn't one of the LogController hook methods. listenTextResolver
    // is the only public override point for that call; returning undefined
    // makes pino emit no msg field at all (msg === undefined is skipped),
    // so no unlisted field reaches stdout. The event line right after is
    // this app's own, allowlisted replacement.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await app.listen({ host: config.host, port: config.port, listenTextResolver: (() => undefined) as any });
    app.log.info({ event: 'server_started' });
  } catch {
    app.log.error({ event: 'listen_failed' });
    process.exit(1);
  }
}

void main();
