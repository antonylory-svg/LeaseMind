// Shared test-only connection strings, mirroring the four-identity model in
// 03_ARCHITECTURE/decisions/ADR-0005-least-privilege-database-boundary.md.
// Never used by application code -- tests only.

export const MIGRATION_DATABASE_URL = process.env.LEASEMIND_MIGRATION_DATABASE_URL;
export const MAINTENANCE_DATABASE_URL = process.env.LEASEMIND_MAINTENANCE_DATABASE_URL;
export const API_DATABASE_URL = process.env.DATABASE_URL;
export const COMMAND_DATABASE_URL = process.env.LEASEMIND_COMMAND_DATABASE_URL;
export const TA_DATABASE_URL = process.env.LEASEMIND_TECHNICAL_ASSIGNMENT_DATABASE_URL;
export const BOOTSTRAP_DATABASE_URL = process.env.LEASEMIND_BOOTSTRAP_DATABASE_URL;

/** True only when all six connection strings are configured -- the same
 * disposable-database precondition every DB-dependent test in this suite
 * already gates on via {skip: !hasDatabase}. */
export const hasDatabase = Boolean(
  MIGRATION_DATABASE_URL &&
    MAINTENANCE_DATABASE_URL &&
    API_DATABASE_URL &&
    COMMAND_DATABASE_URL &&
    TA_DATABASE_URL &&
    BOOTSTRAP_DATABASE_URL
);
