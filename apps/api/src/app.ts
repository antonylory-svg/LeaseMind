import Fastify, { type FastifyInstance } from 'fastify';
import type pg from 'pg';
import { checkDatabaseConnection } from './db.js';
import { CAMPAIGN_STATUSES, getCampaignById, listCampaigns } from './db/campaigns.js';
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
  200: campaignSchema,
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
// Assignment plus the caller's launch idempotency_key and the synthetic
// Contacts Gate marker.
const launchCampaignBodySchema = {
  type: 'object',
  additionalProperties: false,
  required: ['idempotency_key', 'technical_assignment_id', 'expected_revision', 'contacts_gate_evidence'],
  properties: {
    idempotency_key: { type: 'string', minLength: 1, maxLength: 200 },
    technical_assignment_id: { type: 'string', format: 'uuid' },
    expected_revision: { type: 'integer', minimum: 1 },
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
        const campaign = await getCampaignById(pool, campaignId);
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
        contacts_gate_evidence: string;
      };
      try {
        const result = await launchCampaignFromTechnicalAssignment(commandPool, {
          idempotencyKey: body.idempotency_key,
          technicalAssignmentId: body.technical_assignment_id,
          expectedRevision: body.expected_revision,
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
  });

  return app;
}
