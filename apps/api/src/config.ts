export interface AppConfig {
  host: string;
  port: number;
  databaseUrl: string;
  nodeEnv: string;
}

/** API runtime only (server.ts). Never read by migrate-cli.ts or
 * seed-cli.ts -- see ADR-0005-least-privilege-database-boundary.md. */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const databaseUrl = env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('Missing required environment variable: DATABASE_URL');
  }
  return {
    host: env.HOST ?? '127.0.0.1',
    port: Number(env.PORT ?? 3001),
    databaseUrl,
    nodeEnv: env.NODE_ENV ?? 'development'
  };
}

/** migrate-cli.ts only. No fallback to DATABASE_URL: a missing dedicated
 * migration connection string is a configuration error, never silently
 * resolved by reusing the less-restricted API runtime connection. */
export function loadMigrationDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const databaseUrl = env.LEASEMIND_MIGRATION_DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('Missing required environment variable: LEASEMIND_MIGRATION_DATABASE_URL');
  }
  return databaseUrl;
}

/** seed-cli.ts (and any future rebuild CLI) only. No fallback to
 * DATABASE_URL, for the same reason as loadMigrationDatabaseUrl. */
export function loadMaintenanceDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const databaseUrl = env.LEASEMIND_MAINTENANCE_DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('Missing required environment variable: LEASEMIND_MAINTENANCE_DATABASE_URL');
  }
  return databaseUrl;
}

/** server.ts's Campaign creation command path only (apps/api/src/db/
 * createCampaign.ts) -- never the read-only DATABASE_URL pool, never
 * migrator/maintainer/bootstrap. No fallback to DATABASE_URL, for the same
 * reason as loadMigrationDatabaseUrl. See
 * ADR-0007-synthetic-campaign-creation-command-boundary.md. */
export function loadCommandDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const databaseUrl = env.LEASEMIND_COMMAND_DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('Missing required environment variable: LEASEMIND_COMMAND_DATABASE_URL');
  }
  return databaseUrl;
}

/** server.ts's Technical Assignment draft-save command path only
 * (apps/api/src/db/technicalAssignment.ts) -- the only pool with any
 * access to the protected address table. Never the read-only DATABASE_URL
 * pool, never migrator/maintainer/bootstrap/campaign-writer. No fallback
 * to DATABASE_URL, for the same reason as loadMigrationDatabaseUrl. See
 * ADR-0008-technical-assignment-implementation.md. */
export function loadTechnicalAssignmentDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const databaseUrl = env.LEASEMIND_TECHNICAL_ASSIGNMENT_DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('Missing required environment variable: LEASEMIND_TECHNICAL_ASSIGNMENT_DATABASE_URL');
  }
  return databaseUrl;
}
