-- 009_post_launch_refresh_intent.up.sql
-- Durable server-owned post-launch Analysis refresh state machine.
-- Requires migration 008 and bootstrap provisioning from provisionRoles.ts.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'lmapp_post_launch_refresh_owner'
      AND rolcanlogin = false
      AND rolsuper = false
      AND rolcreatedb = false
      AND rolcreaterole = false
      AND rolreplication = false
      AND rolbypassrls = false
      AND rolinherit = false
  ) THEN
    RAISE EXCEPTION 'POST_LAUNCH_REFRESH_OWNER_NOT_PROVISIONED: bootstrap contract missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_auth_members m
    JOIN pg_roles r ON r.oid = m.roleid
    JOIN pg_roles g ON g.oid = m.member
    WHERE r.rolname = 'lmapp_post_launch_refresh_owner'
      AND g.rolname = 'lmapp_migrator'
      AND m.set_option = true
      AND m.inherit_option = false
      AND m.admin_option = false
  ) THEN
    RAISE EXCEPTION 'POST_LAUNCH_REFRESH_OWNER_MEMBERSHIP_INVALID: expected ADMIN FALSE, INHERIT FALSE, SET TRUE';
  END IF;

  IF (
    SELECT count(*)
    FROM pg_auth_members m
    JOIN pg_roles r ON r.oid = m.roleid
    WHERE r.rolname = 'lmapp_post_launch_refresh_owner'
  ) <> 1 OR EXISTS (
    SELECT 1
    FROM pg_auth_members m
    JOIN pg_roles member_role ON member_role.oid = m.member
    WHERE member_role.rolname = 'lmapp_post_launch_refresh_owner'
  ) THEN
    RAISE EXCEPTION 'POST_LAUNCH_REFRESH_OWNER_MEMBERSHIP_INVALID: owner must have exactly migrator as grantee and be member of no role';
  END IF;
END;
$$;

CREATE TABLE leasemind_app.post_launch_refresh_intent (
  campaign_id uuid PRIMARY KEY,
  property_id uuid NULL REFERENCES leasemind_app.property (property_id),
  tenant_request_id uuid NULL REFERENCES leasemind_app.tenant_request (tenant_request_id),
  technical_assignment_id uuid
    GENERATED ALWAYS AS (COALESCE(property_id, tenant_request_id)) STORED,
  scenario text NOT NULL CHECK (scenario IN ('need_tenant', 'need_property')),
  source_revision integer NOT NULL CHECK (source_revision >= 1),
  analysis_kind text NOT NULL CHECK (analysis_kind = 'post_launch_refresh'),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'claimed', 'completed', 'failed')),
  execution_claim_count integer NOT NULL DEFAULT 0 CHECK (execution_claim_count >= 0),
  claimed_by_worker_id text NULL,
  claimed_at timestamptz NULL,
  lease_expires_at timestamptz NULL,
  current_analysis_snapshot_id uuid NULL,
  launched_at timestamptz NOT NULL,
  sla_deadline_at timestamptz NOT NULL
    GENERATED ALWAYS AS (
      timezone('UTC', timezone('UTC', launched_at) + interval '15 minutes')
    ) STORED,
  finished_at timestamptz NULL,
  sla_breach_reported_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),

  CONSTRAINT post_launch_refresh_intent_exactly_one_reference CHECK (
    (scenario = 'need_tenant' AND property_id IS NOT NULL AND tenant_request_id IS NULL)
    OR (scenario = 'need_property' AND tenant_request_id IS NOT NULL AND property_id IS NULL)
  ),
  CONSTRAINT post_launch_refresh_intent_campaign_link_fk
    FOREIGN KEY (campaign_id, scenario, technical_assignment_id, source_revision)
    REFERENCES leasemind_app.campaign_subject_link_projection
      (campaign_id, scenario, technical_assignment_id, source_revision),
  CONSTRAINT post_launch_refresh_intent_current_snapshot_identity_fk
    FOREIGN KEY (
      current_analysis_snapshot_id, technical_assignment_id, source_revision,
      analysis_kind, campaign_id
    ) REFERENCES leasemind_app.analysis_snapshot (
      analysis_snapshot_id, technical_assignment_id, source_revision,
      analysis_kind, campaign_id
    ),
  CONSTRAINT post_launch_refresh_intent_updated_at_after_created
    CHECK (updated_at >= created_at),
  CONSTRAINT post_launch_refresh_intent_finished_after_launch
    CHECK (finished_at IS NULL OR finished_at >= launched_at),
  CONSTRAINT post_launch_refresh_intent_pending_shape CHECK (
    status <> 'pending'
    OR (
      claimed_by_worker_id IS NULL AND claimed_at IS NULL
      AND lease_expires_at IS NULL AND finished_at IS NULL
    )
  ),
  CONSTRAINT post_launch_refresh_intent_claimed_shape CHECK (
    status <> 'claimed'
    OR (
      claimed_by_worker_id IS NOT NULL AND claimed_at IS NOT NULL
      AND lease_expires_at IS NOT NULL AND finished_at IS NULL
    )
  ),
  CONSTRAINT post_launch_refresh_intent_completed_shape CHECK (
    status <> 'completed'
    OR (current_analysis_snapshot_id IS NOT NULL AND finished_at IS NOT NULL)
  ),
  CONSTRAINT post_launch_refresh_intent_failed_shape CHECK (
    status <> 'failed'
    OR (current_analysis_snapshot_id IS NOT NULL AND finished_at IS NOT NULL)
  )
);

REVOKE ALL ON leasemind_app.post_launch_refresh_intent FROM PUBLIC;

CREATE FUNCTION leasemind_app.enforce_post_launch_refresh_intent_transition()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, leasemind_app
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'POST_LAUNCH_REFRESH_INTENT_IMMUTABLE: DELETE is never permitted';
  END IF;

  IF NEW.campaign_id <> OLD.campaign_id
     OR NEW.property_id IS DISTINCT FROM OLD.property_id
     OR NEW.tenant_request_id IS DISTINCT FROM OLD.tenant_request_id
     OR NEW.scenario <> OLD.scenario
     OR NEW.source_revision <> OLD.source_revision
     OR NEW.analysis_kind <> OLD.analysis_kind
     OR NEW.launched_at <> OLD.launched_at
     OR NEW.created_at <> OLD.created_at
  THEN
    RAISE EXCEPTION 'POST_LAUNCH_REFRESH_INTENT_IMMUTABLE_IDENTITY: identity/launch time cannot change';
  END IF;

  IF OLD.status = NEW.status THEN
    IF OLD.status = 'claimed' THEN
      IF NEW.execution_claim_count = OLD.execution_claim_count
         AND NEW.claimed_by_worker_id IS NOT DISTINCT FROM OLD.claimed_by_worker_id
         AND NEW.claimed_at IS NOT DISTINCT FROM OLD.claimed_at
         AND NEW.lease_expires_at >= OLD.lease_expires_at
         AND NEW.current_analysis_snapshot_id IS NOT DISTINCT FROM OLD.current_analysis_snapshot_id
         AND NEW.finished_at IS NOT DISTINCT FROM OLD.finished_at
         AND NEW.sla_breach_reported_at IS NOT DISTINCT FROM OLD.sla_breach_reported_at
         AND NEW.updated_at >= OLD.updated_at
      THEN
        RETURN NEW;
      END IF;

      IF OLD.lease_expires_at < clock_timestamp()
         AND NEW.execution_claim_count = OLD.execution_claim_count + 1
         AND NEW.claimed_by_worker_id IS NOT NULL
         AND NEW.claimed_at IS NOT NULL
         AND NEW.lease_expires_at IS NOT NULL
         AND NEW.claimed_at >= OLD.claimed_at
         AND NEW.lease_expires_at > NEW.claimed_at
         AND NEW.current_analysis_snapshot_id IS NOT DISTINCT FROM OLD.current_analysis_snapshot_id
         AND NEW.finished_at IS NOT DISTINCT FROM OLD.finished_at
         AND NEW.sla_breach_reported_at IS NOT DISTINCT FROM OLD.sla_breach_reported_at
         AND NEW.updated_at >= OLD.updated_at
      THEN
        RETURN NEW;
      END IF;
    END IF;

    IF OLD.sla_breach_reported_at IS NULL
       AND NEW.sla_breach_reported_at IS NOT NULL
       AND NEW.execution_claim_count IS NOT DISTINCT FROM OLD.execution_claim_count
       AND NEW.claimed_by_worker_id IS NOT DISTINCT FROM OLD.claimed_by_worker_id
       AND NEW.claimed_at IS NOT DISTINCT FROM OLD.claimed_at
       AND NEW.lease_expires_at IS NOT DISTINCT FROM OLD.lease_expires_at
       AND NEW.current_analysis_snapshot_id IS NOT DISTINCT FROM OLD.current_analysis_snapshot_id
       AND NEW.finished_at IS NOT DISTINCT FROM OLD.finished_at
       AND NEW.updated_at >= OLD.updated_at
    THEN
      RETURN NEW;
    END IF;

    RAISE EXCEPTION 'POST_LAUNCH_REFRESH_INTENT_INVALID_SELF_TRANSITION: % self-transition only permitted for claimed re-claim or one-time SLA breach marking', OLD.status;
  END IF;

  IF NOT (
    (OLD.status = 'pending' AND NEW.status = 'claimed')
    OR (OLD.status = 'claimed' AND NEW.status = 'completed')
    OR (OLD.status = 'claimed' AND NEW.status = 'failed')
    OR (OLD.status = 'failed' AND NEW.status = 'pending')
  ) THEN
    RAISE EXCEPTION 'POST_LAUNCH_REFRESH_INTENT_INVALID_TRANSITION: % -> % is not permitted', OLD.status, NEW.status;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION leasemind_app.enforce_post_launch_refresh_intent_transition() FROM PUBLIC;

CREATE TRIGGER post_launch_refresh_intent_reject_delete
  BEFORE DELETE ON leasemind_app.post_launch_refresh_intent
  FOR EACH ROW EXECUTE FUNCTION leasemind_app.enforce_post_launch_refresh_intent_transition();

CREATE TRIGGER post_launch_refresh_intent_enforce_transition
  BEFORE UPDATE ON leasemind_app.post_launch_refresh_intent
  FOR EACH ROW EXECUTE FUNCTION leasemind_app.enforce_post_launch_refresh_intent_transition();

CREATE FUNCTION leasemind_app.claim_post_launch_refresh_intent(
  p_worker_id text,
  p_limit integer DEFAULT 1
) RETURNS TABLE (
  campaign_id uuid,
  property_id uuid,
  tenant_request_id uuid,
  technical_assignment_id uuid,
  scenario text,
  source_revision integer,
  current_analysis_snapshot_id uuid,
  execution_claim_count integer,
  launched_at timestamptz,
  sla_deadline_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, leasemind_app
AS $$
BEGIN
  IF p_worker_id IS NULL OR length(p_worker_id) = 0 OR length(p_worker_id) > 200 THEN
    RAISE EXCEPTION 'POST_LAUNCH_REFRESH_CLAIM_INVALID_WORKER_ID';
  END IF;
  IF p_limit IS NULL OR p_limit < 1 OR p_limit > 20 THEN
    RAISE EXCEPTION 'POST_LAUNCH_REFRESH_CLAIM_INVALID_LIMIT';
  END IF;

  RETURN QUERY
  UPDATE leasemind_app.post_launch_refresh_intent i
  SET status = 'claimed',
      claimed_by_worker_id = p_worker_id,
      claimed_at = clock_timestamp(),
      lease_expires_at = clock_timestamp() + interval '2 minutes',
      execution_claim_count = i.execution_claim_count + 1,
      updated_at = clock_timestamp()
  FROM (
    SELECT pri.campaign_id
    FROM leasemind_app.post_launch_refresh_intent pri
    WHERE pri.status = 'pending'
       OR (pri.status = 'claimed' AND pri.lease_expires_at < clock_timestamp())
    ORDER BY pri.launched_at
    LIMIT p_limit
    FOR UPDATE SKIP LOCKED
  ) picked
  WHERE i.campaign_id = picked.campaign_id
  RETURNING
    i.campaign_id, i.property_id, i.tenant_request_id, i.technical_assignment_id,
    i.scenario, i.source_revision, i.current_analysis_snapshot_id,
    i.execution_claim_count, i.launched_at, i.sla_deadline_at;
END;
$$;

REVOKE ALL ON FUNCTION leasemind_app.claim_post_launch_refresh_intent(text, integer) FROM PUBLIC;

CREATE FUNCTION leasemind_app.renew_post_launch_refresh_intent_lease(
  p_campaign_id uuid,
  p_worker_id text,
  p_execution_claim_count integer
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, leasemind_app
AS $$
DECLARE
  v_rows integer;
BEGIN
  UPDATE leasemind_app.post_launch_refresh_intent
  SET lease_expires_at = clock_timestamp() + interval '2 minutes',
      updated_at = clock_timestamp()
  WHERE campaign_id = p_campaign_id
    AND status = 'claimed'
    AND claimed_by_worker_id = p_worker_id
    AND execution_claim_count = p_execution_claim_count
    AND lease_expires_at >= clock_timestamp();
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    RAISE EXCEPTION 'POST_LAUNCH_REFRESH_INTENT_FENCING_STALE: worker % lost claim on campaign % (claim_count=%)', p_worker_id, p_campaign_id, p_execution_claim_count;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION leasemind_app.renew_post_launch_refresh_intent_lease(uuid, text, integer) FROM PUBLIC;

CREATE FUNCTION leasemind_app.complete_post_launch_refresh_intent(
  p_campaign_id uuid,
  p_worker_id text,
  p_execution_claim_count integer,
  p_analysis_snapshot_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, leasemind_app
AS $$
DECLARE
  v_rows integer;
BEGIN
  UPDATE leasemind_app.post_launch_refresh_intent i
  SET status = 'completed',
      current_analysis_snapshot_id = p_analysis_snapshot_id,
      finished_at = clock_timestamp(),
      updated_at = clock_timestamp()
  WHERE i.campaign_id = p_campaign_id
    AND i.status = 'claimed'
    AND i.claimed_by_worker_id = p_worker_id
    AND i.execution_claim_count = p_execution_claim_count
    AND i.lease_expires_at >= clock_timestamp()
    AND EXISTS (
      SELECT 1
      FROM leasemind_app.analysis_snapshot s
      WHERE s.analysis_snapshot_id = p_analysis_snapshot_id
        AND s.technical_assignment_id = i.technical_assignment_id
        AND s.source_revision = i.source_revision
        AND s.analysis_kind = i.analysis_kind
        AND s.campaign_id = i.campaign_id
        AND s.status IN ('completed', 'insufficient_data')
    );
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    RAISE EXCEPTION 'POST_LAUNCH_REFRESH_INTENT_FENCING_STALE: worker % lost claim on campaign % (claim_count=%)', p_worker_id, p_campaign_id, p_execution_claim_count;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION leasemind_app.complete_post_launch_refresh_intent(uuid, text, integer, uuid) FROM PUBLIC;

CREATE FUNCTION leasemind_app.fail_post_launch_refresh_intent(
  p_campaign_id uuid,
  p_worker_id text,
  p_execution_claim_count integer,
  p_analysis_snapshot_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, leasemind_app
AS $$
DECLARE
  v_rows integer;
BEGIN
  UPDATE leasemind_app.post_launch_refresh_intent i
  SET status = 'failed',
      current_analysis_snapshot_id = p_analysis_snapshot_id,
      finished_at = clock_timestamp(),
      updated_at = clock_timestamp()
  WHERE i.campaign_id = p_campaign_id
    AND i.status = 'claimed'
    AND i.claimed_by_worker_id = p_worker_id
    AND i.execution_claim_count = p_execution_claim_count
    AND i.lease_expires_at >= clock_timestamp()
    AND EXISTS (
      SELECT 1
      FROM leasemind_app.analysis_snapshot s
      WHERE s.analysis_snapshot_id = p_analysis_snapshot_id
        AND s.technical_assignment_id = i.technical_assignment_id
        AND s.source_revision = i.source_revision
        AND s.analysis_kind = i.analysis_kind
        AND s.campaign_id = i.campaign_id
        AND s.status = 'failed'
    );
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    RAISE EXCEPTION 'POST_LAUNCH_REFRESH_INTENT_FENCING_STALE: worker % lost claim on campaign % (claim_count=%)', p_worker_id, p_campaign_id, p_execution_claim_count;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION leasemind_app.fail_post_launch_refresh_intent(uuid, text, integer, uuid) FROM PUBLIC;

CREATE FUNCTION leasemind_app.request_post_launch_refresh_retry(
  p_campaign_id uuid,
  p_new_analysis_snapshot_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, leasemind_app
AS $$
DECLARE
  v_intent_status text;
  v_current_analysis_snapshot_id uuid;
  v_prior_status text;
  v_prior_failure jsonb;
  v_prior_technical_assignment_id uuid;
  v_prior_source_revision integer;
  v_prior_calculation_attempt integer;
  v_new_status text;
  v_new_failure jsonb;
  v_new_technical_assignment_id uuid;
  v_new_source_revision integer;
  v_new_analysis_kind text;
  v_new_campaign_id uuid;
  v_new_calculation_attempt integer;
BEGIN
  SELECT status, current_analysis_snapshot_id
  INTO v_intent_status, v_current_analysis_snapshot_id
  FROM leasemind_app.post_launch_refresh_intent
  WHERE campaign_id = p_campaign_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'POST_LAUNCH_REFRESH_INTENT_NOT_FOUND: %', p_campaign_id;
  END IF;
  IF v_intent_status <> 'failed' THEN
    RAISE EXCEPTION 'POST_LAUNCH_REFRESH_INTENT_NOT_FAILED: campaign_id % is % not failed', p_campaign_id, v_intent_status;
  END IF;

  SELECT status, failure, technical_assignment_id, source_revision, calculation_attempt
  INTO v_prior_status, v_prior_failure, v_prior_technical_assignment_id,
       v_prior_source_revision, v_prior_calculation_attempt
  FROM leasemind_app.analysis_snapshot
  WHERE analysis_snapshot_id = v_current_analysis_snapshot_id;
  IF NOT FOUND OR v_prior_status <> 'failed'
     OR (v_prior_failure->>'retryable')::boolean IS NOT TRUE THEN
    RAISE EXCEPTION 'POST_LAUNCH_REFRESH_INTENT_PRIOR_NOT_RETRYABLE: %', p_campaign_id;
  END IF;

  SELECT status, failure, technical_assignment_id, source_revision,
         analysis_kind, campaign_id, calculation_attempt
  INTO v_new_status, v_new_failure, v_new_technical_assignment_id,
       v_new_source_revision, v_new_analysis_kind, v_new_campaign_id,
       v_new_calculation_attempt
  FROM leasemind_app.analysis_snapshot
  WHERE analysis_snapshot_id = p_new_analysis_snapshot_id;
  IF NOT FOUND
     OR v_new_status <> 'pending'
     OR v_new_failure IS NOT NULL
     OR v_new_technical_assignment_id <> v_prior_technical_assignment_id
     OR v_new_source_revision <> v_prior_source_revision
     OR v_new_analysis_kind <> 'post_launch_refresh'
     OR v_new_campaign_id <> p_campaign_id
     OR v_new_calculation_attempt <> v_prior_calculation_attempt + 1
  THEN
    RAISE EXCEPTION 'POST_LAUNCH_REFRESH_INTENT_RETRY_TARGET_INVALID: %', p_campaign_id;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM leasemind_app.analysis_snapshot_idempotency_mapping m
    WHERE m.analysis_snapshot_id = p_new_analysis_snapshot_id
      AND m.retry_of_analysis_snapshot_id = v_current_analysis_snapshot_id
  ) THEN
    RAISE EXCEPTION 'POST_LAUNCH_REFRESH_INTENT_RETRY_MAPPING_MISSING: %', p_campaign_id;
  END IF;

  UPDATE leasemind_app.post_launch_refresh_intent
  SET status = 'pending',
      current_analysis_snapshot_id = p_new_analysis_snapshot_id,
      claimed_by_worker_id = NULL,
      claimed_at = NULL,
      lease_expires_at = NULL,
      finished_at = NULL,
      updated_at = clock_timestamp()
  WHERE campaign_id = p_campaign_id;
END;
$$;

REVOKE ALL ON FUNCTION leasemind_app.request_post_launch_refresh_retry(uuid, uuid) FROM PUBLIC;

CREATE FUNCTION leasemind_app.mark_post_launch_refresh_intent_sla_breach(
  p_campaign_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, leasemind_app
AS $$
DECLARE
  v_rows integer;
BEGIN
  UPDATE leasemind_app.post_launch_refresh_intent
  SET sla_breach_reported_at = clock_timestamp(),
      updated_at = clock_timestamp()
  WHERE campaign_id = p_campaign_id
    AND sla_breach_reported_at IS NULL
    AND (
      (finished_at IS NULL AND clock_timestamp() > sla_deadline_at)
      OR (finished_at IS NOT NULL AND finished_at > sla_deadline_at)
    );
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows > 0;
END;
$$;

REVOKE ALL ON FUNCTION leasemind_app.mark_post_launch_refresh_intent_sla_breach(uuid) FROM PUBLIC;

-- Worker core-table allowlist is intentionally granted in 009, not 008.
GRANT USAGE ON SCHEMA leasemind_app TO lmapp_analysis_worker;
GRANT EXECUTE ON FUNCTION leasemind_app.jsonb_object_key_count(jsonb)
  TO lmapp_analysis_worker;
GRANT EXECUTE ON FUNCTION leasemind_app.is_valid_metric_envelope(jsonb)
  TO lmapp_analysis_worker;

GRANT SELECT (
  property_id, revision, lifecycle_status, created_at, updated_at,
  property_type, property_country_code, property_region, property_city, property_districts,
  property_area_sqm, property_floor, property_total_floors, property_entrance_type, property_condition,
  property_available_from, property_monthly_rent_rub, property_operating_expenses_included,
  property_utilities_included, property_security_deposit_rub, property_min_lease_months,
  property_allowed_business_categories, property_excluded_business_categories,
  property_target_tenant_categories, property_power_kw, property_ceiling_height_m, property_features,
  property_parking_spaces, property_loading_access, property_access_mode, property_deal_priority
) ON leasemind_app.property TO lmapp_analysis_worker;

GRANT SELECT (
  tenant_request_id, revision, lifecycle_status, created_at, updated_at,
  request_business_category, request_business_stage, request_expected_occupancy_people,
  request_country_code, request_region, request_cities, request_districts, request_location_priorities,
  request_property_types, request_area_min_sqm, request_area_max_sqm, request_monthly_budget_max_rub,
  request_monthly_rent_rate_max_rub_per_sqm, request_budget_includes_operating_expenses,
  request_condition_options, request_move_in_by, request_min_lease_months, request_power_min_kw,
  request_ceiling_height_min_m, request_entrance_requirement, request_floor_options,
  request_parking_min_spaces, request_loading_access_required, request_access_mode,
  request_required_features, request_excluded_features, request_deal_priority
) ON leasemind_app.tenant_request TO lmapp_analysis_worker;

GRANT SELECT (
  analysis_snapshot_id, technical_assignment_id, source_revision, scenario, analysis_kind,
  campaign_id, calculation_attempt, status, schema_version, method_version,
  country_code, currency, locale, area_unit, rent_period,
  input_fingerprint, evidence_dataset_revision, evidence_as_of,
  results, failure, created_at, generated_at
) ON leasemind_app.analysis_snapshot TO lmapp_analysis_worker;
GRANT INSERT (
  analysis_snapshot_id, property_id, tenant_request_id, source_revision, scenario,
  analysis_kind, campaign_id, calculation_attempt, status, schema_version, method_version,
  country_code, currency, locale, area_unit, rent_period, input_fingerprint
) ON leasemind_app.analysis_snapshot TO lmapp_analysis_worker;
GRANT UPDATE (
  status, generated_at, results, failure, evidence_as_of, evidence_dataset_revision
) ON leasemind_app.analysis_snapshot TO lmapp_analysis_worker;

GRANT SELECT (idempotency_key, command_hash, analysis_snapshot_id, retry_of_analysis_snapshot_id)
  ON leasemind_app.analysis_snapshot_idempotency_mapping TO lmapp_analysis_worker;
GRANT INSERT (idempotency_key, command_hash, analysis_snapshot_id, retry_of_analysis_snapshot_id)
  ON leasemind_app.analysis_snapshot_idempotency_mapping TO lmapp_analysis_worker;

-- Ownership transfer requires temporary CREATE on the schema and permanent
-- USAGE/column SELECT for the SECURITY DEFINER functions' external reads.
GRANT CREATE, USAGE ON SCHEMA leasemind_app TO lmapp_post_launch_refresh_owner;
GRANT SELECT (
  analysis_snapshot_id, status, failure, technical_assignment_id, source_revision,
  analysis_kind, campaign_id, calculation_attempt
) ON leasemind_app.analysis_snapshot TO lmapp_post_launch_refresh_owner;
GRANT SELECT (analysis_snapshot_id, retry_of_analysis_snapshot_id)
  ON leasemind_app.analysis_snapshot_idempotency_mapping
  TO lmapp_post_launch_refresh_owner;

ALTER TABLE leasemind_app.post_launch_refresh_intent
  OWNER TO lmapp_post_launch_refresh_owner;
ALTER FUNCTION leasemind_app.enforce_post_launch_refresh_intent_transition()
  OWNER TO lmapp_post_launch_refresh_owner;
ALTER FUNCTION leasemind_app.claim_post_launch_refresh_intent(text, integer)
  OWNER TO lmapp_post_launch_refresh_owner;
ALTER FUNCTION leasemind_app.renew_post_launch_refresh_intent_lease(uuid, text, integer)
  OWNER TO lmapp_post_launch_refresh_owner;
ALTER FUNCTION leasemind_app.complete_post_launch_refresh_intent(uuid, text, integer, uuid)
  OWNER TO lmapp_post_launch_refresh_owner;
ALTER FUNCTION leasemind_app.fail_post_launch_refresh_intent(uuid, text, integer, uuid)
  OWNER TO lmapp_post_launch_refresh_owner;
ALTER FUNCTION leasemind_app.request_post_launch_refresh_retry(uuid, uuid)
  OWNER TO lmapp_post_launch_refresh_owner;
ALTER FUNCTION leasemind_app.mark_post_launch_refresh_intent_sla_breach(uuid)
  OWNER TO lmapp_post_launch_refresh_owner;

REVOKE CREATE ON SCHEMA leasemind_app FROM lmapp_post_launch_refresh_owner;

SET ROLE lmapp_post_launch_refresh_owner;

GRANT INSERT (
  campaign_id, property_id, tenant_request_id, scenario, source_revision,
  analysis_kind, status, launched_at
) ON leasemind_app.post_launch_refresh_intent TO lmapp_campaign_writer;

GRANT EXECUTE ON FUNCTION leasemind_app.claim_post_launch_refresh_intent(text, integer)
  TO lmapp_analysis_worker;
GRANT EXECUTE ON FUNCTION leasemind_app.renew_post_launch_refresh_intent_lease(uuid, text, integer)
  TO lmapp_analysis_worker;
GRANT EXECUTE ON FUNCTION leasemind_app.complete_post_launch_refresh_intent(uuid, text, integer, uuid)
  TO lmapp_analysis_worker;
GRANT EXECUTE ON FUNCTION leasemind_app.fail_post_launch_refresh_intent(uuid, text, integer, uuid)
  TO lmapp_analysis_worker;
GRANT EXECUTE ON FUNCTION leasemind_app.mark_post_launch_refresh_intent_sla_breach(uuid)
  TO lmapp_analysis_worker;
GRANT EXECUTE ON FUNCTION leasemind_app.request_post_launch_refresh_retry(uuid, uuid)
  TO lmapp_analysis_writer;

RESET ROLE;
