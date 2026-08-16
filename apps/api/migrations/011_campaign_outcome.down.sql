-- 011_campaign_outcome.down.sql
-- Fail-closed reversal of 011_campaign_outcome.up.sql. See
-- 03_ARCHITECTURE/decisions/ADR-0010-campaign-outcome-implementation.md
-- section 11: unlike every prior migration's down script (008/009/010),
-- this one refuses to run at all if any accepted outcome data exists --
-- business outcome is an immutable product fact, not a regenerable
-- technical snapshot, so a full `migrate:down` must never silently destroy
-- accumulated outcome history, even in a synthetic-only environment.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM leasemind_app.campaign_outcome_event_log)
     OR EXISTS (SELECT 1 FROM leasemind_app.campaign_outcome_idempotency_mapping)
     OR EXISTS (SELECT 1 FROM leasemind_app.campaign_outcome_current_projection) THEN
    RAISE EXCEPTION 'CAMPAIGN_OUTCOME_DOWN_MIGRATION_BLOCKED: refusing to drop non-empty campaign outcome history';
  END IF;
END $$;

-- Only reached when all three tables are confirmed empty above.

REVOKE SELECT ON leasemind_app.campaign_outcome_public_projection FROM lmapp_api_reader;

REVOKE SELECT (campaign_id, current_outcome_record_id, updated_at)
  ON leasemind_app.campaign_outcome_current_projection FROM lmapp_maintainer;
REVOKE INSERT (campaign_id, current_outcome_record_id)
  ON leasemind_app.campaign_outcome_current_projection FROM lmapp_maintainer;
REVOKE UPDATE (current_outcome_record_id, updated_at)
  ON leasemind_app.campaign_outcome_current_projection FROM lmapp_maintainer;
REVOKE SELECT (
  outcome_record_id, campaign_id, outcome_sequence,
  outcome_code, mapped_lifecycle_status, resulting_campaign_aggregate_version
) ON leasemind_app.campaign_outcome_event_log FROM lmapp_maintainer;

REVOKE SELECT (campaign_id, current_outcome_record_id)
  ON leasemind_app.campaign_outcome_current_projection FROM lmapp_campaign_outcome_writer;
REVOKE INSERT (campaign_id, current_outcome_record_id)
  ON leasemind_app.campaign_outcome_current_projection FROM lmapp_campaign_outcome_writer;
REVOKE UPDATE (current_outcome_record_id, updated_at)
  ON leasemind_app.campaign_outcome_current_projection FROM lmapp_campaign_outcome_writer;
REVOKE SELECT (idempotency_key, command_hash, campaign_id, outcome_record_id)
  ON leasemind_app.campaign_outcome_idempotency_mapping FROM lmapp_campaign_outcome_writer;
REVOKE INSERT (idempotency_key, command_hash, campaign_id, outcome_record_id)
  ON leasemind_app.campaign_outcome_idempotency_mapping FROM lmapp_campaign_outcome_writer;
REVOKE SELECT (
  outcome_record_id, campaign_id, outcome_sequence, command_type,
  outcome_code, mapped_lifecycle_status, corrects_outcome_record_id,
  recorded_at, confirmation_method, resulting_campaign_aggregate_version
) ON leasemind_app.campaign_outcome_event_log FROM lmapp_campaign_outcome_writer;
REVOKE INSERT (
  outcome_record_id, campaign_id, outcome_sequence, command_type,
  outcome_code, mapped_lifecycle_status, confirmation_method, operator_ref,
  corrects_outcome_record_id, correction_reason_code, runtime_mode,
  resulting_campaign_aggregate_version
) ON leasemind_app.campaign_outcome_event_log FROM lmapp_campaign_outcome_writer;
REVOKE SELECT (campaign_id) ON leasemind_app.campaign_subject_link_projection FROM lmapp_campaign_outcome_writer;
REVOKE SELECT, INSERT, UPDATE ON leasemind_app.campaign_current_state_projection FROM lmapp_campaign_outcome_writer;
REVOKE SELECT, INSERT, UPDATE ON leasemind_app.campaign_stream_head FROM lmapp_campaign_outcome_writer;
REVOKE SELECT, INSERT ON leasemind_app.campaign_event_log FROM lmapp_campaign_outcome_writer;
REVOKE USAGE ON SCHEMA leasemind_app FROM lmapp_campaign_outcome_writer;

DROP VIEW leasemind_app.campaign_outcome_public_projection;

DROP TRIGGER campaign_outcome_idempotency_mapping_reject_truncate ON leasemind_app.campaign_outcome_idempotency_mapping;
DROP TRIGGER campaign_outcome_idempotency_mapping_reject_delete ON leasemind_app.campaign_outcome_idempotency_mapping;
DROP TRIGGER campaign_outcome_idempotency_mapping_reject_update ON leasemind_app.campaign_outcome_idempotency_mapping;
DROP FUNCTION leasemind_app.reject_campaign_outcome_idempotency_mapping_mutation();

DROP TABLE leasemind_app.campaign_outcome_idempotency_mapping;
DROP TABLE leasemind_app.campaign_outcome_current_projection;

DROP TRIGGER campaign_outcome_event_log_verify_resulting_event ON leasemind_app.campaign_outcome_event_log;
DROP FUNCTION leasemind_app.verify_campaign_outcome_resulting_event();
DROP TRIGGER campaign_outcome_event_log_reject_truncate ON leasemind_app.campaign_outcome_event_log;
DROP TRIGGER campaign_outcome_event_log_reject_delete ON leasemind_app.campaign_outcome_event_log;
DROP TRIGGER campaign_outcome_event_log_reject_update ON leasemind_app.campaign_outcome_event_log;
DROP FUNCTION leasemind_app.reject_campaign_outcome_event_log_mutation();

-- campaign_outcome_event_log_one_record_per_campaign (partial unique index)
-- and campaign_outcome_event_log_sequence_shape (CHECK) are part of this
-- table's own definition -- dropped automatically with it, no separate
-- DROP INDEX/ALTER TABLE ... DROP CONSTRAINT required.
DROP TABLE leasemind_app.campaign_outcome_event_log;
