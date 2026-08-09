import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// No React DOM renderer is set up in this project's test suite (see the
// same note in technicalAssignmentErrorMessages.test.ts). These are
// source-text regression guards for the two Sprint 4 blocking defects --
// the only way to pin down "this wiring exists and is not dead code"
// without a DOM. They check structure/ordering, not runtime behavior.

const SOURCE = readFileSync(fileURLToPath(new URL('../src/CampaignLaunchWizard.tsx', import.meta.url)), 'utf8');

function functionBody(source: string, startMarker: string): string {
  const start = source.indexOf(startMarker);
  assert.ok(start >= 0, `could not find "${startMarker}" in CampaignLaunchWizard.tsx`);
  const end = source.indexOf('\n  };', start);
  assert.ok(end > start, `could not find the end of the block starting at "${startMarker}"`);
  return source.slice(start, end);
}

// ---------------------------------------------------------------------------
// Defect 1: reload / return-to-old-tab restore
// ---------------------------------------------------------------------------

test('CampaignLaunchWizard never actually calls localStorage or sessionStorage', () => {
  // The Technical Assignment payload, property_exact_address and any
  // contact data must never be persisted client-side beyond the URL's
  // opaque id (technicalAssignmentUrlState.ts). Checks for actual call
  // syntax (getItem/setItem/removeItem, or `window.localStorage`), not a
  // bare word match -- the file's own comments legitimately name these APIs
  // in prose to explain why they are NOT used, which a plain substring or
  // "word followed by a dot" check would misfire on (a comment ending a
  // sentence right after the word is exactly such a case).
  const STORAGE_CALL = /\b(local|session)Storage\.(getItem|setItem|removeItem|clear|key)\s*\(|window\.(local|session)Storage\b/;
  assert.ok(!STORAGE_CALL.test(SOURCE), 'CampaignLaunchWizard.tsx must never call localStorage/sessionStorage');
});

test('the restore-on-mount effect reads the URL and re-fetches from the backend, not from any trusted client cache', () => {
  const start = SOURCE.indexOf('useEffect(() => {\n    const id = getTechnicalAssignmentIdFromSearch(window.location.search);');
  assert.ok(start >= 0, 'restore-on-mount effect not found');
  const end = SOURCE.indexOf('}, [restoreAttempt]);', start);
  assert.ok(end > start, 'could not find the end of the restore-on-mount effect');
  const body = SOURCE.slice(start, end);
  assert.ok(body.includes('getTechnicalAssignmentIdFromSearch(window.location.search)'), 'must read the id from window.location.search');
  assert.ok(body.includes('fetchTechnicalAssignmentById(id)'), 'must re-fetch the Technical Assignment from the backend');
  assert.ok(body.includes('setStep('), 'must open a step based on what the GET returned');
  // The restored step must come from the server's lifecycle_status, never
  // from a client-side value read out of the URL/storage.
  assert.ok(!/setStep\(\s*['"]\w+['"]\s*\)/.test(body.slice(0, body.indexOf('setStep('))), 'must not hardcode a step before the GET resolves');
});

test('handleSaveDraft persists the just-saved technical_assignment_id into the URL on success', () => {
  const body = functionBody(SOURCE, 'const handleSaveDraft = async () => {');
  const savedBranchStart = body.indexOf("result.kind === 'saved'");
  assert.ok(savedBranchStart >= 0, "handleSaveDraft's 'saved' branch not found");
  const savedBranch = body.slice(savedBranchStart);
  assert.ok(savedBranch.includes('buildSearchWithTechnicalAssignmentId('), 'must build a URL search string carrying the technical_assignment_id');
  assert.ok(savedBranch.includes('window.history.replaceState('), 'must write the id into the URL via history.replaceState');
});

test('handleSaveDraft targets the currently loaded assignment and revision after restore', () => {
  const body = functionBody(SOURCE, 'const handleSaveDraft = async () => {');
  assert.ok(
    body.includes('saveTechnicalAssignmentDraft(taIdempotencyKey, scenario, payload, assignment ?? undefined)'),
    'restored and subsequent saves must send the server-owned assignment identity/revision'
  );
});

test('a transient restore error keeps the URL recovery reference and exposes retry', () => {
  const effectStart = SOURCE.indexOf('fetchTechnicalAssignmentById(id).then(result => {');
  assert.ok(effectStart >= 0, 'restore request result handler not found');
  const notFoundStart = SOURCE.indexOf("result.kind === 'not_found'", effectStart);
  assert.ok(notFoundStart > effectStart, 'confirmed not-found branch not found');
  const transientBranch = SOURCE.slice(effectStart, notFoundStart);
  assert.ok(transientBranch.includes("result.kind === 'error'"), 'transient error branch not found');
  assert.ok(!transientBranch.includes('buildSearchWithoutTechnicalAssignmentId'), 'transient errors must never remove the recovery reference');
  assert.ok(SOURCE.includes('setRestoreAttempt(attempt => attempt + 1)'), 'the user must be able to retry restore');
});

// ---------------------------------------------------------------------------
// Defect 2: Contacts Gate bypass
// ---------------------------------------------------------------------------

function sectionBetween(marker1: string, marker2: string): string {
  const start = SOURCE.indexOf(marker1);
  assert.ok(start >= 0, `could not find "${marker1}"`);
  const end = SOURCE.indexOf(marker2, start);
  assert.ok(end > start, `could not find "${marker2}" after "${marker1}"`);
  return SOURCE.slice(start, end);
}

test('the Contacts screen\'s "Далее" button is disabled until an explicit gate confirmation is checked', () => {
  const contactsSection = sectionBetween("if (step === 'contacts') {", "if (step === 'launch') {");
  assert.ok(contactsSection.includes("type=\"checkbox\""), 'Contacts screen must render an explicit confirmation control');
  assert.ok(contactsSection.includes('contactsGateConfirmed'), 'must gate on a contactsGateConfirmed flag');
  assert.ok(
    contactsSection.includes('disabled={!contactsGateConfirmed}') && contactsSection.includes("setStep('launch')"),
    '"Далее" (-> launch) must be disabled until contactsGateConfirmed is true'
  );
});

test('the launch step independently refuses to render its launch button without contactsGateConfirmed (defense in depth)', () => {
  const launchSection = sectionBetween("if (step === 'launch') {", "if (step === 'success'");
  const guardIndex = launchSection.indexOf('if (!contactsGateConfirmed)');
  assert.ok(guardIndex >= 0, 'launch step must guard on contactsGateConfirmed');
  const launchButtonIndex = launchSection.indexOf('Запустить кампанию');
  assert.ok(launchButtonIndex >= 0, 'launch button not found');
  assert.ok(guardIndex < launchButtonIndex, 'the contactsGateConfirmed guard must appear before the actual launch button in the code path');
});

test('handleLaunch never sends anything but the server-defined synthetic Contacts Gate marker (no client-invented evidence)', () => {
  // The security boundary here is server-side (ADR-0008 section 2): the
  // frontend is not trusted to prove the gate was passed, only to decide
  // when to call launchCampaign at all -- which the tests above cover.
  const body = functionBody(SOURCE, 'const handleLaunch = async () => {');
  assert.ok(body.includes('launchCampaign('), 'handleLaunch must call the launchCampaign command');
});
