-- 006_campaign_event_log_subject_linked_event_type.down.sql
-- Reverts to the original constraints from 002_campaign_event_log.up.sql.
-- Fails if any row already uses 'campaign.subject_linked.v1' -- by design:
-- a down migration must not silently discard data it cannot represent.

ALTER TABLE leasemind_app.campaign_event_log
  DROP CONSTRAINT campaign_event_log_payload_subject_linked_shape_check;
ALTER TABLE leasemind_app.campaign_event_log
  DROP CONSTRAINT campaign_event_log_payload_status_shape_check;

ALTER TABLE leasemind_app.campaign_event_log
  ADD CONSTRAINT campaign_event_log_payload_check
  CHECK (payload = jsonb_build_object('status', payload->>'status'));
ALTER TABLE leasemind_app.campaign_event_log
  ADD CONSTRAINT campaign_event_log_payload_check1
  CHECK (jsonb_typeof(payload->'status') = 'string');
ALTER TABLE leasemind_app.campaign_event_log
  ADD CONSTRAINT campaign_event_log_payload_check2
  CHECK ((payload->>'status') IN (
    'Created', 'Analyzing', 'Strategy Building', 'Searching', 'Qualifying',
    'Negotiating', 'Viewing', 'Deal Support', 'Completed', 'Paused', 'Failed'
  ));

ALTER TABLE leasemind_app.campaign_event_log
  DROP CONSTRAINT campaign_event_log_event_type_check;

ALTER TABLE leasemind_app.campaign_event_log
  ADD CONSTRAINT campaign_event_log_event_type_check
  CHECK (event_type = 'campaign.status_recorded.v1');
