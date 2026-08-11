import { test } from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { migrateUp } from '../src/db/migrate.js';
import {
  verifyRuntimeDatabasePrivileges,
  verifyRuntimeCommandPrivileges,
  verifyRuntimeTechnicalAssignmentPrivileges,
  verifyRuntimeAnalysisPrivileges,
  verifyRuntimeAnalysisWorkerPrivileges,
  verifyRuntimeEvidenceRevocationPrivileges
} from '../src/dbPrivilegePolicy.js';
import {
  MIGRATION_DATABASE_URL,
  API_DATABASE_URL,
  COMMAND_DATABASE_URL,
  TA_DATABASE_URL,
  ANALYSIS_DATABASE_URL,
  ANALYSIS_WORKER_DATABASE_URL,
  EVIDENCE_REVOCATION_DATABASE_URL,
  BOOTSTRAP_DATABASE_URL,
  hasAnalysisDatabase
} from './testDatabaseUrls.js';

function pool(connectionString: string | undefined, max = 1): pg.Pool {
  return new pg.Pool({ connectionString, max });
}

test('migrations 008-010 apply and all six runtime database gates pass', { skip: !hasAnalysisDatabase }, async () => {
  const migrationPool = pool(MIGRATION_DATABASE_URL, 2);
  try {
    const result = await migrateUp(migrationPool);
    assert.ok(
      result.applied.includes('010_evidence_dataset_revocation.up.sql')
        || result.skipped.includes('010_evidence_dataset_revocation.up.sql')
    );
  } finally {
    await migrationPool.end();
  }

  const profiles: Array<[string | undefined, (value: pg.Pool) => Promise<void>]> = [
    [API_DATABASE_URL, verifyRuntimeDatabasePrivileges],
    [COMMAND_DATABASE_URL, verifyRuntimeCommandPrivileges],
    [TA_DATABASE_URL, verifyRuntimeTechnicalAssignmentPrivileges],
    [ANALYSIS_DATABASE_URL, verifyRuntimeAnalysisPrivileges],
    [ANALYSIS_WORKER_DATABASE_URL, verifyRuntimeAnalysisWorkerPrivileges],
    [EVIDENCE_REVOCATION_DATABASE_URL, verifyRuntimeEvidenceRevocationPrivileges]
  ];

  for (const [connectionString, verify] of profiles) {
    const rolePool = pool(connectionString);
    try {
      await assert.doesNotReject(verify(rolePool));
    } finally {
      await rolePool.end();
    }
  }
});

test('ADR-0009 owner, generated columns and security-invoker view match the catalog contract', { skip: !hasAnalysisDatabase }, async () => {
  const bootstrapPool = pool(BOOTSTRAP_DATABASE_URL);
  try {
    const owner = await bootstrapPool.query(`
      SELECT
        r.rolcanlogin,
        r.rolinherit,
        r.rolsuper,
        r.rolcreatedb,
        r.rolcreaterole,
        r.rolreplication,
        r.rolbypassrls,
        count(o.*)::int AS object_count
      FROM pg_roles r
      LEFT JOIN (
        SELECT c.relowner AS owner
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'leasemind_app'
          AND c.relname = 'post_launch_refresh_intent'
        UNION ALL
        SELECT p.proowner AS owner
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'leasemind_app'
          AND p.proname = ANY(ARRAY[
            'enforce_post_launch_refresh_intent_transition',
            'claim_post_launch_refresh_intent',
            'renew_post_launch_refresh_intent_lease',
            'complete_post_launch_refresh_intent',
            'fail_post_launch_refresh_intent',
            'request_post_launch_refresh_retry',
            'mark_post_launch_refresh_intent_sla_breach'
          ])
      ) o ON o.owner = r.oid
      WHERE r.rolname = 'lmapp_post_launch_refresh_owner'
      GROUP BY r.rolcanlogin, r.rolinherit, r.rolsuper, r.rolcreatedb,
               r.rolcreaterole, r.rolreplication, r.rolbypassrls
    `);
    assert.deepEqual(owner.rows[0], {
      rolcanlogin: false,
      rolinherit: false,
      rolsuper: false,
      rolcreatedb: false,
      rolcreaterole: false,
      rolreplication: false,
      rolbypassrls: false,
      object_count: 8
    });

    const membership = await bootstrapPool.query(`
      SELECT member.rolname AS member_name, m.admin_option, m.inherit_option, m.set_option
      FROM pg_auth_members m
      JOIN pg_roles granted ON granted.oid = m.roleid
      JOIN pg_roles member ON member.oid = m.member
      WHERE granted.rolname = 'lmapp_post_launch_refresh_owner'
    `);
    assert.deepEqual(membership.rows, [{
      member_name: 'lmapp_migrator',
      admin_option: false,
      inherit_option: false,
      set_option: true
    }]);

    const generated = await bootstrapPool.query(`
      SELECT c.relname, a.attname, a.attgenerated
      FROM pg_attribute a
      JOIN pg_class c ON c.oid = a.attrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'leasemind_app'
        AND (c.relname, a.attname) IN (
          ('campaign_subject_link_projection', 'technical_assignment_id'),
          ('analysis_snapshot', 'technical_assignment_id'),
          ('post_launch_refresh_intent', 'technical_assignment_id'),
          ('post_launch_refresh_intent', 'sla_deadline_at')
        )
      ORDER BY c.relname, a.attname
    `);
    assert.equal(generated.rows.length, 4);
    assert.ok(generated.rows.every(row => row.attgenerated === 's'));

    const view = await bootstrapPool.query(`
      SELECT c.reloptions
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'leasemind_app'
        AND c.relname = 'analysis_snapshot_freshness_projection'
    `);
    assert.ok(view.rows[0].reloptions.includes('security_invoker=true'));
  } finally {
    await bootstrapPool.end();
  }
});

test('snapshot immutability, explicit retry, fencing, SLA and evidence revocation work end to end', { skip: !hasAnalysisDatabase }, async () => {
  const migrationPool = pool(MIGRATION_DATABASE_URL);
  const taPool = pool(TA_DATABASE_URL);
  const campaignPool = pool(COMMAND_DATABASE_URL);
  const analysisPool = pool(ANALYSIS_DATABASE_URL);
  const workerPool = pool(ANALYSIS_WORKER_DATABASE_URL);
  const evidencePool = pool(EVIDENCE_REVOCATION_DATABASE_URL);
  const apiPool = pool(API_DATABASE_URL);

  const propertyId = '11111111-1111-4111-8111-111111111111';
  const preSnapshotId = '22222222-2222-4222-8222-222222222222';
  const campaignId = '33333333-3333-4333-8333-333333333333';
  const failedSnapshotId = '44444444-4444-4444-8444-444444444444';
  const retrySnapshotId = '55555555-5555-4555-8555-555555555555';
  const evidenceRevision = 'a'.repeat(64);
  const inputFingerprint = 'b'.repeat(64);
  const metric = (assessed: boolean) => ({
    metric_status: assessed ? 'assessed' : 'insufficient_data',
    confidence: assessed ? 'medium' : null,
    value: assessed ? { synthetic_value: 1 } : null,
    sample_size: assessed ? 5 : 0,
    evidence: { method: 'synthetic_test', filters_applied: [], dataset_revision: evidenceRevision },
    reason_codes: assessed ? [] : ['CALIBRATED_OUTCOME_HISTORY_REQUIRED'],
    assumptions: []
  });
  const results = {
    price_adequacy: metric(true),
    competition: metric(true),
    deal_probability_30d: metric(false),
    candidate_categories: metric(true)
  };

  try {
    await taPool.query(`
      INSERT INTO leasemind_app.property (
        property_id, idempotency_key, lifecycle_status, property_country_code,
        property_region, property_city, property_area_sqm, property_monthly_rent_rub
      ) VALUES ($1, 'analysis-foundation-property', 'ready_for_analysis', 'RU',
        'synthetic-region', 'synthetic-city', 100, 100000)
    `, [propertyId]);

    await analysisPool.query(`
      INSERT INTO leasemind_app.analysis_snapshot (
        analysis_snapshot_id, property_id, source_revision, scenario, analysis_kind,
        calculation_attempt, status, schema_version, method_version,
        country_code, currency, locale, area_unit, rent_period, input_fingerprint
      ) VALUES ($1, $2, 1, 'need_tenant', 'pre_launch', 1, 'pending', '1.0',
        'synthetic_ru_v1', 'RU', 'RUB', 'ru-RU', 'sqm', 'month', $3)
    `, [preSnapshotId, propertyId, inputFingerprint]);
    await analysisPool.query(`
      UPDATE leasemind_app.analysis_snapshot
      SET status = 'completed', generated_at = clock_timestamp(), results = $2,
          evidence_as_of = clock_timestamp(), evidence_dataset_revision = $3
      WHERE analysis_snapshot_id = $1
    `, [preSnapshotId, results, evidenceRevision]);
    await analysisPool.query(`
      INSERT INTO leasemind_app.analysis_snapshot_idempotency_mapping
        (idempotency_key, command_hash, analysis_snapshot_id, retry_of_analysis_snapshot_id)
      VALUES ('analysis-foundation-pre', $2, $1, NULL)
    `, [preSnapshotId, 'c'.repeat(64)]);
    await assert.rejects(
      analysisPool.query(`UPDATE leasemind_app.analysis_snapshot_idempotency_mapping SET command_hash = $1`, ['d'.repeat(64)]),
      /permission denied/
    );
    await assert.rejects(
      migrationPool.query(`UPDATE leasemind_app.analysis_snapshot_idempotency_mapping SET command_hash = $1`, ['d'.repeat(64)]),
      /IMMUTABLE/
    );
    await assert.rejects(
      analysisPool.query(`UPDATE leasemind_app.analysis_snapshot SET generated_at = clock_timestamp() WHERE analysis_snapshot_id = $1`, [preSnapshotId]),
      /IMMUTABLE/
    );

    await migrationPool.query(`
      INSERT INTO leasemind_app.campaign_current_state_projection (campaign_id, status)
      VALUES ($1, 'Analyzing')
    `, [campaignId]);
    await campaignPool.query(`
      INSERT INTO leasemind_app.campaign_subject_link_projection (
        campaign_id, scenario, property_id, source_revision, source_schema_version,
        linked_at, authorization_contract_version, analysis_snapshot_id,
        authorized_analysis_kind, authorized_analysis_status
      ) VALUES ($1, 'need_tenant', $2, 1, '1.0', clock_timestamp(),
        'analysis_v2', $3, 'pre_launch', 'completed')
    `, [campaignId, propertyId, preSnapshotId]);
    await campaignPool.query(`
      INSERT INTO leasemind_app.post_launch_refresh_intent (
        campaign_id, property_id, scenario, source_revision, analysis_kind, status, launched_at
      ) VALUES ($1, $2, 'need_tenant', 1, 'post_launch_refresh', 'pending',
        clock_timestamp() - interval '20 minutes')
    `, [campaignId, propertyId]);

    const firstClaim = await workerPool.query(
      `SELECT * FROM leasemind_app.claim_post_launch_refresh_intent('worker-a', 1)`
    );
    assert.equal(firstClaim.rows[0].execution_claim_count, 1);
    assert.equal(firstClaim.rows[0].current_analysis_snapshot_id, null);

    await workerPool.query(`
      INSERT INTO leasemind_app.analysis_snapshot (
        analysis_snapshot_id, property_id, source_revision, scenario, analysis_kind,
        campaign_id, calculation_attempt, status, schema_version, method_version,
        country_code, currency, locale, area_unit, rent_period, input_fingerprint
      ) VALUES ($1, $2, 1, 'need_tenant', 'post_launch_refresh', $3, 1, 'pending',
        '1.0', 'synthetic_ru_v1', 'RU', 'RUB', 'ru-RU', 'sqm', 'month', $4)
    `, [failedSnapshotId, propertyId, campaignId, inputFingerprint]);
    await workerPool.query(`
      INSERT INTO leasemind_app.analysis_snapshot_idempotency_mapping
        (idempotency_key, command_hash, analysis_snapshot_id, retry_of_analysis_snapshot_id)
      VALUES ('analysis-foundation-post-initial', $2, $1, NULL)
    `, [failedSnapshotId, 'd'.repeat(64)]);
    await workerPool.query(`
      UPDATE leasemind_app.analysis_snapshot
      SET status = 'failed', generated_at = clock_timestamp(),
          failure = '{"code":"ANALYSIS_GENERATION_FAILED","retryable":true}'::jsonb
      WHERE analysis_snapshot_id = $1
    `, [failedSnapshotId]);
    await workerPool.query(
      `SELECT leasemind_app.fail_post_launch_refresh_intent($1, 'worker-a', 1, $2)`,
      [campaignId, failedSnapshotId]
    );

    await analysisPool.query(`
      INSERT INTO leasemind_app.analysis_snapshot (
        analysis_snapshot_id, property_id, source_revision, scenario, analysis_kind,
        campaign_id, calculation_attempt, status, schema_version, method_version,
        country_code, currency, locale, area_unit, rent_period, input_fingerprint
      ) VALUES ($1, $2, 1, 'need_tenant', 'post_launch_refresh', $3, 2, 'pending',
        '1.0', 'synthetic_ru_v1', 'RU', 'RUB', 'ru-RU', 'sqm', 'month', $4)
    `, [retrySnapshotId, propertyId, campaignId, inputFingerprint]);
    await analysisPool.query(`
      INSERT INTO leasemind_app.analysis_snapshot_idempotency_mapping
        (idempotency_key, command_hash, analysis_snapshot_id, retry_of_analysis_snapshot_id)
      VALUES ('analysis-foundation-post-retry', $3, $1, $2)
    `, [retrySnapshotId, failedSnapshotId, 'e'.repeat(64)]);
    await analysisPool.query(
      `SELECT leasemind_app.request_post_launch_refresh_retry($1, $2)`,
      [campaignId, retrySnapshotId]
    );

    const retryClaim = await workerPool.query(
      `SELECT * FROM leasemind_app.claim_post_launch_refresh_intent('worker-b', 1)`
    );
    assert.equal(retryClaim.rows[0].execution_claim_count, 2);
    assert.equal(retryClaim.rows[0].current_analysis_snapshot_id, retrySnapshotId);
    await workerPool.query(`
      UPDATE leasemind_app.analysis_snapshot
      SET status = 'completed', generated_at = clock_timestamp(), results = $2,
          evidence_as_of = clock_timestamp(), evidence_dataset_revision = $3
      WHERE analysis_snapshot_id = $1
    `, [retrySnapshotId, results, evidenceRevision]);
    await workerPool.query(
      `SELECT leasemind_app.complete_post_launch_refresh_intent($1, 'worker-b', 2, $2)`,
      [campaignId, retrySnapshotId]
    );
    await assert.rejects(
      workerPool.query(`SELECT leasemind_app.complete_post_launch_refresh_intent($1, 'worker-a', 1, $2)`, [campaignId, failedSnapshotId]),
      /FENCING_STALE/
    );

    const firstSla = await workerPool.query<{ marked: boolean }>(
      `SELECT leasemind_app.mark_post_launch_refresh_intent_sla_breach($1) AS marked`, [campaignId]
    );
    const secondSla = await workerPool.query<{ marked: boolean }>(
      `SELECT leasemind_app.mark_post_launch_refresh_intent_sla_breach($1) AS marked`, [campaignId]
    );
    assert.equal(firstSla.rows[0].marked, true);
    assert.equal(secondSla.rows[0].marked, false);

    await taPool.query(
      `UPDATE leasemind_app.property SET revision = 2, updated_at = clock_timestamp() WHERE property_id = $1`,
      [propertyId]
    );
    await evidencePool.query(`
      INSERT INTO leasemind_app.evidence_dataset_revocation (
        evidence_dataset_revision, evidence_revocation_reason_code, revoked_by_actor_ref
      ) VALUES ($1, 'SOURCE_WITHDRAWN', 'synthetic-operator')
    `, [evidenceRevision]);
    const freshness = await apiPool.query(`
      SELECT freshness_status, freshness_reason
      FROM leasemind_app.analysis_snapshot_freshness_projection
      WHERE analysis_snapshot_id = $1
    `, [retrySnapshotId]);
    assert.deepEqual(freshness.rows[0], {
      freshness_status: 'stale',
      freshness_reason: 'evidence_revoked'
    });
    await assert.rejects(
      evidencePool.query(`UPDATE leasemind_app.evidence_dataset_revocation SET revoked_by_actor_ref = 'changed'`),
      /permission denied/
    );
  } finally {
    await Promise.all([
      migrationPool.end(), taPool.end(), campaignPool.end(), analysisPool.end(),
      workerPool.end(), evidencePool.end(), apiPool.end()
    ]);
  }
});
