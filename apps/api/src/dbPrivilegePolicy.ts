import type pg from 'pg';
import { MIGRATOR_ROLE, MAINTAINER_ROLE } from './db/provisionRoles.js';

// Pre-launch database-boundary gate. See
// 03_ARCHITECTURE/decisions/ADR-0005-least-privilege-database-boundary.md.
//
// Runs once at startup, after createPool() and before app.listen(). Fails
// closed: any error while evaluating privileges is itself treated as a
// violation, never as a silent pass. The thrown message is always the
// single stable code below -- never the underlying error, the connection
// string, username, password or a stack trace.

export const DATABASE_PRIVILEGE_VIOLATION_CODE = 'DATABASE_PRIVILEGE_VIOLATION';

export class DatabasePrivilegeViolation extends Error {
  constructor() {
    super(DATABASE_PRIVILEGE_VIOLATION_CODE);
    this.name = 'DatabasePrivilegeViolation';
  }
}

interface PrivilegeCheckRow {
  rolsuper: boolean;
  rolcreatedb: boolean;
  rolcreaterole: boolean;
  rolreplication: boolean;
  rolbypassrls: boolean;
  can_create_on_database: boolean;
  can_create_temp: boolean;
  can_create_in_schema: boolean;
  can_select_projection: boolean;
  can_write_projection: boolean;
  can_access_event_log: boolean;
  can_access_stream_head: boolean;
  can_access_ledger: boolean;
  is_member_of_migrator: boolean;
  is_member_of_maintainer: boolean;
}

const PRIVILEGE_CHECK_QUERY = `
  SELECT
    r.rolsuper,
    r.rolcreatedb,
    r.rolcreaterole,
    r.rolreplication,
    r.rolbypassrls,
    has_database_privilege(current_database(), 'CREATE') AS can_create_on_database,
    has_database_privilege(current_database(), 'TEMP') AS can_create_temp,
    has_schema_privilege('leasemind_app', 'CREATE') AS can_create_in_schema,
    has_table_privilege('leasemind_app.campaign_current_state_projection', 'SELECT') AS can_select_projection,
    (
      has_table_privilege('leasemind_app.campaign_current_state_projection', 'INSERT')
      OR has_table_privilege('leasemind_app.campaign_current_state_projection', 'UPDATE')
      OR has_table_privilege('leasemind_app.campaign_current_state_projection', 'DELETE')
      OR has_table_privilege('leasemind_app.campaign_current_state_projection', 'TRUNCATE')
    ) AS can_write_projection,
    (
      has_table_privilege('leasemind_app.campaign_event_log', 'SELECT')
      OR has_table_privilege('leasemind_app.campaign_event_log', 'INSERT')
      OR has_table_privilege('leasemind_app.campaign_event_log', 'UPDATE')
      OR has_table_privilege('leasemind_app.campaign_event_log', 'DELETE')
    ) AS can_access_event_log,
    (
      has_table_privilege('leasemind_app.campaign_stream_head', 'SELECT')
      OR has_table_privilege('leasemind_app.campaign_stream_head', 'INSERT')
      OR has_table_privilege('leasemind_app.campaign_stream_head', 'UPDATE')
      OR has_table_privilege('leasemind_app.campaign_stream_head', 'DELETE')
    ) AS can_access_stream_head,
    (
      has_table_privilege('leasemind_app.schema_migrations', 'SELECT')
      OR has_table_privilege('leasemind_app.schema_migrations', 'INSERT')
      OR has_table_privilege('leasemind_app.schema_migrations', 'UPDATE')
      OR has_table_privilege('leasemind_app.schema_migrations', 'DELETE')
    ) AS can_access_ledger,
    pg_has_role(current_user, $1, 'MEMBER') AS is_member_of_migrator,
    pg_has_role(current_user, $2, 'MEMBER') AS is_member_of_maintainer
  FROM pg_roles r
  WHERE r.rolname = current_user
`;

/**
 * Verifies that the connected role matches exactly the API reader
 * allowlist. Called once at startup; never per-request. Throws
 * DatabasePrivilegeViolation (and only that) on any deviation, including
 * any failure to even evaluate the check (e.g. the projection table not
 * existing yet, or a connection error) -- fail closed, not fail open.
 */
export async function verifyRuntimeDatabasePrivileges(pool: pg.Pool): Promise<void> {
  let row: PrivilegeCheckRow;
  try {
    const result = await pool.query<PrivilegeCheckRow>(PRIVILEGE_CHECK_QUERY, [MIGRATOR_ROLE, MAINTAINER_ROLE]);
    if (result.rows.length !== 1) {
      throw new Error('unable to resolve current_user role row');
    }
    row = result.rows[0];
  } catch {
    throw new DatabasePrivilegeViolation();
  }

  const isViolation =
    row.rolsuper ||
    row.rolcreatedb ||
    row.rolcreaterole ||
    row.rolreplication ||
    row.rolbypassrls ||
    row.can_create_on_database ||
    row.can_create_temp ||
    row.can_create_in_schema ||
    row.can_write_projection ||
    row.can_access_event_log ||
    row.can_access_stream_head ||
    row.can_access_ledger ||
    row.is_member_of_migrator ||
    row.is_member_of_maintainer ||
    !row.can_select_projection;

  if (isViolation) {
    throw new DatabasePrivilegeViolation();
  }
}
