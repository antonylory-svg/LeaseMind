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
    readFile('package.json', 'utf8'),
    readFile('apps/api/package.json', 'utf8'),
    readFile('apps/api/src/analysis-worker.ts', 'utf8')
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
