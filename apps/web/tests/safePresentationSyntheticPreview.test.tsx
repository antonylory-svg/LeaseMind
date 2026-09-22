import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SafePresentationSyntheticPreview from '../src/synthetic/SafePresentationSyntheticPreview.js';
import {
  projectSafePresentationSynthetic,
  SYNTHETIC_PRESENTATION_BLOCKED,
  SYNTHETIC_PRESENTATION_WATERMARK
} from '../src/synthetic/safePresentationSyntheticViewModel.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = path.resolve(
  TEST_DIRECTORY,
  '..',
  '..',
  '..',
  '05_DEVELOPMENT',
  'matching-engine',
  'safe-presentation-synthetic',
  'fixtures'
);

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(path.join(FIXTURE_ROOT, name), 'utf8')) as unknown;
}

const valid = fixture('valid-minimal.json');

test('valid synthetic input projects and renders the exact visible watermark', () => {
  const view = projectSafePresentationSynthetic(valid);
  assert.deepEqual(view, {
    kind: 'ready',
    watermark: SYNTHETIC_PRESENTATION_WATERMARK,
    heading: 'SYNTHETIC_HEADING',
    message: 'SYNTHETIC_MESSAGE'
  });

  const markup = renderToStaticMarkup(createElement(SafePresentationSyntheticPreview, { input: valid }));
  assert.ok(markup.includes(SYNTHETIC_PRESENTATION_WATERMARK));
  assert.ok(markup.includes('SYNTHETIC_HEADING'));
  assert.ok(markup.includes('SYNTHETIC_MESSAGE'));
});

test('every invalid condition renders only the exact blocked output and never echoes rejected input', () => {
  const prohibitedCases = fixture('invalid-forbidden-content-cases.json') as unknown[];
  const cases: unknown[] = [
    fixture('blocked-stale.json'),
    fixture('blocked-revoked.json'),
    fixture('blocked-binding-mismatch.json'),
    { ...(valid as object), hash_matches: false },
    { ...(valid as object), recipient: 'SYNTHETIC_UNKNOWN_ENUM' },
    { ...(valid as object), additional_property: 'SYNTHETIC_REJECTED_INPUT_SENTINEL' },
    ...prohibitedCases,
    null
  ];

  for (const input of cases) {
    assert.deepEqual(projectSafePresentationSynthetic(input), {
      kind: 'blocked',
      presentation: SYNTHETIC_PRESENTATION_BLOCKED
    });
    const markup = renderToStaticMarkup(createElement(SafePresentationSyntheticPreview, { input }));
    assert.equal(markup, SYNTHETIC_PRESENTATION_BLOCKED);
    assert.equal(markup.includes('SYNTHETIC_REJECTED_INPUT_SENTINEL'), false);
    assert.equal(markup.includes('SYNTHETIC_PROHIBITED_CONTENT_SENTINEL'), false);
    assert.equal(markup.includes('SYNTHETIC_HEADING'), false);
    assert.equal(markup.includes('SYNTHETIC_MESSAGE'), false);
    assert.equal(markup.includes(SYNTHETIC_PRESENTATION_WATERMARK), false);
  }
});

test('projector performs no logging while accepting or rejecting input', () => {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  let calls = 0;
  console.log = () => { calls += 1; };
  console.warn = () => { calls += 1; };
  console.error = () => { calls += 1; };
  try {
    projectSafePresentationSynthetic(valid);
    projectSafePresentationSynthetic({ rejected: 'SYNTHETIC_REJECTED_INPUT_SENTINEL' });
  } finally {
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
  }
  assert.equal(calls, 0);
});
