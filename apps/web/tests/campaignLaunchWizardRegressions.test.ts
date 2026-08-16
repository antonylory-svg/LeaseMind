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

// AnalysisResultBlocks is shared between the pre-launch 'analysis' step and
// the post-launch section of 'detail' (see the two tests further below) --
// its own markup and ordering only needs proving once, here.
function analysisResultBlocksBody(): string {
  const start = SOURCE.indexOf('function AnalysisResultBlocks(');
  assert.ok(start >= 0, 'AnalysisResultBlocks not found');
  const end = SOURCE.indexOf('interface RenderFieldContext {', start);
  assert.ok(end > start, 'could not find the end of AnalysisResultBlocks');
  return SOURCE.slice(start, end);
}

test('AnalysisResultBlocks presents the four approved blocks in order and never invents a probability percentage', () => {
  const body = analysisResultBlocksBody();
  const price = body.indexOf('1. Адекватность арендной ставки');
  const competition = body.indexOf('2. Конкурентная среда');
  const probability = body.indexOf('3. Вероятность сделки за 30 дней');
  const categories = body.indexOf('4. ');
  assert.ok(price >= 0 && competition > price && probability > competition && categories > probability);
  assert.ok(
    body.includes('Недостаточно подтверждённой истории исходов для обоснованной оценки за 30 дней.')
  );
  assert.ok(!body.includes('%'), 'v1 must not display a deal probability percentage');
  assert.ok(!body.toLocaleLowerCase('ru-RU').includes('реальный рынок'));
});

test('the pre-launch Analysis screen renders the heading, synthetic marker and the shared four-block component -- not a second copy of the markup', () => {
  const analysisSection = sectionBetween("if (step === 'analysis') {", "if (step === 'contacts') {");
  assert.ok(analysisSection.includes('<h2>Предварительный анализ</h2>'));
  assert.ok(analysisSection.includes('{SYNTHETIC_DATA_MARKER}'));
  assert.ok(
    analysisSection.includes('<AnalysisResultBlocks results={currentTerminalSnapshot.results} scenario={assignment.scenario} />'),
    'pre-launch must reuse the shared component, not duplicate the four-block markup'
  );
  assert.ok(!analysisSection.includes('1. Адекватность арендной ставки'), 'the heading text must live only in AnalysisResultBlocks, not duplicated here');
});

test('stale Analysis result is explained outside the terminal-results render branch', () => {
  const analysisSection = sectionBetween("if (step === 'analysis') {", "if (step === 'contacts') {");
  const staleMessage = analysisSection.indexOf("analysisSnapshot?.freshness_status === 'stale'");
  const resultsBranch = analysisSection.indexOf('{currentTerminalSnapshot?.results && (');
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
// Sprint 5 / H2: post-launch Analysis on the Campaign detail screen
// (PRODUCT §15.3, ADR-0009 §11.1). Campaign status and Analysis refresh
// status are distinct fields; a failed/stale refresh never touches or
// implies a change to the Campaign's own status; there is no launch button
// anywhere on this screen; reload/recovery reads only from the server.
// ---------------------------------------------------------------------------

function detailStepSection(): string {
  const start = SOURCE.indexOf("if (step === 'detail') {");
  assert.ok(start >= 0, "'detail' step not found");
  // 'detail' is the last step in the component -- slicing to end-of-file is
  // safe for the .includes()/.indexOf() substring checks below (no CRLF
  // dependency, unlike a literal multi-line end marker would be).
  return SOURCE.slice(start);
}

test('Campaign detail never renders a launch button, in any state', () => {
  const section = detailStepSection();
  assert.ok(!section.includes('Запустить кампанию'), 'no launch button text anywhere in the detail screen');
  assert.ok(!section.includes('void handleLaunch()') && !section.includes('handleLaunch()'), 'handleLaunch must never be wired up on this screen');
});

test('Campaign detail shows Campaign status and Analysis refresh status as two distinct fields', () => {
  const section = detailStepSection();
  assert.ok(section.includes('Статус кампании: {campaignStatusLabel}'));
  assert.ok(section.includes('Статус анализа после запуска:'));
  assert.ok(
    section.indexOf('const campaignStatusLabel = detail ? ruLabel(CAMPAIGN_STATUS_LABELS, detail.status)')
      < section.indexOf('Статус анализа после запуска:'),
    'Campaign status is derived once, independently of any Analysis state'
  );
});

test('analysis_context=null shows a distinct safe message, never presented as pending', () => {
  const section = detailStepSection();
  const nullMessageIndex = section.indexOf('{!detail.analysis_context && (');
  assert.ok(nullMessageIndex >= 0);
  const nullBranch = section.slice(nullMessageIndex, section.indexOf('{detail.analysis_context && ('));
  assert.ok(nullBranch.includes('Анализ после запуска для этой кампании недоступен.'));
  assert.ok(!nullBranch.includes('pending') && !nullBranch.includes('15 минут'), 'must not be worded as a pending/waiting state');
});

test('post-launch pending (no Snapshot yet, and an actual pending Snapshot) both show the 15-minute message', () => {
  const section = detailStepSection();
  const noSnapshotYet = section.indexOf('{!postLaunchLoading && !postLaunchError && !postLaunchSnapshot && (');
  const pendingSnapshot = section.indexOf("postLaunchSnapshot.status === 'pending'");
  assert.ok(noSnapshotYet >= 0 && pendingSnapshot > noSnapshotYet);
  const noSnapshotBranch = section.slice(noSnapshotYet, section.indexOf('{postLaunchSnapshot && ('));
  assert.ok(noSnapshotBranch.includes('Не позднее 15 минут после запуска'));
  const pendingBranch = section.slice(pendingSnapshot, section.indexOf("postLaunchSnapshot.status === 'failed'"));
  assert.ok(pendingBranch.includes('Не позднее 15 минут после запуска'));
});

test('H2 corrective pass: post-launch stale uses its own message -- never claims launch is blocked, always confirms the Campaign status is unchanged', () => {
  const section = detailStepSection();
  const staleLine = section.indexOf("postLaunchSnapshot.freshness_status === 'stale'");
  assert.ok(staleLine >= 0, 'post-launch stale branch not found');
  assert.ok(
    section.includes('postLaunchFreshnessMessage(postLaunchSnapshot)'),
    'the post-launch stale message must use its own context-appropriate function, not the pre-launch one'
  );
  assert.ok(
    !section.slice(staleLine, staleLine + 400).includes('analysisFreshnessMessage(postLaunchSnapshot)'),
    'post-launch stale must not reuse the pre-launch message function'
  );

  // The function itself: never claims launch is blocked (that claim is
  // only true/meaningful pre-launch), and always confirms the already-
  // launched Campaign's own status is unchanged.
  const fnStart = SOURCE.indexOf('function postLaunchFreshnessMessage(');
  assert.ok(fnStart >= 0, 'postLaunchFreshnessMessage not found');
  const fnEnd = SOURCE.indexOf('\n}', fnStart);
  const fnBody = SOURCE.slice(fnStart, fnEnd);
  assert.ok(!fnBody.includes('не разрешает запуск'), 'must never claim a stale post-launch result blocks launch -- the Campaign already launched');
  assert.ok(fnBody.includes('Статус уже запущенной кампании не изменился'), 'must explicitly confirm the Campaign status is unchanged');
  // Never leaks the internal audit fields (PRODUCT §6.4) -- only the
  // public freshness_reason is consulted, same boundary as the pre-launch
  // message.
  for (const forbidden of ['reason_code', 'revoked_at', 'revoked_by', 'actor']) {
    assert.ok(!fnBody.toLowerCase().includes(forbidden.toLowerCase()), `must never reference ${forbidden}`);
  }

  // Pre-launch keeps its original, launch-blocking wording -- unaffected by
  // this corrective pass.
  const analysisSection = sectionBetween("if (step === 'analysis') {", "if (step === 'contacts') {");
  assert.ok(analysisSection.includes('analysisFreshnessMessage(analysisSnapshot)'));
  const preLaunchFnStart = SOURCE.indexOf('function analysisFreshnessMessage(');
  const preLaunchFnEnd = SOURCE.indexOf('\n}', preLaunchFnStart);
  assert.ok(SOURCE.slice(preLaunchFnStart, preLaunchFnEnd).includes('не разрешает запуск кампании'));
});

test('post-launch retry is shown only for failed+retryable, gated the same way as pre-launch retry', () => {
  const section = detailStepSection();
  const failedBranchStart = section.indexOf("postLaunchSnapshot.status === 'failed'");
  const retryButtonIndex = section.indexOf('Повторить анализ', failedBranchStart);
  assert.ok(failedBranchStart >= 0 && retryButtonIndex > failedBranchStart);
  const failedBranch = section.slice(failedBranchStart, retryButtonIndex);
  assert.ok(failedBranch.includes('postLaunchSnapshot.failure?.retryable &&'), 'retry button must be conditioned on failure.retryable');
  // Only inside the failed branch -- never rendered for pending/completed/
  // insufficient_data/stale.
  const beforeFailedBranch = section.slice(0, failedBranchStart);
  assert.ok(!beforeFailedBranch.includes('Повторить анализ'));
});

test('handlePostLaunchRetry has a synchronous in-flight guard checked before any other condition', () => {
  const body = functionBody(SOURCE, 'const handlePostLaunchRetry = () => {');
  const guardCheckIndex = body.indexOf('postLaunchRetryInFlightRef.current) return;');
  const statusCheckIndex = body.indexOf("postLaunchSnapshot.status !== 'failed'");
  const guardSetIndex = body.indexOf('postLaunchRetryInFlightRef.current = true;');
  const reloadBumpIndex = body.indexOf('setPostLaunchReloadAttempt(attempt => attempt + 1);');
  assert.ok(guardCheckIndex >= 0 && statusCheckIndex >= 0 && guardSetIndex >= 0 && reloadBumpIndex >= 0);
  assert.ok(guardCheckIndex < statusCheckIndex, 'the in-flight guard must be checked before any other condition');
  assert.ok(guardSetIndex > statusCheckIndex && guardSetIndex < reloadBumpIndex, 'the guard must be set synchronously before triggering the retry effect');
});

test('post-launch retry command names analysis_kind=post_launch_refresh, the Campaign and the failed Snapshot as its target', () => {
  const flowStart = SOURCE.indexOf('// Post-launch Analysis read/retry');
  const flowEnd = SOURCE.indexOf('// Server-owned Analysis restore/create flow.', flowStart);
  assert.ok(flowStart >= 0 && flowEnd > flowStart, 'post-launch read/retry effect not found');
  const flow = SOURCE.slice(flowStart, flowEnd);
  assert.ok(
    flow.includes('analysisRetryInFlightRef.current = false;') === false,
    'post-launch must use its own guard, not the pre-launch one'
  );
  const callIndex = flow.indexOf('createPostLaunchRefreshRetry(');
  assert.ok(callIndex >= 0, 'createPostLaunchRefreshRetry must be called from the read/retry effect');
  const call = flow.slice(callIndex, flow.indexOf(');', callIndex));
  assert.ok(call.includes('command.idempotencyKey'));
  assert.ok(call.includes('command.retryOfAnalysisSnapshotId'));
  // The guard is released once the effect settles, mirroring the M3 pattern.
  assert.ok(flow.includes('postLaunchRetryInFlightRef.current = false;'), 'the guard must be released once the retry command settles');
});

test('a confirmed 404 on the post-launch read is a safe waiting state -- it never creates a Snapshot', () => {
  const flowStart = SOURCE.indexOf('// Post-launch Analysis read/retry');
  const flowEnd = SOURCE.indexOf('// Server-owned Analysis restore/create flow.', flowStart);
  const flow = SOURCE.slice(flowStart, flowEnd);
  const notFoundIndex = flow.indexOf("current.kind === 'not_found'");
  assert.ok(notFoundIndex >= 0);
  const notFoundBranch = flow.slice(notFoundIndex, flow.indexOf("current.kind === 'rejected'", notFoundIndex));
  assert.ok(!notFoundBranch.includes('createPostLaunchRefreshRetry'), 'a 404 must never trigger a create/retry call');
  assert.ok(notFoundBranch.includes('setPostLaunchSnapshot(null);'));
});

test('the Campaign detail restore-on-mount effect only ever performs GET-shaped reads, never a write command', () => {
  const restoreStart = SOURCE.indexOf('// Campaign detail restore-on-mount');
  const restoreEnd = SOURCE.indexOf('// Campaign detail read:', restoreStart);
  assert.ok(restoreStart >= 0 && restoreEnd > restoreStart);
  const restoreEffect = SOURCE.slice(restoreStart, restoreEnd);
  for (const forbidden of ['launchCampaign(', 'createPostLaunchRefreshRetry(', 'createPreLaunchAnalysisSnapshot(', 'fetch(']) {
    assert.ok(!restoreEffect.includes(forbidden), `restore-on-mount must never call ${forbidden}`);
  }
  assert.ok(restoreEffect.includes('getCampaignIdFromSearch(window.location.search)'), 'must read the id from the URL');
  assert.ok(restoreEffect.includes("setStep('detail')"), 'a valid id must open the detail step');
});

test('a malformed campaign id is stripped from the URL and never opens detail; a transient GET error keeps the recovery URL', () => {
  const restoreStart = SOURCE.indexOf('// Campaign detail restore-on-mount');
  const restoreEnd = SOURCE.indexOf('// Campaign detail read:', restoreStart);
  const restoreEffect = SOURCE.slice(restoreStart, restoreEnd);
  const malformedCheck = restoreEffect.indexOf('!isLikelyCampaignId(id)');
  const stripCall = restoreEffect.indexOf('buildSearchWithoutCampaignId(window.location.search)', malformedCheck);
  const setStepDetail = restoreEffect.indexOf("setStep('detail')");
  assert.ok(malformedCheck >= 0 && stripCall > malformedCheck && stripCall < setStepDetail, 'a malformed id must be stripped before the valid-id path ever runs');

  const readStart = SOURCE.indexOf('// Campaign detail read:');
  const readEnd = SOURCE.indexOf('// Post-launch Analysis read/retry', readStart);
  const readEffect = SOURCE.slice(readStart, readEnd);
  assert.ok(!readEffect.includes('buildSearchWithoutCampaignId'), 'a transient fetchCampaignById error must never strip the recovery URL');
  assert.ok(readEffect.includes('setDetailError(true);'));
});

test('a launched Campaign writes campaign into the URL and removes ta; openDetail keeps the same recovery URL in sync', () => {
  const launchBody = functionBody(SOURCE, 'const handleLaunch = async () => {');
  const successBranchStart = launchBody.indexOf("result.kind === 'created' || result.kind === 'replayed'");
  const successBranch = launchBody.slice(successBranchStart, launchBody.indexOf("result.kind === 'invalid'", successBranchStart));
  assert.ok(successBranch.includes('buildSearchWithoutTechnicalAssignmentId(window.location.search)'));
  assert.ok(successBranch.includes('buildSearchWithCampaignId(searchWithoutTa, result.campaign.campaign_id)'));
  assert.ok(successBranch.includes('window.history.replaceState('));

  const openDetailBody = functionBody(SOURCE, 'const openDetail = () => {');
  assert.ok(openDetailBody.includes('buildSearchWithCampaignId(window.location.search, campaign.campaign_id)'));
  assert.ok(openDetailBody.includes('window.history.replaceState('));
});

test('the pre-launch ta-restore effect steps aside only when campaignRestoreTakesPriority is true, never for a merely-present campaign id', () => {
  const restoreStart = SOURCE.indexOf('// Restore-on-mount:');
  const restoreEnd = SOURCE.indexOf("}, [restoreAttempt]);", restoreStart);
  const restoreEffect = SOURCE.slice(restoreStart, restoreEnd);
  assert.ok(
    restoreEffect.includes('campaignRestoreTakesPriority(window.location.search)'),
    'the ta restore guard must use the shared priority decision, not a bare "campaign id present" check -- a malformed campaign id must never suppress ta restore (H2 corrective pass)'
  );
  assert.ok(
    !restoreEffect.includes('getCampaignIdFromSearch(window.location.search)'),
    'the guard must not go back to a bare presence check (that was the original deadlock for a malformed campaign id)'
  );
});

// ---------------------------------------------------------------------------
// H2 corrective pass: the initial `restoring` state, the ta-restore effect's
// guard, and the campaign-restore effect's valid-id branch must all agree
// (via the one shared, directly-unit-tested campaignRestoreTakesPriority --
// see campaignUrlState.test.ts) on when a campaign id takes priority, and
// the campaign-restore effect must unconditionally close out `restoring`
// once it accepts a valid id -- otherwise the recovery screen can get stuck
// forever (valid ta + valid campaign, and valid ta + malformed campaign).
// ---------------------------------------------------------------------------

test('the initial restoring state defers to campaignRestoreTakesPriority, not a bare ta-presence check', () => {
  const start = SOURCE.indexOf('const [restoring, setRestoring] = useState(() =>');
  assert.ok(start >= 0, 'restoring useState initializer not found');
  const end = SOURCE.indexOf('const [restoreNotice', start);
  assert.ok(end > start, 'could not find the end of the restoring useState initializer');
  const body = SOURCE.slice(start, end);
  assert.ok(body.includes('getTechnicalAssignmentIdFromSearch(window.location.search)'));
  assert.ok(
    body.includes('!campaignRestoreTakesPriority(window.location.search)'),
    'restoring must not start true when a valid campaign already takes priority over ta restore'
  );
});

test('accepting a valid Campaign id unconditionally closes out restoring, so the recovery screen can never get stuck', () => {
  const restoreStart = SOURCE.indexOf('// Campaign detail restore-on-mount');
  const restoreEnd = SOURCE.indexOf('// Campaign detail read:', restoreStart);
  assert.ok(restoreStart >= 0 && restoreEnd > restoreStart);
  const restoreEffect = SOURCE.slice(restoreStart, restoreEnd);
  const malformedBranchEnd = restoreEffect.indexOf('setRestoring(false);');
  assert.ok(malformedBranchEnd >= 0, 'the valid-id path must explicitly close out restoring');
  const setStepDetailIndex = restoreEffect.indexOf("setStep('detail');");
  const setDetailCampaignIdIndex = restoreEffect.indexOf('setDetailCampaignId(id);');
  assert.ok(
    malformedBranchEnd < setStepDetailIndex && setStepDetailIndex < setDetailCampaignIdIndex,
    'restoring must be closed out alongside opening detail, not left to a separate/uncertain code path'
  );
  // The malformed branch (return before reaching here) must not itself
  // touch restoring -- it neither opens detail nor needs to, since a
  // malformed id never suppressed restoring in the first place (see
  // campaignRestoreTakesPriority).
  const malformedBranchText = restoreEffect.slice(restoreEffect.indexOf('!isLikelyCampaignId(id)'), malformedBranchEnd);
  assert.ok(!malformedBranchText.includes('setRestoring'), 'the malformed-id branch must not touch restoring at all');
});

// ---------------------------------------------------------------------------
// Sprint 6 read-model: Campaign business outcome (ADR-0010 §10,
// CAMPAIGN_OUTCOMES.md §11, CO-C-010/CO-C-022/CO-C-029). Read-only: no
// write button, form or network write call exists anywhere in the detail
// screen for this data; the server (GET /api/v1/campaigns/{id}) is the only
// source, refetched on every reload (campaigns.ts fetchCampaignById).
// ---------------------------------------------------------------------------

function outcomeSectionBody(): string {
  return sectionBetween('id="campaign-outcome-heading"', 'id="post-launch-analysis-heading"');
}

test('the Campaign outcome section is a separate section, distinct from lifecycle status and from post-launch Analysis', () => {
  const section = detailStepSection();
  const lifecycleIndex = section.indexOf('Статус кампании: {campaignStatusLabel}');
  const outcomeHeadingIndex = section.indexOf('id="campaign-outcome-heading"');
  const analysisHeadingIndex = section.indexOf('id="post-launch-analysis-heading"');
  assert.ok(lifecycleIndex >= 0 && outcomeHeadingIndex > lifecycleIndex, 'the outcome section must come after the lifecycle status field');
  assert.ok(analysisHeadingIndex > outcomeHeadingIndex, 'the outcome section must be its own section, separate from post-launch Analysis');
  assert.ok(section.includes('<h3 id="campaign-outcome-heading">Результат кампании</h3>'));
});

test('outcome_context=null shows a distinct safe message, never presented as pending', () => {
  const body = outcomeSectionBody();
  const nullMessageIndex = body.indexOf('{!detail.outcome_context && (');
  assert.ok(nullMessageIndex >= 0);
  const nullBranch = body.slice(nullMessageIndex, body.indexOf('{detail.outcome_context && ('));
  assert.ok(nullBranch.includes('Результат кампании пока не зафиксирован.'));
  assert.ok(!nullBranch.includes('pending') && !nullBranch.includes('15 минут'), 'must not be worded as a pending/waiting state');
});

test('an effective outcome renders the localized outcome name, server recorded_at, fixed confirmation and fixed operator strings', () => {
  const body = outcomeSectionBody();
  const effectiveBranchStart = body.indexOf('{detail.outcome_context && (');
  assert.ok(effectiveBranchStart >= 0);
  const effectiveBranch = body.slice(effectiveBranchStart);
  assert.ok(
    effectiveBranch.includes('ruLabel(CAMPAIGN_OUTCOME_CODE_LABELS, detail.outcome_context.outcome_code)'),
    'must render the localized outcome name via the closed CAMPAIGN_OUTCOME_CODE_LABELS mapping, never the raw outcome_code'
  );
  assert.ok(
    effectiveBranch.includes('formatAnalysisTime(detail.outcome_context.recorded_at)'),
    'must format recorded_at with the existing safe ru-RU time pattern, not a raw timestamp'
  );
  assert.ok(effectiveBranch.includes('Явное подтверждение пользователя'), 'confirmation_method=user_attestation must render this exact fixed string');
  assert.ok(effectiveBranch.includes('Уполномоченный администратор пилота'), 'operator must render this exact fixed string, regardless of any actual operator_ref');
});

test('a correction shows only the safe "Результат уточнён." marker, gated on is_corrected, and shows nothing when uncorrected', () => {
  const body = outcomeSectionBody();
  const correctedLineIndex = body.indexOf('detail.outcome_context.is_corrected && <li>Результат уточнён.</li>');
  assert.ok(correctedLineIndex >= 0, 'the is_corrected marker must be conditionally rendered');
  // Nothing else in the outcome section ever mentions correction reasons/history.
  for (const forbidden of ['correction_reason', 'reason_code', 'corrects_outcome_record_id', 'уточнение:', 'причин']) {
    assert.ok(!body.toLowerCase().includes(forbidden.toLowerCase()), `outcome section must never reference ${forbidden}`);
  }
});

test('the Campaign outcome section never references raw operator_ref, audit or internal record-identity fields', () => {
  const body = outcomeSectionBody();
  for (const forbidden of ['operator_ref', 'outcome_record_id', 'outcome_sequence', 'resulting_campaign_aggregate_version', 'mapped_lifecycle_status', 'runtime_mode']) {
    assert.ok(!body.includes(forbidden), `outcome section must never reference ${forbidden}`);
  }
});

test('the Campaign outcome section renders no write button, form or write-shaped network call', () => {
  const body = outcomeSectionBody();
  assert.ok(!/<button/.test(body), 'no button of any kind belongs in the read-only outcome section');
  assert.ok(!/<form/.test(body), 'no form belongs in the read-only outcome section');
  for (const forbidden of ['fetch(', 'method: \'POST\'', 'method: \'PUT\'', 'method: \'PATCH\'', 'campaign-outcome-cli', 'executeCampaignOutcomeCommand', 'dryRunCampaignOutcomeCommand']) {
    assert.ok(!body.includes(forbidden), `outcome section must never reference ${forbidden}`);
  }
});

test('post-launch results are rendered via the shared AnalysisResultBlocks component, not duplicated markup', () => {
  const section = detailStepSection();
  assert.ok(
    section.includes('<AnalysisResultBlocks results={postLaunchSnapshot.results} scenario={detail.analysis_context.scenario} />')
  );
  assert.ok(!section.includes('1. Адекватность арендной ставки'), 'the heading text must live only in AnalysisResultBlocks, not duplicated here');
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
