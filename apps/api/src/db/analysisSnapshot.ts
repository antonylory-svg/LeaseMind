import { createHash, randomUUID } from 'node:crypto';
import type pg from 'pg';
import {
  calculateSyntheticAnalysis,
  computeAnalysisInputFingerprint,
  prepareSyntheticAnalysis,
  type AnalysisSourceRow
} from '../analysisCalculation.js';
import {
  ANALYSIS_METHOD_VERSION,
  ANALYSIS_SCHEMA_VERSION,
  AnalysisRequestError,
  type AnalysisFailure,
  type AnalysisFreshnessReason,
  type AnalysisFreshnessStatus,
  type AnalysisKind,
  type AnalysisResults,
  type AnalysisScenario,
  type AnalysisSnapshotEnvelope,
  type AnalysisStatus
} from '../analysisTypes.js';

const COMMAND_DOMAIN = 'LEASEMIND_ANALYSIS_SNAPSHOT_COMMAND_V2';

const PROPERTY_COLUMNS = [
  'property_id', 'revision', 'lifecycle_status', 'created_at', 'updated_at',
  'property_type', 'property_country_code', 'property_region', 'property_city', 'property_districts',
  'property_area_sqm', 'property_floor', 'property_total_floors', 'property_entrance_type', 'property_condition',
  'property_available_from', 'property_monthly_rent_rub', 'property_operating_expenses_included',
  'property_utilities_included', 'property_security_deposit_rub', 'property_min_lease_months',
  'property_allowed_business_categories', 'property_excluded_business_categories',
  'property_target_tenant_categories', 'property_power_kw', 'property_ceiling_height_m', 'property_features',
  'property_parking_spaces', 'property_loading_access', 'property_access_mode', 'property_deal_priority'
] as const;

const TENANT_REQUEST_COLUMNS = [
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

interface MappingRow {
  command_hash: string;
  analysis_snapshot_id: string;
}

interface CurrentAttemptRow {
  analysis_snapshot_id: string;
  calculation_attempt: number;
  status: AnalysisStatus;
  failure: AnalysisFailure | null;
}

interface Subject {
  scenario: AnalysisScenario;
  row: AnalysisSourceRow;
}

interface SnapshotRow {
  analysis_snapshot_id: string;
  technical_assignment_id: string;
  source_revision: number;
  scenario: AnalysisScenario;
  analysis_kind: AnalysisKind;
  campaign_id: string | null;
  calculation_attempt: number;
  status: AnalysisStatus;
  schema_version: typeof ANALYSIS_SCHEMA_VERSION;
  method_version: typeof ANALYSIS_METHOD_VERSION;
  country_code: 'RU';
  currency: 'RUB';
  locale: 'ru-RU';
  area_unit: 'sqm';
  rent_period: 'month';
  input_fingerprint: string;
  evidence_dataset_revision: string | null;
  evidence_as_of: Date | null;
  results: AnalysisResults | null;
  failure: AnalysisFailure | null;
  created_at: Date;
  generated_at: Date | null;
  freshness_status: AnalysisFreshnessStatus;
  freshness_reason: AnalysisFreshnessReason;
}

export interface CreateAnalysisSnapshotInput {
  idempotencyKey: string;
  technicalAssignmentId: string;
  expectedRevision: number;
  analysisKind: AnalysisKind;
  campaignId: string | null;
  retryOfAnalysisSnapshotId: string | null;
}

export interface CreateAnalysisSnapshotResult {
  analysisSnapshotId: string;
  created: boolean;
}

export interface GetCurrentAnalysisSnapshotInput {
  technicalAssignmentId: string;
  revision: number;
  analysisKind: AnalysisKind;
  campaignId?: string | null;
}

export function computeAnalysisCommandHash(input: CreateAnalysisSnapshotInput): string {
  return createHash('sha256')
    .update(
      `${COMMAND_DOMAIN}|${input.technicalAssignmentId}|${input.expectedRevision}|${input.analysisKind}|${input.campaignId ?? ''}|${input.retryOfAnalysisSnapshotId ?? ''}`
    )
    .digest('hex');
}

async function readMapping(queryable: pg.Pool | pg.PoolClient, idempotencyKey: string): Promise<MappingRow | null> {
  const result = await queryable.query<MappingRow>(
    `SELECT command_hash, analysis_snapshot_id
       FROM leasemind_app.analysis_snapshot_idempotency_mapping
      WHERE idempotency_key = $1`,
    [idempotencyKey]
  );
  return result.rows[0] ?? null;
}

function replayOrConflict(mapping: MappingRow, commandHash: string): CreateAnalysisSnapshotResult {
  if (mapping.command_hash !== commandHash) {
    throw new AnalysisRequestError('ANALYSIS_IDEMPOTENCY_CONFLICT', 409, false);
  }
  return { analysisSnapshotId: mapping.analysis_snapshot_id, created: false };
}

async function acquireSessionLock(client: pg.PoolClient, scope: string): Promise<void> {
  await client.query('SELECT pg_advisory_lock(hashtextextended($1, 0))', [scope]);
}

async function releaseSessionLock(client: pg.PoolClient, scope: string): Promise<boolean> {
  const result = await client.query<{ unlocked: boolean }>(
    'SELECT pg_advisory_unlock(hashtextextended($1, 0)) AS unlocked',
    [scope]
  );
  return result.rows[0]?.unlocked === true;
}

async function readSubject(client: pg.PoolClient, technicalAssignmentId: string): Promise<Subject | null> {
  const property = await client.query<AnalysisSourceRow>(
    `SELECT ${PROPERTY_COLUMNS.join(', ')}
       FROM leasemind_app.property
      WHERE property_id = $1`,
    [technicalAssignmentId]
  );
  if (property.rows[0]) return { scenario: 'need_tenant', row: property.rows[0] };

  const request = await client.query<AnalysisSourceRow>(
    `SELECT ${TENANT_REQUEST_COLUMNS.join(', ')}
       FROM leasemind_app.tenant_request
      WHERE tenant_request_id = $1`,
    [technicalAssignmentId]
  );
  if (request.rows[0]) return { scenario: 'need_property', row: request.rows[0] };
  return null;
}

async function readEligibleDataset(client: pg.PoolClient): Promise<{
  properties: AnalysisSourceRow[];
  tenantRequests: AnalysisSourceRow[];
}> {
  const [properties, tenantRequests] = await Promise.all([
    client.query<AnalysisSourceRow>(
      `SELECT ${PROPERTY_COLUMNS.join(', ')}
         FROM leasemind_app.property
        WHERE lifecycle_status IN ('ready_for_analysis', 'campaign_started')`
    ),
    client.query<AnalysisSourceRow>(
      `SELECT ${TENANT_REQUEST_COLUMNS.join(', ')}
         FROM leasemind_app.tenant_request
        WHERE lifecycle_status IN ('ready_for_analysis', 'campaign_started')`
    )
  ]);
  return { properties: properties.rows, tenantRequests: tenantRequests.rows };
}

async function readCurrentAttempt(
  client: pg.PoolClient,
  technicalAssignmentId: string,
  sourceRevision: number
): Promise<CurrentAttemptRow | null> {
  const result = await client.query<CurrentAttemptRow>(
    `SELECT analysis_snapshot_id, calculation_attempt, status, failure
       FROM leasemind_app.analysis_snapshot
      WHERE technical_assignment_id = $1
        AND source_revision = $2
        AND analysis_kind = 'pre_launch'
      ORDER BY calculation_attempt DESC
      LIMIT 1`,
    [technicalAssignmentId, sourceRevision]
  );
  return result.rows[0] ?? null;
}

function decideAttempt(
  current: CurrentAttemptRow | null,
  retryTarget: string | null
): { create: true; attempt: number } | { create: false; analysisSnapshotId: string } {
  if (!current) {
    if (retryTarget !== null) {
      throw new AnalysisRequestError('ANALYSIS_RETRY_NOT_ALLOWED', 409, false);
    }
    return { create: true, attempt: 1 };
  }

  if (retryTarget === null) {
    if (current.status === 'pending' || current.status === 'completed' || current.status === 'insufficient_data') {
      return { create: false, analysisSnapshotId: current.analysis_snapshot_id };
    }
    if (current.failure?.retryable === true) {
      throw new AnalysisRequestError('ANALYSIS_RETRY_TARGET_MISMATCH', 409, false);
    }
    throw new AnalysisRequestError('ANALYSIS_RETRY_NOT_ALLOWED', 409, false);
  }

  if (current.status !== 'failed' || current.failure?.retryable !== true) {
    throw new AnalysisRequestError('ANALYSIS_RETRY_NOT_ALLOWED', 409, false);
  }
  if (retryTarget !== current.analysis_snapshot_id) {
    throw new AnalysisRequestError('ANALYSIS_RETRY_TARGET_MISMATCH', 409, false);
  }
  return { create: true, attempt: current.calculation_attempt + 1 };
}

async function insertMapping(
  client: pg.PoolClient,
  input: CreateAnalysisSnapshotInput,
  commandHash: string,
  analysisSnapshotId: string
): Promise<void> {
  await client.query(
    `INSERT INTO leasemind_app.analysis_snapshot_idempotency_mapping
       (idempotency_key, command_hash, analysis_snapshot_id, retry_of_analysis_snapshot_id)
     VALUES ($1, $2, $3, $4)`,
    [input.idempotencyKey, commandHash, analysisSnapshotId, input.retryOfAnalysisSnapshotId]
  );
}

async function evidenceIsRevoked(client: pg.PoolClient, evidenceDatasetRevision: string): Promise<boolean> {
  const result = await client.query(
    `SELECT 1
       FROM leasemind_app.evidence_dataset_revocation
      WHERE evidence_dataset_revision = $1`,
    [evidenceDatasetRevision]
  );
  return (result.rowCount ?? 0) > 0;
}

async function markFailed(
  client: pg.PoolClient,
  analysisSnapshotId: string,
  failure: AnalysisFailure,
  evidenceAsOf: Date | null,
  evidenceDatasetRevision: string | null
): Promise<void> {
  await client.query(
    `UPDATE leasemind_app.analysis_snapshot
        SET status = 'failed',
            generated_at = clock_timestamp(),
            results = NULL,
            failure = $2::jsonb,
            evidence_as_of = $3,
            evidence_dataset_revision = $4
      WHERE analysis_snapshot_id = $1 AND status = 'pending'`,
    [analysisSnapshotId, JSON.stringify(failure), evidenceAsOf, evidenceDatasetRevision]
  );
}

export async function createOrReplayPreLaunchAnalysisSnapshot(
  pool: pg.Pool,
  input: CreateAnalysisSnapshotInput
): Promise<CreateAnalysisSnapshotResult> {
  const commandHash = computeAnalysisCommandHash(input);
  const fastMapping = await readMapping(pool, input.idempotencyKey);
  if (fastMapping) return replayOrConflict(fastMapping, commandHash);

  const client = await pool.connect();
  const keyScope = `analysis-snapshot:idempotency-key:${input.idempotencyKey}`;
  const logicalScope = `technical-assignment:id:${input.technicalAssignmentId}`;
  let keyLocked = false;
  let logicalLocked = false;
  let transactionOpen = false;
  let destroyClient = false;

  try {
    await acquireSessionLock(client, keyScope);
    keyLocked = true;

    const lockedMapping = await readMapping(client, input.idempotencyKey);
    if (lockedMapping) return replayOrConflict(lockedMapping, commandHash);

    // PRODUCT §6.1 requires the durable idempotency mapping to take
    // precedence over current-command validation. A previously accepted key
    // therefore always replays or conflicts before kind/Campaign rules are
    // evaluated; only a genuinely new key reaches this pre-launch-only gate.
    if (input.analysisKind !== 'pre_launch' || input.campaignId !== null) {
      throw new AnalysisRequestError('ANALYSIS_KIND_INVALID', 400, false);
    }

    await acquireSessionLock(client, logicalScope);
    logicalLocked = true;

    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ');
    transactionOpen = true;

    const subject = await readSubject(client, input.technicalAssignmentId);
    if (!subject) {
      throw new AnalysisRequestError('ANALYSIS_TECHNICAL_ASSIGNMENT_NOT_FOUND', 404, false);
    }
    if (subject.row.lifecycle_status !== 'ready_for_analysis') {
      throw new AnalysisRequestError('ANALYSIS_TECHNICAL_ASSIGNMENT_NOT_READY', 409, false);
    }
    if (subject.row.revision !== input.expectedRevision) {
      throw new AnalysisRequestError('ANALYSIS_REVISION_CONFLICT', 409, false);
    }
    const countryCode = subject.scenario === 'need_tenant'
      ? subject.row.property_country_code
      : subject.row.request_country_code;
    if (countryCode !== 'RU') {
      throw new AnalysisRequestError('ANALYSIS_MARKET_UNSUPPORTED', 400, false);
    }

    const current = await readCurrentAttempt(client, input.technicalAssignmentId, input.expectedRevision);
    const decision = decideAttempt(current, input.retryOfAnalysisSnapshotId);

    if (!decision.create) {
      await insertMapping(client, input, commandHash, decision.analysisSnapshotId);
      await client.query('COMMIT');
      transactionOpen = false;
      return { analysisSnapshotId: decision.analysisSnapshotId, created: false };
    }

    const analysisSnapshotId = randomUUID();
    const inputFingerprint = computeAnalysisInputFingerprint(subject.scenario, subject.row);
    await client.query(
      `INSERT INTO leasemind_app.analysis_snapshot (
         analysis_snapshot_id, property_id, tenant_request_id, source_revision, scenario,
         analysis_kind, campaign_id, calculation_attempt, status, schema_version,
         method_version, country_code, currency, locale, area_unit, rent_period, input_fingerprint
       ) VALUES (
         $1, $2, $3, $4, $5,
         'pre_launch', NULL, $6, 'pending', $7,
         $8, 'RU', 'RUB', 'ru-RU', 'sqm', 'month', $9
       )`,
      [
        analysisSnapshotId,
        subject.scenario === 'need_tenant' ? input.technicalAssignmentId : null,
        subject.scenario === 'need_property' ? input.technicalAssignmentId : null,
        input.expectedRevision,
        subject.scenario,
        decision.attempt,
        ANALYSIS_SCHEMA_VERSION,
        ANALYSIS_METHOD_VERSION,
        inputFingerprint
      ]
    );
    await insertMapping(client, input, commandHash, analysisSnapshotId);

    await client.query('SAVEPOINT analysis_calculation');
    let evidenceAsOf: Date | null = null;
    let evidenceDatasetRevision: string | null = null;
    try {
      const time = await client.query<{ evidence_as_of: Date }>('SELECT transaction_timestamp() AS evidence_as_of');
      evidenceAsOf = time.rows[0].evidence_as_of;
      const dataset = await readEligibleDataset(client);
      const preparation = prepareSyntheticAnalysis(
        subject.scenario,
        subject.row,
        dataset.properties,
        dataset.tenantRequests
      );
      evidenceDatasetRevision = preparation.evidenceDatasetRevision;

      if (await evidenceIsRevoked(client, evidenceDatasetRevision)) {
        await markFailed(
          client,
          analysisSnapshotId,
          { code: 'ANALYSIS_DATASET_UNAVAILABLE', retryable: true },
          evidenceAsOf,
          evidenceDatasetRevision
        );
      } else {
        const results = calculateSyntheticAnalysis({
          scenario: subject.scenario,
          subject: subject.row,
          properties: dataset.properties,
          tenantRequests: dataset.tenantRequests,
          evidenceDatasetRevision
        });
        if (await evidenceIsRevoked(client, evidenceDatasetRevision)) {
          await markFailed(
            client,
            analysisSnapshotId,
            { code: 'ANALYSIS_DATASET_UNAVAILABLE', retryable: true },
            evidenceAsOf,
            evidenceDatasetRevision
          );
        } else {
          const status: AnalysisStatus = Object.values(results).some(metric => metric.metric_status === 'assessed')
            ? 'completed'
            : 'insufficient_data';
          await client.query(
            `UPDATE leasemind_app.analysis_snapshot
                SET status = $2,
                    generated_at = clock_timestamp(),
                    results = $3::jsonb,
                    failure = NULL,
                    evidence_as_of = $4,
                    evidence_dataset_revision = $5
              WHERE analysis_snapshot_id = $1 AND status = 'pending'`,
            [analysisSnapshotId, status, JSON.stringify(results), evidenceAsOf, evidenceDatasetRevision]
          );
        }
      }
      await client.query('RELEASE SAVEPOINT analysis_calculation');
    } catch {
      await client.query('ROLLBACK TO SAVEPOINT analysis_calculation');
      await markFailed(
        client,
        analysisSnapshotId,
        { code: 'ANALYSIS_GENERATION_FAILED', retryable: true },
        evidenceAsOf,
        evidenceDatasetRevision
      );
      await client.query('RELEASE SAVEPOINT analysis_calculation');
    }

    await client.query('COMMIT');
    transactionOpen = false;
    return { analysisSnapshotId, created: true };
  } catch (error) {
    if (transactionOpen) {
      await client.query('ROLLBACK').catch(() => {
        destroyClient = true;
      });
      transactionOpen = false;
    }
    throw error;
  } finally {
    if (logicalLocked) {
      try {
        if (!(await releaseSessionLock(client, logicalScope))) destroyClient = true;
      } catch {
        destroyClient = true;
      }
    }
    if (keyLocked) {
      try {
        if (!(await releaseSessionLock(client, keyScope))) destroyClient = true;
      } catch {
        destroyClient = true;
      }
    }
    client.release(destroyClient);
  }
}

function snapshotEnvelope(row: SnapshotRow): AnalysisSnapshotEnvelope {
  return {
    schema_version: row.schema_version,
    analysis_snapshot_id: row.analysis_snapshot_id,
    technical_assignment_id: row.technical_assignment_id,
    source_revision: row.source_revision,
    scenario: row.scenario,
    analysis_kind: row.analysis_kind,
    campaign_id: row.campaign_id,
    calculation_attempt: row.calculation_attempt,
    status: row.status,
    freshness_status: row.freshness_status,
    freshness_reason: row.freshness_reason,
    method_version: row.method_version,
    market_context: {
      country_code: row.country_code,
      currency: row.currency,
      locale: row.locale,
      area_unit: row.area_unit,
      rent_period: row.rent_period
    },
    input_fingerprint: row.input_fingerprint,
    evidence_dataset_revision: row.evidence_dataset_revision,
    evidence_as_of: row.evidence_as_of?.toISOString() ?? null,
    generated_at: row.generated_at?.toISOString() ?? null,
    created_at: row.created_at.toISOString(),
    failure: row.failure,
    results: row.results
  };
}

const SNAPSHOT_SELECT = `
  SELECT
    s.analysis_snapshot_id, s.technical_assignment_id, s.source_revision,
    s.scenario, s.analysis_kind, s.campaign_id, s.calculation_attempt,
    s.status, s.schema_version, s.method_version, s.country_code, s.currency,
    s.locale, s.area_unit, s.rent_period, s.input_fingerprint,
    s.evidence_dataset_revision, s.evidence_as_of, s.results, s.failure,
    s.created_at, s.generated_at, freshness.freshness_status, freshness.freshness_reason
  FROM leasemind_app.analysis_snapshot s
  JOIN leasemind_app.analysis_snapshot_freshness_projection freshness
    ON freshness.analysis_snapshot_id = s.analysis_snapshot_id`;

export async function getAnalysisSnapshotById(
  pool: pg.Pool,
  analysisSnapshotId: string
): Promise<AnalysisSnapshotEnvelope | null> {
  const result = await pool.query<SnapshotRow>(
    `${SNAPSHOT_SELECT} WHERE s.analysis_snapshot_id = $1`,
    [analysisSnapshotId]
  );
  return result.rows[0] ? snapshotEnvelope(result.rows[0]) : null;
}

export async function getCurrentAnalysisSnapshot(
  pool: pg.Pool,
  input: GetCurrentAnalysisSnapshotInput
): Promise<AnalysisSnapshotEnvelope | null> {
  if (input.analysisKind === 'pre_launch' && input.campaignId != null) {
    throw new AnalysisRequestError('ANALYSIS_KIND_INVALID', 400, false);
  }
  if (input.analysisKind === 'post_launch_refresh' && input.campaignId == null) {
    throw new AnalysisRequestError('ANALYSIS_CAMPAIGN_REQUIRED', 400, false);
  }
  const values: unknown[] = [input.technicalAssignmentId, input.revision, input.analysisKind];
  let campaignPredicate = 'AND s.campaign_id IS NULL';
  if (input.analysisKind === 'post_launch_refresh') {
    values.push(input.campaignId);
    campaignPredicate = `AND s.campaign_id = $${values.length}`;
  }
  const result = await pool.query<SnapshotRow>(
    `${SNAPSHOT_SELECT}
      WHERE s.technical_assignment_id = $1
        AND s.source_revision = $2
        AND s.analysis_kind = $3
        ${campaignPredicate}
      ORDER BY s.calculation_attempt DESC
      LIMIT 1`,
    values
  );
  return result.rows[0] ? snapshotEnvelope(result.rows[0]) : null;
}
