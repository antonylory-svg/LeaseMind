-- 002_campaign_event_log.up.sql
-- Adds the canonical, immutable Campaign Event Log and the internal stream
-- head used only to atomically serialize appends per Campaign. From this
-- migration onward the Event Log is the technical source of truth for
-- Campaign state (LeaseMind_AI_MANAGER_ARCHITECTURE_v1.0.md section 5.1);
-- leasemind_app.campaign_current_state_projection (migration 001, unchanged)
-- remains a rebuildable derived read projection, never written to directly
-- except by the single internal append path (apps/api/src/db/campaignEvents.ts)
-- and the rebuild functions. See
-- 03_ARCHITECTURE/decisions/ADR-0002-campaign-event-stream.md.
--
-- Exactly one technical event type is defined: campaign.status_recorded.v1.
-- Its payload carries only the resulting status -- it does not define or
-- imply any new business status-transition rule; the approved 11 statuses
-- and their meaning remain defined solely by
-- LeaseMind_AI_MANAGER_ARCHITECTURE_v1.0.md section 5.3. No HTTP write API
-- is exposed for this table.

CREATE TABLE leasemind_app.campaign_event_log (
  event_id uuid PRIMARY KEY
    CHECK (event_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  campaign_id uuid NOT NULL
    CHECK (campaign_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[47][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  event_sequence bigint NOT NULL
    CHECK (event_sequence >= 1),
  event_type text NOT NULL
    CHECK (event_type = 'campaign.status_recorded.v1'),
  schema_version integer NOT NULL
    CHECK (schema_version = 1),
  payload jsonb NOT NULL
    CHECK (payload = jsonb_build_object('status', payload->>'status'))
    CHECK (jsonb_typeof(payload->'status') = 'string')
    CHECK ((payload->>'status') IN (
      'Created', 'Analyzing', 'Strategy Building', 'Searching', 'Qualifying',
      'Negotiating', 'Viewing', 'Deal Support', 'Completed', 'Paused', 'Failed'
    )),
  idempotency_key text NOT NULL
    CHECK (length(idempotency_key) > 0),
  command_hash char(64) NOT NULL
    CHECK (command_hash ~ '^[0-9a-f]{64}$'),
  previous_event_hash char(64) NOT NULL
    CHECK (previous_event_hash ~ '^[0-9a-f]{64}$'),
  event_hash char(64) NOT NULL
    CHECK (event_hash ~ '^[0-9a-f]{64}$'),
  occurred_at timestamptz NOT NULL,
  CONSTRAINT campaign_event_log_sequence_unique UNIQUE (campaign_id, event_sequence),
  CONSTRAINT campaign_event_log_idempotency_unique UNIQUE (campaign_id, idempotency_key)
);

COMMENT ON TABLE leasemind_app.campaign_event_log IS
  'Immutable, append-only Campaign Event Log -- the canonical technical source of Campaign state (LeaseMind_AI_MANAGER_ARCHITECTURE_v1.0.md section 5.1). UPDATE/DELETE are unconditionally rejected by trigger. Rows are created only via the single internal append path, never via a write HTTP endpoint.';
COMMENT ON COLUMN leasemind_app.campaign_event_log.event_id IS
  'Server-generated UUID v4. Never supplied by a caller.';
COMMENT ON COLUMN leasemind_app.campaign_event_log.campaign_id IS
  'Campaign identity, UUID v4 or v7 only, matching the Current State Projection key.';
COMMENT ON COLUMN leasemind_app.campaign_event_log.event_sequence IS
  'Server-assigned, strictly increasing per campaign_id starting at 1. Never supplied by a caller.';
COMMENT ON COLUMN leasemind_app.campaign_event_log.event_type IS
  'The single approved technical event type. Does not define or imply any new business status-transition rule.';
COMMENT ON COLUMN leasemind_app.campaign_event_log.payload IS
  'Exactly one key, "status", holding one of the 11 approved Campaign statuses as a plain string. No other keys or nested data permitted.';
COMMENT ON COLUMN leasemind_app.campaign_event_log.idempotency_key IS
  'Caller-supplied idempotency identifier, unique per campaign_id. Replaying the same key with the same command returns the original event.';
COMMENT ON COLUMN leasemind_app.campaign_event_log.command_hash IS
  'Server-computed SHA-256 (lowercase hex) over the requested command (campaign_id + status), used to detect same-key/different-command conflicts.';
COMMENT ON COLUMN leasemind_app.campaign_event_log.previous_event_hash IS
  'SHA-256 (lowercase hex) of the preceding event in this campaign''s stream, or 64 zero characters for the first event. Forms the hash chain.';
COMMENT ON COLUMN leasemind_app.campaign_event_log.event_hash IS
  'Server-computed, domain-separated (LEASEMIND_CAMPAIGN_EVENT_V1) SHA-256 (lowercase hex) over this event''s own fields plus previous_event_hash.';
COMMENT ON COLUMN leasemind_app.campaign_event_log.occurred_at IS
  'Server-owned timestamp (database clock_timestamp()), fetched exactly once per append. Never derived from client input.';

CREATE TABLE leasemind_app.campaign_stream_head (
  campaign_id uuid PRIMARY KEY
    CHECK (campaign_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[47][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  current_sequence bigint NOT NULL
    CHECK (current_sequence >= 0),
  current_event_hash char(64) NOT NULL
    CHECK (current_event_hash ~ '^[0-9a-f]{64}$'),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

COMMENT ON TABLE leasemind_app.campaign_stream_head IS
  'Internal append-serialization cursor for one Campaign stream (current sequence and head hash). Locked via SELECT ... FOR UPDATE to atomically serialize concurrent appends. Not a business source of truth.';
COMMENT ON COLUMN leasemind_app.campaign_stream_head.current_sequence IS
  '0 means no event has been appended yet for this campaign_id.';
COMMENT ON COLUMN leasemind_app.campaign_stream_head.current_event_hash IS
  '64 zero characters (genesis) until the first event is appended; thereafter the event_hash of the most recently appended event.';

CREATE FUNCTION leasemind_app.reject_campaign_event_log_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'CAMPAIGN_EVENT_LOG_IMMUTABLE: % is not permitted on leasemind_app.campaign_event_log', TG_OP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION leasemind_app.reject_campaign_event_log_mutation() IS
  'Unconditionally rejects UPDATE/DELETE on campaign_event_log, enforcing append-only immutability regardless of the calling role.';

CREATE TRIGGER campaign_event_log_reject_update
  BEFORE UPDATE ON leasemind_app.campaign_event_log
  FOR EACH ROW EXECUTE FUNCTION leasemind_app.reject_campaign_event_log_mutation();

CREATE TRIGGER campaign_event_log_reject_delete
  BEFORE DELETE ON leasemind_app.campaign_event_log
  FOR EACH ROW EXECUTE FUNCTION leasemind_app.reject_campaign_event_log_mutation();
