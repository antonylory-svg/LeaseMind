import { randomUUID } from 'node:crypto';
import { LogController, type FastifyRequest, type FastifyReply } from 'fastify';

// Secure application observability boundary. See
// 03_ARCHITECTURE/decisions/ADR-0006-secure-application-observability-boundary.md.
//
// Single allowlist for every log line this application emits: event,
// request_id, method, route, status_code, duration_ms, safe_error_code (only
// when applicable). Nothing else -- no headers, no query string, no raw URL,
// no request/response body, no IP/user-agent, no raw Error/message/stack.

declare module 'fastify' {
  interface FastifyRequest {
    /** Set by a route handler right before an error-shaped response is sent.
     * Read once by SafeLogController.requestCompleted() to attach a stable,
     * non-sensitive safe_error_code to that request's completion log line.
     * Never derived from the caught error object itself. */
    safeErrorCode: string | null;
  }
}

export const UNMATCHED_ROUTE = 'UNMATCHED';

/** Server-owned request ID generator. Never reads any incoming header --
 * paired with `requestIdHeader: false` in the Fastify constructor options,
 * this makes a caller-supplied x-request-id/request-id header (including a
 * CRLF/log-injection payload) structurally unable to become request.id or
 * to reach any log line. */
export function genReqId(): string {
  return randomUUID();
}

/** The registered route template only (e.g. "/api/v1/campaigns/:campaignId"),
 * never the raw request URL or its query string. Falls back to a fixed safe
 * placeholder for requests that never matched a route. */
export function safeRoute(request: FastifyRequest): string {
  try {
    const url = request.routeOptions?.url;
    return typeof url === 'string' && url.length > 0 ? url : UNMATCHED_ROUTE;
  } catch {
    return UNMATCHED_ROUTE;
  }
}

interface CompletionFields {
  event: string;
  request_id: string;
  method: string;
  route: string;
  status_code: number;
  duration_ms?: number;
  safe_error_code?: string;
}

function completionFields(request: FastifyRequest, reply: FastifyReply, event: string): CompletionFields {
  const fields: CompletionFields = {
    event,
    request_id: request.id,
    method: request.method,
    route: safeRoute(request),
    status_code: reply.statusCode,
    duration_ms: Math.round(reply.elapsedTime)
  };
  if (request.safeErrorCode) {
    fields.safe_error_code = request.safeErrorCode;
  }
  return fields;
}

/**
 * Replaces Fastify's default internal lifecycle logging (which serializes
 * raw req/res/err objects, including the full URL with any query string,
 * and -- on the default error handler path -- a stack trace) with an
 * allowlist-only implementation. Passed as the `logController` Fastify
 * constructor option (a first-class, documented Fastify 5 extension point),
 * not a monkey-patch.
 */
export class SafeLogController extends LogController {
  incomingRequest(request: FastifyRequest): void {
    if (this.isLogDisabled(request)) return;
    request.log.info({
      event: 'request_started',
      request_id: request.id,
      method: request.method,
      route: safeRoute(request)
    });
  }

  requestCompleted(_error: Error | null, request: FastifyRequest, reply: FastifyReply): void {
    if (this.isLogDisabled(request)) return;
    request.log.info(completionFields(request, reply, 'request_completed'));
  }

  // Only reachable for a genuinely unexpected thrown/rejected error -- every
  // current route handler catches its own errors and never throws. Kept as
  // a backstop so even that path can never log a raw error or stack trace.
  defaultErrorLog(_error: Error, request: FastifyRequest, reply: FastifyReply): void {
    if (this.isLogDisabled(request)) return;
    const fields = completionFields(request, reply, 'request_errored');
    fields.safe_error_code = fields.safe_error_code ?? 'INTERNAL_ERROR';
    if (reply.statusCode >= 500) {
      request.log.error(fields);
    } else {
      request.log.info(fields);
    }
  }

  // Fastify's default implementation logs "Route <method>:<url> not found"
  // with the raw URL. incomingRequest + requestCompleted already safely
  // cover this request's lifecycle (route resolves to UNMATCHED), so this
  // override is intentionally a no-op rather than a duplicate safe line.
  routeNotFound(): void {}

  streamError(_error: Error, request: FastifyRequest): void {
    if (this.isLogDisabled(request)) return;
    request.log.warn({ event: 'stream_error', request_id: request.id });
  }

  writeHeadError(_error: Error, request: FastifyRequest): void {
    if (this.isLogDisabled(request)) return;
    request.log.warn({ event: 'write_head_error', request_id: request.id });
  }

  serializerError(_error: Error, request: FastifyRequest, _reply: FastifyReply, metadata: { statusCode: number }): void {
    if (this.isLogDisabled(request)) return;
    request.log.error({ event: 'serializer_error', status_code: metadata.statusCode });
  }

  serviceUnavailable(logger: FastifyRequest['log']): void {
    logger.info({ event: 'server_closing_request_rejected', status_code: 503 });
  }
}

/** Pino options for the Fastify-bundled logger. Defense-in-depth only: with
 * SafeLogController in place, Fastify's own internals never pass a raw req/
 * res/err object to the logger in the first place. This is a backstop for
 * any future/unexpected direct log call, not the primary control. */
// Fastify's serializer types each require a specific non-optional object
// shape, but pino's actual runtime behavior (standard JSON.stringify
// semantics: a key whose value is undefined is omitted entirely) is exactly
// what "completely absent" requires here. The cast on the whole object
// isolates that intentional, deliberate mismatch in one place.
const dropRawObjectsEntirely: Record<'req' | 'res' | 'err', () => undefined> = {
  req: () => undefined,
  res: () => undefined,
  err: () => undefined
};

// Inferred, not explicitly annotated: Fastify's public type for this shape
// (FastifyLoggerOptions & PinoLoggerOptions) is only available as an inline
// intersection at the `logger` option's call site, not as a named export.
export const loggerOptions = {
  level: 'info',
  // Pino's default 'err' handling reads obj.err.message into the top-level
  // msg field *before* the serializers above ever run (see pino/lib/
  // proto.js write()) -- an unrelated leak path the serializers alone don't
  // close. Renaming errorKey to a value nothing in this codebase ever sets
  // disables that auto-extraction; SafeLogController never emits this key
  // anyway, but this keeps a future accidental `log.error({err})` call safe.
  errorKey: '__leasemind_unused_error_key__',
  serializers: dropRawObjectsEntirely,
  redact: {
    paths: [
      'req.headers',
      'res.headers',
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers["set-cookie"]',
      'req.headers["x-api-key"]',
      'req.body',
      'res.body'
    ],
    censor: '[Redacted]'
  }
};
