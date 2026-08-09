import { randomUUID } from 'node:crypto';
import type pg from 'pg';
import {
  PROPERTY_FIELD_SPECS,
  PROPERTY_REQUIRED_FIELDS,
  TENANT_REQUEST_FIELD_SPECS,
  TENANT_REQUEST_REQUIRED_FIELDS,
  validateField,
  validatePropertyCrossFieldRules,
  validateTenantRequestCrossFieldRules,
  missingRequiredFields,
  type FieldError,
  type FieldSpec,
  type NormalizedValue
} from './technicalAssignmentValidation.js';

// Technical Assignment save-draft command. See
// 02_PRODUCT/CAMPAIGN_TECHNICAL_ASSIGNMENT.md and
// 03_ARCHITECTURE/decisions/ADR-0008-technical-assignment-implementation.md.
//
// TechnicalAssignment is not a separate domain entity (doc 9.1.1): its
// envelope lives as columns on Property/TenantRequest. `scenario` is not a
// stored column -- it is implied by which table the row lives in.
// `technical_assignment_id` is the same server-generated UUID as
// Property.property_id / TenantRequest.tenant_request_id.

export const TECHNICAL_ASSIGNMENT_SCHEMA_VERSION = '1.0';
export const LIFECYCLE_STATUSES = ['draft', 'ready_for_analysis', 'campaign_started'] as const;
export type LifecycleStatus = (typeof LIFECYCLE_STATUSES)[number];

export type Scenario = 'need_tenant' | 'need_property';

export class TechnicalAssignmentFieldError extends Error {
  readonly field_id: string;
  readonly code: FieldError['code'];
  constructor(error: FieldError) {
    super(error.code);
    this.name = 'TechnicalAssignmentFieldError';
    this.field_id = error.field_id;
    this.code = error.code;
  }
}

export class TechnicalAssignmentScenarioImmutableError extends Error {
  constructor() {
    super('TECHNICAL_ASSIGNMENT_SCENARIO_IMMUTABLE');
    this.name = 'TechnicalAssignmentScenarioImmutableError';
  }
}

export class TechnicalAssignmentStateInvalidError extends Error {
  constructor() {
    super('TECHNICAL_ASSIGNMENT_STATE_INVALID');
    this.name = 'TechnicalAssignmentStateInvalidError';
  }
}

export class TechnicalAssignmentRevisionConflictError extends Error {
  constructor() {
    super('TECHNICAL_ASSIGNMENT_REVISION_CONFLICT');
    this.name = 'TechnicalAssignmentRevisionConflictError';
  }
}

export interface SaveTechnicalAssignmentDraftInput {
  idempotencyKey: string;
  scenario: Scenario;
  payload: Record<string, unknown>;
  technicalAssignmentId?: string;
  expectedRevision?: number;
}

export interface TechnicalAssignmentEnvelope {
  technical_assignment_id: string;
  scenario: Scenario;
  schema_version: string;
  revision: number;
  lifecycle_status: LifecycleStatus;
  has_exact_address: boolean;
  payload: Record<string, NormalizedValue>;
  created_at: string;
  updated_at: string;
  isNew: boolean;
}

const SCENARIO_TABLE: Record<Scenario, { table: string; idColumn: string; specs: typeof PROPERTY_FIELD_SPECS; required: readonly string[] }> = {
  need_tenant: {
    table: 'leasemind_app.property',
    idColumn: 'property_id',
    specs: PROPERTY_FIELD_SPECS,
    required: PROPERTY_REQUIRED_FIELDS
  },
  need_property: {
    table: 'leasemind_app.tenant_request',
    idColumn: 'tenant_request_id',
    specs: TENANT_REQUEST_FIELD_SPECS,
    required: TENANT_REQUEST_REQUIRED_FIELDS
  }
};

const OTHER_SCENARIO: Record<Scenario, Scenario> = { need_tenant: 'need_property', need_property: 'need_tenant' };

function isDateField(fieldId: string): boolean {
  return fieldId === 'property_available_from' || fieldId === 'request_move_in_by';
}

function normalizedEquals(a: NormalizedValue, b: NormalizedValue): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }
  return a === b;
}

/** node-postgres does not return every column type as the JS shape this
 * module works with, verified empirically:
 *  - `numeric`/`decimal` columns come back as strings, not numbers (to
 *    avoid float precision loss) -- comparing a freshly-validated number
 *    against the raw stored string (`100 !== "100.00"`) would report every
 *    unchanged decimal field as "changed" on every resubmission;
 *  - `date` columns come back as JS `Date` objects (in local server time),
 *    not the `"YYYY-MM-DD"` strings this module validates and stores --
 *    the same false-mismatch problem.
 * Coerces exactly the 'decimal' and 'date' kind fields back to the shape
 * `validateField` produces; every other kind already round-trips through
 * `pg` as the correct JS type (arrays, booleans, integers, strings). */
function coerceStoredRow(row: Record<string, unknown>, specs: readonly FieldSpec[]): Record<string, unknown> {
  const coerced = { ...row };
  for (const spec of specs) {
    const value = coerced[spec.fieldId];
    if (spec.kind === 'decimal' && typeof value === 'string') {
      coerced[spec.fieldId] = Number(value);
    } else if (spec.kind === 'date' && value instanceof Date) {
      // pg parses `date` columns as a local-midnight Date object (verified
      // empirically: server timezone UTC+3 turned stored "2026-08-11" into
      // a Date whose .toISOString() reads "2026-08-10T21:00:00.000Z") --
      // local getters, not UTC ones, are required to recover the original
      // calendar date string regardless of server timezone.
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      coerced[spec.fieldId] = `${year}-${month}-${day}`;
    }
  }
  return coerced;
}

async function findRowByIdempotencyKey(
  client: pg.PoolClient,
  table: string,
  idColumn: string,
  idempotencyKey: string
): Promise<Record<string, unknown> | null> {
  const result = await client.query(`SELECT * FROM ${table} WHERE idempotency_key = $1 FOR UPDATE`, [idempotencyKey]);
  return result.rows[0] ?? null;
}

async function findRowById(
  client: pg.PoolClient,
  table: string,
  idColumn: string,
  technicalAssignmentId: string
): Promise<Record<string, unknown> | null> {
  const result = await client.query(`SELECT * FROM ${table} WHERE ${idColumn} = $1 FOR UPDATE`, [technicalAssignmentId]);
  return result.rows[0] ?? null;
}

/**
 * Serializes every command that targets the same draft identity or reuses
 * the same creation idempotency key. The two namespaced scopes are sorted
 * before locking, so commands that overlap on both can never deadlock.
 * hashtextextended collisions only cause harmless extra serialization.
 */
async function lockCommandScopes(client: pg.PoolClient, idempotencyKey: string, technicalAssignmentId?: string): Promise<void> {
  const scopes = [`technical-assignment:key:${idempotencyKey}`];
  if (technicalAssignmentId) scopes.push(`technical-assignment:id:${technicalAssignmentId}`);
  for (const scope of scopes.sort()) {
    await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [scope]);
  }
}

async function hydrateProtectedAddress(
  client: pg.PoolClient,
  scenario: Scenario,
  existing: Record<string, unknown> | null
): Promise<Record<string, unknown> | null> {
  if (!existing || scenario !== 'need_tenant') return existing;
  const result = await client.query<{ exact_address: string | null }>(
    'SELECT exact_address FROM leasemind_app.property_protected_address WHERE property_id = $1',
    [existing.property_id]
  );
  return { ...existing, property_exact_address: result.rows[0]?.exact_address ?? null };
}

/**
 * Creates or updates one Technical Assignment draft. A first save is
 * keyed by (scenario, idempotency_key); an identical retry is a no-op.
 * Every changed update explicitly targets technicalAssignmentId at the
 * caller's expectedRevision. This preserves reload/old-tab recovery without
 * exposing the creation key, while stale writers fail instead of silently
 * overwriting a newer revision. Reusing a bound key under the other scenario
 * is rejected without any write (TechnicalAssignmentScenarioImmutableError).
 */
export async function saveTechnicalAssignmentDraft(
  pool: pg.Pool,
  input: SaveTechnicalAssignmentDraftInput
): Promise<TechnicalAssignmentEnvelope> {
  const { table, idColumn, specs, required } = SCENARIO_TABLE[input.scenario];
  const otherScenario = SCENARIO_TABLE[OTHER_SCENARIO[input.scenario]];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const targetsExisting = input.technicalAssignmentId !== undefined;
    if (targetsExisting !== (input.expectedRevision !== undefined)) {
      await client.query('ROLLBACK');
      throw new TechnicalAssignmentStateInvalidError();
    }

    await lockCommandScopes(client, input.idempotencyKey, input.technicalAssignmentId);

    let existingRaw: Record<string, unknown> | null;
    if (targetsExisting) {
      existingRaw = await findRowById(client, table, idColumn, input.technicalAssignmentId!);
      if (!existingRaw) {
        const otherById = await findRowById(client, otherScenario.table, otherScenario.idColumn, input.technicalAssignmentId!);
        await client.query('ROLLBACK');
        if (otherById) throw new TechnicalAssignmentScenarioImmutableError();
        throw new TechnicalAssignmentStateInvalidError();
      }

      // A command key that already belongs to another draft cannot be
      // rebound to this target. Check both scenario tables while the key
      // advisory lock is held, closing the cross-table race as well.
      for (const candidate of [SCENARIO_TABLE.need_tenant, SCENARIO_TABLE.need_property]) {
        const keyed = await findRowByIdempotencyKey(client, candidate.table, candidate.idColumn, input.idempotencyKey);
        if (keyed && keyed[candidate.idColumn] !== input.technicalAssignmentId) {
          await client.query('ROLLBACK');
          throw new TechnicalAssignmentStateInvalidError();
        }
      }
    } else {
      const conflict = await client.query(`SELECT 1 FROM ${otherScenario.table} WHERE idempotency_key = $1`, [
        input.idempotencyKey
      ]);
      if ((conflict.rowCount ?? 0) > 0) {
        await client.query('ROLLBACK');
        throw new TechnicalAssignmentScenarioImmutableError();
      }
      existingRaw = await findRowByIdempotencyKey(client, table, idColumn, input.idempotencyKey);
    }

    const hydratedExisting = await hydrateProtectedAddress(client, input.scenario, existingRaw);
    const existing = hydratedExisting ? coerceStoredRow(hydratedExisting, specs) : null;
    if (existing && existing.lifecycle_status === 'campaign_started') {
      await client.query('ROLLBACK');
      throw new TechnicalAssignmentStateInvalidError();
    }

    const normalized: Record<string, NormalizedValue> = {};
    for (const spec of specs) {
      const provided = Object.prototype.hasOwnProperty.call(input.payload, spec.fieldId);
      const rawValue = provided ? input.payload[spec.fieldId] : (existing?.[spec.fieldId] as unknown);
      const existingNormalized = existing ? ((existing[spec.fieldId] as NormalizedValue) ?? null) : null;

      let dateFreshnessApplies = true;
      if (isDateField(spec.fieldId) && existing) {
        // Only re-check "not before today / not beyond +730 days" when this
        // save is actually changing the value (doc 7.4.9 / 8.4.7): a value
        // already stored and left untouched must never become invalid
        // purely because time has passed.
        const rawUnchanged = provided ? rawValue === existingNormalized : true;
        dateFreshnessApplies = !rawUnchanged;
      }

      const { value, error } = validateField(spec, rawValue, dateFreshnessApplies);
      if (error) {
        await client.query('ROLLBACK');
        throw new TechnicalAssignmentFieldError(error);
      }
      normalized[spec.fieldId] = value;
    }

    const crossFieldErrors =
      input.scenario === 'need_tenant' ? validatePropertyCrossFieldRules(normalized) : validateTenantRequestCrossFieldRules(normalized);
    if (crossFieldErrors.length > 0) {
      await client.query('ROLLBACK');
      throw new TechnicalAssignmentFieldError(crossFieldErrors[0]);
    }

    const isNew = !existing;
    const technicalAssignmentId = existing ? (existing[idColumn] as string) : randomUUID();

    const storedRevision = existing ? (existing.revision as number) : null;
    let revision: number = storedRevision ?? 1;
    let changed = false;
    if (existing) {
      changed = specs.some(spec => !normalizedEquals(normalized[spec.fieldId], (existing[spec.fieldId] as NormalizedValue) ?? null));
      if (changed) {
        if (!targetsExisting || storedRevision !== input.expectedRevision) {
          await client.query('ROLLBACK');
          throw new TechnicalAssignmentRevisionConflictError();
        }
        revision += 1;
      }
    }

    const missing = missingRequiredFields(normalized, required);
    const lifecycleStatus: LifecycleStatus = missing.length === 0 ? 'ready_for_analysis' : 'draft';

    // property_exact_address is one of the 30 approved fields but is not a
    // column on `table` itself -- it lives only in
    // leasemind_app.property_protected_address (doc 9.2), written below.
    const columns = specs.map(spec => spec.fieldId).filter(fieldId => fieldId !== 'property_exact_address');
    const values = columns.map(fieldId => normalized[fieldId]);

    // has_exact_address is a denormalized flag stored directly on `property`
    // (never on tenant_request, which has no address field at all) so that
    // read-only callers (lmapp_api_reader) never need any grant on
    // property_protected_address (ADR-0008 section 3). Computed here, from
    // the submitted payload or -- when the address is not part of this
    // particular save call -- from the existing denormalized flag. The
    // protected value itself is read only by this write-role transaction
    // above, solely to detect an actual value change and avoid false
    // revision bumps after a restore.
    const addressProvided = input.scenario === 'need_tenant' && Object.prototype.hasOwnProperty.call(input.payload, 'property_exact_address');
    const hasExactAddress =
      input.scenario === 'need_tenant'
        ? addressProvided
          ? normalized.property_exact_address !== null
          : Boolean(existing?.has_exact_address)
        : false;

    if (isNew) {
      const insertColumns = [idColumn, 'idempotency_key', 'schema_version', 'revision', 'lifecycle_status', ...columns];
      const insertValues: unknown[] = [technicalAssignmentId, input.idempotencyKey, TECHNICAL_ASSIGNMENT_SCHEMA_VERSION, revision, lifecycleStatus, ...values];
      if (input.scenario === 'need_tenant') {
        insertColumns.push('has_exact_address');
        insertValues.push(hasExactAddress);
      }
      const placeholders = insertColumns.map((_, i) => `$${i + 1}`).join(', ');
      await client.query(`INSERT INTO ${table} (${insertColumns.join(', ')}) VALUES (${placeholders})`, insertValues);
    } else if (changed) {
      const setClauses = [
        'revision = $1',
        'lifecycle_status = $2',
        'updated_at = clock_timestamp()',
        ...columns.map((fieldId, i) => `${fieldId} = $${i + 3}`)
      ];
      const updateValues: unknown[] = [revision, lifecycleStatus, ...values];
      if (input.scenario === 'need_tenant') {
        setClauses.push(`has_exact_address = $${updateValues.length + 1}`);
        updateValues.push(hasExactAddress);
      }
      updateValues.push(technicalAssignmentId, storedRevision);
      const result = await client.query(
        `UPDATE ${table} SET ${setClauses.join(', ')}
          WHERE ${idColumn} = $${updateValues.length - 1} AND revision = $${updateValues.length}`,
        updateValues
      );
      if (result.rowCount !== 1) {
        await client.query('ROLLBACK');
        throw new TechnicalAssignmentRevisionConflictError();
      }
    }

    const protectedAddressChanged =
      input.scenario === 'need_tenant' &&
      addressProvided &&
      !normalizedEquals(normalized.property_exact_address, (existing?.property_exact_address as NormalizedValue) ?? null);
    if (protectedAddressChanged) {
      await client.query(
        `INSERT INTO leasemind_app.property_protected_address (property_id, exact_address, updated_at)
         VALUES ($1, $2, clock_timestamp())
         ON CONFLICT (property_id) DO UPDATE SET exact_address = EXCLUDED.exact_address, updated_at = EXCLUDED.updated_at`,
        [technicalAssignmentId, normalized.property_exact_address]
      );
    }

    const finalRow = await client.query(`SELECT created_at, updated_at FROM ${table} WHERE ${idColumn} = $1`, [technicalAssignmentId]);

    await client.query('COMMIT');

    const responsePayload = { ...normalized };
    delete responsePayload.property_exact_address;

    return {
      technical_assignment_id: technicalAssignmentId,
      scenario: input.scenario,
      schema_version: TECHNICAL_ASSIGNMENT_SCHEMA_VERSION,
      revision,
      lifecycle_status: lifecycleStatus,
      has_exact_address: hasExactAddress,
      payload: responsePayload,
      created_at: (finalRow.rows[0].created_at as Date).toISOString(),
      updated_at: (finalRow.rows[0].updated_at as Date).toISOString(),
      isNew
    };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

/** Read-only lookup used by GET /api/v1/technical-assignments/{id}. Never
 * selects or returns property_exact_address. */
export async function getTechnicalAssignmentById(pool: pg.Pool, technicalAssignmentId: string): Promise<TechnicalAssignmentEnvelope | null> {
  for (const scenario of ['need_tenant', 'need_property'] as const) {
    const { table, idColumn, specs } = SCENARIO_TABLE[scenario];
    const columns = specs.map(spec => spec.fieldId).filter(fieldId => fieldId !== 'property_exact_address');
    // has_exact_address is read directly off the row (property only --
    // tenant_request has no such column, so it is never selected there):
    // this path must never touch property_protected_address (ADR-0008
    // section 3; lmapp_api_reader has zero grant on that table).
    const hasExactAddressColumn = scenario === 'need_tenant' ? ', has_exact_address' : '';
    const result = await pool.query(
      `SELECT ${idColumn}, schema_version, revision, lifecycle_status, created_at, updated_at${hasExactAddressColumn}, ${columns.join(', ')}
         FROM ${table} WHERE ${idColumn} = $1`,
      [technicalAssignmentId]
    );
    const rawRow = result.rows[0] as Record<string, unknown> | undefined;
    if (!rawRow) continue;

    // Same pg round-trip quirks as the save path (decimal columns come
    // back as strings, date columns as local-midnight Date objects) --
    // without this, GET returns shapes that never match what POST
    // accepted or what the OpenAPI contract documents.
    const row = coerceStoredRow(rawRow, specs);

    const hasExactAddress = scenario === 'need_tenant' ? Boolean(row.has_exact_address) : false;

    const payload: Record<string, NormalizedValue> = {};
    for (const fieldId of columns) {
      payload[fieldId] = (row[fieldId] as NormalizedValue) ?? null;
    }

    return {
      technical_assignment_id: row[idColumn] as string,
      scenario,
      schema_version: row.schema_version as string,
      revision: row.revision as number,
      lifecycle_status: row.lifecycle_status as LifecycleStatus,
      has_exact_address: hasExactAddress,
      payload,
      created_at: (row.created_at as Date).toISOString(),
      updated_at: (row.updated_at as Date).toISOString(),
      isNew: false
    };
  }
  return null;
}
