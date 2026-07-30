import { loadConfig } from './config.js';
import { createPool } from './db.js';
import { buildApp } from './app.js';
import { enforceRuntimeSafetyGate, RuntimeSafetyViolation } from './runtimePolicy.js';
import { verifyRuntimeDatabasePrivileges, DatabasePrivilegeViolation, DATABASE_PRIVILEGE_VIOLATION_CODE } from './dbPrivilegePolicy.js';

async function main(): Promise<void> {
  try {
    enforceRuntimeSafetyGate();
  } catch (error) {
    // Never touch app.log here: the Fastify instance does not exist yet,
    // and this must run before any PostgreSQL connection or port bind.
    console.error(error instanceof RuntimeSafetyViolation ? error.message : 'runtime safety gate violation');
    process.exit(1);
  }

  const config = loadConfig();
  const pool = createPool(config.databaseUrl);

  try {
    await verifyRuntimeDatabasePrivileges(pool);
  } catch (error) {
    // Never log the pool, config or the underlying error: only the stable
    // code is safe to print. The port must never open after this point.
    console.error(error instanceof DatabasePrivilegeViolation ? error.message : DATABASE_PRIVILEGE_VIOLATION_CODE);
    await pool.end().catch(() => {});
    process.exit(1);
  }

  const app = buildApp({ pool });

  let shuttingDown = false;
  const shutdown = (signal: string): void => {
    if (shuttingDown) return;
    shuttingDown = true;
    app.log.info(`received ${signal}, shutting down`);
    app
      .close()
      .then(() => process.exit(0))
      .catch(() => {
        app.log.error('error during graceful shutdown');
        process.exit(1);
      });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  try {
    await app.listen({ host: config.host, port: config.port });
  } catch {
    app.log.error('failed to start server');
    process.exit(1);
  }
}

void main();
