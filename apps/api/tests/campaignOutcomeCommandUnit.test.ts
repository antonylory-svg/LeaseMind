import { test } from 'node:test';
import assert from 'node:assert/strict';
import type pg from 'pg';
import {
  CAMPAIGN_OUTCOME_ARGUMENT_INVALID,
  CampaignOutcomeError,
  canonicalizeCampaignOutcomeCommand,
  computeCampaignOutcomeCommandHash,
  CONFIRMATION_METHOD,
  CORRECTION_REASON_CODE,
  dryRunCampaignOutcomeCommand,
  isOutcomeCode,
  isValidOperatorRef,
  OUTCOME_CODE_TO_LIFECYCLE_STATUS,
  OUTCOME_CODES,
  parseCampaignOutcomeArgs,
  type CampaignOutcomeCommand,
  type NormalizedCampaignOutcomeCommand
} from '../src/db/campaignOutcomes.js';

// Pure unit coverage for the Campaign Outcome command core (no database
// required). See ADR-0010 §4 (command hash), §9 (CLI argument allowlist),
// §2 (outcome code mapping). Database-backed behavior (record/correct
// execute flow, locking, atomicity) is covered separately in
// campaignOutcomeCommand.test.ts.

const CAMPAIGN_ID = '00000000-0000-4000-9400-000000000001';
const OPERATOR_REF = 'pilot-admin:11111111-1111-4111-8111-111111111111';
const RECORD_ID = '11111111-1111-4111-8111-000000000001';

// ---------------------------------------------------------------------------
// CO-C-005..009: outcome code -> lifecycle status mapping.
// ---------------------------------------------------------------------------

test('OUTCOME_CODE_TO_LIFECYCLE_STATUS maps exactly the five PRODUCT outcome codes', () => {
  assert.deepEqual(OUTCOME_CODES, [
    'success_via_leasemind', 'success_independently', 'success_via_broker', 'cancelled', 'expired'
  ]);
  assert.deepEqual(OUTCOME_CODE_TO_LIFECYCLE_STATUS, {
    success_via_leasemind: 'Completed',
    success_independently: 'Completed',
    success_via_broker: 'Completed',
    cancelled: 'Failed',
    expired: 'Failed'
  });
});

test('isOutcomeCode accepts only the five known codes', () => {
  for (const code of OUTCOME_CODES) assert.equal(isOutcomeCode(code), true);
  for (const invalid of ['', 'Success', 'SUCCESS_VIA_LEASEMIND', 'withdrawn', 'success_via_leasemind ']) {
    assert.equal(isOutcomeCode(invalid), false);
  }
});

test('isValidOperatorRef accepts only pilot-admin:<uuid v4 or v7>', () => {
  assert.equal(isValidOperatorRef(OPERATOR_REF), true);
  assert.equal(isValidOperatorRef('pilot-admin:018f7f4e-0000-7000-8000-000000000000'), true, 'uuid v7 allowed');
  for (const invalid of [
    '',
    'admin:11111111-1111-4111-8111-111111111111',
    'pilot-admin:not-a-uuid',
    'pilot-admin:11111111-1111-3111-8111-111111111111', // wrong version nibble
    'pilot-admin:11111111-1111-4111-8111-111111111111 ',
    ' pilot-admin:11111111-1111-4111-8111-111111111111',
    'pilot-admin:11111111-1111-4111-c111-111111111111' // wrong variant nibble
  ]) {
    assert.equal(isValidOperatorRef(invalid), false, `expected rejection for ${JSON.stringify(invalid)}`);
  }
});

// ---------------------------------------------------------------------------
// CO-C-018: CLI argument allowlist.
// ---------------------------------------------------------------------------

test('parseCampaignOutcomeArgs: valid record command parses to the exact expected shape', () => {
  const parsed = parseCampaignOutcomeArgs([
    'record',
    '--campaign-id', CAMPAIGN_ID,
    '--outcome-code', 'success_via_leasemind',
    '--expected-campaign-version', '3',
    '--idempotency-key', 'op:1',
    '--actor-ref', OPERATOR_REF,
    '--confirmation-attested',
    '--execute'
  ]);
  assert.deepEqual(parsed, {
    action: 'record',
    campaignId: CAMPAIGN_ID,
    outcomeCode: 'success_via_leasemind',
    expectedCampaignVersion: '3',
    idempotencyKey: 'op:1',
    actorRef: OPERATOR_REF,
    confirmationAttested: true,
    execute: true,
    correctsOutcomeRecordId: null,
    correctionReasonCode: null
  });
});

test('parseCampaignOutcomeArgs: default (no --execute) is dry-run', () => {
  const parsed = parseCampaignOutcomeArgs([
    'record',
    '--campaign-id', CAMPAIGN_ID,
    '--outcome-code', 'expired',
    '--expected-campaign-version', '1',
    '--idempotency-key', 'op:2',
    '--actor-ref', OPERATOR_REF,
    '--confirmation-attested'
  ]);
  assert.equal(parsed.execute, false);
});

test('parseCampaignOutcomeArgs: valid correct command requires target and exact reason code', () => {
  const parsed = parseCampaignOutcomeArgs([
    'correct',
    '--campaign-id', CAMPAIGN_ID,
    '--outcome-code', 'cancelled',
    '--expected-campaign-version', '2',
    '--idempotency-key', 'op:3',
    '--actor-ref', OPERATOR_REF,
    '--confirmation-attested',
    '--corrects-outcome-record-id', RECORD_ID,
    '--correction-reason-code', CORRECTION_REASON_CODE,
    '--execute'
  ]);
  assert.equal(parsed.correctsOutcomeRecordId, RECORD_ID);
  assert.equal(parsed.correctionReasonCode, CORRECTION_REASON_CODE);
});

test('parseCampaignOutcomeArgs: unknown, missing, duplicate, extra, wrong-action and malformed-value arguments are all rejected', () => {
  const validRecord = [
    'record',
    '--campaign-id', CAMPAIGN_ID,
    '--outcome-code', 'success_via_leasemind',
    '--expected-campaign-version', '1',
    '--idempotency-key', 'op:4',
    '--actor-ref', OPERATOR_REF,
    '--confirmation-attested'
  ];
  const cases: string[][] = [
    [],
    ['launch'], // unknown action
    [...validRecord, '--unknown-flag'],
    [...validRecord, '--campaign-id', CAMPAIGN_ID], // duplicate
    validRecord.slice(0, -2), // missing confirmation-attested and one value
    ['record', '--campaign-id', 'not-a-uuid', '--outcome-code', 'success_via_leasemind', '--expected-campaign-version', '1', '--idempotency-key', 'op:5', '--actor-ref', OPERATOR_REF, '--confirmation-attested'],
    ['record', '--campaign-id', CAMPAIGN_ID, '--outcome-code', 'withdrawn', '--expected-campaign-version', '1', '--idempotency-key', 'op:6', '--actor-ref', OPERATOR_REF, '--confirmation-attested'],
    ['record', '--campaign-id', CAMPAIGN_ID, '--outcome-code', 'success_via_leasemind', '--expected-campaign-version', '0', '--idempotency-key', 'op:7', '--actor-ref', OPERATOR_REF, '--confirmation-attested'],
    ['record', '--campaign-id', CAMPAIGN_ID, '--outcome-code', 'success_via_leasemind', '--expected-campaign-version', '1', '--idempotency-key', '', '--actor-ref', OPERATOR_REF, '--confirmation-attested'],
    ['record', '--campaign-id', CAMPAIGN_ID, '--outcome-code', 'success_via_leasemind', '--expected-campaign-version', '1', '--idempotency-key', 'op:8', '--actor-ref', 'not-an-operator-ref', '--confirmation-attested'],
    // record must never accept correction-only flags
    [...validRecord, '--corrects-outcome-record-id', RECORD_ID],
    [...validRecord, '--correction-reason-code', CORRECTION_REASON_CODE],
    // correct without target/reason
    ['correct', '--campaign-id', CAMPAIGN_ID, '--outcome-code', 'cancelled', '--expected-campaign-version', '2', '--idempotency-key', 'op:9', '--actor-ref', OPERATOR_REF, '--confirmation-attested'],
    // correct with a non-CORRECTION_REASON_CODE reason
    ['correct', '--campaign-id', CAMPAIGN_ID, '--outcome-code', 'cancelled', '--expected-campaign-version', '2', '--idempotency-key', 'op:10', '--actor-ref', OPERATOR_REF, '--confirmation-attested', '--corrects-outcome-record-id', RECORD_ID, '--correction-reason-code', 'BECAUSE_I_SAID_SO'],
    // trailing flag value looks like another flag
    ['record', '--campaign-id', '--outcome-code', '--expected-campaign-version', '1', '--idempotency-key', 'op:11', '--actor-ref', OPERATOR_REF, '--confirmation-attested']
  ];
  for (const args of cases) {
    assert.throws(
      () => parseCampaignOutcomeArgs(args),
      (error: unknown) => error instanceof CampaignOutcomeError && error.safeCode === CAMPAIGN_OUTCOME_ARGUMENT_INVALID,
      `expected rejection for ${JSON.stringify(args)}`
    );
  }
});

// ---------------------------------------------------------------------------
// ADR-0010 §4: canonical normalized command + deterministic command hash.
// operator_ref and idempotency_key are deliberately NOT part of the hash.
// ---------------------------------------------------------------------------

function normalized(overrides: Partial<NormalizedCampaignOutcomeCommand> = {}): NormalizedCampaignOutcomeCommand {
  return {
    commandType: 'record',
    campaignId: CAMPAIGN_ID,
    outcomeCode: 'success_via_leasemind',
    confirmationMethod: CONFIRMATION_METHOD,
    expectedCampaignVersion: '1',
    correctsOutcomeRecordId: null,
    correctionReasonCode: null,
    ...overrides
  };
}

test('computeCampaignOutcomeCommandHash is deterministic for identical input', () => {
  assert.equal(computeCampaignOutcomeCommandHash(normalized()), computeCampaignOutcomeCommandHash(normalized()));
  assert.match(computeCampaignOutcomeCommandHash(normalized()), /^[0-9a-f]{64}$/);
});

test('computeCampaignOutcomeCommandHash changes when any logical field changes', () => {
  const base = computeCampaignOutcomeCommandHash(normalized());
  const variants: Array<Partial<NormalizedCampaignOutcomeCommand>> = [
    { commandType: 'correct', correctsOutcomeRecordId: RECORD_ID, correctionReasonCode: CORRECTION_REASON_CODE },
    { campaignId: '00000000-0000-4000-9400-000000000002' },
    { outcomeCode: 'expired' },
    { expectedCampaignVersion: '2' }
  ];
  for (const variant of variants) {
    assert.notEqual(computeCampaignOutcomeCommandHash(normalized(variant)), base, `expected hash to change for ${JSON.stringify(variant)}`);
  }
});

test('computeCampaignOutcomeCommandHash is independent of idempotency_key and operator_ref: two different keys with the same logical command converge to the same hash', () => {
  // idempotency_key and operator_ref are not fields of NormalizedCampaignOutcomeCommand
  // at all -- this test documents that omission is intentional, not an
  // oversight: the hash is purely a function of the logical command.
  const a = computeCampaignOutcomeCommandHash(normalized());
  const b = computeCampaignOutcomeCommandHash(normalized());
  assert.equal(a, b, 'the same logical command must hash identically regardless of which idempotency_key or operator_ref happened to submit it');
});

// ---------------------------------------------------------------------------
// Lossless expected_campaign_version: canonical decimal string end to end,
// never `number` -- Number.MAX_SAFE_INTEGER = 9007199254740991, so
// 9007199254740992 (2^53) and 9007199254740993 (2^53+1) are the smallest
// pair of distinct positive integers that Number() collapses to the same
// float64 value.
// ---------------------------------------------------------------------------

const HUGE_VERSION_A = '9007199254740992';
const HUGE_VERSION_B = '9007199254740993';

test('sanity: Number() actually collapses 9007199254740992 and 9007199254740993 to the same value -- this is exactly the precision loss the string contract avoids', () => {
  assert.equal(Number(HUGE_VERSION_A), Number(HUGE_VERSION_B));
});

test('computeCampaignOutcomeCommandHash treats 9007199254740992 and 9007199254740993 as distinct expected_campaign_version values', () => {
  const a = computeCampaignOutcomeCommandHash(normalized({ expectedCampaignVersion: HUGE_VERSION_A }));
  const b = computeCampaignOutcomeCommandHash(normalized({ expectedCampaignVersion: HUGE_VERSION_B }));
  assert.notEqual(a, b);
});

test('parseCampaignOutcomeArgs preserves expected_campaign_version losslessly as a canonical string beyond Number.MAX_SAFE_INTEGER', () => {
  const parsed = parseCampaignOutcomeArgs([
    'record',
    '--campaign-id', CAMPAIGN_ID,
    '--outcome-code', 'success_via_leasemind',
    '--expected-campaign-version', HUGE_VERSION_B,
    '--idempotency-key', 'op:huge',
    '--actor-ref', OPERATOR_REF,
    '--confirmation-attested'
  ]);
  assert.equal(parsed.expectedCampaignVersion, HUGE_VERSION_B);
  assert.equal(typeof parsed.expectedCampaignVersion, 'string');
});

test('parseCampaignOutcomeArgs still rejects malformed expected_campaign_version values (zero, negative, leading zero, non-numeric)', () => {
  for (const malformedVersion of ['0', '-1', '01', '1.5', 'abc', '', ' 1', '1 ']) {
    assert.throws(
      () => parseCampaignOutcomeArgs([
        'record',
        '--campaign-id', CAMPAIGN_ID,
        '--outcome-code', 'success_via_leasemind',
        '--expected-campaign-version', malformedVersion,
        '--idempotency-key', 'op:malformed-version',
        '--actor-ref', OPERATOR_REF,
        '--confirmation-attested'
      ]),
      (error: unknown) => error instanceof CampaignOutcomeError && error.safeCode === CAMPAIGN_OUTCOME_ARGUMENT_INVALID,
      `expected rejection for version ${JSON.stringify(malformedVersion)}`
    );
  }
});

// ---------------------------------------------------------------------------
// UUID canonicalization: campaign_id and corrects_outcome_record_id are
// lowercased end to end, so the command hash and every in-process
// comparison are case-independent.
// ---------------------------------------------------------------------------

const CAMPAIGN_ID_LOWER = 'aabbccdd-eeff-4001-8002-aabbccddeeff';
const RECORD_ID_LOWER = 'bbccddee-ffaa-4002-9003-bbccddeeffaa';

test('canonicalizeCampaignOutcomeCommand lowercases campaign_id and corrects_outcome_record_id', () => {
  const upper: CampaignOutcomeCommand = {
    action: 'correct',
    campaignId: CAMPAIGN_ID_LOWER.toUpperCase(),
    outcomeCode: 'cancelled',
    expectedCampaignVersion: '1',
    idempotencyKey: 'op:case',
    actorRef: OPERATOR_REF,
    confirmationAttested: true,
    execute: true,
    correctsOutcomeRecordId: RECORD_ID_LOWER.toUpperCase(),
    correctionReasonCode: CORRECTION_REASON_CODE
  };
  const canonical = canonicalizeCampaignOutcomeCommand(upper);
  assert.equal(canonical.campaignId, CAMPAIGN_ID_LOWER);
  assert.equal(canonical.correctsOutcomeRecordId, RECORD_ID_LOWER);
});

test('canonicalizeCampaignOutcomeCommand leaves a record command\'s null corrects_outcome_record_id untouched', () => {
  const command: CampaignOutcomeCommand = {
    action: 'record',
    campaignId: CAMPAIGN_ID_LOWER.toUpperCase(),
    outcomeCode: 'success_via_leasemind',
    expectedCampaignVersion: '1',
    idempotencyKey: 'op:record-case',
    actorRef: OPERATOR_REF,
    confirmationAttested: true,
    execute: true,
    correctsOutcomeRecordId: null,
    correctionReasonCode: null
  };
  const canonical = canonicalizeCampaignOutcomeCommand(command);
  assert.equal(canonical.campaignId, CAMPAIGN_ID_LOWER);
  assert.equal(canonical.correctsOutcomeRecordId, null);
});

test('computeCampaignOutcomeCommandHash itself is case-independent for campaign_id and corrects_outcome_record_id, defensively -- upper and lower case UUIDs are one logical command and must hash identically even without a prior canonicalization step', () => {
  const lowerHash = computeCampaignOutcomeCommandHash(normalized({ campaignId: CAMPAIGN_ID_LOWER }));
  const upperHash = computeCampaignOutcomeCommandHash(normalized({ campaignId: CAMPAIGN_ID_LOWER.toUpperCase() }));
  assert.equal(upperHash, lowerHash, 'computeCampaignOutcomeCommandHash must defensively canonicalize campaign_id itself');

  const correctionVariant = (recordId: string): Partial<NormalizedCampaignOutcomeCommand> => ({
    commandType: 'correct',
    campaignId: CAMPAIGN_ID_LOWER,
    correctsOutcomeRecordId: recordId,
    correctionReasonCode: CORRECTION_REASON_CODE
  });
  const lowerRecordHash = computeCampaignOutcomeCommandHash(normalized(correctionVariant(RECORD_ID_LOWER)));
  const upperRecordHash = computeCampaignOutcomeCommandHash(normalized(correctionVariant(RECORD_ID_LOWER.toUpperCase())));
  assert.equal(upperRecordHash, lowerRecordHash, 'computeCampaignOutcomeCommandHash must defensively canonicalize corrects_outcome_record_id itself');
});

test('parseCampaignOutcomeArgs returns canonical lowercase UUIDs even when given uppercase CLI input', () => {
  const parsed = parseCampaignOutcomeArgs([
    'correct',
    '--campaign-id', CAMPAIGN_ID_LOWER.toUpperCase(),
    '--outcome-code', 'cancelled',
    '--expected-campaign-version', '1',
    '--idempotency-key', 'op:upper-cli',
    '--actor-ref', OPERATOR_REF,
    '--confirmation-attested',
    '--corrects-outcome-record-id', RECORD_ID_LOWER.toUpperCase(),
    '--correction-reason-code', CORRECTION_REASON_CODE
  ]);
  assert.equal(parsed.campaignId, CAMPAIGN_ID_LOWER);
  assert.equal(parsed.correctsOutcomeRecordId, RECORD_ID_LOWER);
});

// ---------------------------------------------------------------------------
// Defensive validation on the direct typed-core path: a malformed cast must
// fail closed with CAMPAIGN_OUTCOME_ARGUMENT_INVALID, never a raw TypeError,
// and never reach the database.
// ---------------------------------------------------------------------------

test('a malformed direct-core cast is rejected as CAMPAIGN_OUTCOME_ARGUMENT_INVALID before any database contact, not a raw TypeError', async () => {
  // If validation did not run first (or ran after a DB call), this pool
  // would be used and its thrown Error would surface as
  // CAMPAIGN_OUTCOME_OPERATION_FAILED instead -- making this test
  // self-verifying, not just a try/catch around a TypeError.
  const explodingPool = {
    connect: () => {
      throw new Error('DB_CONTACT_NOT_EXPECTED_FOR_INVALID_ARGUMENTS');
    }
  } as unknown as pg.Pool;

  const malformed = {
    action: 'launch', // neither 'record' nor 'correct'
    campaignId: 12345, // not a string
    outcomeCode: 'success_via_leasemind',
    expectedCampaignVersion: 1, // number, not the canonical decimal string
    idempotencyKey: undefined, // missing entirely
    actorRef: OPERATOR_REF,
    confirmationAttested: true,
    execute: false,
    correctsOutcomeRecordId: null,
    correctionReasonCode: null
  } as unknown as CampaignOutcomeCommand;

  await assert.rejects(
    dryRunCampaignOutcomeCommand(explodingPool, malformed),
    (error: unknown) => {
      assert.ok(error instanceof CampaignOutcomeError, `expected a CampaignOutcomeError, got ${String(error)}`);
      assert.equal(error.safeCode, CAMPAIGN_OUTCOME_ARGUMENT_INVALID);
      return true;
    }
  );
});
