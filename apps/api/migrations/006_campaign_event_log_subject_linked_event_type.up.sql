-- 006_campaign_event_log_subject_linked_event_type.up.sql
-- Extends the existing campaign_event_log constraints (002_campaign_event_log.up.sql)
-- to additionally allow the new, additive 'campaign.subject_linked.v1'
-- provenance-linking event appended by the atomic Campaign launch command
-- (apps/api/src/db/launchCampaign.ts, ADR-0008). Does not touch any
-- existing row or column, and does not weaken the original constraint for
-- 'campaign.status_recorded.v1' rows (still exactly {"status": <one of the
-- 11 approved values>}) -- 002 itself is never modified. See
-- 03_ARCHITECTURE/decisions/ADR-0008-technical-assignment-implementation.md.

ALTER TABLE leasemind_app.campaign_event_log
  DROP CONSTRAINT campaign_event_log_event_type_check;

ALTER TABLE leasemind_app.campaign_event_log
  ADD CONSTRAINT campaign_event_log_event_type_check
  CHECK (event_type IN ('campaign.status_recorded.v1', 'campaign.subject_linked.v1'));

ALTER TABLE leasemind_app.campaign_event_log
  DROP CONSTRAINT campaign_event_log_payload_check;
ALTER TABLE leasemind_app.campaign_event_log
  DROP CONSTRAINT campaign_event_log_payload_check1;
ALTER TABLE leasemind_app.campaign_event_log
  DROP CONSTRAINT campaign_event_log_payload_check2;

-- Exactly the original rule, now scoped to campaign.status_recorded.v1 rows.
ALTER TABLE leasemind_app.campaign_event_log
  ADD CONSTRAINT campaign_event_log_payload_status_shape_check
  CHECK (
    event_type <> 'campaign.status_recorded.v1'
    OR (
      payload = jsonb_build_object('status', payload->>'status')
      AND jsonb_typeof(payload->'status') = 'string'
      AND (payload->>'status') IN (
        'Created', 'Analyzing', 'Strategy Building', 'Searching', 'Qualifying',
        'Negotiating', 'Viewing', 'Deal Support', 'Completed', 'Paused', 'Failed'
      )
    )
  );

-- Exactly the 5 fields apps/api/src/db/launchCampaign.ts writes -- no other
-- key, and never a raw commercial fact, PII or the exact address.
ALTER TABLE leasemind_app.campaign_event_log
  ADD CONSTRAINT campaign_event_log_payload_subject_linked_shape_check
  CHECK (
    event_type <> 'campaign.subject_linked.v1'
    OR (
      payload = jsonb_build_object(
        'entity_type', payload->>'entity_type',
        'entity_id', payload->>'entity_id',
        'source_technical_assignment_id', payload->>'source_technical_assignment_id',
        'source_schema_version', payload->>'source_schema_version',
        'source_revision', (payload->'source_revision')
      )
      AND (payload->>'entity_type') IN ('Property', 'TenantRequest')
      AND (payload->>'entity_id') ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[47][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      AND (payload->>'source_technical_assignment_id') ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[47][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      AND (payload->>'source_schema_version') = '1.0'
      AND jsonb_typeof(payload->'source_revision') = 'number'
      AND (payload->'source_revision')::text ~ '^[1-9][0-9]*$'
    )
  );
