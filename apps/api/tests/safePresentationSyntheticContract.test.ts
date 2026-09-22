import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Ajv2020 } from 'ajv/dist/2020.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(TEST_DIRECTORY, '..', '..', '..');
const PACKAGE_ROOT = path.join(
  REPOSITORY_ROOT,
  '05_DEVELOPMENT',
  'matching-engine',
  'safe-presentation-synthetic'
);

function readJson(relativePath: string): unknown {
  return JSON.parse(readFileSync(path.join(PACKAGE_ROOT, relativePath), 'utf8')) as unknown;
}

const schema = readJson(path.join('schema', 'safe-presentation-synthetic-preview.schema.json')) as Record<string, unknown>;
const validMinimal = readJson(path.join('fixtures', 'valid-minimal.json'));
const blockedStale = readJson(path.join('fixtures', 'blocked-stale.json'));
const blockedRevoked = readJson(path.join('fixtures', 'blocked-revoked.json'));
const blockedBindingMismatch = readJson(path.join('fixtures', 'blocked-binding-mismatch.json'));
const forbiddenCases = readJson(path.join('fixtures', 'invalid-forbidden-content-cases.json')) as unknown[];
const validate = new Ajv2020({ allErrors: true, strict: true }).compile(schema);

test('G7 schema is closed and exposes only the frozen synthetic fields', () => {
  assert.equal(schema.additionalProperties, false);
  assert.deepEqual(schema.required, [
    'recipient',
    'audience',
    'purpose',
    'locale',
    'heading',
    'message',
    'stale',
    'revoked',
    'hash_matches',
    'binding_matches'
  ]);
  assert.deepEqual(Object.keys(schema.properties as object).sort(), [...schema.required as string[]].sort());
});

test('only the exact frozen domain tokens are accepted', () => {
  assert.equal(validate(validMinimal), true, JSON.stringify(validate.errors));
  for (const field of ['recipient', 'audience', 'purpose', 'locale', 'heading', 'message']) {
    assert.equal(validate({ ...(validMinimal as object), [field]: 'SYNTHETIC_UNKNOWN_ENUM' }), false, field);
  }
  assert.equal(validate({ ...(validMinimal as object), additional_property: true }), false);
});

test('state fixtures remain schema-valid so presentation logic must block them atomically', () => {
  for (const fixture of [blockedStale, blockedRevoked, blockedBindingMismatch]) {
    assert.equal(validate(fixture), true, JSON.stringify(validate.errors));
  }
  assert.equal(validate({ ...(validMinimal as object), hash_matches: false }), true, JSON.stringify(validate.errors));
});

test('prohibited-content sentinels and additional content are rejected without diagnostics containing input', () => {
  assert.ok(forbiddenCases.length > 0);
  for (const fixture of forbiddenCases) {
    assert.equal(validate(fixture), false);
    assert.equal(JSON.stringify(validate.errors).includes('SYNTHETIC_PROHIBITED_CONTENT_SENTINEL'), false);
  }
});
