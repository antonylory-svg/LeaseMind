import Fastify, { type FastifyInstance } from 'fastify';
import type pg from 'pg';
import { checkDatabaseConnection } from './db.js';

export interface BuildAppOptions {
  pool: pg.Pool;
  logger?: boolean;
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

export function buildApp(options: BuildAppOptions): FastifyInstance {
  const app = Fastify({ logger: options.logger ?? true });
  const { pool } = options;

  app.get(
    '/api/v1/health/live',
    { schema: { response: liveResponseSchema } },
    async () => ({ status: 'ok' as const })
  );

  app.get(
    '/api/v1/health/ready',
    { schema: { response: readyResponseSchema } },
    async (_request, reply) => {
      const connected = await checkDatabaseConnection(pool);
      if (!connected) {
        return reply.code(503).send({ status: 'error' as const, database: 'unreachable' as const });
      }
      return reply.code(200).send({ status: 'ok' as const, database: 'connected' as const });
    }
  );

  app.addHook('onClose', async () => {
    await pool.end();
  });

  return app;
}
