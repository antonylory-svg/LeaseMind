import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getTechnicalAssignmentIdFromSearch,
  buildSearchWithTechnicalAssignmentId,
  buildSearchWithoutTechnicalAssignmentId
} from '../src/technicalAssignmentUrlState.js';

// Defect 1 (Sprint 4): reload / return-to-old-tab restore. The Technical
// Assignment id lives only in the URL query string -- never
// localStorage/sessionStorage (see CampaignLaunchWizard.tsx and
// campaignLaunchWizardRegressions.test.ts, which asserts the source never
// even references those APIs).

test('getTechnicalAssignmentIdFromSearch: extracts the id from a bare "?ta=" query string', () => {
  assert.equal(getTechnicalAssignmentIdFromSearch('?ta=2c880adf-13e2-4eb7-b391-2c115eeada26'), '2c880adf-13e2-4eb7-b391-2c115eeada26');
});

test('getTechnicalAssignmentIdFromSearch: returns null when the param is absent', () => {
  assert.equal(getTechnicalAssignmentIdFromSearch(''), null);
  assert.equal(getTechnicalAssignmentIdFromSearch('?foo=bar'), null);
});

test('getTechnicalAssignmentIdFromSearch: finds the id alongside unrelated query params', () => {
  assert.equal(getTechnicalAssignmentIdFromSearch('?foo=bar&ta=abc-123&baz=qux'), 'abc-123');
});

test('buildSearchWithTechnicalAssignmentId: sets the param on an empty search string', () => {
  assert.equal(buildSearchWithTechnicalAssignmentId('', 'abc-123'), '?ta=abc-123');
});

test('buildSearchWithTechnicalAssignmentId: overwrites an existing ta param rather than duplicating it', () => {
  const result = buildSearchWithTechnicalAssignmentId('?ta=old-id', 'new-id');
  assert.equal(getTechnicalAssignmentIdFromSearch(result), 'new-id');
  assert.equal((result.match(/ta=/g) ?? []).length, 1);
});

test('buildSearchWithTechnicalAssignmentId: preserves unrelated existing params', () => {
  const result = buildSearchWithTechnicalAssignmentId('?foo=bar', 'abc-123');
  assert.equal(getTechnicalAssignmentIdFromSearch(result), 'abc-123');
  assert.equal(new URLSearchParams(result).get('foo'), 'bar');
});

test('buildSearchWithoutTechnicalAssignmentId: removes the param and preserves the rest', () => {
  const result = buildSearchWithoutTechnicalAssignmentId('?foo=bar&ta=abc-123');
  assert.equal(getTechnicalAssignmentIdFromSearch(result), null);
  assert.equal(new URLSearchParams(result).get('foo'), 'bar');
});

test('buildSearchWithoutTechnicalAssignmentId: returns an empty string when nothing is left', () => {
  assert.equal(buildSearchWithoutTechnicalAssignmentId('?ta=abc-123'), '');
});

test('round trip: build then get returns exactly the id that was put in', () => {
  const search = buildSearchWithTechnicalAssignmentId('', '35a0bc9d-fa53-40c0-94e7-bd53badb74c3');
  assert.equal(getTechnicalAssignmentIdFromSearch(search), '35a0bc9d-fa53-40c0-94e7-bd53badb74c3');
});

test('two tabs restore independently: building two different ids from independent starting points never cross-contaminates', () => {
  // Simulates what two separate browser tabs would each compute for their
  // own window.location.search -- these functions carry no module-level or
  // shared state, so tab A's id can never leak into tab B's search string.
  const tabASearch = buildSearchWithTechnicalAssignmentId('', 'ta-for-tab-a');
  const tabBSearch = buildSearchWithTechnicalAssignmentId('', 'ta-for-tab-b');
  assert.equal(getTechnicalAssignmentIdFromSearch(tabASearch), 'ta-for-tab-a');
  assert.equal(getTechnicalAssignmentIdFromSearch(tabBSearch), 'ta-for-tab-b');
  assert.notEqual(tabASearch, tabBSearch);
});
