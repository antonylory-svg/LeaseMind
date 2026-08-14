import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// No React DOM renderer is set up in this project's test suite (see the
// same note in technicalAssignmentErrorMessages.test.ts). These are
// source-text regression guards for the Sprint 4 blocking defects and the
// Sprint 5 Analysis gate --
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
  const restoreMarker = SOURCE.indexOf('// Restore-on-mount:');
  assert.ok(restoreMarker >= 0, 'restore-on-mount marker not found');
  const start = SOURCE.indexOf('useEffect(() => {', restoreMarker);
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

// ---------------------------------------------------------------------------
// Sprint 5: server-owned Analysis restore, presentation and launch gate
// ---------------------------------------------------------------------------

test('Analysis restore reads the current server result before a confirmed not-found can create the first attempt', () => {
  const start = SOURCE.indexOf('// Server-owned Analysis restore/create flow.');
  assert.ok(start >= 0, 'Analysis restore/create effect not found');
  const end = SOURCE.indexOf('// A pending attempt is refreshed', start);
  assert.ok(end > start, 'could not find the end of the Analysis restore/create flow');
  const flow = SOURCE.slice(start, end);
  const readIndex = flow.indexOf('fetchCurrentPreLaunchAnalysisSnapshot(technicalAssignmentId, revision)');
  const notFoundIndex = flow.indexOf("current.kind === 'not_found'");
  const createIndex = flow.indexOf('createFromCommand(commandFor(null))', notFoundIndex);
  assert.ok(readIndex >= 0 && notFoundIndex > readIndex && createIndex > notFoundIndex);
});

test('explicit Analysis retry creates a new key and names the failed Snapshot as its retry target', () => {
  const body = functionBody(SOURCE, 'const handleAnalysisRetry = () => {');
  assert.ok(body.includes("analysisSnapshot.status !== 'failed'"), 'retry must require a terminal failed result');
  assert.ok(body.includes('!analysisSnapshot.failure?.retryable'), 'retry must require retryable=true');
  assert.ok(body.includes('idempotencyKey: crypto.randomUUID()'), 'an explicit retry must use a new idempotency key');
  assert.ok(
    body.includes('retryOfAnalysisSnapshotId: analysisSnapshot.analysis_snapshot_id'),
    'the new attempt must name the failed Snapshot'
  );
});

test('handleAnalysisRetry has a synchronous in-flight guard checked before any other condition', () => {
  // setAnalysisLoading(true) only commits on the next render, so a second
  // click landing before that render must be rejected by something that is
  // readable/writable synchronously -- a ref, checked first, before even
  // the assignment/analysisSnapshot validity checks.
  const body = functionBody(SOURCE, 'const handleAnalysisRetry = () => {');
  const guardCheckIndex = body.indexOf('analysisRetryInFlightRef.current) return;');
  const statusCheckIndex = body.indexOf("analysisSnapshot.status !== 'failed'");
  const guardSetIndex = body.indexOf('analysisRetryInFlightRef.current = true;');
  const reloadBumpIndex = body.indexOf('setAnalysisReloadAttempt(attempt => attempt + 1);');
  assert.ok(guardCheckIndex >= 0, 'handleAnalysisRetry must synchronously check an in-flight guard');
  assert.ok(statusCheckIndex >= 0 && guardSetIndex >= 0 && reloadBumpIndex >= 0);
  assert.ok(
    guardCheckIndex < statusCheckIndex,
    'the in-flight guard must be checked before any other condition, so two rapid clicks cannot both pass validation and each dispatch a distinct retry command'
  );
  assert.ok(
    guardSetIndex > statusCheckIndex && guardSetIndex < reloadBumpIndex,
    'the guard must be set synchronously, after validity checks pass, before triggering the retry effect'
  );
});

test('the retry in-flight guard is released once the pending retry command settles, so a later legitimate retry stays possible', () => {
  const flowStart = SOURCE.indexOf('// Server-owned Analysis restore/create flow.');
  const flowEnd = SOURCE.indexOf('// A pending attempt is refreshed', flowStart);
  assert.ok(flowStart >= 0 && flowEnd > flowStart, 'Analysis restore/create effect not found');
  const flow = SOURCE.slice(flowStart, flowEnd);
  assert.ok(
    flow.includes('analysisRetryInFlightRef.current = false;'),
    'the guard must be released in the same effect that consumes (or supersedes) the pending retry command'
  );
});

test('Analysis screen presents the four approved blocks in order and never invents a probability percentage', () => {
  const analysisSection = sectionBetween("if (step === 'analysis') {", "if (step === 'contacts') {");
  assert.ok(analysisSection.includes('<h2>Предварительный анализ</h2>'));
  assert.ok(analysisSection.includes('По синтетической базе LeaseMind'));
  const price = analysisSection.indexOf('1. Адекватность арендной ставки');
  const competition = analysisSection.indexOf('2. Конкурентная среда');
  const probability = analysisSection.indexOf('3. Вероятность сделки за 30 дней');
  const categories = analysisSection.indexOf('4. ');
  assert.ok(price >= 0 && competition > price && probability > competition && categories > probability);
  assert.ok(
    analysisSection.includes('Недостаточно подтверждённой истории исходов для обоснованной оценки за 30 дней.')
  );
  assert.ok(!analysisSection.includes('%'), 'v1 must not display a deal probability percentage');
  assert.ok(!analysisSection.toLocaleLowerCase('ru-RU').includes('реальный рынок'));
});

test('stale Analysis result is explained outside the terminal-results render branch', () => {
  const analysisSection = sectionBetween("if (step === 'analysis') {", "if (step === 'contacts') {");
  const staleMessage = analysisSection.indexOf("analysisSnapshot?.freshness_status === 'stale'");
  const resultsBranch = analysisSection.indexOf('{currentTerminalSnapshot && (');
  assert.ok(staleMessage >= 0 && resultsBranch > staleMessage);
  assert.ok(
    analysisSection.includes('const currentTerminalSnapshot = analysisReady'),
    'results must be derived only from the current terminal gate'
  );
});

test('Contacts and Launch independently require the same current terminal Analysis gate', () => {
  const contactsSection = sectionBetween("if (step === 'contacts') {", "if (step === 'launch') {");
  const launchSection = sectionBetween("if (step === 'launch') {", "if (step === 'success'");
  assert.ok(contactsSection.includes('!analysisAllowsProgress(analysisSnapshot, assignment)'));
  assert.ok(launchSection.includes('!analysisAllowsProgress(analysisSnapshot, assignment)'));
  assert.ok(launchSection.includes('disabled={launching || !analysisAllowsProgress(analysisSnapshot, assignment)}'));
  assert.ok(
    SOURCE.includes("snapshot.status === 'completed' || snapshot.status === 'insufficient_data'"),
    'a current insufficient_data Snapshot must still allow progress to Contacts'
  );
});

test('Analysis gate checks scenario and result payload and fails closed after a server refresh error', () => {
  const matchStart = SOURCE.indexOf('function analysisMatchesAssignment(');
  const allowStart = SOURCE.indexOf('function analysisAllowsProgress(', matchStart);
  const messagesStart = SOURCE.indexOf('function analysisFailureMessage(', allowStart);
  const gates = SOURCE.slice(matchStart, messagesStart);
  assert.ok(gates.includes('snapshot.scenario === assignment.scenario'));
  assert.ok(gates.includes('Boolean(snapshot.results)'));

  const flowStart = SOURCE.indexOf('// Server-owned Analysis restore/create flow.');
  const flowEnd = SOURCE.indexOf('// A pending attempt is refreshed', flowStart);
  const flow = SOURCE.slice(flowStart, flowEnd);
  const readFailure = flow.indexOf('setAnalysisLoading(false);', flow.indexOf("current.kind === 'not_found'"));
  assert.ok(readFailure >= 0, 'current-read failure branch not found');
  assert.ok(
    flow.indexOf('setAnalysisSnapshot(null);', readFailure) > readFailure,
    'a failed server refresh must revoke the locally cached progress gate'
  );
});

test('handleLaunch passes the exact authorizing Analysis Snapshot id to the launch command', () => {
  const body = functionBody(SOURCE, 'const handleLaunch = async () => {');
  assert.ok(body.includes('!analysisAllowsProgress(analysisSnapshot, assignment)'));
  assert.ok(body.includes('analysisSnapshot.analysis_snapshot_id'));
  const launchCall = body.slice(body.indexOf('launchCampaign('));
  assert.ok(
    launchCall.indexOf('analysisSnapshot.analysis_snapshot_id') > launchCall.indexOf('assignment.revision'),
    'the launch command must receive the Snapshot id after the expected revision'
  );
});

// ---------------------------------------------------------------------------
// Tenant rent-rate constraint
// ---------------------------------------------------------------------------

test('TenantRequest rent-rate mode persists the rate and derives the total budget from maximum area', () => {
  assert.ok(SOURCE.includes("const REQUEST_RENT_RATE_FIELD_ID = 'request_monthly_rent_rate_max_rub_per_sqm'"));
  const effectStart = SOURCE.indexOf('// TenantRequest keeps both constraints:');
  assert.ok(effectStart >= 0, 'TenantRequest rate derivation effect not found');
  const effectEnd = SOURCE.indexOf('const handleDecimalChange', effectStart);
  const effect = SOURCE.slice(effectStart, effectEnd);
  assert.ok(effect.includes('formValues.request_area_max_sqm'), 'must calculate against the requested maximum area');
  assert.ok(effect.includes('[REQUEST_RENT_RATE_FIELD_ID]: result.value'), 'must persist the entered maximum rate');
  assert.ok(effect.includes('request_monthly_budget_max_rub:'), 'must derive and persist the compatible maximum total');
  assert.ok(effect.includes('computeTotalRentFromRate(result.value, area)'), 'must use the shared fixed rent formula');
});

test('the raw TenantRequest rate field is represented only by the combined rate/total control', () => {
  assert.ok(
    SOURCE.includes('field.fieldId !== REQUEST_RENT_RATE_FIELD_ID'),
    'the rate must not be rendered a second time as a disconnected raw field'
  );
  assert.ok(SOURCE.includes('context="request"'), 'the tenant-specific combined rent control must be rendered');
  assert.ok(SOURCE.includes('mode={requestBudgetMode}'), 'the combined control must expose the tenant mode');
});
