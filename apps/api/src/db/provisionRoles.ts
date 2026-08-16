import type pg from 'pg';

// Fixed, non-configurable role names -- never derived from untrusted input.
// See 03_ARCHITECTURE/decisions/ADR-0005-least-privilege-database-boundary.md
// and ADR-0007-synthetic-campaign-creation-command-boundary.md.
export const MIGRATOR_ROLE = 'lmapp_migrator';
export const MAINTAINER_ROLE = 'lmapp_maintainer';
export const API_READER_ROLE = 'lmapp_api_reader';
export const CAMPAIGN_WRITER_ROLE = 'lmapp_campaign_writer';
export const TA_WRITER_ROLE = 'lmapp_ta_writer';
export const ANALYSIS_WRITER_ROLE = 'lmapp_analysis_writer';
export const ANALYSIS_WORKER_ROLE = 'lmapp_analysis_worker';
export const EVIDENCE_REVOCATION_WRITER_ROLE = 'lmapp_evidence_revocation_writer';
export const POST_LAUNCH_REFRESH_OWNER_ROLE = 'lmapp_post_launch_refresh_owner';
export const CAMPAIGN_OUTCOME_WRITER_ROLE = 'lmapp_campaign_outcome_writer';

export interface ProvisionRolesInput {
  migratorPassword: string;
  maintainerPassword: string;
  apiReaderPassword: string;
  campaignWriterPassword: string;
  taWriterPassword: string;
  analysisWriterPassword: string;
  analysisWorkerPassword: string;
  evidenceRevocationWriterPassword: string;
  campaignOutcomeWriterPassword: string;
}

export interface ProvisionRolesResult {
  provisioned: string[];
}

/** Escapes a string for use as a single-quoted SQL literal. The values
 * passed here always originate from our own environment variables (never
 * end-user input), but this is applied regardless as standard practice. */
function quoteLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

/** roleName is always one of the fixed constants above -- never
 * derived from untrusted input -- so direct identifier interpolation here
 * carries no injection risk. */
async function ensureRoleExists(client: pg.PoolClient, roleName: string): Promise<void> {
  const existing = await client.query('SELECT 1 FROM pg_roles WHERE rolname = $1', [roleName]);
  if (existing.rowCount === 0) {
    await client.query(`CREATE ROLE ${roleName}`);
  }
}

/**
 * Idempotently provisions the nine fixed, least-privilege LOGIN roles
 * and the bootstrap-owned NOLOGIN role required by ADR-0009.
 * Must be run via a bootstrap/admin connection (LEASEMIND_BOOTSTRAP_DATABASE_URL)
 * -- never via the application's own DATABASE_URL/migration/maintenance
 * connections. Every run resets dangerous role attributes unconditionally,
 * so re-running is always safe and converges to the same state. Passwords
 * are never logged, never written to a file, and never appear in any
 * thrown error.
 */
export async function provisionRoles(pool: pg.Pool, input: ProvisionRolesInput): Promise<ProvisionRolesResult> {
  const roles: Array<{ name: string; password: string }> = [
    { name: MIGRATOR_ROLE, password: input.migratorPassword },
    { name: MAINTAINER_ROLE, password: input.maintainerPassword },
    { name: API_READER_ROLE, password: input.apiReaderPassword },
    { name: CAMPAIGN_WRITER_ROLE, password: input.campaignWriterPassword },
    { name: TA_WRITER_ROLE, password: input.taWriterPassword },
    { name: ANALYSIS_WRITER_ROLE, password: input.analysisWriterPassword },
    { name: ANALYSIS_WORKER_ROLE, password: input.analysisWorkerPassword },
    { name: EVIDENCE_REVOCATION_WRITER_ROLE, password: input.evidenceRevocationWriterPassword },
    { name: CAMPAIGN_OUTCOME_WRITER_ROLE, password: input.campaignOutcomeWriterPassword }
  ];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const role of roles) {
      await ensureRoleExists(client, role.name);
      // Unconditional reset on every run: LOGIN + password always current,
      // every dangerous attribute always explicitly off, no privilege
      // inheritance from any role membership.
      await client.query(
        `ALTER ROLE ${role.name}
           WITH LOGIN
           PASSWORD ${quoteLiteral(role.password)}
           NOSUPERUSER
           NOCREATEDB
           NOCREATEROLE
           NOREPLICATION
           NOBYPASSRLS
           NOINHERIT`
      );
    }

    // Owns the durable post-launch-refresh state machine and its SECURITY
    // DEFINER functions. It never participates in the password/LOGIN cycle
    // above and never receives CONNECT. Re-provisioning resets every
    // dangerous attribute and clears any historical password.
    await ensureRoleExists(client, POST_LAUNCH_REFRESH_OWNER_ROLE);
    await client.query(
      `ALTER ROLE ${POST_LAUNCH_REFRESH_OWNER_ROLE}
         WITH NOLOGIN
         PASSWORD NULL
         NOSUPERUSER
         NOCREATEDB
         NOCREATEROLE
         NOREPLICATION
         NOBYPASSRLS
         NOINHERIT`
    );

    // PostgreSQL 16+ stores ADMIN/INHERIT/SET as independent membership
    // options. Separate GRANT statements converge an existing membership
    // to the exact fail-closed contract required by migration 009.
    await client.query(`GRANT ${POST_LAUNCH_REFRESH_OWNER_ROLE} TO ${MIGRATOR_ROLE} WITH ADMIN FALSE`);
    await client.query(`GRANT ${POST_LAUNCH_REFRESH_OWNER_ROLE} TO ${MIGRATOR_ROLE} WITH INHERIT FALSE`);
    await client.query(`GRANT ${POST_LAUNCH_REFRESH_OWNER_ROLE} TO ${MIGRATOR_ROLE} WITH SET TRUE`);

    // Allow-list CONNECT: PUBLIC loses every database-level default
    // (CONNECT, TEMP, CREATE); only the nine LOGIN roles get CONNECT back,
    // and only lmapp_migrator additionally gets CREATE (needed once, to
    // create the leasemind_app schema the first time migrate:up runs).
    // GRANT/REVOKE ON DATABASE requires an identifier, not an expression --
    // current_database() is resolved first and quoted as an identifier.
    const dbNameResult = await client.query<{ current_database: string }>('SELECT current_database()');
    const dbIdent = `"${dbNameResult.rows[0].current_database.replace(/"/g, '""')}"`;

    await client.query(`REVOKE CONNECT, TEMP, CREATE ON DATABASE ${dbIdent} FROM PUBLIC`);
    for (const role of roles) {
      await client.query(`GRANT CONNECT ON DATABASE ${dbIdent} TO ${role.name}`);
    }
    await client.query(`GRANT CREATE ON DATABASE ${dbIdent} TO ${MIGRATOR_ROLE}`);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }

  return { provisioned: [...roles.map(r => r.name), POST_LAUNCH_REFRESH_OWNER_ROLE] };
}
