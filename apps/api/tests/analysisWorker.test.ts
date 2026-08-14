import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { computeInitialPostLaunchRefreshIdempotencyKey } from '../src/db/analysisSnapshot.js';

test('initial post-launch refresh key is deterministic and scoped to the full logical identity', () => {
  const identity = {
    campaignId: '11111111-1111-4111-8111-111111111111',
    propertyId: '22222222-2222-4222-8222-222222222222',
    tenantRequestId: null,
    technicalAssignmentId: '22222222-2222-4222-8222-222222222222',
    scenario: 'need_tenant' as const,
    sourceRevision: 3
  };
  const expected = createHash('sha256')
    .update(
      'LEASEMIND_ANALYSIS_POST_LAUNCH_REFRESH_INTENT_V1|11111111-1111-4111-8111-111111111111|22222222-2222-4222-8222-222222222222|3|post_launch_refresh'
    )
    .digest('hex');
  assert.equal(computeInitialPostLaunchRefreshIdempotencyKey(identity), expected);
  assert.notEqual(
    computeInitialPostLaunchRefreshIdempotencyKey({
      ...identity,
      campaignId: '33333333-3333-4333-8333-333333333333'
    }),
    expected
  );
});

test('analysis worker is a separate least-privilege entrypoint with safe lifecycle logging', async () => {
  const [rootPackageRaw, apiPackageRaw, workerSource] = await Promise.all([
    readFile(new URL('../../../package.json', import.meta.url), 'utf8'),
    readFile(new URL('../package.json', import.meta.url), 'utf8'),
    readFile(new URL('../src/analysis-worker.ts', import.meta.url), 'utf8')
  ]);
  const rootPackage = JSON.parse(rootPackageRaw);
  const apiPackage = JSON.parse(apiPackageRaw);
  assert.equal(rootPackage.scripts['dev:analysis-worker'], 'npm run dev:analysis-worker --workspace apps/api');
  assert.equal(apiPackage.scripts['dev:analysis-worker'], 'node --env-file-if-exists=.env --import tsx src/analysis-worker.ts');
  assert.match(workerSource, /enforceRuntimeSafetyGate\(\)/);
  assert.match(workerSource, /loadAnalysisWorkerDatabaseUrl\(\)/);
  assert.match(workerSource, /verifyRuntimeAnalysisWorkerPrivileges\(pool\)/);
  assert.doesNotMatch(workerSource, /loadAnalysisDatabaseUrl/);
  assert.doesNotMatch(workerSource, /console\.(?:error|log)\(error/);
  assert.doesNotMatch(workerSource, /JSON\.stringify\(error/);
});

test('post_launch_refresh_sla_breach is a distinct structured event with a stable code and no forbidden fields', async () => {
  const workerSource = await readFile(new URL('../src/analysis-worker.ts', import.meta.url), 'utf8');
  assert.match(workerSource, /event: 'post_launch_refresh_sla_breach'/);
  assert.match(workerSource, /safe_error_code: 'POST_LAUNCH_REFRESH_SLA_BREACH'/);
  assert.match(workerSource, /campaign_id: breach\.campaignId/);
  assert.match(workerSource, /analysis_snapshot_id: breach\.analysisSnapshotId/);
  // PRODUCT §14 forbids logging TA payload, rates, addresses, contacts and
  // raw exceptions -- the breach event object literal must carry only the
  // four safe fields asserted above, nothing else.
  const breachEventBlock = workerSource.match(/for \(const breach of result\.slaBreachEvents\) \{[\s\S]*?\n {6}\}/);
  assert.ok(breachEventBlock, 'expected a for-of loop emitting post_launch_refresh_sla_breach events');
  assert.doesNotMatch(breachEventBlock[0], /technicalAssignmentId|property|tenant_request|\brate\b|address|contact/i);
  assert.doesNotMatch(breachEventBlock[0], /console\.(?:error|log)\([^,)]*,\s*(?:error|err)\b/);
  assert.doesNotMatch(breachEventBlock[0], /JSON\.stringify\((?:error|err)\b/);
});
