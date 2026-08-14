import type pg from 'pg';

type ColumnPrivilege = 'select' | 'insert' | 'update' | 'references';
type TablePrivilege = 'select' | 'insert' | 'update' | 'delete' | 'truncate' | 'references' | 'trigger' | 'maintain';

interface ObjectExpectation {
  name: string;
  tableWide?: Partial<Record<TablePrivilege, boolean>>;
  columns?: Partial<Record<ColumnPrivilege, readonly string[] | '*'>>;
}

interface FunctionExpectation {
  signature: string;
  execute: boolean;
}

interface AnalysisPrivilegeProfile {
  role: string;
  objects: readonly ObjectExpectation[];
  functions: readonly FunctionExpectation[];
}

const PROPERTY_ANALYSIS_COLUMNS = [
  'property_id', 'revision', 'lifecycle_status', 'created_at', 'updated_at',
  'property_type', 'property_country_code', 'property_region', 'property_city', 'property_districts',
  'property_area_sqm', 'property_floor', 'property_total_floors', 'property_entrance_type', 'property_condition',
  'property_available_from', 'property_monthly_rent_rub', 'property_operating_expenses_included',
  'property_utilities_included', 'property_security_deposit_rub', 'property_min_lease_months',
  'property_allowed_business_categories', 'property_excluded_business_categories',
  'property_target_tenant_categories', 'property_power_kw', 'property_ceiling_height_m', 'property_features',
  'property_parking_spaces', 'property_loading_access', 'property_access_mode', 'property_deal_priority'
] as const;

const TENANT_REQUEST_ANALYSIS_COLUMNS = [
  'tenant_request_id', 'revision', 'lifecycle_status', 'created_at', 'updated_at',
  'request_business_category', 'request_business_stage', 'request_expected_occupancy_people',
  'request_country_code', 'request_region', 'request_cities', 'request_districts', 'request_location_priorities',
  'request_property_types', 'request_area_min_sqm', 'request_area_max_sqm', 'request_monthly_budget_max_rub',
  'request_monthly_rent_rate_max_rub_per_sqm', 'request_budget_includes_operating_expenses',
  'request_condition_options', 'request_move_in_by', 'request_min_lease_months', 'request_power_min_kw',
  'request_ceiling_height_min_m', 'request_entrance_requirement', 'request_floor_options',
  'request_parking_min_spaces', 'request_loading_access_required', 'request_access_mode',
  'request_required_features', 'request_excluded_features', 'request_deal_priority'
] as const;

const ANALYSIS_SNAPSHOT_READ_COLUMNS = [
  'analysis_snapshot_id', 'technical_assignment_id', 'source_revision', 'scenario', 'analysis_kind',
  'campaign_id', 'calculation_attempt', 'status', 'schema_version', 'method_version',
  'country_code', 'currency', 'locale', 'area_unit', 'rent_period',
  'input_fingerprint', 'evidence_dataset_revision', 'evidence_as_of',
  'results', 'failure', 'created_at', 'generated_at'
] as const;

const ANALYSIS_SNAPSHOT_INSERT_COLUMNS = [
  'analysis_snapshot_id', 'property_id', 'tenant_request_id', 'source_revision', 'scenario',
  'analysis_kind', 'campaign_id', 'calculation_attempt', 'status', 'schema_version', 'method_version',
  'country_code', 'currency', 'locale', 'area_unit', 'rent_period', 'input_fingerprint'
] as const;

const ANALYSIS_SNAPSHOT_UPDATE_COLUMNS = [
  'status', 'generated_at', 'results', 'failure', 'evidence_as_of', 'evidence_dataset_revision'
] as const;

const MAPPING_COLUMNS = [
  'idempotency_key', 'command_hash', 'analysis_snapshot_id', 'retry_of_analysis_snapshot_id'
] as const;

const INTENT_INSERT_COLUMNS = [
  'campaign_id', 'property_id', 'tenant_request_id', 'scenario',
  'source_revision', 'analysis_kind', 'status', 'launched_at'
] as const;

const CAMPAIGN_ANALYSIS_READ_COLUMNS = [
  'analysis_snapshot_id', 'technical_assignment_id', 'scenario', 'source_revision',
  'analysis_kind', 'status', 'campaign_id', 'evidence_dataset_revision'
] as const;

const API_LINK_COLUMNS = ['campaign_id', 'scenario', 'technical_assignment_id', 'source_revision'] as const;
const EVIDENCE_REVISION_COLUMN = ['evidence_dataset_revision'] as const;
const EVIDENCE_INSERT_COLUMNS = [
  'evidence_dataset_revision', 'evidence_revocation_reason_code', 'revoked_by_actor_ref'
] as const;

const FUNCTION_SIGNATURES = {
  objectKeyCount: 'leasemind_app.jsonb_object_key_count(jsonb)',
  metricEnvelope: 'leasemind_app.is_valid_metric_envelope(jsonb)',
  snapshotImmutableTrigger: 'leasemind_app.reject_analysis_snapshot_immutable_mutation()',
  mappingImmutableTrigger: 'leasemind_app.reject_analysis_snapshot_idempotency_mapping_mutation()',
  intentTransitionTrigger: 'leasemind_app.enforce_post_launch_refresh_intent_transition()',
  evidenceImmutableTrigger: 'leasemind_app.reject_evidence_dataset_revocation_mutation()',
  claim: 'leasemind_app.claim_post_launch_refresh_intent(text,integer)',
  renew: 'leasemind_app.renew_post_launch_refresh_intent_lease(uuid,text,integer)',
  complete: 'leasemind_app.complete_post_launch_refresh_intent(uuid,text,integer,uuid)',
  fail: 'leasemind_app.fail_post_launch_refresh_intent(uuid,text,integer,uuid)',
  retry: 'leasemind_app.request_post_launch_refresh_retry(uuid,uuid)',
  sla: 'leasemind_app.mark_post_launch_refresh_intent_sla_breach(uuid)'
} as const;

const ALL_FUNCTIONS = Object.values(FUNCTION_SIGNATURES);
const VALIDATION_FUNCTIONS = new Set<string>([
  FUNCTION_SIGNATURES.objectKeyCount,
  FUNCTION_SIGNATURES.metricEnvelope
]);
const WORKER_COMMAND_FUNCTIONS = new Set<string>([
  FUNCTION_SIGNATURES.claim,
  FUNCTION_SIGNATURES.renew,
  FUNCTION_SIGNATURES.complete,
  FUNCTION_SIGNATURES.fail,
  FUNCTION_SIGNATURES.sla
]);

const empty = (name: string): ObjectExpectation => ({ name });

const analysisCoreObjects = (): ObjectExpectation[] => [
  { name: 'property', columns: { select: PROPERTY_ANALYSIS_COLUMNS } },
  { name: 'tenant_request', columns: { select: TENANT_REQUEST_ANALYSIS_COLUMNS } },
  empty('property_protected_address'),
  empty('campaign_current_state_projection'),
  empty('campaign_event_log'),
  empty('campaign_stream_head'),
  empty('schema_migrations'),
  { name: 'campaign_subject_link_projection', tableWide: { select: true } },
  {
    name: 'analysis_snapshot',
    columns: {
      select: ANALYSIS_SNAPSHOT_READ_COLUMNS,
      insert: ANALYSIS_SNAPSHOT_INSERT_COLUMNS,
      update: ANALYSIS_SNAPSHOT_UPDATE_COLUMNS
    }
  },
  {
    name: 'analysis_snapshot_idempotency_mapping',
    columns: { select: MAPPING_COLUMNS, insert: MAPPING_COLUMNS }
  },
  empty('post_launch_refresh_intent'),
  { name: 'evidence_dataset_revocation', columns: { select: EVIDENCE_REVISION_COLUMN } },
  empty('analysis_snapshot_freshness_projection')
];

const profiles: Record<string, AnalysisPrivilegeProfile> = {
  api_reader: {
    role: 'lmapp_api_reader',
    objects: [
      {
        name: 'analysis_snapshot',
        columns: { select: ANALYSIS_SNAPSHOT_READ_COLUMNS }
      },
      {
        name: 'campaign_subject_link_projection',
        columns: { select: API_LINK_COLUMNS }
      },
      empty('analysis_snapshot_idempotency_mapping'),
      empty('post_launch_refresh_intent'),
      { name: 'evidence_dataset_revocation', columns: { select: EVIDENCE_REVISION_COLUMN } },
      { name: 'analysis_snapshot_freshness_projection', tableWide: { select: true } }
    ],
    functions: ALL_FUNCTIONS.map(signature => ({ signature, execute: false }))
  },
  campaign_writer: {
    role: 'lmapp_campaign_writer',
    objects: [
      { name: 'analysis_snapshot', columns: { select: CAMPAIGN_ANALYSIS_READ_COLUMNS } },
      { name: 'campaign_subject_link_projection', tableWide: { select: true, insert: true } },
      empty('analysis_snapshot_idempotency_mapping'),
      { name: 'post_launch_refresh_intent', columns: { insert: INTENT_INSERT_COLUMNS } },
      { name: 'evidence_dataset_revocation', columns: { select: EVIDENCE_REVISION_COLUMN } },
      empty('analysis_snapshot_freshness_projection')
    ],
    functions: ALL_FUNCTIONS.map(signature => ({ signature, execute: false }))
  },
  ta_writer: {
    role: 'lmapp_ta_writer',
    objects: [
      empty('campaign_subject_link_projection'),
      empty('analysis_snapshot'),
      empty('analysis_snapshot_idempotency_mapping'),
      empty('post_launch_refresh_intent'),
      empty('evidence_dataset_revocation'),
      empty('analysis_snapshot_freshness_projection')
    ],
    functions: ALL_FUNCTIONS.map(signature => ({ signature, execute: false }))
  },
  analysis_writer: {
    role: 'lmapp_analysis_writer',
    objects: analysisCoreObjects(),
    functions: ALL_FUNCTIONS.map(signature => ({
      signature,
      execute: VALIDATION_FUNCTIONS.has(signature) || signature === FUNCTION_SIGNATURES.retry
    }))
  },
  analysis_worker: {
    role: 'lmapp_analysis_worker',
    objects: analysisCoreObjects().map(expectation =>
      expectation.name === 'campaign_subject_link_projection' ? empty(expectation.name) : expectation
    ),
    functions: ALL_FUNCTIONS.map(signature => ({
      signature,
      execute: VALIDATION_FUNCTIONS.has(signature) || WORKER_COMMAND_FUNCTIONS.has(signature)
    }))
  },
  evidence_revocation_writer: {
    role: 'lmapp_evidence_revocation_writer',
    objects: [
      empty('property'),
      empty('tenant_request'),
      empty('property_protected_address'),
      empty('campaign_current_state_projection'),
      empty('campaign_event_log'),
      empty('campaign_stream_head'),
      empty('schema_migrations'),
      empty('campaign_subject_link_projection'),
      empty('analysis_snapshot'),
      empty('analysis_snapshot_idempotency_mapping'),
      empty('post_launch_refresh_intent'),
      {
        name: 'evidence_dataset_revocation',
        columns: { select: EVIDENCE_REVISION_COLUMN, insert: EVIDENCE_INSERT_COLUMNS }
      },
      empty('analysis_snapshot_freshness_projection')
    ],
    functions: ALL_FUNCTIONS.map(signature => ({ signature, execute: false }))
  }
};

interface RoleBoundaryRow {
  current_user: string;
  session_user: string;
  rolsuper: boolean;
  rolinherit: boolean;
  rolcreatedb: boolean;
  rolcreaterole: boolean;
  rolreplication: boolean;
  rolbypassrls: boolean;
  can_connect: boolean;
  can_create_database_object: boolean;
  can_create_temp: boolean;
  can_use_schema: boolean;
  can_create_in_schema: boolean;
  has_membership: boolean;
}

interface ColumnPrivilegeRow {
  column_name: string;
  can_select: boolean;
  can_insert: boolean;
  can_update: boolean;
  can_references: boolean;
}

interface TablePrivilegeRow {
  can_select: boolean;
  can_insert: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_truncate: boolean;
  can_references: boolean;
  can_trigger: boolean;
  can_maintain: boolean;
}

function expectedColumn(expectation: ObjectExpectation, privilege: ColumnPrivilege, column: string): boolean {
  const expected = expectation.columns?.[privilege];
  return expected === '*' || Boolean(expected?.includes(column));
}

async function verifyRoleBoundary(pool: pg.Pool, expectedRole: string): Promise<void> {
  const result = await pool.query<RoleBoundaryRow>(`
    SELECT
      current_user,
      session_user,
      r.rolsuper,
      r.rolinherit,
      r.rolcreatedb,
      r.rolcreaterole,
      r.rolreplication,
      r.rolbypassrls,
      has_database_privilege(current_database(), 'CONNECT') AS can_connect,
      has_database_privilege(current_database(), 'CREATE') AS can_create_database_object,
      has_database_privilege(current_database(), 'TEMP') AS can_create_temp,
      has_schema_privilege('leasemind_app', 'USAGE') AS can_use_schema,
      has_schema_privilege('leasemind_app', 'CREATE') AS can_create_in_schema,
      EXISTS (SELECT 1 FROM pg_auth_members m WHERE m.member = r.oid) AS has_membership
    FROM pg_roles r
    WHERE r.rolname = current_user
  `);
  const row = result.rows[0];
  if (
    result.rows.length !== 1 || row.current_user !== expectedRole || row.session_user !== expectedRole
    || row.rolsuper || row.rolinherit || row.rolcreatedb || row.rolcreaterole
    || row.rolreplication || row.rolbypassrls || !row.can_connect
    || row.can_create_database_object || row.can_create_temp || !row.can_use_schema
    || row.can_create_in_schema || row.has_membership
  ) {
    throw new Error('analysis role boundary mismatch');
  }
}

async function verifyObject(pool: pg.Pool, expectation: ObjectExpectation): Promise<void> {
  const tableResult = await pool.query<TablePrivilegeRow>(`
    SELECT
      has_table_privilege(current_user, format('%I.%I', 'leasemind_app', $1::text), 'SELECT') AS can_select,
      has_table_privilege(current_user, format('%I.%I', 'leasemind_app', $1::text), 'INSERT') AS can_insert,
      has_table_privilege(current_user, format('%I.%I', 'leasemind_app', $1::text), 'UPDATE') AS can_update,
      has_table_privilege(current_user, format('%I.%I', 'leasemind_app', $1::text), 'DELETE') AS can_delete,
      has_table_privilege(current_user, format('%I.%I', 'leasemind_app', $1::text), 'TRUNCATE') AS can_truncate,
      has_table_privilege(current_user, format('%I.%I', 'leasemind_app', $1::text), 'REFERENCES') AS can_references,
      has_table_privilege(current_user, format('%I.%I', 'leasemind_app', $1::text), 'TRIGGER') AS can_trigger,
      has_table_privilege(current_user, format('%I.%I', 'leasemind_app', $1::text), 'MAINTAIN') AS can_maintain
  `, [expectation.name]);
  const table = tableResult.rows[0];
  for (const privilege of ['select', 'insert', 'update', 'delete', 'truncate', 'references', 'trigger', 'maintain'] as const) {
    const actual = table[`can_${privilege}`];
    const expected = expectation.tableWide?.[privilege] ?? false;
    if (actual !== expected) {
      throw new Error(`table privilege mismatch: ${expectation.name}.${privilege}`);
    }
  }

  const columnResult = await pool.query<ColumnPrivilegeRow>(`
    SELECT
      a.attname AS column_name,
      has_column_privilege(current_user, format('%I.%I', n.nspname, c.relname), a.attname, 'SELECT') AS can_select,
      has_column_privilege(current_user, format('%I.%I', n.nspname, c.relname), a.attname, 'INSERT') AS can_insert,
      has_column_privilege(current_user, format('%I.%I', n.nspname, c.relname), a.attname, 'UPDATE') AS can_update,
      has_column_privilege(current_user, format('%I.%I', n.nspname, c.relname), a.attname, 'REFERENCES') AS can_references
    FROM pg_catalog.pg_attribute a
    JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'leasemind_app'
      AND c.relname = $1
      AND a.attnum > 0
      AND NOT a.attisdropped
    ORDER BY a.attnum
  `, [expectation.name]);
  if (columnResult.rows.length === 0) {
    throw new Error(`missing database object: ${expectation.name}`);
  }
  for (const row of columnResult.rows) {
    for (const privilege of ['select', 'insert', 'update', 'references'] as const) {
      const actual = row[`can_${privilege}`];
      const expected = expectation.tableWide?.[privilege] === true
        || expectedColumn(expectation, privilege, row.column_name);
      if (actual !== expected) {
        throw new Error(`column privilege mismatch: ${expectation.name}.${row.column_name}.${privilege}`);
      }
    }
  }
}

async function verifyFunctions(pool: pg.Pool, expectations: readonly FunctionExpectation[]): Promise<void> {
  for (const expectation of expectations) {
    const result = await pool.query<{ can_execute: boolean; public_can_execute: boolean }>(`
      SELECT
        has_function_privilege(current_user, $1::text, 'EXECUTE') AS can_execute,
        has_function_privilege('public', $1::text, 'EXECUTE') AS public_can_execute
    `, [expectation.signature]);
    const row = result.rows[0];
    if (row.can_execute !== expectation.execute || row.public_can_execute) {
      throw new Error(`function privilege mismatch: ${expectation.signature}`);
    }
  }
}

export async function verifyAnalysisPrivilegeProfile(pool: pg.Pool, profileName: keyof typeof profiles): Promise<void> {
  const profile = profiles[profileName];
  await verifyRoleBoundary(pool, profile.role);
  for (const expectation of profile.objects) {
    await verifyObject(pool, expectation);
  }
  await verifyFunctions(pool, profile.functions);
}
