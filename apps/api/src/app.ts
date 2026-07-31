import Fastify, { type FastifyInstance } from 'fastify';
import type pg from 'pg';
import { checkDatabaseConnection } from './db.js';
import { CAMPAIGN_STATUSES, getCampaignById, listCampaigns } from './db/campaigns.js';
import { isUuidV4OrV7 } from './uuid.js';
import { SafeLogController, loggerOptions, genReqId } from './observability/logging.js';

export interface BuildAppOptions {
  pool: pg.Pool;
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
    requestIdHeader: false
  });
  app.decorateRequest('safeErrorCode', null);
  const { pool } = options;

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

  app.addHook('onClose', async () => {
    await pool.end();
  });

  return app;
}
