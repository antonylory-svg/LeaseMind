import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { canonicalizeLineEndings, computeMigrationChecksum } from '../src/db/migrate.js';

// Pure, no-database coverage for the cross-platform migration checksum fix.
// The bug: `npm run migrate:up` on a CRLF (Windows) checkout hashed the raw
// CRLF bytes, producing a different checksum than the same committed SQL's
// LF checkout -- a false MIGRATION_CHECKSUM_MISMATCH against a real,
// unmodified, already-applied migration. See migrate.ts for the fix and
// campaigns.test.ts ("a checksum mismatch on an already-applied migration
// is rejected...") for the DB-backed ledger-acceptance proof.

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

const SAMPLE_SQL_LF = 'CREATE TABLE leasemind_app.probe (\n  id integer PRIMARY KEY\n);\n-- a trailing comment\n';
const SAMPLE_SQL_CRLF = SAMPLE_SQL_LF.replace(/\n/g, '\r\n');
const SAMPLE_SQL_CR = SAMPLE_SQL_LF.replace(/\n/g, '\r');

test('canonicalizeLineEndings collapses CRLF to LF without otherwise changing content', () => {
  assert.equal(canonicalizeLineEndings(SAMPLE_SQL_CRLF), SAMPLE_SQL_LF);
});

test('canonicalizeLineEndings collapses a lone CR to LF', () => {
  assert.equal(canonicalizeLineEndings(SAMPLE_SQL_CR), SAMPLE_SQL_LF);
});

test('canonicalizeLineEndings is a no-op on already-LF content', () => {
  assert.equal(canonicalizeLineEndings(SAMPLE_SQL_LF), SAMPLE_SQL_LF);
});

test('canonicalizeLineEndings does not mutate its input string', () => {
  const before = SAMPLE_SQL_CRLF;
  const beforeCopy = `${before}`;
  canonicalizeLineEndings(SAMPLE_SQL_CRLF);
  assert.equal(SAMPLE_SQL_CRLF, beforeCopy, 'the original string reference must be unchanged after the call');
});

test('canonicalizeLineEndings never leaves a bare CR byte in its output, regardless of the input line-ending convention -- platform-independent by construction (no os.EOL, no process.platform check)', () => {
  for (const input of [SAMPLE_SQL_LF, SAMPLE_SQL_CRLF, SAMPLE_SQL_CR]) {
    assert.equal(canonicalizeLineEndings(input).includes('\r'), false, `unexpected CR left in output for input variant`);
  }
});

test('LF and CRLF representations of the same SQL produce the identical canonical checksum', () => {
  assert.equal(computeMigrationChecksum(SAMPLE_SQL_LF), computeMigrationChecksum(SAMPLE_SQL_CRLF));
});

test('a lone-CR representation of the same SQL also produces the identical canonical checksum', () => {
  assert.equal(computeMigrationChecksum(SAMPLE_SQL_LF), computeMigrationChecksum(SAMPLE_SQL_CR));
});

test('the canonical checksum is exactly SHA-256 of the LF-only text, and is stable across repeated calls', () => {
  const expected = sha256(SAMPLE_SQL_LF);
  assert.equal(computeMigrationChecksum(SAMPLE_SQL_LF), expected);
  assert.equal(computeMigrationChecksum(SAMPLE_SQL_CRLF), expected);
  assert.equal(computeMigrationChecksum(SAMPLE_SQL_LF), computeMigrationChecksum(SAMPLE_SQL_LF));
});

test('compatibility: the checksum a historical pure-LF checkout/runner would have recorded already equals the canonical checksum', () => {
  // Pre-fix behavior on an LF checkout was already `sha256(raw)`, and raw
  // was already pure LF -- identical to today's canonical checksum. No
  // separate legacy path is needed in this direction.
  const historicalLfChecksum = sha256(SAMPLE_SQL_LF);
  assert.equal(historicalLfChecksum, computeMigrationChecksum(SAMPLE_SQL_LF));
  assert.equal(historicalLfChecksum, computeMigrationChecksum(SAMPLE_SQL_CRLF));
});

test('compatibility: the checksum a historical pure-CRLF (Windows) checkout/runner would have recorded is reproducible from the canonical form using only pure helpers and crypto', () => {
  // What the old, buggy Windows runner actually hashed: the raw CRLF bytes
  // git checked the file out as. Recomputed here purely from
  // canonicalizeLineEndings' output plus crypto -- no DB, no fixture file,
  // and independent of migrate.ts's own private legacy-checksum helper.
  const historicalCrlfChecksum = sha256(SAMPLE_SQL_CRLF);
  const reproducedFromCanonicalHelper = sha256(canonicalizeLineEndings(SAMPLE_SQL_LF).replace(/\n/g, '\r\n'));
  assert.equal(historicalCrlfChecksum, reproducedFromCanonicalHelper);
  // And it is genuinely distinct from the canonical checksum -- the whole
  // reason a compatibility path is needed at all.
  assert.notEqual(historicalCrlfChecksum, computeMigrationChecksum(SAMPLE_SQL_LF));
});

test('a genuine SQL content change produces a different canonical checksum, in every line-ending representation', () => {
  const mutated = SAMPLE_SQL_LF.replace('probe', 'probe_mutated');
  assert.notEqual(computeMigrationChecksum(mutated), computeMigrationChecksum(SAMPLE_SQL_LF));
  assert.notEqual(computeMigrationChecksum(mutated.replace(/\n/g, '\r\n')), computeMigrationChecksum(SAMPLE_SQL_LF));
});

test('a trailing-newline-only change produces a different canonical checksum -- only line-ending bytes are normalized, not newline presence/count', () => {
  const withoutTrailingNewline = SAMPLE_SQL_LF.replace(/\n$/, '');
  assert.notEqual(computeMigrationChecksum(withoutTrailingNewline), computeMigrationChecksum(SAMPLE_SQL_LF));
  const withExtraTrailingNewline = `${SAMPLE_SQL_LF}\n`;
  assert.notEqual(computeMigrationChecksum(withExtraTrailingNewline), computeMigrationChecksum(SAMPLE_SQL_LF));
});
