import { createHash, randomUUID } from 'node:crypto';
import type pg from 'pg';
import { appendCampaignStatusEventOnClient } from './campaignEvents.js';
import type { CampaignStatus } from './campaigns.js';
import { isUuidV4OrV7 } from '../uuid.js';

// Campaign Outcome command core (Sprint 6). See
// 02_PRODUCT/CAMPAIGN_OUTCOMES.md v0.2 and
// 03_ARCHITECTURE/decisions/ADR-0010-campaign-outcome-implementation.md
// §5.2, §5.3, §6-§9. Not reachable from any HTTP route -- the only caller
// is the synthetic operational CLI (campaign-outcome-cli.ts).

export const OUTCOME_CODES = [
  'success_via_leasemind',
  'success_independently',
  'success_via_broker',
  'cancelled',
  'expired'
] as const;
export type OutcomeCode = (typeof OUTCOME_CODES)[number];

export function isOutcomeCode(value: string): value is OutcomeCode {
  return (OUTCOME_CODES as readonly string[]).includes(value);
}

/** Deterministic PRODUCT mapping (CAMPAIGN_OUTCOMES.md раздел 5, ADR-0010
 * §2) -- the exact same mapping the database CHECK constraint
 * campaign_outcome_event_log_mapping_valid enforces independently. */
export const OUTCOME_CODE_TO_LIFECYCLE_STATUS: Record<OutcomeCode, 'Completed' | 'Failed'> = {
  success_via_leasemind: 'Completed',
  success_independently: 'Completed',
  success_via_broker: 'Completed',
  cancelled: 'Failed',
  expired: 'Failed'
};

export const CONFIRMATION_METHOD = 'user_attestation' as const;
export const CAMPAIGN_OUTCOME_RUNTIME_MODE = 'synthetic' as const;
export const CORRECTION_REASON_CODE = 'OUTCOME_CLASSIFICATION_CORRECTED' as const;

// pilot-admin:<UUID v4 or v7> -- closed, opaque, non-PII format (ADR-0010
// §2/§9). The same shape as the DB CHECK on campaign_outcome_event_log.operator_ref.
const OPERATOR_REF_PATTERN = /^pilot-admin:[0-9a-f]{8}-[0-9a-f]{4}-[47][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function isValidOperatorRef(value: string): boolean {
  return OPERATOR_REF_PATTERN.test(value);
}

// campaign_outcome_event_log.outcome_record_id is UUID v4 only (DB CHECK),
// distinct from campaign_id's v4-or-v7 allowlist.
const OUTCOME_RECORD_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isValidOutcomeRecordId(value: string): boolean {
  return OUTCOME_RECORD_ID_PATTERN.test(value);
}

// expected_campaign_version travels as a canonical positive decimal string
// end to end (parser, command hash, comparisons) -- never through `number`,
// which silently loses precision above Number.MAX_SAFE_INTEGER and could
// make two distinct versions collide into the same command_hash. No leading
// zero, no sign, no whitespace.
const CAMPAIGN_VERSION_PATTERN = /^[1-9][0-9]*$/;

// ---------------------------------------------------------------------------
// Stable, machine-safe error codes (ADR-0010 §9). No localized text is ever
// attached -- localization is a future client's job, not this module's.
// ---------------------------------------------------------------------------

export const CAMPAIGN_OUTCOME_ARGUMENT_INVALID = 'CAMPAIGN_OUTCOME_ARGUMENT_INVALID';
// ADR-0010 §9's own stable CLI-contract code for a rejected synthetic-only
// runtime gate -- distinct from runtimePolicy.ts's generic
// RuntimeSafetyViolation message, which no other CLI's safe-error-code
// contract names. Only apps/api/src/db/campaign-outcome-cli.ts maps
// RuntimeSafetyViolation to this code; runtimePolicy.ts itself is unchanged.
export const CAMPAIGN_OUTCOME_RUNTIME_NOT_SYNTHETIC = 'CAMPAIGN_OUTCOME_RUNTIME_NOT_SYNTHETIC';
export const CAMPAIGN_OUTCOME_CAMPAIGN_NOT_LAUNCHED = 'CAMPAIGN_OUTCOME_CAMPAIGN_NOT_LAUNCHED';
export const CAMPAIGN_OUTCOME_STATUS_NOT_ELIGIBLE = 'CAMPAIGN_OUTCOME_STATUS_NOT_ELIGIBLE';
export const CAMPAIGN_OUTCOME_VERSION_CONFLICT = 'CAMPAIGN_OUTCOME_VERSION_CONFLICT';
export const CAMPAIGN_OUTCOME_STATE_INCONSISTENT = 'CAMPAIGN_OUTCOME_STATE_INCONSISTENT';
export const CAMPAIGN_OUTCOME_IDEMPOTENCY_CONFLICT = 'CAMPAIGN_OUTCOME_IDEMPOTENCY_CONFLICT';
export const CAMPAIGN_OUTCOME_EFFECTIVE_OUTCOME_ALREADY_EXISTS = 'CAMPAIGN_OUTCOME_EFFECTIVE_OUTCOME_ALREADY_EXISTS';
export const CAMPAIGN_OUTCOME_NO_EFFECTIVE_OUTCOME = 'CAMPAIGN_OUTCOME_NO_EFFECTIVE_OUTCOME';
export const CAMPAIGN_OUTCOME_CORRECTION_TARGET_STALE = 'CAMPAIGN_OUTCOME_CORRECTION_TARGET_STALE';
export const CAMPAIGN_OUTCOME_SAME_CODE_REJECTED = 'CAMPAIGN_OUTCOME_SAME_CODE_REJECTED';
export const CAMPAIGN_OUTCOME_OPERATION_FAILED = 'CAMPAIGN_OUTCOME_OPERATION_FAILED';

export class CampaignOutcomeError extends Error {
  constructor(public readonly safeCode: string) {
    super(safeCode);
    this.name = 'CampaignOutcomeError';
  }
}

function invalidArguments(): never {
  throw new CampaignOutcomeError(CAMPAIGN_OUTCOME_ARGUMENT_INVALID);
}

// ---------------------------------------------------------------------------
// CLI argument parsing (ADR-0010 §9). Lives here, not in the CLI runner,
// mirroring parseEvidenceDatasetRevocationArgs in evidenceDatasetRevocation.ts.
// Validated entirely before any database connection is attempted.
// ---------------------------------------------------------------------------

export interface CampaignOutcomeCommand {
  action: 'record' | 'correct';
  campaignId: string;
  outcomeCode: OutcomeCode;
  // Canonical positive decimal string (^[1-9][0-9]*$), never `number` --
  // see CAMPAIGN_VERSION_PATTERN.
  expectedCampaignVersion: string;
  idempotencyKey: string;
  actorRef: string;
  confirmationAttested: true;
  execute: boolean;
  correctsOutcomeRecordId: string | null;
  correctionReasonCode: string | null;
}

/** Parses and validates a complete `record`/`correct` CLI invocation.
 * Unknown, repeated, positional-besides-the-action, and incomplete
 * arguments are all rejected rather than silently ignored or defaulted. */
export function parseCampaignOutcomeArgs(argv: readonly string[]): CampaignOutcomeCommand {
  const [action, ...args] = argv;
  if (action !== 'record' && action !== 'correct') {
    invalidArguments();
  }

  let campaignId: string | undefined;
  let outcomeCode: string | undefined;
  let expectedCampaignVersionRaw: string | undefined;
  let idempotencyKey: string | undefined;
  let actorRef: string | undefined;
  let confirmationAttested = false;
  let execute = false;
  let correctsOutcomeRecordId: string | undefined;
  let correctionReasonCode: string | undefined;

  const takeValue = (index: number): string => {
    const value = args[index + 1];
    if (value === undefined || value.startsWith('--')) invalidArguments();
    return value;
  };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    switch (argument) {
      case '--campaign-id':
        if (campaignId !== undefined) invalidArguments();
        campaignId = takeValue(index);
        index += 1;
        break;
      case '--outcome-code':
        if (outcomeCode !== undefined) invalidArguments();
        outcomeCode = takeValue(index);
        index += 1;
        break;
      case '--expected-campaign-version':
        if (expectedCampaignVersionRaw !== undefined) invalidArguments();
        expectedCampaignVersionRaw = takeValue(index);
        index += 1;
        break;
      case '--idempotency-key':
        if (idempotencyKey !== undefined) invalidArguments();
        idempotencyKey = takeValue(index);
        index += 1;
        break;
      case '--actor-ref':
        if (actorRef !== undefined) invalidArguments();
        actorRef = takeValue(index);
        index += 1;
        break;
      case '--confirmation-attested':
        if (confirmationAttested) invalidArguments();
        confirmationAttested = true;
        break;
      case '--execute':
        if (execute) invalidArguments();
        execute = true;
        break;
      case '--corrects-outcome-record-id':
        if (correctsOutcomeRecordId !== undefined) invalidArguments();
        correctsOutcomeRecordId = takeValue(index);
        index += 1;
        break;
      case '--correction-reason-code':
        if (correctionReasonCode !== undefined) invalidArguments();
        correctionReasonCode = takeValue(index);
        index += 1;
        break;
      default:
        invalidArguments();
    }
  }

  if (
    campaignId === undefined ||
    !isUuidV4OrV7(campaignId) ||
    outcomeCode === undefined ||
    !isOutcomeCode(outcomeCode) ||
    expectedCampaignVersionRaw === undefined ||
    !CAMPAIGN_VERSION_PATTERN.test(expectedCampaignVersionRaw) ||
    idempotencyKey === undefined ||
    idempotencyKey.length === 0 ||
    idempotencyKey.length > 200 ||
    actorRef === undefined ||
    !isValidOperatorRef(actorRef) ||
    !confirmationAttested
  ) {
    invalidArguments();
  }

  if (action === 'correct') {
    if (
      correctsOutcomeRecordId === undefined ||
      !isValidOutcomeRecordId(correctsOutcomeRecordId) ||
      correctionReasonCode === undefined ||
      correctionReasonCode !== CORRECTION_REASON_CODE
    ) {
      invalidArguments();
    }
  } else if (correctsOutcomeRecordId !== undefined || correctionReasonCode !== undefined) {
    // record must never silently accept correction-only flags.
    invalidArguments();
  }

  return canonicalizeCampaignOutcomeCommand({
    action,
    campaignId,
    outcomeCode: outcomeCode as OutcomeCode,
    // Kept as the exact canonical decimal string the caller supplied
    // (already validated against CAMPAIGN_VERSION_PATTERN above) -- never
    // routed through Number(), which loses precision above
    // Number.MAX_SAFE_INTEGER and could collide two distinct versions into
    // the same command_hash.
    expectedCampaignVersion: expectedCampaignVersionRaw,
    idempotencyKey,
    actorRef,
    confirmationAttested: true,
    execute,
    correctsOutcomeRecordId: action === 'correct' ? (correctsOutcomeRecordId as string) : null,
    correctionReasonCode: action === 'correct' ? (correctionReasonCode as string) : null
  });
}

/** Lowercases campaign_id and corrects_outcome_record_id so the command hash
 * and every in-process comparison are case-independent -- PostgreSQL's
 * native `uuid` columns already normalize case transparently, but the
 * command hash (a plain SHA-256 over strings, computed entirely in
 * application code before ever reaching a `uuid`-typed column) and the
 * JS-level "does this match the current effective outcome" comparison in
 * runLockedCommand do not get that normalization for free. Called by both
 * parseCampaignOutcomeArgs (the CLI path) and the two public entry points
 * below (the direct typed-core path) -- never assumes a caller already
 * went through the CLI parser. Defensive against non-string input (a
 * malformed direct-core cast): leaves a non-string value untouched so
 * validateCommandShape's own type check is what reports the failure, not a
 * TypeError from .toLowerCase(). */
export function canonicalizeCampaignOutcomeCommand(command: CampaignOutcomeCommand): CampaignOutcomeCommand {
  return {
    ...command,
    campaignId: typeof command.campaignId === 'string' ? command.campaignId.toLowerCase() : command.campaignId,
    correctsOutcomeRecordId:
      typeof command.correctsOutcomeRecordId === 'string'
        ? command.correctsOutcomeRecordId.toLowerCase()
        : command.correctsOutcomeRecordId
  };
}

/** Fail-closed shape gate for BOTH callers: the CLI parser output (already
 * validated once, but re-checked here rather than trusted) and any direct
 * typed-core caller, which may hand in a value that only satisfies
 * CampaignOutcomeCommand at the type-checker level (e.g. via `as unknown as
 * CampaignOutcomeCommand`) and not at runtime. Every field is checked by
 * runtime `typeof`, not merely presence, so a malformed cast fails closed
 * with CAMPAIGN_OUTCOME_ARGUMENT_INVALID instead of throwing a raw
 * TypeError (e.g. calling .length on a non-string) partway through. */
function validateCommandShape(command: CampaignOutcomeCommand): void {
  if (command.action !== 'record' && command.action !== 'correct') invalidArguments();
  if (typeof command.campaignId !== 'string' || !isUuidV4OrV7(command.campaignId)) invalidArguments();
  if (typeof command.outcomeCode !== 'string' || !isOutcomeCode(command.outcomeCode)) invalidArguments();
  if (typeof command.expectedCampaignVersion !== 'string' || !CAMPAIGN_VERSION_PATTERN.test(command.expectedCampaignVersion)) {
    invalidArguments();
  }
  if (typeof command.idempotencyKey !== 'string' || command.idempotencyKey.length === 0 || command.idempotencyKey.length > 200) {
    invalidArguments();
  }
  if (typeof command.actorRef !== 'string' || !isValidOperatorRef(command.actorRef)) invalidArguments();
  if (command.confirmationAttested !== true) invalidArguments();
  if (command.action === 'correct') {
    if (typeof command.correctsOutcomeRecordId !== 'string' || !isValidOutcomeRecordId(command.correctsOutcomeRecordId)) {
      invalidArguments();
    }
    if (command.correctionReasonCode !== CORRECTION_REASON_CODE) invalidArguments();
  } else if (command.correctsOutcomeRecordId !== null || command.correctionReasonCode !== null) {
    invalidArguments();
  }
}

// ---------------------------------------------------------------------------
// Normalized command + command hash (PRODUCT §9, ADR-0010 §4).
// ---------------------------------------------------------------------------

const COMMAND_HASH_DOMAIN_SEPARATOR = 'LEASEMIND_CAMPAIGN_OUTCOME_COMMAND_V1';

function sha256Hex(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

export interface NormalizedCampaignOutcomeCommand {
  commandType: 'record' | 'correct';
  campaignId: string;
  outcomeCode: OutcomeCode;
  confirmationMethod: typeof CONFIRMATION_METHOD;
  // Canonical positive decimal string -- see CampaignOutcomeCommand.
  expectedCampaignVersion: string;
  correctsOutcomeRecordId: string | null;
  correctionReasonCode: string | null;
}

/** Composition documented here, not in a comment elsewhere: command type
 * (record/correct), Campaign, outcome, confirmation method, expected
 * version, and for correct -- target + reason code. idempotency_key and
 * operator_ref are deliberately NOT part of the hash -- they are not part
 * of the logical request (PRODUCT §9): two different idempotency_key values
 * with an otherwise-identical normalized command legitimately converge to
 * the same command_hash. Defensively re-lowercases campaignId and
 * correctsOutcomeRecordId itself -- every current caller already went
 * through canonicalizeCampaignOutcomeCommand upstream, but the hash is the
 * one piece of durable, comparable state (persisted and replay-compared
 * later) that must stay case-independent even if a future caller of this
 * exported function forgets that pre-step. */
export function computeCampaignOutcomeCommandHash(normalized: NormalizedCampaignOutcomeCommand): string {
  return sha256Hex(
    [
      COMMAND_HASH_DOMAIN_SEPARATOR,
      normalized.commandType,
      normalized.campaignId.toLowerCase(),
      normalized.outcomeCode,
      normalized.confirmationMethod,
      normalized.expectedCampaignVersion,
      normalized.correctsOutcomeRecordId?.toLowerCase() ?? '',
      normalized.correctionReasonCode ?? ''
    ].join('|')
  );
}

function toNormalizedCommand(command: CampaignOutcomeCommand): NormalizedCampaignOutcomeCommand {
  return {
    commandType: command.action,
    campaignId: command.campaignId,
    outcomeCode: command.outcomeCode,
    confirmationMethod: CONFIRMATION_METHOD,
    expectedCampaignVersion: command.expectedCampaignVersion,
    correctsOutcomeRecordId: command.correctsOutcomeRecordId,
    correctionReasonCode: command.correctionReasonCode
  };
}

// ---------------------------------------------------------------------------
// Machine-safe result envelopes. Never include operator_ref, connection
// strings, raw SQL, a stack trace or localized text.
// ---------------------------------------------------------------------------

export interface CampaignOutcomeRecordSnapshot {
  outcomeRecordId: string;
  campaignId: string;
  outcomeSequence: string;
  commandType: 'record' | 'correct';
  outcomeCode: OutcomeCode;
  mappedLifecycleStatus: 'Completed' | 'Failed';
  correctsOutcomeRecordId: string | null;
  recordedAt: string;
  confirmationMethod: typeof CONFIRMATION_METHOD;
  resultingCampaignAggregateVersion: string;
}

export interface CampaignOutcomeExecuteResult {
  isReplay: boolean;
  record: CampaignOutcomeRecordSnapshot;
}

export interface CampaignOutcomeDryRunResult {
  wouldSucceed: boolean;
  commandType: 'record' | 'correct';
  campaignId: string;
  outcomeCode: OutcomeCode;
  safeErrorCode: string | null;
  currentCampaignStatus: string | null;
  currentCampaignVersion: string | null;
  currentEffectiveOutcomeCode: string | null;
}

// ---------------------------------------------------------------------------
// Shared read helpers. `Executor` covers both a plain pool (safe for
// unlocked reads) and an already-open client (inside the locked flow).
// ---------------------------------------------------------------------------

type Executor = Pick<pg.Pool, 'query'> | pg.PoolClient;

async function readIdempotencyMapping(
  executor: Executor,
  idempotencyKey: string
): Promise<{ commandHash: string; outcomeRecordId: string } | null> {
  const result = await executor.query<{ command_hash: string; outcome_record_id: string }>(
    `SELECT command_hash, outcome_record_id
       FROM leasemind_app.campaign_outcome_idempotency_mapping
      WHERE idempotency_key = $1`,
    [idempotencyKey]
  );
  if (result.rowCount === 0) return null;
  return { commandHash: result.rows[0].command_hash, outcomeRecordId: result.rows[0].outcome_record_id };
}

async function readOutcomeRecordSnapshot(executor: Executor, outcomeRecordId: string): Promise<CampaignOutcomeRecordSnapshot> {
  const result = await executor.query<{
    outcome_record_id: string;
    campaign_id: string;
    outcome_sequence: string;
    command_type: 'record' | 'correct';
    outcome_code: OutcomeCode;
    mapped_lifecycle_status: 'Completed' | 'Failed';
    corrects_outcome_record_id: string | null;
    recorded_at: Date;
    confirmation_method: string;
    resulting_campaign_aggregate_version: string;
  }>(
    `SELECT outcome_record_id, campaign_id, outcome_sequence::text AS outcome_sequence, command_type, outcome_code,
            mapped_lifecycle_status, corrects_outcome_record_id, recorded_at, confirmation_method,
            resulting_campaign_aggregate_version::text AS resulting_campaign_aggregate_version
       FROM leasemind_app.campaign_outcome_event_log
      WHERE outcome_record_id = $1`,
    [outcomeRecordId]
  );
  if (result.rowCount === 0) {
    throw new CampaignOutcomeError(CAMPAIGN_OUTCOME_OPERATION_FAILED);
  }
  const row = result.rows[0];
  return {
    outcomeRecordId: row.outcome_record_id,
    campaignId: row.campaign_id,
    outcomeSequence: row.outcome_sequence,
    commandType: row.command_type,
    outcomeCode: row.outcome_code,
    mappedLifecycleStatus: row.mapped_lifecycle_status,
    correctsOutcomeRecordId: row.corrects_outcome_record_id,
    recordedAt: row.recorded_at.toISOString(),
    confirmationMethod: row.confirmation_method as typeof CONFIRMATION_METHOD,
    resultingCampaignAggregateVersion: row.resulting_campaign_aggregate_version
  };
}

/** Двойная серверная проверка (ADR-0010 §5.2 шаг 9): immutable
 * `campaign.subject_linked.v1` в campaign_event_log И согласованная строка
 * campaign_subject_link_projection. Ровно EXISTS-запросы, без FOR UPDATE --
 * безопасно как для locked execute flow, так и для read-only dry-run. */
async function checkLaunchProof(
  executor: Executor,
  campaignId: string
): Promise<{ subjectLinkedEvent: boolean; subjectLinkProjection: boolean }> {
  const result = await executor.query<{ has_event: boolean; has_projection: boolean }>(
    `SELECT
       EXISTS (
         SELECT 1 FROM leasemind_app.campaign_event_log
          WHERE campaign_id = $1 AND event_type = 'campaign.subject_linked.v1'
       ) AS has_event,
       EXISTS (
         SELECT 1 FROM leasemind_app.campaign_subject_link_projection WHERE campaign_id = $1
       ) AS has_projection`,
    [campaignId]
  );
  return { subjectLinkedEvent: result.rows[0].has_event, subjectLinkProjection: result.rows[0].has_projection };
}

// ---------------------------------------------------------------------------
// Dry-run (ADR-0010 §9): a provably read-only diagnostic snapshot, not a
// truncated execute. No advisory lock, no FOR UPDATE/FOR SHARE, no genesis,
// no write-primitive call, no write of any kind. May be stale the instant
// it completes -- a successful dry-run never guarantees a successful
// subsequent --execute, which always re-validates everything from scratch.
// ---------------------------------------------------------------------------

async function evaluateWouldSucceed(
  client: pg.PoolClient,
  command: CampaignOutcomeCommand
): Promise<{
  safeErrorCode: string | null;
  currentCampaignStatus: string | null;
  currentCampaignVersion: string | null;
  currentEffectiveOutcomeCode: string | null;
}> {
  const normalized = toNormalizedCommand(command);
  const commandHash = computeCampaignOutcomeCommandHash(normalized);

  const mapping = await readIdempotencyMapping(client, command.idempotencyKey);
  if (mapping) {
    return {
      safeErrorCode: mapping.commandHash === commandHash ? null : CAMPAIGN_OUTCOME_IDEMPOTENCY_CONFLICT,
      currentCampaignStatus: null,
      currentCampaignVersion: null,
      currentEffectiveOutcomeCode: null
    };
  }

  const head = await client.query<{ current_sequence: string }>(
    `SELECT current_sequence FROM leasemind_app.campaign_stream_head WHERE campaign_id = $1`,
    [command.campaignId]
  );
  const proof = await checkLaunchProof(client, command.campaignId);

  if (head.rowCount === 0) {
    const safeErrorCode =
      !proof.subjectLinkedEvent && !proof.subjectLinkProjection
        ? CAMPAIGN_OUTCOME_CAMPAIGN_NOT_LAUNCHED
        : CAMPAIGN_OUTCOME_STATE_INCONSISTENT;
    return { safeErrorCode, currentCampaignStatus: null, currentCampaignVersion: null, currentEffectiveOutcomeCode: null };
  }
  if (!proof.subjectLinkedEvent && !proof.subjectLinkProjection) {
    return {
      safeErrorCode: CAMPAIGN_OUTCOME_CAMPAIGN_NOT_LAUNCHED,
      currentCampaignStatus: null,
      currentCampaignVersion: null,
      currentEffectiveOutcomeCode: null
    };
  }
  if (proof.subjectLinkedEvent !== proof.subjectLinkProjection) {
    return {
      safeErrorCode: CAMPAIGN_OUTCOME_STATE_INCONSISTENT,
      currentCampaignStatus: null,
      currentCampaignVersion: null,
      currentEffectiveOutcomeCode: null
    };
  }

  const projection = await client.query<{ status: string; aggregate_version: string }>(
    `SELECT status, aggregate_version::text AS aggregate_version
       FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = $1`,
    [command.campaignId]
  );
  if (projection.rowCount === 0) {
    return {
      safeErrorCode: CAMPAIGN_OUTCOME_STATE_INCONSISTENT,
      currentCampaignStatus: null,
      currentCampaignVersion: null,
      currentEffectiveOutcomeCode: null
    };
  }
  const status = projection.rows[0].status;
  const aggregateVersion = projection.rows[0].aggregate_version;
  const currentSequence = head.rows[0].current_sequence;

  const currentOutcome = await client.query<{ current_outcome_record_id: string; outcome_code: OutcomeCode; mapped_lifecycle_status: string }>(
    `SELECT p.current_outcome_record_id, l.outcome_code, l.mapped_lifecycle_status
       FROM leasemind_app.campaign_outcome_current_projection p
       JOIN leasemind_app.campaign_outcome_event_log l ON l.campaign_id = p.campaign_id AND l.outcome_record_id = p.current_outcome_record_id
      WHERE p.campaign_id = $1`,
    [command.campaignId]
  );
  const currentEffectiveOutcomeCode = currentOutcome.rowCount && currentOutcome.rowCount > 0 ? currentOutcome.rows[0].outcome_code : null;
  const base = { currentCampaignStatus: status, currentCampaignVersion: currentSequence, currentEffectiveOutcomeCode };

  if (BigInt(currentSequence) !== BigInt(command.expectedCampaignVersion)) {
    return { safeErrorCode: CAMPAIGN_OUTCOME_VERSION_CONFLICT, ...base };
  }
  if (BigInt(aggregateVersion) !== BigInt(currentSequence)) {
    return { safeErrorCode: CAMPAIGN_OUTCOME_STATE_INCONSISTENT, ...base };
  }

  if (command.action === 'record') {
    if (status === 'Paused') return { safeErrorCode: CAMPAIGN_OUTCOME_STATUS_NOT_ELIGIBLE, ...base };
    if (currentOutcome.rowCount && currentOutcome.rowCount > 0) {
      return { safeErrorCode: CAMPAIGN_OUTCOME_EFFECTIVE_OUTCOME_ALREADY_EXISTS, ...base };
    }
    return { safeErrorCode: null, ...base };
  }

  // correct
  if (status !== 'Completed' && status !== 'Failed') {
    return { safeErrorCode: CAMPAIGN_OUTCOME_STATE_INCONSISTENT, ...base };
  }
  if (!currentOutcome.rowCount) {
    return { safeErrorCode: CAMPAIGN_OUTCOME_NO_EFFECTIVE_OUTCOME, ...base };
  }
  const current = currentOutcome.rows[0];
  if (current.mapped_lifecycle_status !== status) {
    return { safeErrorCode: CAMPAIGN_OUTCOME_STATE_INCONSISTENT, ...base };
  }
  if (current.current_outcome_record_id !== command.correctsOutcomeRecordId) {
    return { safeErrorCode: CAMPAIGN_OUTCOME_CORRECTION_TARGET_STALE, ...base };
  }
  if (current.outcome_code === command.outcomeCode) {
    return { safeErrorCode: CAMPAIGN_OUTCOME_SAME_CODE_REJECTED, ...base };
  }
  return { safeErrorCode: null, ...base };
}

/** Public entry point. Never leaks a raw DB/infrastructure exception: a
 * known CampaignOutcomeError (e.g. CAMPAIGN_OUTCOME_ARGUMENT_INVALID from
 * validateCommandShape, which runs before any DB contact) passes through
 * unchanged; anything else -- a connection failure, an unexpected SQL
 * error, or any other infrastructure fault -- is translated to
 * CAMPAIGN_OUTCOME_OPERATION_FAILED only after the internal implementation
 * has already run its own rollback/release cleanup. */
export async function dryRunCampaignOutcomeCommand(pool: pg.Pool, command: CampaignOutcomeCommand): Promise<CampaignOutcomeDryRunResult> {
  try {
    return await dryRunCampaignOutcomeCommandInternal(pool, command);
  } catch (error) {
    if (error instanceof CampaignOutcomeError) throw error;
    throw new CampaignOutcomeError(CAMPAIGN_OUTCOME_OPERATION_FAILED);
  }
}

async function dryRunCampaignOutcomeCommandInternal(pool: pg.Pool, rawCommand: CampaignOutcomeCommand): Promise<CampaignOutcomeDryRunResult> {
  const command = canonicalizeCampaignOutcomeCommand(rawCommand);
  validateCommandShape(command);

  const client = await pool.connect();
  let transactionOpen = false;
  try {
    await client.query('BEGIN TRANSACTION READ ONLY');
    transactionOpen = true;

    const evaluation = await evaluateWouldSucceed(client, command);

    await client.query('ROLLBACK');
    transactionOpen = false;

    return {
      wouldSucceed: evaluation.safeErrorCode === null,
      commandType: command.action,
      campaignId: command.campaignId,
      outcomeCode: command.outcomeCode,
      safeErrorCode: evaluation.safeErrorCode,
      currentCampaignStatus: evaluation.currentCampaignStatus,
      currentCampaignVersion: evaluation.currentCampaignVersion,
      currentEffectiveOutcomeCode: evaluation.currentEffectiveOutcomeCode
    };
  } finally {
    if (transactionOpen) await client.query('ROLLBACK').catch(() => {});
    client.release();
  }
}

// ---------------------------------------------------------------------------
// Authoritative execute flow (ADR-0010 §5.2/§5.3/§6). Always re-validates
// everything from scratch -- a prior dry-run result is never trusted.
// ---------------------------------------------------------------------------

async function releaseLockClient(client: pg.PoolClient, lockKey: string, lockAcquired: boolean): Promise<void> {
  if (!lockAcquired) {
    client.release();
    return;
  }
  let poisoned = false;
  try {
    const result = await client.query<{ unlocked: boolean }>('SELECT pg_advisory_unlock(hashtextextended($1, 0)) AS unlocked', [lockKey]);
    if (result.rows[0]?.unlocked !== true) {
      poisoned = true;
    }
  } catch {
    poisoned = true;
  }
  // Any uncertainty about unlock confirmation -> destroy the client rather
  // than return it to the pool (ADR-0009 §6 step 10 principle, reused by
  // ADR-0010 §5.2 step 22).
  client.release(poisoned);
}

/** Public entry point. Never leaks a raw DB/infrastructure exception: a
 * known CampaignOutcomeError (e.g. CAMPAIGN_OUTCOME_ARGUMENT_INVALID from
 * validateCommandShape, which runs before any DB contact) passes through
 * unchanged; anything else -- a connection failure, an unexpected SQL
 * error, or any other infrastructure fault -- is translated to
 * CAMPAIGN_OUTCOME_OPERATION_FAILED only after the internal implementation
 * has already run its own rollback/release cleanup. */
export async function executeCampaignOutcomeCommand(pool: pg.Pool, command: CampaignOutcomeCommand): Promise<CampaignOutcomeExecuteResult> {
  try {
    return await executeCampaignOutcomeCommandInternal(pool, command);
  } catch (error) {
    if (error instanceof CampaignOutcomeError) throw error;
    throw new CampaignOutcomeError(CAMPAIGN_OUTCOME_OPERATION_FAILED);
  }
}

async function executeCampaignOutcomeCommandInternal(pool: pg.Pool, rawCommand: CampaignOutcomeCommand): Promise<CampaignOutcomeExecuteResult> {
  const command = canonicalizeCampaignOutcomeCommand(rawCommand);
  validateCommandShape(command);

  const normalized = toNormalizedCommand(command);
  const commandHash = computeCampaignOutcomeCommandHash(normalized);

  // Fast path (step 1-4): no lock.
  const fastPathMapping = await readIdempotencyMapping(pool, command.idempotencyKey);
  if (fastPathMapping) {
    if (fastPathMapping.commandHash !== commandHash) {
      throw new CampaignOutcomeError(CAMPAIGN_OUTCOME_IDEMPOTENCY_CONFLICT);
    }
    const record = await readOutcomeRecordSnapshot(pool, fastPathMapping.outcomeRecordId);
    return { isReplay: true, record };
  }

  // Key not found -> session-level advisory lock, before BEGIN, autocommit.
  const lockKey = `campaign-outcome:idempotency-key:${command.idempotencyKey}`;
  const lockClient = await pool.connect();
  let lockAcquired = false;
  try {
    await lockClient.query('SELECT pg_advisory_lock(hashtextextended($1, 0))', [lockKey]);
    lockAcquired = true;

    // Recheck under the lock (TOCTOU close).
    const recheckMapping = await readIdempotencyMapping(lockClient, command.idempotencyKey);
    if (recheckMapping) {
      if (recheckMapping.commandHash !== commandHash) {
        throw new CampaignOutcomeError(CAMPAIGN_OUTCOME_IDEMPOTENCY_CONFLICT);
      }
      const record = await readOutcomeRecordSnapshot(lockClient, recheckMapping.outcomeRecordId);
      return { isReplay: true, record };
    }

    // Still not found -> BEGIN READ COMMITTED (not REPEATABLE READ -- ADR-0010 §6).
    await lockClient.query('BEGIN ISOLATION LEVEL READ COMMITTED');
    try {
      const record = await runLockedCommand(lockClient, command);
      await lockClient.query('COMMIT');
      // Fresh, unlocked read via the shared pool -- the same column set the
      // fast-path/recheck replay paths return, for a consistent envelope
      // shape regardless of which path produced it.
      const snapshot = await readOutcomeRecordSnapshot(pool, record.outcomeRecordId);
      return { isReplay: false, record: snapshot };
    } catch (error) {
      await lockClient.query('ROLLBACK').catch(() => {});
      throw error;
    }
  } finally {
    await releaseLockClient(lockClient, lockKey, lockAcquired);
  }
}

/** Runs entirely inside the caller's already-open `BEGIN ISOLATION LEVEL
 * READ COMMITTED` transaction, on the already-lock-holding client. Returns
 * only once every row has been written; the caller commits. */
async function runLockedCommand(client: pg.PoolClient, command: CampaignOutcomeCommand): Promise<{ outcomeRecordId: string }> {
  const normalized = toNormalizedCommand(command);
  const commandHash = computeCampaignOutcomeCommandHash(normalized);

  const head = await client.query<{ current_sequence: string }>(
    `SELECT current_sequence FROM leasemind_app.campaign_stream_head WHERE campaign_id = $1 FOR UPDATE`,
    [command.campaignId]
  );

  if (head.rowCount === 0) {
    const proof = await checkLaunchProof(client, command.campaignId);
    if (!proof.subjectLinkedEvent && !proof.subjectLinkProjection) {
      throw new CampaignOutcomeError(CAMPAIGN_OUTCOME_CAMPAIGN_NOT_LAUNCHED);
    }
    throw new CampaignOutcomeError(CAMPAIGN_OUTCOME_STATE_INCONSISTENT);
  }

  const proof = await checkLaunchProof(client, command.campaignId);
  if (!proof.subjectLinkedEvent && !proof.subjectLinkProjection) {
    throw new CampaignOutcomeError(CAMPAIGN_OUTCOME_CAMPAIGN_NOT_LAUNCHED);
  }
  if (proof.subjectLinkedEvent !== proof.subjectLinkProjection) {
    throw new CampaignOutcomeError(CAMPAIGN_OUTCOME_STATE_INCONSISTENT);
  }

  const projection = await client.query<{ status: string; aggregate_version: string }>(
    `SELECT status, aggregate_version::text AS aggregate_version FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = $1`,
    [command.campaignId]
  );
  if (projection.rowCount === 0) {
    throw new CampaignOutcomeError(CAMPAIGN_OUTCOME_STATE_INCONSISTENT);
  }
  const status = projection.rows[0].status;
  const aggregateVersion = projection.rows[0].aggregate_version;
  const currentSequence = head.rows[0].current_sequence;

  if (BigInt(currentSequence) !== BigInt(command.expectedCampaignVersion)) {
    throw new CampaignOutcomeError(CAMPAIGN_OUTCOME_VERSION_CONFLICT);
  }
  if (BigInt(aggregateVersion) !== BigInt(currentSequence)) {
    throw new CampaignOutcomeError(CAMPAIGN_OUTCOME_STATE_INCONSISTENT);
  }

  if (command.action === 'record') {
    if (status === 'Paused') {
      throw new CampaignOutcomeError(CAMPAIGN_OUTCOME_STATUS_NOT_ELIGIBLE);
    }
    const currentOutcome = await client.query(
      `SELECT current_outcome_record_id FROM leasemind_app.campaign_outcome_current_projection WHERE campaign_id = $1`,
      [command.campaignId]
    );
    if (currentOutcome.rowCount && currentOutcome.rowCount > 0) {
      throw new CampaignOutcomeError(CAMPAIGN_OUTCOME_EFFECTIVE_OUTCOME_ALREADY_EXISTS);
    }

    const outcomeRecordId = await appendOutcomeRow(client, command, commandHash, null);
    await client.query(
      `INSERT INTO leasemind_app.campaign_outcome_current_projection (campaign_id, current_outcome_record_id)
       VALUES ($1, $2)`,
      [command.campaignId, outcomeRecordId]
    );
    return { outcomeRecordId };
  }

  // correct
  if (status !== 'Completed' && status !== 'Failed') {
    throw new CampaignOutcomeError(CAMPAIGN_OUTCOME_STATE_INCONSISTENT);
  }
  // Plain SELECT, no FOR UPDATE: campaign_outcome_event_log is immutable
  // (the writer holds no UPDATE privilege on it at all, by design), and the
  // already-held campaign_stream_head FOR UPDATE lock above already
  // serializes every writer of campaign_outcome_current_projection for this
  // campaign_id -- no concurrent transaction can change this row out from
  // under us between this read and the UPDATE below.
  const current = await client.query<{ current_outcome_record_id: string; outcome_code: OutcomeCode; mapped_lifecycle_status: string }>(
    `SELECT p.current_outcome_record_id, l.outcome_code, l.mapped_lifecycle_status
       FROM leasemind_app.campaign_outcome_current_projection p
       JOIN leasemind_app.campaign_outcome_event_log l ON l.campaign_id = p.campaign_id AND l.outcome_record_id = p.current_outcome_record_id
      WHERE p.campaign_id = $1`,
    [command.campaignId]
  );
  if (current.rowCount === 0) {
    throw new CampaignOutcomeError(CAMPAIGN_OUTCOME_NO_EFFECTIVE_OUTCOME);
  }
  const currentRow = current.rows[0];
  if (currentRow.mapped_lifecycle_status !== status) {
    throw new CampaignOutcomeError(CAMPAIGN_OUTCOME_STATE_INCONSISTENT);
  }
  if (currentRow.current_outcome_record_id !== command.correctsOutcomeRecordId) {
    throw new CampaignOutcomeError(CAMPAIGN_OUTCOME_CORRECTION_TARGET_STALE);
  }
  if (currentRow.outcome_code === command.outcomeCode) {
    throw new CampaignOutcomeError(CAMPAIGN_OUTCOME_SAME_CODE_REJECTED);
  }

  const outcomeRecordId = await appendOutcomeRow(client, command, commandHash, currentRow.current_outcome_record_id);
  await client.query(
    `UPDATE leasemind_app.campaign_outcome_current_projection
        SET current_outcome_record_id = $2, updated_at = clock_timestamp()
      WHERE campaign_id = $1`,
    [command.campaignId, outcomeRecordId]
  );
  return { outcomeRecordId };
}

/** Mints a new outcome_record_id, atomically appends the paired
 * campaign.status_recorded.v1 lifecycle event (always -- even when the
 * mapped status equals the Campaign's current status, PRODUCT §5), then
 * inserts the immutable campaign_outcome_event_log row and its idempotency
 * mapping. Never followed by an UPDATE of the row it just inserted. */
async function appendOutcomeRow(
  client: pg.PoolClient,
  command: CampaignOutcomeCommand,
  commandHash: string,
  correctsOutcomeRecordId: string | null
): Promise<string> {
  const mappedLifecycleStatus: CampaignStatus = OUTCOME_CODE_TO_LIFECYCLE_STATUS[command.outcomeCode];
  const outcomeRecordId = randomUUID();
  const statusEventIdempotencyKey = `campaign-outcome:${outcomeRecordId}:status`;

  const event = await appendCampaignStatusEventOnClient(client, {
    campaignId: command.campaignId,
    status: mappedLifecycleStatus,
    idempotencyKey: statusEventIdempotencyKey
  });

  const sequenceResult = await client.query<{ next: string }>(
    `SELECT (COALESCE(MAX(outcome_sequence), 0) + 1)::text AS next
       FROM leasemind_app.campaign_outcome_event_log WHERE campaign_id = $1`,
    [command.campaignId]
  );
  const outcomeSequence = sequenceResult.rows[0].next;

  await client.query(
    `INSERT INTO leasemind_app.campaign_outcome_event_log
       (outcome_record_id, campaign_id, outcome_sequence, command_type, outcome_code, mapped_lifecycle_status,
        confirmation_method, operator_ref, corrects_outcome_record_id, correction_reason_code, runtime_mode,
        resulting_campaign_aggregate_version)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      outcomeRecordId,
      command.campaignId,
      outcomeSequence,
      command.action,
      command.outcomeCode,
      mappedLifecycleStatus,
      CONFIRMATION_METHOD,
      command.actorRef,
      correctsOutcomeRecordId,
      correctsOutcomeRecordId === null ? null : CORRECTION_REASON_CODE,
      CAMPAIGN_OUTCOME_RUNTIME_MODE,
      event.eventSequence
    ]
  );

  await client.query(
    `INSERT INTO leasemind_app.campaign_outcome_idempotency_mapping (idempotency_key, command_hash, campaign_id, outcome_record_id)
     VALUES ($1, $2, $3, $4)`,
    [command.idempotencyKey, commandHash, command.campaignId, outcomeRecordId]
  );

  return outcomeRecordId;
}
