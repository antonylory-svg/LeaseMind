import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import type pg from 'pg';
import { checkDatabaseConnection } from './db.js';
import { CAMPAIGN_STATUSES, getCampaignDetailById, listCampaigns } from './db/campaigns.js';
import { isUuidV4OrV7 } from './uuid.js';
import { SafeLogController, loggerOptions, genReqId } from './observability/logging.js';
import {
  saveTechnicalAssignmentDraft,
  getTechnicalAssignmentById,
  TechnicalAssignmentFieldError,
  TechnicalAssignmentScenarioImmutableError,
  TechnicalAssignmentStateInvalidError,
  TechnicalAssignmentRevisionConflictError,
  type Scenario
} from './db/technicalAssignment.js';
import { PROPERTY_FIELD_SPECS, TENANT_REQUEST_FIELD_SPECS } from './db/technicalAssignmentValidation.js';
import {
  launchCampaignFromTechnicalAssignment,
  TechnicalAssignmentNotFoundError,
  TechnicalAssignmentAnalysisRequiredError,
  TechnicalAssignmentAnalysisStaleError,
  ContactsGateRequiredError,
  LaunchIdempotencyConflictError
} from './db/launchCampaign.js';
import {
  createOrReplayPreLaunchAnalysisSnapshot,
  createOrReplayPostLaunchRefreshRetry,
  getAnalysisSnapshotById,
  getCurrentAnalysisSnapshot
} from './db/analysisSnapshot.js';
import { ANALYSIS_ERROR_CODES, AnalysisRequestError, type AnalysisKind } from './analysisTypes.js';

export interface BuildAppOptions {
  pool: pg.Pool;
  // Dedicated least-privilege write connection for POST /api/v1/campaigns
  // only (ADR-0007/ADR-0008) -- never the migrator/maintainer/bootstrap
  // identity. Defaults to `pool` when omitted, which is only ever
  // exercised by tests that never call the command endpoint; server.ts
  // always passes a real, separate command pool.
  commandPool?: pg.Pool;
  // Dedicated least-privilege connection for the Technical Assignment
  // save-draft command (ADR-0008) -- the only pool with any access to the
  // protected address table. Defaults to `pool` when omitted (tests only).
  technicalAssignmentPool?: pg.Pool;
  // Dedicated synchronous Analysis command identity (ADR-0009). Read paths
  // stay on the ordinary API reader pool; only POST uses this pool.
  analysisPool?: pg.Pool;
  // false disables logging entirely (existing test-suite behavior); a
  // writable stream captures the allowlisted JSON logs in-memory for
  // observability tests (see tests/observabilityBoundary.test.ts); omitted
  // keeps the previous default (stdout via loggerOptions).
  logger?: boolean | NodeJS.WritableStream;
}

const liveResponseSchema = {
  200: {
    type: 'object',
    additionalProperties: false,
    required: ['status'],
    properties: {
      status: { type: 'string', enum: ['ok'] }
    }
  }
} as const;

const readyResponseSchema = {
  200: {
    type: 'object',
    additionalProperties: false,
    required: ['status', 'database'],
    properties: {
      status: { type: 'string', enum: ['ok'] },
      database: { type: 'string', enum: ['connected'] }
    }
  },
  503: {
    type: 'object',
    additionalProperties: false,
    required: ['status', 'database'],
    properties: {
      status: { type: 'string', enum: ['error'] },
      database: { type: 'string', enum: ['unreachable'] }
    }
  }
} as const;

const campaignSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['campaign_id', 'status', 'aggregate_version', 'created_at', 'updated_at'],
  properties: {
    campaign_id: { type: 'string', format: 'uuid' },
    status: { type: 'string', enum: [...CAMPAIGN_STATUSES] },
    aggregate_version: { type: 'string', pattern: '^[1-9][0-9]*$' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  }
} as const;

// ADR-0009: read-only server-owned context (technical_assignment_id,
// source_revision, scenario) letting the frontend ask the existing
// GET .../analysis-snapshots/current endpoint for the current
// post_launch_refresh Snapshot -- never exact address, contacts, PII, raw
// evidence, internal reason codes or any post_launch_refresh_intent column.
const campaignAnalysisContextSchema = {
  anyOf: [
    { type: 'null' },
    {
      type: 'object',
      additionalProperties: false,
      required: ['technical_assignment_id', 'source_revision', 'scenario'],
      properties: {
        technical_assignment_id: { type: 'string', format: 'uuid' },
        source_revision: { type: 'integer', minimum: 1 },
        scenario: { type: 'string', enum: ['need_tenant', 'need_property'] }
      }
    }
  ]
} as const;

const campaignDetailSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['campaign_id', 'status', 'aggregate_version', 'created_at', 'updated_at', 'analysis_context'],
  properties: {
    campaign_id: { type: 'string', format: 'uuid' },
    status: { type: 'string', enum: [...CAMPAIGN_STATUSES] },
    aggregate_version: { type: 'string', pattern: '^[1-9][0-9]*$' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
    analysis_context: campaignAnalysisContextSchema
  }
} as const;

const campaignServiceUnavailableSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['status', 'database'],
  properties: {
    status: { type: 'string', enum: ['error'] },
    database: { type: 'string', enum: ['unreachable'] }
  }
} as const;

const campaignListResponseSchema = {
  200: {
    type: 'object',
    additionalProperties: false,
    required: ['campaigns'],
    properties: {
      campaigns: { type: 'array', items: campaignSchema }
    }
  },
  503: campaignServiceUnavailableSchema
} as const;

const campaignDetailResponseSchema = {
  200: campaignDetailSchema,
  400: {
    type: 'object',
    additionalProperties: false,
    required: ['error'],
    properties: {
      error: { type: 'string', enum: ['INVALID_CAMPAIGN_ID'] }
    }
  },
  404: {
    type: 'object',
    additionalProperties: false,
    required: ['error'],
    properties: {
      error: { type: 'string', enum: ['CAMPAIGN_NOT_FOUND'] }
    }
  },
  503: campaignServiceUnavailableSchema
} as const;

// Synthetic-only atomic Campaign launch command (ADR-0007/ADR-0008). Never
// accepts a name, phone, email or any other contact/commercial field --
// only a reference to an already-saved, already-ready Technical
// Assignment plus the caller's launch idempotency_key, optional-at-transport
// Analysis Snapshot reference (required by application logic for every new
// launch), and the synthetic Contacts Gate marker.
const launchCampaignBodySchema = {
  type: 'object',
  additionalProperties: false,
  required: ['idempotency_key', 'technical_assignment_id', 'expected_revision', 'contacts_gate_evidence'],
  properties: {
    idempotency_key: { type: 'string', minLength: 1, maxLength: 200 },
    technical_assignment_id: { type: 'string', format: 'uuid' },
    expected_revision: { type: 'integer', minimum: 1 },
    analysis_snapshot_id: { type: 'string', format: 'uuid' },
    contacts_gate_evidence: { type: 'string', minLength: 1, maxLength: 100 }
  }
} as const;

const launchCampaignErrorResponseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['error'],
  properties: {
    error: {
      type: 'string',
      enum: [
        'INVALID_IDEMPOTENCY_KEY',
        'TECHNICAL_ASSIGNMENT_STATE_INVALID',
        'TECHNICAL_ASSIGNMENT_ANALYSIS_REQUIRED',
        'TECHNICAL_ASSIGNMENT_ANALYSIS_STALE',
        'TECHNICAL_ASSIGNMENT_CONTACTS_GATE_REQUIRED',
        'TECHNICAL_ASSIGNMENT_REVISION_CONFLICT'
      ]
    }
  }
} as const;

const createCampaignResponseSchema = {
  200: campaignSchema,
  201: campaignSchema,
  400: launchCampaignErrorResponseSchema,
  503: campaignServiceUnavailableSchema
} as const;

// ---------------------------------------------------------------------------
// Technical Assignment (ADR-0008). additionalProperties: false at every
// level makes it structurally impossible to submit a name, phone, email or
// any other field outside the 30 (Property) / 30 (TenantRequest) approved
// field_ids -- an unknown key is a schema-validation failure, not a
// silently-ignored extra property.
// ---------------------------------------------------------------------------

const propertyPayloadPropertiesSchema = Object.fromEntries(PROPERTY_FIELD_SPECS.map(spec => [spec.fieldId, {}]));
const tenantRequestPayloadPropertiesSchema = Object.fromEntries(TENANT_REQUEST_FIELD_SPECS.map(spec => [spec.fieldId, {}]));

const saveTechnicalAssignmentBodySchema = {
  type: 'object',
  additionalProperties: false,
  required: ['idempotency_key', 'scenario', 'payload'],
  properties: {
    idempotency_key: { type: 'string', minLength: 1, maxLength: 200 },
    technical_assignment_id: { type: 'string', format: 'uuid' },
    expected_revision: { type: 'integer', minimum: 1 },
    scenario: { type: 'string', enum: ['need_tenant', 'need_property'] },
    payload: { type: 'object' }
  },
  allOf: [
    {
      if: { required: ['technical_assignment_id'] },
      then: { required: ['expected_revision'] },
      else: { not: { required: ['expected_revision'] } }
    }
  ],
  if: { properties: { scenario: { const: 'need_tenant' } } },
  then: {
    properties: {
      payload: { type: 'object', additionalProperties: false, properties: propertyPayloadPropertiesSchema }
    }
  },
  else: {
    properties: {
      payload: { type: 'object', additionalProperties: false, properties: tenantRequestPayloadPropertiesSchema }
    }
  }
} as const;

const technicalAssignmentEnvelopeSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'technical_assignment_id',
    'scenario',
    'schema_version',
    'revision',
    'lifecycle_status',
    'has_exact_address',
    'payload',
    'created_at',
    'updated_at'
  ],
  properties: {
    technical_assignment_id: { type: 'string', format: 'uuid' },
    scenario: { type: 'string', enum: ['need_tenant', 'need_property'] },
    schema_version: { type: 'string' },
    revision: { type: 'integer' },
    lifecycle_status: { type: 'string', enum: ['draft', 'ready_for_analysis', 'campaign_started'] },
    has_exact_address: { type: 'boolean' },
    // additionalProperties: true is required, not cosmetic: Fastify's
    // response serializer (fast-json-stringify) treats a bare
    // `{ type: 'object' }` with neither `properties` nor
    // `additionalProperties` as "serialize no keys at all" -- verified
    // empirically -- which would silently return `payload: {}` on every
    // response regardless of actual content. The payload's exact shape is
    // already fully constrained on the way in by
    // saveTechnicalAssignmentBodySchema's per-scenario if/then/else, and
    // property_exact_address is always stripped before this object is
    // built (see technicalAssignment.ts) -- passthrough here is safe.
    payload: { type: 'object', additionalProperties: true },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  }
} as const;

const technicalAssignmentErrorResponseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['error'],
  properties: {
    field_id: { type: ['string', 'null'] },
    error: {
      type: 'string',
      enum: [
        'TECHNICAL_ASSIGNMENT_SCHEMA_UNSUPPORTED',
        'TECHNICAL_ASSIGNMENT_SCENARIO_REQUIRED',
        'TECHNICAL_ASSIGNMENT_SCENARIO_IMMUTABLE',
        'TECHNICAL_ASSIGNMENT_STATE_INVALID',
        'TECHNICAL_ASSIGNMENT_REVISION_CONFLICT',
        'TECHNICAL_ASSIGNMENT_REQUIRED_FIELD_MISSING',
        'TECHNICAL_ASSIGNMENT_FIELD_TYPE_INVALID',
        'TECHNICAL_ASSIGNMENT_FIELD_VALUE_INVALID',
        'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT',
        'TECHNICAL_ASSIGNMENT_PERSONAL_DATA_FORBIDDEN',
        'TECHNICAL_ASSIGNMENT_SECRET_FORBIDDEN'
      ]
    }
  }
} as const;

const saveTechnicalAssignmentResponseSchema = {
  200: technicalAssignmentEnvelopeSchema,
  201: technicalAssignmentEnvelopeSchema,
  400: technicalAssignmentErrorResponseSchema,
  503: campaignServiceUnavailableSchema
} as const;

const getTechnicalAssignmentResponseSchema = {
  200: technicalAssignmentEnvelopeSchema,
  404: {
    type: 'object',
    additionalProperties: false,
    required: ['error'],
    properties: { error: { type: 'string', enum: ['TECHNICAL_ASSIGNMENT_NOT_FOUND'] } }
  }
} as const;

const nullableUuidSchema = {
  anyOf: [{ type: 'string', format: 'uuid' }, { type: 'null' }]
} as const;

const analysisMetricSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['metric_status', 'confidence', 'value', 'sample_size', 'evidence', 'reason_codes', 'assumptions'],
  properties: {
    metric_status: { type: 'string', enum: ['assessed', 'insufficient_data'] },
    confidence: { type: ['string', 'null'], enum: ['low', 'medium', 'high', null] },
    value: { anyOf: [{ type: 'object', additionalProperties: true }, { type: 'null' }] },
    sample_size: { type: 'integer', minimum: 0 },
    evidence: {
      type: 'object',
      additionalProperties: false,
      required: ['method', 'filters_applied', 'dataset_revision'],
      properties: {
        method: { type: 'string' },
        filters_applied: { type: 'array', items: { type: 'string' } },
        dataset_revision: { type: ['string', 'null'], pattern: '^[0-9a-f]{64}$' }
      }
    },
    reason_codes: { type: 'array', items: { type: 'string' } },
    assumptions: { type: 'array', items: { type: 'string' } }
  }
} as const;

const analysisSnapshotSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'schema_version', 'analysis_snapshot_id', 'technical_assignment_id', 'source_revision',
    'scenario', 'analysis_kind', 'campaign_id', 'calculation_attempt', 'status',
    'freshness_status', 'freshness_reason', 'method_version', 'market_context',
    'input_fingerprint', 'evidence_dataset_revision', 'evidence_as_of', 'generated_at',
    'created_at', 'failure', 'results'
  ],
  properties: {
    schema_version: { type: 'string', enum: ['1.0'] },
    analysis_snapshot_id: { type: 'string', format: 'uuid' },
    technical_assignment_id: { type: 'string', format: 'uuid' },
    source_revision: { type: 'integer', minimum: 1 },
    scenario: { type: 'string', enum: ['need_tenant', 'need_property'] },
    analysis_kind: { type: 'string', enum: ['pre_launch', 'post_launch_refresh'] },
    campaign_id: nullableUuidSchema,
    calculation_attempt: { type: 'integer', minimum: 1 },
    status: { type: 'string', enum: ['pending', 'completed', 'insufficient_data', 'failed'] },
    freshness_status: { type: 'string', enum: ['current', 'stale'] },
    freshness_reason: {
      type: ['string', 'null'],
      enum: ['revision_changed', 'campaign_mismatch', 'evidence_revoked', null]
    },
    method_version: { type: 'string', enum: ['synthetic_ru_v1'] },
    market_context: {
      type: 'object',
      additionalProperties: false,
      required: ['country_code', 'currency', 'locale', 'area_unit', 'rent_period'],
      properties: {
        country_code: { type: 'string', enum: ['RU'] },
        currency: { type: 'string', enum: ['RUB'] },
        locale: { type: 'string', enum: ['ru-RU'] },
        area_unit: { type: 'string', enum: ['sqm'] },
        rent_period: { type: 'string', enum: ['month'] }
      }
    },
    input_fingerprint: { type: 'string', pattern: '^[0-9a-f]{64}$' },
    evidence_dataset_revision: { type: ['string', 'null'], pattern: '^[0-9a-f]{64}$' },
    evidence_as_of: { type: ['string', 'null'], format: 'date-time' },
    generated_at: { type: ['string', 'null'], format: 'date-time' },
    created_at: { type: 'string', format: 'date-time' },
    failure: {
      anyOf: [
        { type: 'null' },
        {
          type: 'object',
          additionalProperties: false,
          required: ['code', 'retryable'],
          properties: {
            code: { type: 'string', enum: ['ANALYSIS_DATASET_UNAVAILABLE', 'ANALYSIS_GENERATION_FAILED'] },
            retryable: { type: 'boolean' }
          }
        }
      ]
    },
    results: {
      anyOf: [
        { type: 'null' },
        {
          type: 'object',
          additionalProperties: false,
          required: ['price_adequacy', 'competition', 'deal_probability_30d', 'candidate_categories'],
          properties: {
            price_adequacy: analysisMetricSchema,
            competition: analysisMetricSchema,
            deal_probability_30d: analysisMetricSchema,
            candidate_categories: analysisMetricSchema
          }
        }
      ]
    }
  }
} as const;

const analysisErrorSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['code', 'message', 'request_id', 'retryable'],
  properties: {
    code: { type: 'string', enum: [...ANALYSIS_ERROR_CODES] },
    message: { type: 'string' },
    request_id: { type: 'string' },
    retryable: { type: 'boolean' }
  }
} as const;

const createAnalysisSnapshotBodySchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'idempotency_key', 'technical_assignment_id', 'expected_revision',
    'analysis_kind', 'campaign_id', 'retry_of_analysis_snapshot_id'
  ],
  properties: {
    idempotency_key: { type: 'string', minLength: 1, maxLength: 200 },
    technical_assignment_id: { type: 'string', format: 'uuid' },
    expected_revision: { type: 'integer', minimum: 1 },
    analysis_kind: { type: 'string', enum: ['pre_launch', 'post_launch_refresh'] },
    campaign_id: nullableUuidSchema,
    retry_of_analysis_snapshot_id: nullableUuidSchema
  }
} as const;

const analysisWriteResponseSchema = {
  200: analysisSnapshotSchema,
  201: analysisSnapshotSchema,
  202: analysisSnapshotSchema,
  400: analysisErrorSchema,
  404: analysisErrorSchema,
  409: analysisErrorSchema,
  503: analysisErrorSchema
} as const;

const analysisReadResponseSchema = {
  200: analysisSnapshotSchema,
  400: analysisErrorSchema,
  404: analysisErrorSchema,
  503: analysisErrorSchema
} as const;

export function buildApp(options: BuildAppOptions): FastifyInstance {
  // Secure application observability boundary -- see
  // 03_ARCHITECTURE/decisions/ADR-0006-secure-application-observability-boundary.md.
  // options.logger === false (used by the test suite) disables logging
  // entirely, exactly as before; any other value now gets the allowlisted,
  // server-owned-request-id logger instead of Fastify's raw defaults.
  const customStream = typeof options.logger === 'object' ? options.logger : undefined;
  const app = Fastify({
    // loggerOptions' serializer/redact shape is deliberately looser than
    // Fastify's strict per-key serializer typing (see observability/logging.ts);
    // this is the one narrow, documented point where that is bridged.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger: options.logger === false ? false : ({ ...loggerOptions, stream: customStream } as any),
    logController: new SafeLogController(),
    genReqId,
    requestIdHeader: false,
    // Fastify's default ajv config (removeAdditional: true, coerceTypes:
    // true) silently strips properties that fail `additionalProperties:
    // false` and silently coerces wrong-typed values instead of rejecting
    // the request -- both verified empirically. Either would let a caller
    // send an unexpected shape on POST /api/v1/campaigns and have it
    // silently reinterpreted rather than refused. Disabling both makes any
    // deviation from createCampaignBodySchema a hard 400 (see
    // attachValidation below) instead.
    ajv: { customOptions: { removeAdditional: false, coerceTypes: false } }
  });
  app.decorateRequest('safeErrorCode', null);
  const { pool } = options;
  const commandPool = options.commandPool ?? options.pool;
  const technicalAssignmentPool = options.technicalAssignmentPool ?? options.pool;
  const analysisPool = options.analysisPool ?? options.pool;

  app.get(
    '/api/v1/health/live',
    { schema: { response: liveResponseSchema } },
    async () => ({ status: 'ok' as const })
  );

  app.get(
    '/api/v1/health/ready',
    { schema: { response: readyResponseSchema } },
    async (request, reply) => {
      const connected = await checkDatabaseConnection(pool);
      if (!connected) {
        request.safeErrorCode = 'DATABASE_UNAVAILABLE';
        return reply.code(503).send({ status: 'error' as const, database: 'unreachable' as const });
      }
      return reply.code(200).send({ status: 'ok' as const, database: 'connected' as const });
    }
  );

  // Synthetic-only Campaign Current State Projection: derived read model,
  // not the canonical event source of truth. No write endpoints, no status
  // transitions -- see apps/api/migrations/001_campaign_current_state_projection.up.sql.
  app.get(
    '/api/v1/campaigns',
    { schema: { response: campaignListResponseSchema } },
    async (request, reply) => {
      try {
        const campaigns = await listCampaigns(pool);
        return reply.code(200).send({ campaigns });
      } catch {
        request.safeErrorCode = 'DATABASE_UNAVAILABLE';
        return reply.code(503).send({ status: 'error' as const, database: 'unreachable' as const });
      }
    }
  );

  app.get(
    '/api/v1/campaigns/:campaignId',
    {
      schema: {
        params: {
          type: 'object',
          additionalProperties: false,
          required: ['campaignId'],
          properties: {
            campaignId: { type: 'string' }
          }
        },
        response: campaignDetailResponseSchema
      }
    },
    async (request, reply) => {
      const { campaignId } = request.params as { campaignId: string };

      // Rejects malformed input and forbidden UUID versions before any SQL
      // runs -- an injection-shaped string never reaches the database.
      if (!isUuidV4OrV7(campaignId)) {
        request.safeErrorCode = 'INVALID_CAMPAIGN_ID';
        return reply.code(400).send({ error: 'INVALID_CAMPAIGN_ID' as const });
      }

      try {
        const campaign = await getCampaignDetailById(pool, campaignId);
        if (!campaign) {
          request.safeErrorCode = 'CAMPAIGN_NOT_FOUND';
          return reply.code(404).send({ error: 'CAMPAIGN_NOT_FOUND' as const });
        }
        return reply.code(200).send(campaign);
      } catch {
        request.safeErrorCode = 'DATABASE_UNAVAILABLE';
        return reply.code(503).send({ status: 'error' as const, database: 'unreachable' as const });
      }
    }
  );

  // Technical Assignment save-draft command (ADR-0008). Uses
  // technicalAssignmentPool (lmapp_ta_writer) -- the only identity with any
  // access to the protected address table. additionalProperties: false at
  // every level (including the per-scenario payload) makes it structurally
  // impossible to submit any field outside the 30/30 approved field_ids.
  app.post(
    '/api/v1/technical-assignments',
    { schema: { body: saveTechnicalAssignmentBodySchema, response: saveTechnicalAssignmentResponseSchema }, attachValidation: true },
    async (request, reply) => {
      if (request.validationError) {
        request.safeErrorCode = 'TECHNICAL_ASSIGNMENT_FIELD_VALUE_INVALID';
        return reply.code(400).send({ error: 'TECHNICAL_ASSIGNMENT_FIELD_VALUE_INVALID' as const, field_id: null });
      }

      const body = request.body as {
        idempotency_key: string;
        technical_assignment_id?: string;
        expected_revision?: number;
        scenario: Scenario;
        payload: Record<string, unknown>;
      };
      try {
        const result = await saveTechnicalAssignmentDraft(technicalAssignmentPool, {
          idempotencyKey: body.idempotency_key,
          technicalAssignmentId: body.technical_assignment_id,
          expectedRevision: body.expected_revision,
          scenario: body.scenario,
          payload: body.payload
        });
        request.safeErrorCode = null;
        return reply.code(result.isNew ? 201 : 200).send({
          technical_assignment_id: result.technical_assignment_id,
          scenario: result.scenario,
          schema_version: result.schema_version,
          revision: result.revision,
          lifecycle_status: result.lifecycle_status,
          has_exact_address: result.has_exact_address,
          payload: result.payload,
          created_at: result.created_at,
          updated_at: result.updated_at
        });
      } catch (error) {
        if (error instanceof TechnicalAssignmentFieldError) {
          request.safeErrorCode = error.code;
          return reply.code(400).send({ error: error.code, field_id: error.field_id });
        }
        if (
          error instanceof TechnicalAssignmentScenarioImmutableError ||
          error instanceof TechnicalAssignmentStateInvalidError ||
          error instanceof TechnicalAssignmentRevisionConflictError
        ) {
          request.safeErrorCode = error.message;
          return reply.code(400).send({
            error: error.message as
              | 'TECHNICAL_ASSIGNMENT_SCENARIO_IMMUTABLE'
              | 'TECHNICAL_ASSIGNMENT_STATE_INVALID'
              | 'TECHNICAL_ASSIGNMENT_REVISION_CONFLICT',
            field_id: null
          });
        }
        request.safeErrorCode = 'DATABASE_UNAVAILABLE';
        return reply.code(503).send({ status: 'error' as const, database: 'unreachable' as const });
      }
    }
  );

  app.get(
    '/api/v1/technical-assignments/:technicalAssignmentId',
    {
      schema: {
        params: {
          type: 'object',
          additionalProperties: false,
          required: ['technicalAssignmentId'],
          properties: { technicalAssignmentId: { type: 'string' } }
        },
        response: getTechnicalAssignmentResponseSchema
      }
    },
    async (request, reply) => {
      const { technicalAssignmentId } = request.params as { technicalAssignmentId: string };
      if (!isUuidV4OrV7(technicalAssignmentId)) {
        request.safeErrorCode = 'TECHNICAL_ASSIGNMENT_NOT_FOUND';
        return reply.code(404).send({ error: 'TECHNICAL_ASSIGNMENT_NOT_FOUND' as const });
      }
      const result = await getTechnicalAssignmentById(pool, technicalAssignmentId);
      if (!result) {
        request.safeErrorCode = 'TECHNICAL_ASSIGNMENT_NOT_FOUND';
        return reply.code(404).send({ error: 'TECHNICAL_ASSIGNMENT_NOT_FOUND' as const });
      }
      return reply.code(200).send({
        technical_assignment_id: result.technical_assignment_id,
        scenario: result.scenario,
        schema_version: result.schema_version,
        revision: result.revision,
        lifecycle_status: result.lifecycle_status,
        has_exact_address: result.has_exact_address,
        payload: result.payload,
        created_at: result.created_at,
        updated_at: result.updated_at
      });
    }
  );

  const sendAnalysisError = (
    request: FastifyRequest,
    reply: FastifyReply,
    error: AnalysisRequestError
  ): unknown => {
    request.safeErrorCode = error.code;
    return reply.code(error.httpStatus).send({
      code: error.code,
      message: error.message,
      request_id: request.id,
      retryable: error.retryable
    });
  };

  const analysisUnavailable = (request: FastifyRequest, reply: FastifyReply): unknown => {
    return sendAnalysisError(
      request,
      reply,
      new AnalysisRequestError('ANALYSIS_DATASET_UNAVAILABLE', 503, true)
    );
  };

  app.post(
    '/api/v1/analysis-snapshots',
    {
      schema: { body: createAnalysisSnapshotBodySchema, response: analysisWriteResponseSchema },
      attachValidation: true
    },
    async (request, reply) => {
      if (request.validationError) {
        return sendAnalysisError(request, reply, new AnalysisRequestError('ANALYSIS_KIND_INVALID', 400, false));
      }
      const body = request.body as {
        idempotency_key: string;
        technical_assignment_id: string;
        expected_revision: number;
        analysis_kind: AnalysisKind;
        campaign_id: string | null;
        retry_of_analysis_snapshot_id: string | null;
      };
      if (
        !isUuidV4OrV7(body.technical_assignment_id)
        || (body.campaign_id !== null && !isUuidV4OrV7(body.campaign_id))
        || (body.retry_of_analysis_snapshot_id !== null && !isUuidV4OrV7(body.retry_of_analysis_snapshot_id))
      ) {
        return sendAnalysisError(request, reply, new AnalysisRequestError('ANALYSIS_KIND_INVALID', 400, false));
      }
      try {
        const input = {
          idempotencyKey: body.idempotency_key,
          technicalAssignmentId: body.technical_assignment_id,
          expectedRevision: body.expected_revision,
          analysisKind: body.analysis_kind,
          campaignId: body.campaign_id,
          retryOfAnalysisSnapshotId: body.retry_of_analysis_snapshot_id
        };
        // post_launch_refresh is explicit-retry-only on this public command
        // (PRODUCT §11.1/§15.3): the initial attempt is created exclusively
        // by the durable worker via its own server-derived key. pre_launch
        // (create or explicit retry) is unchanged.
        const command = body.analysis_kind === 'post_launch_refresh'
          ? await createOrReplayPostLaunchRefreshRetry(analysisPool, input)
          : await createOrReplayPreLaunchAnalysisSnapshot(analysisPool, input);
        const snapshot = await getAnalysisSnapshotById(pool, command.analysisSnapshotId);
        if (!snapshot) return analysisUnavailable(request, reply);
        request.safeErrorCode = null;
        // PRODUCT §11.1: a new attempt that completed synchronously is 201;
        // a new attempt left `pending` (post_launch_refresh retry, executed
        // by the worker, never synchronously here) is 202; anything that
        // converged to an existing attempt (replay or convergence) is 200.
        // pre_launch's synchronous path always completes before COMMIT, so
        // its status is never 'pending' here -- this is a pure
        // generalization, not a behavior change for pre_launch.
        const statusCode = !command.created ? 200 : snapshot.status === 'pending' ? 202 : 201;
        return reply.code(statusCode).send(snapshot);
      } catch (error) {
        if (error instanceof AnalysisRequestError) return sendAnalysisError(request, reply, error);
        return analysisUnavailable(request, reply);
      }
    }
  );

  app.get(
    '/api/v1/analysis-snapshots/:analysisSnapshotId',
    {
      schema: {
        params: {
          type: 'object',
          additionalProperties: false,
          required: ['analysisSnapshotId'],
          properties: { analysisSnapshotId: { type: 'string' } }
        },
        response: analysisReadResponseSchema
      }
    },
    async (request, reply) => {
      const { analysisSnapshotId } = request.params as { analysisSnapshotId: string };
      if (!isUuidV4OrV7(analysisSnapshotId)) {
        return sendAnalysisError(request, reply, new AnalysisRequestError('ANALYSIS_SNAPSHOT_NOT_FOUND', 404, false));
      }
      try {
        const snapshot = await getAnalysisSnapshotById(pool, analysisSnapshotId);
        if (!snapshot) {
          return sendAnalysisError(request, reply, new AnalysisRequestError('ANALYSIS_SNAPSHOT_NOT_FOUND', 404, false));
        }
        request.safeErrorCode = null;
        return reply.code(200).send(snapshot);
      } catch {
        return analysisUnavailable(request, reply);
      }
    }
  );

  app.get(
    '/api/v1/technical-assignments/:technicalAssignmentId/analysis-snapshots/current',
    {
      schema: {
        params: {
          type: 'object',
          additionalProperties: false,
          required: ['technicalAssignmentId'],
          properties: { technicalAssignmentId: { type: 'string' } }
        },
        querystring: {
          type: 'object',
          additionalProperties: false,
          required: ['revision', 'analysis_kind'],
          properties: {
            revision: { type: 'string', pattern: '^[1-9][0-9]*$' },
            analysis_kind: { type: 'string', enum: ['pre_launch', 'post_launch_refresh'] },
            campaign_id: { type: 'string' }
          }
        },
        response: analysisReadResponseSchema
      },
      attachValidation: true
    },
    async (request, reply) => {
      if (request.validationError) {
        return sendAnalysisError(request, reply, new AnalysisRequestError('ANALYSIS_KIND_INVALID', 400, false));
      }
      const { technicalAssignmentId } = request.params as { technicalAssignmentId: string };
      const query = request.query as { revision: string; analysis_kind: AnalysisKind; campaign_id?: string };
      if (
        !isUuidV4OrV7(technicalAssignmentId)
        || (query.campaign_id !== undefined && !isUuidV4OrV7(query.campaign_id))
      ) {
        return sendAnalysisError(request, reply, new AnalysisRequestError('ANALYSIS_KIND_INVALID', 400, false));
      }
      try {
        const snapshot = await getCurrentAnalysisSnapshot(pool, {
          technicalAssignmentId,
          revision: Number(query.revision),
          analysisKind: query.analysis_kind,
          campaignId: query.campaign_id
        });
        if (!snapshot) {
          return sendAnalysisError(request, reply, new AnalysisRequestError('ANALYSIS_SNAPSHOT_NOT_FOUND', 404, false));
        }
        request.safeErrorCode = null;
        return reply.code(200).send(snapshot);
      } catch (error) {
        if (error instanceof AnalysisRequestError) return sendAnalysisError(request, reply, error);
        return analysisUnavailable(request, reply);
      }
    }
  );

  // Atomic Campaign launch command (ADR-0007/ADR-0008). The only write
  // endpoint on this path. Uses commandPool (lmapp_campaign_writer) -- the
  // read-only API_READER role never gains write capability at runtime.
  app.post(
    '/api/v1/campaigns',
    { schema: { body: launchCampaignBodySchema, response: createCampaignResponseSchema }, attachValidation: true },
    async (request, reply) => {
      // attachValidation defers schema-validation failures here instead of
      // Fastify's own default 400 response, so every malformed body --
      // missing/empty/oversized field, wrong type, or any additional
      // property (e.g. a name/phone/email field) -- maps to the same safe,
      // uniform error shape, never echoing the submitted value or field
      // name back to the caller.
      if (request.validationError) {
        request.safeErrorCode = 'INVALID_IDEMPOTENCY_KEY';
        return reply.code(400).send({ error: 'INVALID_IDEMPOTENCY_KEY' as const });
      }

      const body = request.body as {
        idempotency_key: string;
        technical_assignment_id: string;
        expected_revision: number;
        analysis_snapshot_id?: string;
        contacts_gate_evidence: string;
      };
      try {
        const result = await launchCampaignFromTechnicalAssignment(commandPool, {
          idempotencyKey: body.idempotency_key,
          technicalAssignmentId: body.technical_assignment_id,
          expectedRevision: body.expected_revision,
          analysisSnapshotId: body.analysis_snapshot_id,
          contactsGateEvidence: body.contacts_gate_evidence
        });
        request.safeErrorCode = null;
        return reply.code(result.isReplay ? 200 : 201).send({
          campaign_id: result.campaign_id,
          status: result.status,
          aggregate_version: result.aggregate_version,
          created_at: result.created_at,
          updated_at: result.updated_at
        });
      } catch (error) {
        if (
          error instanceof TechnicalAssignmentNotFoundError ||
          error instanceof TechnicalAssignmentAnalysisRequiredError ||
          error instanceof TechnicalAssignmentAnalysisStaleError ||
          error instanceof ContactsGateRequiredError ||
          error instanceof LaunchIdempotencyConflictError
        ) {
          request.safeErrorCode = error.message;
          return reply.code(400).send({
            error: error.message as
              | 'TECHNICAL_ASSIGNMENT_STATE_INVALID'
              | 'TECHNICAL_ASSIGNMENT_ANALYSIS_REQUIRED'
              | 'TECHNICAL_ASSIGNMENT_ANALYSIS_STALE'
              | 'TECHNICAL_ASSIGNMENT_CONTACTS_GATE_REQUIRED'
              | 'TECHNICAL_ASSIGNMENT_REVISION_CONFLICT'
          });
        }
        request.safeErrorCode = 'DATABASE_UNAVAILABLE';
        return reply.code(503).send({ status: 'error' as const, database: 'unreachable' as const });
      }
    }
  );

  app.addHook('onClose', async () => {
    await pool.end();
    if (commandPool !== pool) {
      await commandPool.end();
    }
    if (technicalAssignmentPool !== pool && technicalAssignmentPool !== commandPool) {
      await technicalAssignmentPool.end();
    }
    if (analysisPool !== pool && analysisPool !== commandPool && analysisPool !== technicalAssignmentPool) {
      await analysisPool.end();
    }
  });

  return app;
}
