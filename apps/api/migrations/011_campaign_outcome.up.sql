-- 011_campaign_outcome.up.sql
-- Database foundation for Campaign Outcome (Sprint 6, synthetic-only). See
-- 02_PRODUCT/CAMPAIGN_OUTCOMES.md v0.2 and
-- 03_ARCHITECTURE/decisions/ADR-0010-campaign-outcome-implementation.md.
--
-- Strictly additive: campaign_event_log, campaign_stream_head,
-- campaign_current_state_projection and campaign_subject_link_projection
-- (migrations 002/008) are not altered. No new event_type or payload shape
-- is added to campaign_event_log -- an outcome command instead appends a
-- completely ordinary campaign.status_recorded.v1 event through the
-- existing append path (a future, separate technical block; not created by
-- this migration).
--
-- This migration creates database objects and grants only. It does not
-- create the outcome-recording CLI, any TypeScript command/transaction
-- flow, or any HTTP/UI surface (ADR-0010 §1, explicitly out of scope for
-- this block).

-- ---------------------------------------------------------------------------
-- 1. campaign_outcome_event_log -- canonical immutable append-only history.
-- ---------------------------------------------------------------------------

CREATE TABLE leasemind_app.campaign_outcome_event_log (
  outcome_record_id uuid PRIMARY KEY
    CHECK (outcome_record_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),

  campaign_id uuid NOT NULL
    CHECK (campaign_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[47][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  outcome_sequence bigint NOT NULL
    CHECK (outcome_sequence >= 1),

  command_type text NOT NULL
    CHECK (command_type IN ('record', 'correct')),

  outcome_code text NOT NULL
    CHECK (outcome_code IN (
      'success_via_leasemind', 'success_independently', 'success_via_broker',
      'cancelled', 'expired'
    )),
  mapped_lifecycle_status text NOT NULL
    CHECK (mapped_lifecycle_status IN ('Completed', 'Failed')),
  -- Deterministic PRODUCT mapping (CAMPAIGN_OUTCOMES.md раздел 5) enforced
  -- at the database level, not only trusted from application code.
  CONSTRAINT campaign_outcome_event_log_mapping_valid CHECK (
    (outcome_code IN ('success_via_leasemind', 'success_independently', 'success_via_broker')
      AND mapped_lifecycle_status = 'Completed')
    OR (outcome_code IN ('cancelled', 'expired')
      AND mapped_lifecycle_status = 'Failed')
  ),

  confirmation_method text NOT NULL
    CHECK (confirmation_method = 'user_attestation'),
  -- Closed, opaque, non-PII format for Sprint 6 -- structurally cannot hold
  -- a name/email/phone/free text.
  operator_ref text NOT NULL
    CHECK (operator_ref ~ '^pilot-admin:[0-9a-f]{8}-[0-9a-f]{4}-[47][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),

  corrects_outcome_record_id uuid NULL,
  correction_reason_code text NULL
    CHECK (correction_reason_code = 'OUTCOME_CLASSIFICATION_CORRECTED'),
  -- Fail-closed differentiation between a primary record and a correction:
  -- a 'record' row can never carry correction fields and a 'correct' row
  -- can never omit them.
  CONSTRAINT campaign_outcome_event_log_correction_shape CHECK (
    (command_type = 'record' AND corrects_outcome_record_id IS NULL AND correction_reason_code IS NULL)
    OR (command_type = 'correct' AND corrects_outcome_record_id IS NOT NULL AND correction_reason_code = 'OUTCOME_CLASSIFICATION_CORRECTED')
  ),
  CONSTRAINT campaign_outcome_event_log_correction_not_self CHECK (
    corrects_outcome_record_id IS NULL OR corrects_outcome_record_id <> outcome_record_id
  ),

  -- Sprint 6 synthetic-only: this CHECK, not just application logic,
  -- refuses any 'real' value. Permitting 'real' requires a future
  -- migration + ADR revision.
  runtime_mode text NOT NULL
    CHECK (runtime_mode = 'synthetic'),

  recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),

  -- The resulting Campaign aggregate version. No independently-checkable
  -- event_id column: the canonical identity of "which lifecycle event this
  -- outcome produced" is the composite (campaign_id,
  -- resulting_campaign_aggregate_version) below, resolved through
  -- campaign_event_log's own existing UNIQUE(campaign_id, event_sequence).
  resulting_campaign_aggregate_version bigint NOT NULL
    CHECK (resulting_campaign_aggregate_version >= 1),

  -- Identity tuple: an outcome record is addressable by (campaign_id,
  -- outcome_record_id) as a unit, so correction/mapping FKs below can pin
  -- both columns together -- a correction can never reference another
  -- Campaign's outcome_record_id even if the UUID were somehow guessed.
  CONSTRAINT campaign_outcome_event_log_identity_unique UNIQUE (campaign_id, outcome_record_id),
  CONSTRAINT campaign_outcome_event_log_sequence_unique UNIQUE (campaign_id, outcome_sequence),

  -- Row-content mirror of the two DB-level invariants below (shape CHECK +
  -- partial unique index): a 'record' row is always the first (sequence 1)
  -- of its Campaign; a 'correct' row is always sequence 2 or later.
  CONSTRAINT campaign_outcome_event_log_sequence_shape CHECK (
    (command_type = 'record' AND outcome_sequence = 1)
    OR (command_type = 'correct' AND outcome_sequence >= 2)
  ),

  -- Composite self-FK: a correction can only ever reference an outcome
  -- record of the SAME campaign_id. MATCH SIMPLE (default) means this FK is
  -- trivially satisfied when corrects_outcome_record_id IS NULL (plain
  -- 'record' rows).
  CONSTRAINT campaign_outcome_event_log_correction_fk
    FOREIGN KEY (campaign_id, corrects_outcome_record_id)
    REFERENCES leasemind_app.campaign_outcome_event_log (campaign_id, outcome_record_id),

  -- Composite FK into the existing Campaign Event Log: ties this row to
  -- exactly the (campaign_id, event_sequence) pair it claims, using the
  -- already-existing UNIQUE(campaign_id, event_sequence) (migration 002) --
  -- physically impossible to reference another Campaign's lifecycle event.
  CONSTRAINT campaign_outcome_event_log_resulting_event_fk
    FOREIGN KEY (campaign_id, resulting_campaign_aggregate_version)
    REFERENCES leasemind_app.campaign_event_log (campaign_id, event_sequence)
);

COMMENT ON TABLE leasemind_app.campaign_outcome_event_log IS
  'Canonical immutable append-only history of business outcome (record/correct). No is_current or other mutable flag -- see campaign_outcome_current_projection for the effective-outcome pointer.';

-- Exactly one command_type='record' row per Campaign, enforced at the
-- database level, not only application-logic: any attempt at a second
-- primary record (even from a role with only a plain INSERT grant) is
-- rejected before the insert-verification trigger even runs.
CREATE UNIQUE INDEX campaign_outcome_event_log_one_record_per_campaign
  ON leasemind_app.campaign_outcome_event_log (campaign_id)
  WHERE command_type = 'record';

CREATE INDEX campaign_outcome_event_log_campaign_id_idx
  ON leasemind_app.campaign_outcome_event_log (campaign_id);

-- ---------------------------------------------------------------------------
-- Insert-verification trigger: does not replace application checks, guards
-- the history against a directly malformed INSERT by any role holding the
-- allowed INSERT grant.
-- ---------------------------------------------------------------------------

CREATE FUNCTION leasemind_app.verify_campaign_outcome_resulting_event() RETURNS trigger AS $$
DECLARE
  linked_event_type text;
  linked_status text;
  current_pointer_id uuid;
  corrected_sequence bigint;
  corrected_outcome_code text;
BEGIN
  -- (1) Resulting lifecycle-event identity/status: the composite FK above
  -- guarantees a matching (campaign_id, event_sequence) row exists; this
  -- checks its *content*.
  SELECT event_type, payload->>'status'
    INTO linked_event_type, linked_status
    FROM leasemind_app.campaign_event_log
   WHERE campaign_id = NEW.campaign_id
     AND event_sequence = NEW.resulting_campaign_aggregate_version;

  IF linked_event_type IS DISTINCT FROM 'campaign.status_recorded.v1' THEN
    RAISE EXCEPTION 'CAMPAIGN_OUTCOME_STATE_INCONSISTENT: resulting event is not campaign.status_recorded.v1';
  END IF;
  IF linked_status IS DISTINCT FROM NEW.mapped_lifecycle_status THEN
    RAISE EXCEPTION 'CAMPAIGN_OUTCOME_STATE_INCONSISTENT: resulting event status does not match mapped_lifecycle_status';
  END IF;

  IF NEW.command_type = 'record' THEN
    -- (2) No outcome history may exist yet for this Campaign -- row-content
    -- mirror of campaign_outcome_event_log_one_record_per_campaign.
    IF EXISTS (
      SELECT 1 FROM leasemind_app.campaign_outcome_event_log
       WHERE campaign_id = NEW.campaign_id
    ) THEN
      RAISE EXCEPTION 'CAMPAIGN_OUTCOME_STATE_INCONSISTENT: record inserted for a Campaign that already has outcome history';
    END IF;
  ELSE -- 'correct'
    -- (3) Must reference the CURRENT effective outcome, read at this exact
    -- moment -- the projection UPDATE (a future technical block) has not
    -- run yet when this trigger fires.
    SELECT current_outcome_record_id INTO current_pointer_id
      FROM leasemind_app.campaign_outcome_current_projection
     WHERE campaign_id = NEW.campaign_id;

    IF current_pointer_id IS DISTINCT FROM NEW.corrects_outcome_record_id THEN
      RAISE EXCEPTION 'CAMPAIGN_OUTCOME_STATE_INCONSISTENT: correction does not reference the current effective outcome';
    END IF;

    SELECT outcome_sequence, outcome_code INTO corrected_sequence, corrected_outcome_code
      FROM leasemind_app.campaign_outcome_event_log
     WHERE campaign_id = NEW.campaign_id
       AND outcome_record_id = NEW.corrects_outcome_record_id;

    -- (4) Sequence continuity: no gaps, no reordering.
    IF corrected_sequence IS DISTINCT FROM NEW.outcome_sequence - 1 THEN
      RAISE EXCEPTION 'CAMPAIGN_OUTCOME_STATE_INCONSISTENT: correction sequence is not contiguous with the corrected record';
    END IF;
    -- (5) outcome_code must actually change.
    IF corrected_outcome_code IS NOT DISTINCT FROM NEW.outcome_code THEN
      RAISE EXCEPTION 'CAMPAIGN_OUTCOME_STATE_INCONSISTENT: correction outcome_code matches the corrected record';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION leasemind_app.verify_campaign_outcome_resulting_event() IS
  'BEFORE INSERT guard on campaign_outcome_event_log: verifies the resulting lifecycle event content, record-uniqueness for command_type=record, and correction-chain continuity/target/outcome_code-change for command_type=correct. SECURITY INVOKER (default) -- runs with the inserting role''s own privileges.';

REVOKE EXECUTE ON FUNCTION leasemind_app.verify_campaign_outcome_resulting_event() FROM PUBLIC;

CREATE TRIGGER campaign_outcome_event_log_verify_resulting_event
  BEFORE INSERT ON leasemind_app.campaign_outcome_event_log
  FOR EACH ROW EXECUTE FUNCTION leasemind_app.verify_campaign_outcome_resulting_event();

-- ---------------------------------------------------------------------------
-- Immutability: UPDATE/DELETE (row-level) and TRUNCATE (statement-level,
-- since TRUNCATE bypasses row-level triggers and bypasses the object
-- owner's implicit privileges -- absence of a TRUNCATE grant alone would
-- not stop the owning role lmapp_migrator).
-- ---------------------------------------------------------------------------

CREATE FUNCTION leasemind_app.reject_campaign_outcome_event_log_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'CAMPAIGN_OUTCOME_EVENT_LOG_IMMUTABLE: % is not permitted on leasemind_app.campaign_outcome_event_log', TG_OP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION leasemind_app.reject_campaign_outcome_event_log_mutation() IS
  'Unconditionally rejects UPDATE/DELETE/TRUNCATE on campaign_outcome_event_log, including for the table owner.';

REVOKE EXECUTE ON FUNCTION leasemind_app.reject_campaign_outcome_event_log_mutation() FROM PUBLIC;

CREATE TRIGGER campaign_outcome_event_log_reject_update
  BEFORE UPDATE ON leasemind_app.campaign_outcome_event_log
  FOR EACH ROW EXECUTE FUNCTION leasemind_app.reject_campaign_outcome_event_log_mutation();

CREATE TRIGGER campaign_outcome_event_log_reject_delete
  BEFORE DELETE ON leasemind_app.campaign_outcome_event_log
  FOR EACH ROW EXECUTE FUNCTION leasemind_app.reject_campaign_outcome_event_log_mutation();

CREATE TRIGGER campaign_outcome_event_log_reject_truncate
  BEFORE TRUNCATE ON leasemind_app.campaign_outcome_event_log
  FOR EACH STATEMENT EXECUTE FUNCTION leasemind_app.reject_campaign_outcome_event_log_mutation();

-- ---------------------------------------------------------------------------
-- 2. campaign_outcome_current_projection -- mutable, fully rebuildable
--    pointer to the current effective outcome. Exactly one row per Campaign
--    that has ever had a 'record' command accepted; no row otherwise.
-- ---------------------------------------------------------------------------

CREATE TABLE leasemind_app.campaign_outcome_current_projection (
  campaign_id uuid PRIMARY KEY
    CHECK (campaign_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[47][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  current_outcome_record_id uuid NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),

  -- Composite FK: the pointer can only ever point at an outcome record of
  -- the SAME campaign_id -- physically impossible to point at another
  -- Campaign's effective outcome.
  CONSTRAINT campaign_outcome_current_projection_pointer_fk
    FOREIGN KEY (campaign_id, current_outcome_record_id)
    REFERENCES leasemind_app.campaign_outcome_event_log (campaign_id, outcome_record_id)
);

COMMENT ON TABLE leasemind_app.campaign_outcome_current_projection IS
  'Mutable, fully rebuildable pointer to the current effective outcome record. Not the source of truth -- always derivable from campaign_outcome_event_log. No immutability trigger (unlike the two append-only tables in this migration).';

-- ---------------------------------------------------------------------------
-- 3. campaign_outcome_idempotency_mapping -- immutable, globally-unique
--    idempotency-key mapping (durable: an accepted key is never
--    reassigned).
-- ---------------------------------------------------------------------------

CREATE TABLE leasemind_app.campaign_outcome_idempotency_mapping (
  idempotency_key text PRIMARY KEY
    CHECK (length(idempotency_key) > 0 AND length(idempotency_key) <= 200),
  command_hash char(64) NOT NULL
    CHECK (command_hash ~ '^[0-9a-f]{64}$'),

  campaign_id uuid NOT NULL
    CHECK (campaign_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[47][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  outcome_record_id uuid NOT NULL,

  accepted_at timestamptz NOT NULL DEFAULT clock_timestamp(),

  -- Composite FK: a mapping row can only ever point at an outcome record of
  -- the SAME campaign_id it itself declares.
  CONSTRAINT campaign_outcome_idempotency_mapping_record_fk
    FOREIGN KEY (campaign_id, outcome_record_id)
    REFERENCES leasemind_app.campaign_outcome_event_log (campaign_id, outcome_record_id)
);

COMMENT ON TABLE leasemind_app.campaign_outcome_idempotency_mapping IS
  'Immutable, globally-unique idempotency_key -> outcome_record_id mapping. An accepted key is never reassigned: replay of the same key, even after later corrections, always resolves to the originally-linked immutable record.';

CREATE FUNCTION leasemind_app.reject_campaign_outcome_idempotency_mapping_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'CAMPAIGN_OUTCOME_IDEMPOTENCY_MAPPING_IMMUTABLE: % is not permitted on leasemind_app.campaign_outcome_idempotency_mapping', TG_OP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION leasemind_app.reject_campaign_outcome_idempotency_mapping_mutation() IS
  'Unconditionally rejects UPDATE/DELETE/TRUNCATE on campaign_outcome_idempotency_mapping, including for the table owner.';

REVOKE EXECUTE ON FUNCTION leasemind_app.reject_campaign_outcome_idempotency_mapping_mutation() FROM PUBLIC;

CREATE TRIGGER campaign_outcome_idempotency_mapping_reject_update
  BEFORE UPDATE ON leasemind_app.campaign_outcome_idempotency_mapping
  FOR EACH ROW EXECUTE FUNCTION leasemind_app.reject_campaign_outcome_idempotency_mapping_mutation();

CREATE TRIGGER campaign_outcome_idempotency_mapping_reject_delete
  BEFORE DELETE ON leasemind_app.campaign_outcome_idempotency_mapping
  FOR EACH ROW EXECUTE FUNCTION leasemind_app.reject_campaign_outcome_idempotency_mapping_mutation();

CREATE TRIGGER campaign_outcome_idempotency_mapping_reject_truncate
  BEFORE TRUNCATE ON leasemind_app.campaign_outcome_idempotency_mapping
  FOR EACH STATEMENT EXECUTE FUNCTION leasemind_app.reject_campaign_outcome_idempotency_mapping_mutation();

-- ---------------------------------------------------------------------------
-- 4. campaign_outcome_public_projection -- safe read-only view. Owner-rights
--    (security_invoker = false, the PostgreSQL default): lmapp_api_reader
--    gets SELECT on this view only, never on the three base tables above.
-- ---------------------------------------------------------------------------

CREATE VIEW leasemind_app.campaign_outcome_public_projection
  WITH (security_barrier = true, security_invoker = false) AS
SELECT
  p.campaign_id,
  l.outcome_code,
  l.recorded_at,
  l.confirmation_method,
  (l.command_type = 'correct') AS is_corrected
FROM leasemind_app.campaign_outcome_current_projection p
JOIN leasemind_app.campaign_outcome_event_log l
  ON l.campaign_id = p.campaign_id AND l.outcome_record_id = p.current_outcome_record_id;

COMMENT ON VIEW leasemind_app.campaign_outcome_public_projection IS
  'Safe read projection for lmapp_api_reader. Owner-rights view (security_invoker=false, security_barrier=true): the reading role never needs -- and never gets -- any grant on the three base tables. Never exposes operator_ref, correction_reason_code, outcome_record_id, corrects_outcome_record_id, outcome_sequence or resulting_campaign_aggregate_version.';

-- ---------------------------------------------------------------------------
-- 5. PUBLIC gets nothing on any new object.
-- ---------------------------------------------------------------------------

REVOKE ALL ON leasemind_app.campaign_outcome_event_log FROM PUBLIC;
REVOKE ALL ON leasemind_app.campaign_outcome_current_projection FROM PUBLIC;
REVOKE ALL ON leasemind_app.campaign_outcome_idempotency_mapping FROM PUBLIC;
REVOKE ALL ON leasemind_app.campaign_outcome_public_projection FROM PUBLIC;

-- ---------------------------------------------------------------------------
-- 6. lmapp_campaign_outcome_writer -- new LOGIN identity (database-foundation
--    role provisioned separately, apps/api/src/db/provisionRoles.ts). Exact
--    column-level grants on the three new objects; the same table-wide
--    shape already established for lmapp_maintainer/lmapp_campaign_writer
--    (migrations 003/004) on the three existing Campaign objects, since
--    that is what a future transaction-aware append primitive needs.
-- ---------------------------------------------------------------------------

GRANT USAGE ON SCHEMA leasemind_app TO lmapp_campaign_outcome_writer;

GRANT SELECT, INSERT ON leasemind_app.campaign_event_log TO lmapp_campaign_outcome_writer;
GRANT SELECT, INSERT, UPDATE ON leasemind_app.campaign_stream_head TO lmapp_campaign_outcome_writer;
GRANT SELECT, INSERT, UPDATE ON leasemind_app.campaign_current_state_projection TO lmapp_campaign_outcome_writer;

-- Launch-proof: read-only, only campaign_id is needed for the EXISTS check.
GRANT SELECT (campaign_id) ON leasemind_app.campaign_subject_link_projection TO lmapp_campaign_outcome_writer;

GRANT INSERT (
  outcome_record_id, campaign_id, outcome_sequence, command_type,
  outcome_code, mapped_lifecycle_status, confirmation_method, operator_ref,
  corrects_outcome_record_id, correction_reason_code, runtime_mode,
  resulting_campaign_aggregate_version
) ON leasemind_app.campaign_outcome_event_log TO lmapp_campaign_outcome_writer;
-- SELECT includes recorded_at/confirmation_method/resulting_campaign_aggregate_version
-- so a safe idempotent-replay response can be a complete machine-readable
-- snapshot, not only an identifier. Does NOT include operator_ref/
-- correction_reason_code/runtime_mode -- secret/audit-only fields the
-- writer writes but never needs or should read back.
GRANT SELECT (
  outcome_record_id, campaign_id, outcome_sequence, command_type,
  outcome_code, mapped_lifecycle_status, corrects_outcome_record_id,
  recorded_at, confirmation_method, resulting_campaign_aggregate_version
) ON leasemind_app.campaign_outcome_event_log TO lmapp_campaign_outcome_writer;

GRANT SELECT (idempotency_key, command_hash, campaign_id, outcome_record_id)
  ON leasemind_app.campaign_outcome_idempotency_mapping TO lmapp_campaign_outcome_writer;
GRANT INSERT (idempotency_key, command_hash, campaign_id, outcome_record_id)
  ON leasemind_app.campaign_outcome_idempotency_mapping TO lmapp_campaign_outcome_writer;

GRANT SELECT (campaign_id, current_outcome_record_id)
  ON leasemind_app.campaign_outcome_current_projection TO lmapp_campaign_outcome_writer;
GRANT INSERT (campaign_id, current_outcome_record_id)
  ON leasemind_app.campaign_outcome_current_projection TO lmapp_campaign_outcome_writer;
GRANT UPDATE (current_outcome_record_id, updated_at)
  ON leasemind_app.campaign_outcome_current_projection TO lmapp_campaign_outcome_writer;

-- ---------------------------------------------------------------------------
-- 7. lmapp_maintainer -- additive grants for rebuildable current-projection
--    maintenance only. No access whatsoever to campaign_outcome_idempotency_mapping
--    (immutable, durable by construction -- never needs rebuild).
-- ---------------------------------------------------------------------------

GRANT SELECT (
  outcome_record_id, campaign_id, outcome_sequence,
  outcome_code, mapped_lifecycle_status, resulting_campaign_aggregate_version
) ON leasemind_app.campaign_outcome_event_log TO lmapp_maintainer;

-- Separate per-privilege column lists in one GRANT -- writing
-- "GRANT SELECT, INSERT, UPDATE (columns)" would NOT be an exact allowlist:
-- PostgreSQL applies a trailing column list only to the privilege
-- immediately preceding it, silently leaving SELECT/INSERT table-wide.
GRANT SELECT (campaign_id, current_outcome_record_id, updated_at),
      INSERT (campaign_id, current_outcome_record_id),
      UPDATE (current_outcome_record_id, updated_at)
ON leasemind_app.campaign_outcome_current_projection
TO lmapp_maintainer;

-- ---------------------------------------------------------------------------
-- 8. lmapp_api_reader -- safe view only, never the three base tables.
-- ---------------------------------------------------------------------------

GRANT SELECT ON leasemind_app.campaign_outcome_public_projection TO lmapp_api_reader;
