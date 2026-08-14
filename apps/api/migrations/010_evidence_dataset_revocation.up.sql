-- 010_evidence_dataset_revocation.up.sql
-- Append-only evidence revocation and deterministic read-time freshness.

CREATE TABLE leasemind_app.evidence_dataset_revocation (
  evidence_dataset_revision char(64) PRIMARY KEY
    CHECK (evidence_dataset_revision ~ '^[0-9a-f]{64}$'),
  evidence_revocation_reason_code text NOT NULL
    CHECK (evidence_revocation_reason_code ~ '^[A-Z][A-Z0-9_]{2,63}$'),
  revoked_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  revoked_by_actor_ref text NOT NULL
    CHECK (length(revoked_by_actor_ref) > 0 AND length(revoked_by_actor_ref) <= 200)
);

REVOKE ALL ON leasemind_app.evidence_dataset_revocation FROM PUBLIC;

CREATE FUNCTION leasemind_app.reject_evidence_dataset_revocation_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'EVIDENCE_DATASET_REVOCATION_IMMUTABLE: % is not permitted on leasemind_app.evidence_dataset_revocation', TG_OP;
END;
$$;

REVOKE ALL ON FUNCTION leasemind_app.reject_evidence_dataset_revocation_mutation() FROM PUBLIC;

CREATE TRIGGER evidence_dataset_revocation_reject_update
  BEFORE UPDATE ON leasemind_app.evidence_dataset_revocation
  FOR EACH ROW EXECUTE FUNCTION leasemind_app.reject_evidence_dataset_revocation_mutation();

CREATE TRIGGER evidence_dataset_revocation_reject_delete
  BEFORE DELETE ON leasemind_app.evidence_dataset_revocation
  FOR EACH ROW EXECUTE FUNCTION leasemind_app.reject_evidence_dataset_revocation_mutation();

CREATE VIEW leasemind_app.analysis_snapshot_freshness_projection
WITH (security_invoker = true)
AS
SELECT
  s.analysis_snapshot_id,
  CASE
    WHEN revoked.evidence_dataset_revision IS NOT NULL THEN 'stale'
    WHEN s.analysis_kind = 'post_launch_refresh' AND link.campaign_id IS NULL THEN 'stale'
    WHEN current_ta.revision IS NULL THEN 'stale'
    WHEN s.source_revision <> current_ta.revision THEN 'stale'
    ELSE 'current'
  END AS freshness_status,
  CASE
    WHEN revoked.evidence_dataset_revision IS NOT NULL THEN 'evidence_revoked'
    WHEN s.analysis_kind = 'post_launch_refresh' AND link.campaign_id IS NULL THEN 'campaign_mismatch'
    WHEN current_ta.revision IS NULL THEN 'revision_changed'
    WHEN s.source_revision <> current_ta.revision THEN 'revision_changed'
    ELSE NULL
  END AS freshness_reason
FROM leasemind_app.analysis_snapshot s
LEFT JOIN leasemind_app.evidence_dataset_revocation revoked
  ON revoked.evidence_dataset_revision = s.evidence_dataset_revision
LEFT JOIN leasemind_app.campaign_subject_link_projection link
  ON s.analysis_kind = 'post_launch_refresh'
 AND link.campaign_id = s.campaign_id
 AND link.scenario = s.scenario
 AND link.technical_assignment_id = s.technical_assignment_id
 AND link.source_revision = s.source_revision
LEFT JOIN LATERAL (
  SELECT revision
  FROM leasemind_app.property
  WHERE s.scenario = 'need_tenant'
    AND property_id = s.technical_assignment_id
  UNION ALL
  SELECT revision
  FROM leasemind_app.tenant_request
  WHERE s.scenario = 'need_property'
    AND tenant_request_id = s.technical_assignment_id
) current_ta ON true;

REVOKE ALL ON leasemind_app.analysis_snapshot_freshness_projection FROM PUBLIC;

GRANT USAGE ON SCHEMA leasemind_app TO lmapp_evidence_revocation_writer;

GRANT SELECT (evidence_dataset_revision)
  ON leasemind_app.evidence_dataset_revocation
  TO lmapp_api_reader, lmapp_campaign_writer, lmapp_analysis_writer,
     lmapp_analysis_worker, lmapp_evidence_revocation_writer;

GRANT INSERT (
  evidence_dataset_revision, evidence_revocation_reason_code, revoked_by_actor_ref
) ON leasemind_app.evidence_dataset_revocation
  TO lmapp_evidence_revocation_writer;

GRANT SELECT ON leasemind_app.analysis_snapshot_freshness_projection
  TO lmapp_api_reader;
