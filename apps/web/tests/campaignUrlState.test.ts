import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getCampaignIdFromSearch,
  buildSearchWithCampaignId,
  buildSearchWithoutCampaignId,
  isLikelyCampaignId,
  campaignRestoreTakesPriority
} from '../src/campaignUrlState.js';
import { getTechnicalAssignmentIdFromSearch } from '../src/technicalAssignmentUrlState.js';

// Sprint 5 / H2 (PRODUCT §15.3): the Campaign detail screen's reload/
// recovery identity lives only in the URL query string -- never
// localStorage/sessionStorage -- mirroring technicalAssignmentUrlState.ts's
// `ta` param exactly, under a distinct `campaign` param.

test('getCampaignIdFromSearch: extracts the id from a bare "?campaign=" query string', () => {
  assert.equal(getCampaignIdFromSearch('?campaign=2c880adf-13e2-4eb7-b391-2c115eeada26'), '2c880adf-13e2-4eb7-b391-2c115eeada26');
});

test('getCampaignIdFromSearch: returns null when the param is absent', () => {
  assert.equal(getCampaignIdFromSearch(''), null);
  assert.equal(getCampaignIdFromSearch('?foo=bar'), null);
});

test('getCampaignIdFromSearch: finds the id alongside unrelated query params, including a coexisting ta param', () => {
  assert.equal(getCampaignIdFromSearch('?foo=bar&campaign=abc-123&baz=qux'), 'abc-123');
  assert.equal(getCampaignIdFromSearch('?ta=some-ta-id&campaign=abc-123'), 'abc-123');
});

test('buildSearchWithCampaignId: sets the param on an empty search string', () => {
  assert.equal(buildSearchWithCampaignId('', 'abc-123'), '?campaign=abc-123');
});

test('buildSearchWithCampaignId: overwrites an existing campaign param rather than duplicating it', () => {
  const result = buildSearchWithCampaignId('?campaign=old-id', 'new-id');
  assert.equal(getCampaignIdFromSearch(result), 'new-id');
  assert.equal((result.match(/campaign=/g) ?? []).length, 1);
});

test('buildSearchWithCampaignId: preserves unrelated existing params, including a coexisting ta param', () => {
  const result = buildSearchWithCampaignId('?ta=some-ta-id&foo=bar', 'abc-123');
  assert.equal(getCampaignIdFromSearch(result), 'abc-123');
  assert.equal(new URLSearchParams(result).get('foo'), 'bar');
  assert.equal(new URLSearchParams(result).get('ta'), 'some-ta-id');
});

test('buildSearchWithoutCampaignId: removes the param and preserves the rest', () => {
  const result = buildSearchWithoutCampaignId('?foo=bar&campaign=abc-123');
  assert.equal(getCampaignIdFromSearch(result), null);
  assert.equal(new URLSearchParams(result).get('foo'), 'bar');
});

test('buildSearchWithoutCampaignId: returns an empty string when nothing is left', () => {
  assert.equal(buildSearchWithoutCampaignId('?campaign=abc-123'), '');
});

test('round trip: build then get returns exactly the id that was put in', () => {
  const search = buildSearchWithCampaignId('', '35a0bc9d-fa53-40c0-94e7-bd53badb74c3');
  assert.equal(getCampaignIdFromSearch(search), '35a0bc9d-fa53-40c0-94e7-bd53badb74c3');
});

test('two tabs restore independently: building two different ids from independent starting points never cross-contaminates', () => {
  const tabASearch = buildSearchWithCampaignId('', 'campaign-for-tab-a');
  const tabBSearch = buildSearchWithCampaignId('', 'campaign-for-tab-b');
  assert.equal(getCampaignIdFromSearch(tabASearch), 'campaign-for-tab-a');
  assert.equal(getCampaignIdFromSearch(tabBSearch), 'campaign-for-tab-b');
  assert.notEqual(tabASearch, tabBSearch);
});

test('isLikelyCampaignId: accepts UUID v4 and v7, case-insensitively', () => {
  assert.equal(isLikelyCampaignId('00000000-0000-4000-8000-000000000001'), true);
  assert.equal(isLikelyCampaignId('00000000-0000-4000-8000-000000000001'.toUpperCase()), true);
  assert.equal(isLikelyCampaignId('00000000-0000-7000-9000-000000000001'), true);
});

test('isLikelyCampaignId: rejects malformed strings and forbidden UUID versions (never trusted enough to fetch or restore)', () => {
  assert.equal(isLikelyCampaignId('not-a-uuid'), false);
  assert.equal(isLikelyCampaignId(''), false);
  assert.equal(isLikelyCampaignId('00000000-0000-4000-8000'), false);
  for (const version of ['1', '2', '3', '5', '6', '8']) {
    assert.equal(isLikelyCampaignId(`aaaaaaaa-aaaa-${version}aaa-aaaa-aaaaaaaaaaaa`), false, `version ${version} must be rejected`);
  }
});

// ---------------------------------------------------------------------------
// H2 corrective pass: campaignRestoreTakesPriority is the exact, shared
// decision CampaignLaunchWizard.tsx's initial `restoring` state and its
// `ta`-restore effect guard both call -- these are direct calls to the real
// function (not a source-text check), so they exercise the actual logic
// that previously left `restoring` stuck permanently true when a `campaign`
// id -- valid OR malformed -- was present alongside a valid `ta` id.
// ---------------------------------------------------------------------------

const VALID_TA_ID = '11111111-1111-4111-8111-111111111111';
const VALID_CAMPAIGN_ID = '00000000-0000-4000-8000-000000000001';

test('campaignRestoreTakesPriority: true only for a present AND well-formed campaign id', () => {
  assert.equal(campaignRestoreTakesPriority(`?campaign=${VALID_CAMPAIGN_ID}`), true);
  assert.equal(campaignRestoreTakesPriority('?campaign=not-a-uuid'), false);
  assert.equal(campaignRestoreTakesPriority(''), false);
  assert.equal(campaignRestoreTakesPriority('?foo=bar'), false);
});

test('scenario 1 -- valid ta + valid campaign: Campaign takes priority, restoring never starts true, ta restore never fires', () => {
  const search = `?ta=${VALID_TA_ID}&campaign=${VALID_CAMPAIGN_ID}`;

  // The exact boolean CampaignLaunchWizard.tsx uses for its initial
  // `restoring` state.
  const initialRestoring = Boolean(getTechnicalAssignmentIdFromSearch(search)) && !campaignRestoreTakesPriority(search);
  assert.equal(initialRestoring, false, 'restoring must not start true when a valid campaign takes priority -- the deadlock this fixes');

  // The exact boolean the ta-restore effect's guard uses (`if (!id ||
  // campaignRestoreTakesPriority(...)) return;` -- i.e. the effect proceeds
  // only when this is true).
  const taRestoreEffectProceeds = Boolean(getTechnicalAssignmentIdFromSearch(search)) && !campaignRestoreTakesPriority(search);
  assert.equal(taRestoreEffectProceeds, false, 'the ta restore effect must not fetch/run when a valid campaign is present');

  // The campaign-restore effect's own precondition: a valid id is present,
  // so it proceeds to open detail and (per the fix) unconditionally closes
  // out `restoring`.
  const campaignId = getCampaignIdFromSearch(search);
  assert.ok(campaignId !== null && isLikelyCampaignId(campaignId), 'the campaign restore effect must recognize this id as valid');
});

test('scenario 2 -- valid ta + malformed campaign: malformed id is stripped, ta restore proceeds, restoring never starts true and is not skipped', () => {
  const search = `?ta=${VALID_TA_ID}&campaign=not-a-uuid`;

  const initialRestoring = Boolean(getTechnicalAssignmentIdFromSearch(search)) && !campaignRestoreTakesPriority(search);
  assert.equal(initialRestoring, true, 'restoring must still start true so ta restore is not silently skipped');

  const taRestoreEffectProceeds = Boolean(getTechnicalAssignmentIdFromSearch(search)) && !campaignRestoreTakesPriority(search);
  assert.equal(taRestoreEffectProceeds, true, 'the ta restore effect must proceed despite a malformed campaign id being present -- the other deadlock this fixes');

  // The campaign-restore effect's malformed branch: strips the id and
  // leaves `ta` (and any other params) untouched.
  const campaignId = getCampaignIdFromSearch(search);
  assert.ok(campaignId !== null && !isLikelyCampaignId(campaignId), 'this id must be recognized as malformed, not silently accepted');
  const stripped = buildSearchWithoutCampaignId(search);
  assert.equal(getCampaignIdFromSearch(stripped), null, 'the malformed campaign id must be removed from the URL');
  assert.equal(getTechnicalAssignmentIdFromSearch(stripped), VALID_TA_ID, 'the valid ta id must survive stripping the malformed campaign id');

  // And critically: re-evaluating priority against the now-cleaned search
  // still lets ta restore proceed (no leftover suppression).
  assert.equal(campaignRestoreTakesPriority(stripped), false);
});

test('a bare valid ta with no campaign param at all behaves exactly as before this fix (no regression)', () => {
  const search = `?ta=${VALID_TA_ID}`;
  assert.equal(campaignRestoreTakesPriority(search), false);
  const initialRestoring = Boolean(getTechnicalAssignmentIdFromSearch(search)) && !campaignRestoreTakesPriority(search);
  assert.equal(initialRestoring, true);
});
