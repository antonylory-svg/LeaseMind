import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const SOURCE_ROOT = path.join(WEB_ROOT, 'src');
const SYNTHETIC_ROOT = path.join(SOURCE_ROOT, 'synthetic');

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const candidate = path.join(directory, entry.name);
    if (candidate === SYNTHETIC_ROOT) return [];
    return entry.isDirectory() ? sourceFiles(candidate) : [candidate];
  });
}

test('synthetic preview is unreachable from every production web source file', () => {
  for (const file of sourceFiles(SOURCE_ROOT)) {
    const source = readFileSync(file, 'utf8');
    assert.equal(source.includes('/synthetic/'), false, file);
    assert.equal(source.includes('./synthetic'), false, file);
    assert.equal(source.includes('SafePresentationSyntheticPreview'), false, file);
    assert.equal(source.includes('safePresentationSyntheticViewModel'), false, file);
  }
});

test('synthetic implementation contains no network, storage, cache or telemetry capability', () => {
  const forbiddenCapabilities = [
    'fetch(',
    'XMLHttpRequest',
    'WebSocket',
    'localStorage',
    'sessionStorage',
    'indexedDB',
    'caches.',
    'sendBeacon',
    'console.'
  ];
  for (const file of sourceFiles(SYNTHETIC_ROOT)) {
    const source = readFileSync(file, 'utf8');
    for (const capability of forbiddenCapabilities) {
      assert.equal(source.includes(capability), false, `${file}: ${capability}`);
    }
  }
});
