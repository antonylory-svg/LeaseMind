-- 010_evidence_dataset_revocation.down.sql
-- Reverts only migration 010.

REVOKE SELECT ON leasemind_app.analysis_snapshot_freshness_projection
  FROM lmapp_api_reader;

REVOKE INSERT (
  evidence_dataset_revision, evidence_revocation_reason_code, revoked_by_actor_ref
) ON leasemind_app.evidence_dataset_revocation
  FROM lmapp_evidence_revocation_writer;

REVOKE SELECT (evidence_dataset_revision)
  ON leasemind_app.evidence_dataset_revocation
  FROM lmapp_api_reader, lmapp_campaign_writer, lmapp_analysis_writer,
       lmapp_analysis_worker, lmapp_evidence_revocation_writer;

REVOKE USAGE ON SCHEMA leasemind_app FROM lmapp_evidence_revocation_writer;

DROP VIEW IF EXISTS leasemind_app.analysis_snapshot_freshness_projection;

DROP TRIGGER IF EXISTS evidence_dataset_revocation_reject_delete
  ON leasemind_app.evidence_dataset_revocation;
DROP TRIGGER IF EXISTS evidence_dataset_revocation_reject_update
  ON leasemind_app.evidence_dataset_revocation;
REVOKE EXECUTE ON FUNCTION leasemind_app.reject_evidence_dataset_revocation_mutation() FROM PUBLIC;
DROP FUNCTION IF EXISTS leasemind_app.reject_evidence_dataset_revocation_mutation();

DROP TABLE IF EXISTS leasemind_app.evidence_dataset_revocation;
