import type pg from 'pg';
import { MIGRATOR_ROLE, MAINTAINER_ROLE, API_READER_ROLE, CAMPAIGN_WRITER_ROLE, TA_WRITER_ROLE } from './db/provisionRoles.js';
import { verifyAnalysisPrivilegeProfile } from './analysisDbPrivilegePolicy.js';

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
  can_select_property: boolean;
  can_write_property: boolean;
  can_select_tenant_request: boolean;
  can_write_tenant_request: boolean;
  can_access_protected_address: boolean;
  is_member_of_migrator: boolean;
  is_member_of_maintainer: boolean;
  is_member_of_ta_writer: boolean;
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
    has_table_privilege('leasemind_app.property', 'SELECT') AS can_select_property,
    (
      has_table_privilege('leasemind_app.property', 'INSERT')
      OR has_table_privilege('leasemind_app.property', 'UPDATE')
      OR has_table_privilege('leasemind_app.property', 'DELETE')
      OR has_table_privilege('leasemind_app.property', 'TRUNCATE')
    ) AS can_write_property,
    has_table_privilege('leasemind_app.tenant_request', 'SELECT') AS can_select_tenant_request,
    (
      has_table_privilege('leasemind_app.tenant_request', 'INSERT')
      OR has_table_privilege('leasemind_app.tenant_request', 'UPDATE')
      OR has_table_privilege('leasemind_app.tenant_request', 'DELETE')
      OR has_table_privilege('leasemind_app.tenant_request', 'TRUNCATE')
    ) AS can_write_tenant_request,
    (
      has_table_privilege('leasemind_app.property_protected_address', 'SELECT')
      OR has_table_privilege('leasemind_app.property_protected_address', 'INSERT')
      OR has_table_privilege('leasemind_app.property_protected_address', 'UPDATE')
      OR has_table_privilege('leasemind_app.property_protected_address', 'DELETE')
    ) AS can_access_protected_address,
    pg_has_role(current_user, $1, 'MEMBER') AS is_member_of_migrator,
    pg_has_role(current_user, $2, 'MEMBER') AS is_member_of_maintainer,
    pg_has_role(current_user, $3, 'MEMBER') AS is_member_of_ta_writer
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
    const result = await pool.query<PrivilegeCheckRow>(PRIVILEGE_CHECK_QUERY, [MIGRATOR_ROLE, MAINTAINER_ROLE, TA_WRITER_ROLE]);
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
    row.can_write_property ||
    row.can_write_tenant_request ||
    row.can_access_protected_address ||
    row.is_member_of_migrator ||
    row.is_member_of_maintainer ||
    row.is_member_of_ta_writer ||
    !row.can_select_projection ||
    !row.can_select_property ||
    !row.can_select_tenant_request;

  if (isViolation) {
    throw new DatabasePrivilegeViolation();
  }

  try {
    await verifyAnalysisPrivilegeProfile(pool, 'api_reader');
  } catch {
    throw new DatabasePrivilegeViolation();
  }
}

// Campaign creation command boundary. See
// 03_ARCHITECTURE/decisions/ADR-0007-synthetic-campaign-creation-command-boundary.md.
// Same fail-closed philosophy as verifyRuntimeDatabasePrivileges above: any
// deviation, or any failure to even evaluate the check, is a violation.

interface CommandPrivilegeCheckRow {
  rolsuper: boolean;
  rolcreatedb: boolean;
  rolcreaterole: boolean;
  rolreplication: boolean;
  rolbypassrls: boolean;
  can_create_on_database: boolean;
  can_create_temp: boolean;
  can_create_in_schema: boolean;
  can_select_projection: boolean;
  can_insert_projection: boolean;
  can_update_projection: boolean;
  can_destructively_write_projection: boolean;
  can_select_event_log: boolean;
  can_insert_event_log: boolean;
  can_mutate_event_log: boolean;
  can_select_stream_head: boolean;
  can_insert_stream_head: boolean;
  can_update_stream_head: boolean;
  can_destructively_write_stream_head: boolean;
  can_access_ledger: boolean;
  can_select_property: boolean;
  can_select_tenant_request: boolean;
  can_update_property_lifecycle_only: boolean;
  can_update_tenant_request_lifecycle_only: boolean;
  can_update_property_commercial_fact: boolean;
  can_update_tenant_request_commercial_fact: boolean;
  can_update_tenant_request_rent_rate: boolean;
  can_insert_or_delete_property: boolean;
  can_insert_or_delete_tenant_request: boolean;
  can_access_protected_address: boolean;
  is_member_of_migrator: boolean;
  is_member_of_maintainer: boolean;
  is_member_of_api_reader: boolean;
  is_member_of_ta_writer: boolean;
}

const COMMAND_PRIVILEGE_CHECK_QUERY = `
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
    has_table_privilege('leasemind_app.campaign_current_state_projection', 'INSERT') AS can_insert_projection,
    has_table_privilege('leasemind_app.campaign_current_state_projection', 'UPDATE') AS can_update_projection,
    (
      has_table_privilege('leasemind_app.campaign_current_state_projection', 'DELETE')
      OR has_table_privilege('leasemind_app.campaign_current_state_projection', 'TRUNCATE')
    ) AS can_destructively_write_projection,
    has_table_privilege('leasemind_app.campaign_event_log', 'SELECT') AS can_select_event_log,
    has_table_privilege('leasemind_app.campaign_event_log', 'INSERT') AS can_insert_event_log,
    (
      has_table_privilege('leasemind_app.campaign_event_log', 'UPDATE')
      OR has_table_privilege('leasemind_app.campaign_event_log', 'DELETE')
      OR has_table_privilege('leasemind_app.campaign_event_log', 'TRUNCATE')
    ) AS can_mutate_event_log,
    has_table_privilege('leasemind_app.campaign_stream_head', 'SELECT') AS can_select_stream_head,
    has_table_privilege('leasemind_app.campaign_stream_head', 'INSERT') AS can_insert_stream_head,
    has_table_privilege('leasemind_app.campaign_stream_head', 'UPDATE') AS can_update_stream_head,
    (
      has_table_privilege('leasemind_app.campaign_stream_head', 'DELETE')
      OR has_table_privilege('leasemind_app.campaign_stream_head', 'TRUNCATE')
    ) AS can_destructively_write_stream_head,
    (
      has_table_privilege('leasemind_app.schema_migrations', 'SELECT')
      OR has_table_privilege('leasemind_app.schema_migrations', 'INSERT')
      OR has_table_privilege('leasemind_app.schema_migrations', 'UPDATE')
      OR has_table_privilege('leasemind_app.schema_migrations', 'DELETE')
    ) AS can_access_ledger,
    has_table_privilege('leasemind_app.property', 'SELECT') AS can_select_property,
    has_table_privilege('leasemind_app.tenant_request', 'SELECT') AS can_select_tenant_request,
    has_column_privilege('leasemind_app.property', 'lifecycle_status', 'UPDATE') AS can_update_property_lifecycle_only,
    has_column_privilege('leasemind_app.tenant_request', 'lifecycle_status', 'UPDATE') AS can_update_tenant_request_lifecycle_only,
    has_column_privilege('leasemind_app.property', 'property_monthly_rent_rub', 'UPDATE') AS can_update_property_commercial_fact,
    has_column_privilege('leasemind_app.tenant_request', 'request_monthly_budget_max_rub', 'UPDATE') AS can_update_tenant_request_commercial_fact,
    has_column_privilege('leasemind_app.tenant_request', 'request_monthly_rent_rate_max_rub_per_sqm', 'UPDATE') AS can_update_tenant_request_rent_rate,
    (
      has_table_privilege('leasemind_app.property', 'INSERT')
      OR has_table_privilege('leasemind_app.property', 'DELETE')
      OR has_table_privilege('leasemind_app.property', 'TRUNCATE')
    ) AS can_insert_or_delete_property,
    (
      has_table_privilege('leasemind_app.tenant_request', 'INSERT')
      OR has_table_privilege('leasemind_app.tenant_request', 'DELETE')
      OR has_table_privilege('leasemind_app.tenant_request', 'TRUNCATE')
    ) AS can_insert_or_delete_tenant_request,
    (
      has_table_privilege('leasemind_app.property_protected_address', 'SELECT')
      OR has_table_privilege('leasemind_app.property_protected_address', 'INSERT')
      OR has_table_privilege('leasemind_app.property_protected_address', 'UPDATE')
      OR has_table_privilege('leasemind_app.property_protected_address', 'DELETE')
    ) AS can_access_protected_address,
    pg_has_role(current_user, $1, 'MEMBER') AS is_member_of_migrator,
    pg_has_role(current_user, $2, 'MEMBER') AS is_member_of_maintainer,
    pg_has_role(current_user, $3, 'MEMBER') AS is_member_of_api_reader,
    pg_has_role(current_user, $4, 'MEMBER') AS is_member_of_ta_writer
  FROM pg_roles r
  WHERE r.rolname = current_user
`;

/**
 * Verifies that the connected role matches exactly the Campaign creation
 * command allowlist: SELECT+INSERT on campaign_event_log, SELECT+INSERT+
 * UPDATE on campaign_stream_head and campaign_current_state_projection --
 * the same shape as lmapp_maintainer, but never lmapp_maintainer, lmapp_migrator
 * or lmapp_api_reader themselves (no role membership, no shared credential).
 * Also allows exactly SELECT + column-level UPDATE(lifecycle_status,
 * updated_at) on property/tenant_request (ADR-0008) -- enough to verify
 * and transition a Technical Assignment during the atomic launch
 * transaction, but never enough to write any commercial-fact column or
 * touch property_protected_address.
 * Called once at startup, for the dedicated command pool only; never for the
 * read-only DATABASE_URL pool and never per-request.
 */
export async function verifyRuntimeCommandPrivileges(pool: pg.Pool): Promise<void> {
  let row: CommandPrivilegeCheckRow;
  try {
    const result = await pool.query<CommandPrivilegeCheckRow>(COMMAND_PRIVILEGE_CHECK_QUERY, [
      MIGRATOR_ROLE,
      MAINTAINER_ROLE,
      API_READER_ROLE,
      TA_WRITER_ROLE
    ]);
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
    row.can_destructively_write_projection ||
    row.can_mutate_event_log ||
    row.can_destructively_write_stream_head ||
    row.can_access_ledger ||
    row.can_update_property_commercial_fact ||
    row.can_update_tenant_request_commercial_fact ||
    row.can_update_tenant_request_rent_rate ||
    row.can_insert_or_delete_property ||
    row.can_insert_or_delete_tenant_request ||
    row.can_access_protected_address ||
    row.is_member_of_migrator ||
    row.is_member_of_maintainer ||
    row.is_member_of_api_reader ||
    row.is_member_of_ta_writer ||
    !row.can_select_projection ||
    !row.can_insert_projection ||
    !row.can_update_projection ||
    !row.can_select_event_log ||
    !row.can_insert_event_log ||
    !row.can_select_stream_head ||
    !row.can_insert_stream_head ||
    !row.can_update_stream_head ||
    !row.can_select_property ||
    !row.can_select_tenant_request ||
    !row.can_update_property_lifecycle_only ||
    !row.can_update_tenant_request_lifecycle_only;

  if (isViolation) {
    throw new DatabasePrivilegeViolation();
  }

  try {
    await verifyAnalysisPrivilegeProfile(pool, 'campaign_writer');
  } catch {
    throw new DatabasePrivilegeViolation();
  }
}

// Technical Assignment command boundary. See
// 03_ARCHITECTURE/decisions/ADR-0008-technical-assignment-implementation.md.
// Same fail-closed philosophy as the checks above.

interface TaPrivilegeCheckRow {
  rolsuper: boolean;
  rolcreatedb: boolean;
  rolcreaterole: boolean;
  rolreplication: boolean;
  rolbypassrls: boolean;
  can_create_on_database: boolean;
  can_create_temp: boolean;
  can_create_in_schema: boolean;
  can_select_property: boolean;
  can_insert_property: boolean;
  can_update_property: boolean;
  can_destructively_write_property: boolean;
  can_select_tenant_request: boolean;
  can_insert_tenant_request: boolean;
  can_update_tenant_request: boolean;
  can_destructively_write_tenant_request: boolean;
  can_select_protected_address: boolean;
  can_insert_protected_address: boolean;
  can_update_protected_address: boolean;
  can_destructively_write_protected_address: boolean;
  can_access_event_log: boolean;
  can_access_stream_head: boolean;
  can_access_projection: boolean;
  can_access_ledger: boolean;
  is_member_of_migrator: boolean;
  is_member_of_maintainer: boolean;
  is_member_of_api_reader: boolean;
  is_member_of_campaign_writer: boolean;
}

const TA_PRIVILEGE_CHECK_QUERY = `
  SELECT
    r.rolsuper,
    r.rolcreatedb,
    r.rolcreaterole,
    r.rolreplication,
    r.rolbypassrls,
    has_database_privilege(current_database(), 'CREATE') AS can_create_on_database,
    has_database_privilege(current_database(), 'TEMP') AS can_create_temp,
    has_schema_privilege('leasemind_app', 'CREATE') AS can_create_in_schema,
    has_table_privilege('leasemind_app.property', 'SELECT') AS can_select_property,
    has_table_privilege('leasemind_app.property', 'INSERT') AS can_insert_property,
    has_table_privilege('leasemind_app.property', 'UPDATE') AS can_update_property,
    (
      has_table_privilege('leasemind_app.property', 'DELETE')
      OR has_table_privilege('leasemind_app.property', 'TRUNCATE')
    ) AS can_destructively_write_property,
    has_table_privilege('leasemind_app.tenant_request', 'SELECT') AS can_select_tenant_request,
    has_table_privilege('leasemind_app.tenant_request', 'INSERT') AS can_insert_tenant_request,
    has_table_privilege('leasemind_app.tenant_request', 'UPDATE') AS can_update_tenant_request,
    (
      has_table_privilege('leasemind_app.tenant_request', 'DELETE')
      OR has_table_privilege('leasemind_app.tenant_request', 'TRUNCATE')
    ) AS can_destructively_write_tenant_request,
    has_table_privilege('leasemind_app.property_protected_address', 'SELECT') AS can_select_protected_address,
    has_table_privilege('leasemind_app.property_protected_address', 'INSERT') AS can_insert_protected_address,
    has_table_privilege('leasemind_app.property_protected_address', 'UPDATE') AS can_update_protected_address,
    (
      has_table_privilege('leasemind_app.property_protected_address', 'DELETE')
      OR has_table_privilege('leasemind_app.property_protected_address', 'TRUNCATE')
    ) AS can_destructively_write_protected_address,
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
      has_table_privilege('leasemind_app.campaign_current_state_projection', 'SELECT')
      OR has_table_privilege('leasemind_app.campaign_current_state_projection', 'INSERT')
      OR has_table_privilege('leasemind_app.campaign_current_state_projection', 'UPDATE')
      OR has_table_privilege('leasemind_app.campaign_current_state_projection', 'DELETE')
    ) AS can_access_projection,
    (
      has_table_privilege('leasemind_app.schema_migrations', 'SELECT')
      OR has_table_privilege('leasemind_app.schema_migrations', 'INSERT')
      OR has_table_privilege('leasemind_app.schema_migrations', 'UPDATE')
      OR has_table_privilege('leasemind_app.schema_migrations', 'DELETE')
    ) AS can_access_ledger,
    pg_has_role(current_user, $1, 'MEMBER') AS is_member_of_migrator,
    pg_has_role(current_user, $2, 'MEMBER') AS is_member_of_maintainer,
    pg_has_role(current_user, $3, 'MEMBER') AS is_member_of_api_reader,
    pg_has_role(current_user, $4, 'MEMBER') AS is_member_of_campaign_writer
  FROM pg_roles r
  WHERE r.rolname = current_user
`;

/**
 * Verifies that the connected role matches exactly the Technical
 * Assignment command allowlist: SELECT+INSERT+UPDATE on property,
 * tenant_request and property_protected_address -- and nothing else. This
 * is the only role in the system with any access at all to
 * property_protected_address. No DELETE/TRUNCATE anywhere, no access to
 * the Campaign event log/stream head/projection/ledger, no membership in
 * any other role. Called once at startup, for the dedicated Technical
 * Assignment pool only; never for any other pool and never per-request.
 */
export async function verifyRuntimeTechnicalAssignmentPrivileges(pool: pg.Pool): Promise<void> {
  let row: TaPrivilegeCheckRow;
  try {
    const result = await pool.query<TaPrivilegeCheckRow>(TA_PRIVILEGE_CHECK_QUERY, [
      MIGRATOR_ROLE,
      MAINTAINER_ROLE,
      API_READER_ROLE,
      CAMPAIGN_WRITER_ROLE
    ]);
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
    row.can_destructively_write_property ||
    row.can_destructively_write_tenant_request ||
    row.can_destructively_write_protected_address ||
    row.can_access_event_log ||
    row.can_access_stream_head ||
    row.can_access_projection ||
    row.can_access_ledger ||
    row.is_member_of_migrator ||
    row.is_member_of_maintainer ||
    row.is_member_of_api_reader ||
    row.is_member_of_campaign_writer ||
    !row.can_select_property ||
    !row.can_insert_property ||
    !row.can_update_property ||
    !row.can_select_tenant_request ||
    !row.can_insert_tenant_request ||
    !row.can_update_tenant_request ||
    !row.can_select_protected_address ||
    !row.can_insert_protected_address ||
    !row.can_update_protected_address;

  if (isViolation) {
    throw new DatabasePrivilegeViolation();
  }

  try {
    await verifyAnalysisPrivilegeProfile(pool, 'ta_writer');
  } catch {
    throw new DatabasePrivilegeViolation();
  }
}

async function verifyAnalysisBoundary(
  pool: pg.Pool,
  profile: 'analysis_writer' | 'analysis_worker' | 'evidence_revocation_writer'
): Promise<void> {
  try {
    await verifyAnalysisPrivilegeProfile(pool, profile);
  } catch {
    throw new DatabasePrivilegeViolation();
  }
}

/** Startup gate for the synchronous Analysis command pool. */
export async function verifyRuntimeAnalysisPrivileges(pool: pg.Pool): Promise<void> {
  await verifyAnalysisBoundary(pool, 'analysis_writer');
}

/** Startup gate for the dedicated durable post-launch refresh worker. */
export async function verifyRuntimeAnalysisWorkerPrivileges(pool: pg.Pool): Promise<void> {
  await verifyAnalysisBoundary(pool, 'analysis_worker');
}

/** Startup gate for the evidence-revocation operational CLI. */
export async function verifyRuntimeEvidenceRevocationPrivileges(pool: pg.Pool): Promise<void> {
  await verifyAnalysisBoundary(pool, 'evidence_revocation_writer');
}
