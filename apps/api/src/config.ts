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
