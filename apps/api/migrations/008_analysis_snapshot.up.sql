-- 008_analysis_snapshot.up.sql
-- Core server-owned Analysis Snapshot persistence (synthetic-only).
-- See 02_PRODUCT/ANALYSIS_SNAPSHOT.md v0.3 and ADR-0009.

CREATE FUNCTION leasemind_app.jsonb_object_key_count(value jsonb)
RETURNS integer
LANGUAGE sql
IMMUTABLE
STRICT
AS $$
  SELECT count(*)::integer FROM jsonb_object_keys(value);
$$;

REVOKE EXECUTE ON FUNCTION leasemind_app.jsonb_object_key_count(jsonb) FROM PUBLIC;

CREATE FUNCTION leasemind_app.is_valid_metric_envelope(envelope jsonb)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(
    CASE
      WHEN envelope IS NULL THEN FALSE
      WHEN jsonb_typeof(envelope) <> 'object' THEN FALSE
      WHEN leasemind_app.jsonb_object_key_count(envelope) <> 7 THEN FALSE
      WHEN NOT (
        envelope ? 'metric_status' AND envelope ? 'confidence' AND envelope ? 'value'
        AND envelope ? 'sample_size' AND envelope ? 'evidence'
        AND envelope ? 'reason_codes' AND envelope ? 'assumptions'
      ) THEN FALSE
      WHEN jsonb_typeof(envelope->'metric_status') IS DISTINCT FROM 'string' THEN FALSE
      WHEN (envelope->>'metric_status') NOT IN ('assessed', 'insufficient_data') THEN FALSE
      WHEN NOT (
        (envelope->'confidence') = 'null'::jsonb
        OR (envelope->>'confidence') IN ('low', 'medium', 'high')
      ) THEN FALSE
      WHEN (envelope->>'metric_status') = 'assessed'
        AND jsonb_typeof(envelope->'value') <> 'object' THEN FALSE
      WHEN (envelope->>'metric_status') = 'insufficient_data'
        AND (envelope->'value') <> 'null'::jsonb THEN FALSE
      WHEN (envelope->>'metric_status') = 'insufficient_data'
        AND (envelope->'confidence') <> 'null'::jsonb THEN FALSE
      WHEN jsonb_typeof(envelope->'sample_size') <> 'number' THEN FALSE
      WHEN (envelope->>'sample_size') !~ '^(0|[1-9][0-9]*)$' THEN FALSE
      WHEN jsonb_typeof(envelope->'evidence') <> 'object' THEN FALSE
      WHEN leasemind_app.jsonb_object_key_count(envelope->'evidence') <> 3 THEN FALSE
      WHEN NOT (
        (envelope->'evidence') ? 'method'
        AND (envelope->'evidence') ? 'filters_applied'
        AND (envelope->'evidence') ? 'dataset_revision'
      ) THEN FALSE
      WHEN jsonb_typeof(envelope->'evidence'->'method') <> 'string' THEN FALSE
      WHEN jsonb_typeof(envelope->'evidence'->'filters_applied') <> 'array' THEN FALSE
      WHEN NOT (
        (envelope->'evidence'->'dataset_revision') = 'null'::jsonb
        OR (envelope->'evidence'->>'dataset_revision') ~ '^[0-9a-f]{64}$'
      ) THEN FALSE
      WHEN jsonb_typeof(envelope->'reason_codes') <> 'array' THEN FALSE
      WHEN jsonb_typeof(envelope->'assumptions') <> 'array' THEN FALSE
      ELSE TRUE
    END,
    FALSE
  );
$$;

REVOKE EXECUTE ON FUNCTION leasemind_app.is_valid_metric_envelope(jsonb) FROM PUBLIC;

CREATE TABLE leasemind_app.campaign_subject_link_projection (
  campaign_id uuid PRIMARY KEY
    REFERENCES leasemind_app.campaign_current_state_projection (campaign_id),
  scenario text NOT NULL CHECK (scenario IN ('need_tenant', 'need_property')),
  property_id uuid NULL REFERENCES leasemind_app.property (property_id),
  tenant_request_id uuid NULL REFERENCES leasemind_app.tenant_request (tenant_request_id),
  technical_assignment_id uuid
    GENERATED ALWAYS AS (COALESCE(property_id, tenant_request_id)) STORED,
  source_revision integer NOT NULL CHECK (source_revision >= 1),
  source_schema_version text NOT NULL CHECK (source_schema_version = '1.0'),
  linked_at timestamptz NOT NULL,
  authorization_contract_version text NOT NULL
    CHECK (authorization_contract_version IN ('legacy_v1', 'analysis_v2')),
  analysis_snapshot_id uuid NULL,
  authorized_analysis_kind text NULL CHECK (authorized_analysis_kind = 'pre_launch'),
  authorized_analysis_status text NULL
    CHECK (authorized_analysis_status IN ('completed', 'insufficient_data')),

  CONSTRAINT campaign_subject_link_projection_subject_exactly_one_reference CHECK (
    (scenario = 'need_tenant' AND property_id IS NOT NULL AND tenant_request_id IS NULL)
    OR (scenario = 'need_property' AND tenant_request_id IS NOT NULL AND property_id IS NULL)
  ),
  CONSTRAINT campaign_subject_link_projection_composite_unique
    UNIQUE (campaign_id, scenario, technical_assignment_id, source_revision),
  CONSTRAINT campaign_subject_link_projection_one_campaign_per_ta_revision
    UNIQUE (scenario, technical_assignment_id, source_revision),
  CONSTRAINT campaign_subject_link_projection_authorization_shape CHECK (
    (
      authorization_contract_version = 'legacy_v1'
      AND analysis_snapshot_id IS NULL
      AND authorized_analysis_kind IS NULL
      AND authorized_analysis_status IS NULL
    ) OR (
      authorization_contract_version = 'analysis_v2'
      AND analysis_snapshot_id IS NOT NULL
      AND authorized_analysis_kind IS NOT NULL
      AND authorized_analysis_status IS NOT NULL
    )
  )
);

CREATE TABLE leasemind_app.analysis_snapshot (
  analysis_snapshot_id uuid PRIMARY KEY,
  property_id uuid NULL REFERENCES leasemind_app.property (property_id),
  tenant_request_id uuid NULL REFERENCES leasemind_app.tenant_request (tenant_request_id),
  technical_assignment_id uuid
    GENERATED ALWAYS AS (COALESCE(property_id, tenant_request_id)) STORED,
  source_revision integer NOT NULL CHECK (source_revision >= 1),
  scenario text NOT NULL CHECK (scenario IN ('need_tenant', 'need_property')),
  analysis_kind text NOT NULL CHECK (analysis_kind IN ('pre_launch', 'post_launch_refresh')),
  campaign_id uuid NULL,
  calculation_attempt integer NOT NULL CHECK (calculation_attempt >= 1),
  status text NOT NULL
    CHECK (status IN ('pending', 'completed', 'insufficient_data', 'failed')),
  schema_version text NOT NULL CHECK (schema_version = '1.0'),
  method_version text NOT NULL CHECK (method_version = 'synthetic_ru_v1'),
  country_code text NOT NULL CHECK (country_code = 'RU'),
  currency text NOT NULL CHECK (currency = 'RUB'),
  locale text NOT NULL CHECK (locale = 'ru-RU'),
  area_unit text NOT NULL CHECK (area_unit = 'sqm'),
  rent_period text NOT NULL CHECK (rent_period = 'month'),
  input_fingerprint char(64) NOT NULL CHECK (input_fingerprint ~ '^[0-9a-f]{64}$'),
  evidence_dataset_revision char(64) NULL
    CHECK (evidence_dataset_revision ~ '^[0-9a-f]{64}$'),
  evidence_as_of timestamptz NULL,
  results jsonb NULL,
  failure jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  generated_at timestamptz NULL CHECK (generated_at IS NULL OR generated_at >= created_at),

  CONSTRAINT analysis_snapshot_subject_exactly_one_reference CHECK (
    (scenario = 'need_tenant' AND property_id IS NOT NULL AND tenant_request_id IS NULL)
    OR (scenario = 'need_property' AND tenant_request_id IS NOT NULL AND property_id IS NULL)
  ),
  CONSTRAINT analysis_snapshot_campaign_link_fk
    FOREIGN KEY (campaign_id, scenario, technical_assignment_id, source_revision)
    REFERENCES leasemind_app.campaign_subject_link_projection
      (campaign_id, scenario, technical_assignment_id, source_revision),
  CONSTRAINT analysis_snapshot_pre_launch_authorization_unique
    UNIQUE (analysis_snapshot_id, scenario, technical_assignment_id, source_revision, analysis_kind, status),
  CONSTRAINT analysis_snapshot_post_launch_identity_unique
    UNIQUE (analysis_snapshot_id, technical_assignment_id, source_revision, analysis_kind, campaign_id),
  CONSTRAINT analysis_snapshot_failure_shape_check CHECK (
    failure IS NULL OR COALESCE(
      CASE
        WHEN jsonb_typeof(failure) <> 'object' THEN FALSE
        WHEN leasemind_app.jsonb_object_key_count(failure) <> 2 THEN FALSE
        WHEN NOT (failure ? 'code' AND failure ? 'retryable') THEN FALSE
        WHEN jsonb_typeof(failure->'code') <> 'string' THEN FALSE
        WHEN (failure->>'code') = '' THEN FALSE
        WHEN (failure->>'code') NOT IN (
          'ANALYSIS_DATASET_UNAVAILABLE', 'ANALYSIS_GENERATION_FAILED'
        ) THEN FALSE
        WHEN jsonb_typeof(failure->'retryable') <> 'boolean' THEN FALSE
        ELSE TRUE
      END,
      FALSE
    )
  ),
  CONSTRAINT analysis_snapshot_pre_launch_no_campaign CHECK (
    analysis_kind <> 'pre_launch' OR campaign_id IS NULL
  ),
  CONSTRAINT analysis_snapshot_post_launch_requires_campaign CHECK (
    analysis_kind <> 'post_launch_refresh' OR campaign_id IS NOT NULL
  ),
  CONSTRAINT analysis_snapshot_generated_at_matches_status CHECK (
    (status = 'pending') = (generated_at IS NULL)
  ),
  CONSTRAINT analysis_snapshot_completed_requires_results CHECK (
    status NOT IN ('completed', 'insufficient_data')
    OR (results IS NOT NULL AND failure IS NULL)
  ),
  CONSTRAINT analysis_snapshot_failed_requires_failure CHECK (
    status <> 'failed' OR (failure IS NOT NULL AND results IS NULL)
  ),
  CONSTRAINT analysis_snapshot_pending_publishes_nothing CHECK (
    status <> 'pending' OR (results IS NULL AND failure IS NULL)
  ),
  CONSTRAINT analysis_snapshot_results_shape_check CHECK (
    results IS NULL OR (
      jsonb_typeof(results) = 'object'
      AND results ? 'price_adequacy'
      AND results ? 'competition'
      AND results ? 'deal_probability_30d'
      AND results ? 'candidate_categories'
       AND leasemind_app.jsonb_object_key_count(results) = 4
      AND leasemind_app.is_valid_metric_envelope(results->'price_adequacy')
      AND leasemind_app.is_valid_metric_envelope(results->'competition')
      AND leasemind_app.is_valid_metric_envelope(results->'deal_probability_30d')
      AND leasemind_app.is_valid_metric_envelope(results->'candidate_categories')
    )
  )
);

ALTER TABLE leasemind_app.campaign_subject_link_projection
  ADD CONSTRAINT campaign_subject_link_projection_analysis_snapshot_fk
  FOREIGN KEY (
    analysis_snapshot_id, scenario, technical_assignment_id, source_revision,
    authorized_analysis_kind, authorized_analysis_status
  )
  REFERENCES leasemind_app.analysis_snapshot (
    analysis_snapshot_id, scenario, technical_assignment_id, source_revision,
    analysis_kind, status
  );

CREATE TABLE leasemind_app.analysis_snapshot_idempotency_mapping (
  idempotency_key text PRIMARY KEY
    CHECK (length(idempotency_key) > 0 AND length(idempotency_key) <= 200),
  command_hash char(64) NOT NULL CHECK (command_hash ~ '^[0-9a-f]{64}$'),
  analysis_snapshot_id uuid NOT NULL
    REFERENCES leasemind_app.analysis_snapshot (analysis_snapshot_id),
  retry_of_analysis_snapshot_id uuid NULL
    REFERENCES leasemind_app.analysis_snapshot (analysis_snapshot_id),
  accepted_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT analysis_snapshot_idempotency_mapping_retry_not_self CHECK (
    retry_of_analysis_snapshot_id IS NULL
    OR retry_of_analysis_snapshot_id <> analysis_snapshot_id
  )
);

CREATE FUNCTION leasemind_app.reject_analysis_snapshot_immutable_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'ANALYSIS_SNAPSHOT_IMMUTABLE: DELETE is never permitted on leasemind_app.analysis_snapshot';
  END IF;
  IF OLD.status <> 'pending' THEN
    RAISE EXCEPTION 'ANALYSIS_SNAPSHOT_IMMUTABLE: UPDATE on a terminal row is not permitted';
  END IF;
  IF NEW.status NOT IN ('completed', 'insufficient_data', 'failed') THEN
    RAISE EXCEPTION 'ANALYSIS_SNAPSHOT_IMMUTABLE: pending may only transition to a terminal status';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION leasemind_app.reject_analysis_snapshot_immutable_mutation() FROM PUBLIC;

CREATE TRIGGER analysis_snapshot_reject_delete
  BEFORE DELETE ON leasemind_app.analysis_snapshot
  FOR EACH ROW EXECUTE FUNCTION leasemind_app.reject_analysis_snapshot_immutable_mutation();

CREATE TRIGGER analysis_snapshot_reject_invalid_update
  BEFORE UPDATE ON leasemind_app.analysis_snapshot
  FOR EACH ROW EXECUTE FUNCTION leasemind_app.reject_analysis_snapshot_immutable_mutation();

CREATE FUNCTION leasemind_app.reject_analysis_snapshot_idempotency_mapping_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'ANALYSIS_SNAPSHOT_IDEMPOTENCY_MAPPING_IMMUTABLE: % is not permitted on leasemind_app.analysis_snapshot_idempotency_mapping', TG_OP;
END;
$$;

REVOKE EXECUTE ON FUNCTION leasemind_app.reject_analysis_snapshot_idempotency_mapping_mutation() FROM PUBLIC;

CREATE TRIGGER analysis_snapshot_idempotency_mapping_reject_update
  BEFORE UPDATE ON leasemind_app.analysis_snapshot_idempotency_mapping
  FOR EACH ROW EXECUTE FUNCTION leasemind_app.reject_analysis_snapshot_idempotency_mapping_mutation();

CREATE TRIGGER analysis_snapshot_idempotency_mapping_reject_delete
  BEFORE DELETE ON leasemind_app.analysis_snapshot_idempotency_mapping
  FOR EACH ROW EXECUTE FUNCTION leasemind_app.reject_analysis_snapshot_idempotency_mapping_mutation();

CREATE UNIQUE INDEX analysis_snapshot_pre_launch_attempt_unique
  ON leasemind_app.analysis_snapshot (
    technical_assignment_id, source_revision, analysis_kind, calculation_attempt
  ) WHERE analysis_kind = 'pre_launch';

CREATE UNIQUE INDEX analysis_snapshot_post_launch_attempt_unique
  ON leasemind_app.analysis_snapshot (
    technical_assignment_id, source_revision, analysis_kind, campaign_id, calculation_attempt
  ) WHERE analysis_kind = 'post_launch_refresh';

CREATE UNIQUE INDEX analysis_snapshot_pre_launch_single_pending
  ON leasemind_app.analysis_snapshot (
    technical_assignment_id, source_revision, analysis_kind
  ) WHERE analysis_kind = 'pre_launch' AND status = 'pending';

CREATE UNIQUE INDEX analysis_snapshot_post_launch_single_pending
  ON leasemind_app.analysis_snapshot (
    technical_assignment_id, source_revision, analysis_kind, campaign_id
  ) WHERE analysis_kind = 'post_launch_refresh' AND status = 'pending';

CREATE INDEX analysis_snapshot_campaign_id_idx
  ON leasemind_app.analysis_snapshot (campaign_id)
  WHERE campaign_id IS NOT NULL;

-- Fail closed before touching the target table. Migration 006's CHECK
-- alone is insufficient because PostgreSQL accepts a NULL CHECK result.
DO $$
DECLARE
  invalid_count bigint;
BEGIN
  SELECT count(*) INTO invalid_count
  FROM leasemind_app.campaign_event_log e
  WHERE e.event_type = 'campaign.subject_linked.v1'
    AND jsonb_typeof(e.payload) IS DISTINCT FROM 'object';
  IF invalid_count > 0 THEN
    RAISE EXCEPTION
      'ANALYSIS_SNAPSHOT_BACKFILL_INVALID_SOURCE_EVENTS: % campaign.subject_linked.v1 row(s) have a non-object payload',
      invalid_count;
  END IF;

  SELECT count(*) INTO invalid_count
  FROM leasemind_app.campaign_event_log e
  WHERE e.event_type = 'campaign.subject_linked.v1'
    AND (
      leasemind_app.jsonb_object_key_count(e.payload) <> 5
      OR NOT (
        e.payload ? 'entity_type' AND e.payload ? 'entity_id'
        AND e.payload ? 'source_technical_assignment_id'
        AND e.payload ? 'source_schema_version'
        AND e.payload ? 'source_revision'
      )
    );
  IF invalid_count > 0 THEN
    RAISE EXCEPTION
      'ANALYSIS_SNAPSHOT_BACKFILL_INVALID_SOURCE_EVENTS: % campaign.subject_linked.v1 row(s) do not have exactly the five required payload keys',
      invalid_count;
  END IF;

  SELECT count(*) INTO invalid_count
  FROM leasemind_app.campaign_event_log e
  WHERE e.event_type = 'campaign.subject_linked.v1'
    AND (
      e.payload->>'entity_type' IS NULL
      OR e.payload->>'entity_id' IS NULL
      OR e.payload->>'source_technical_assignment_id' IS NULL
      OR e.payload->>'source_schema_version' IS NULL
      OR e.payload->'source_revision' IS NULL
      OR jsonb_typeof(e.payload->'source_revision') IS DISTINCT FROM 'number'
      OR e.payload->>'entity_type' NOT IN ('Property', 'TenantRequest')
      OR e.payload->>'entity_id' <> e.payload->>'source_technical_assignment_id'
      OR e.payload->>'source_schema_version' <> '1.0'
      OR (e.payload->>'source_revision') !~ '^[1-9][0-9]*$'
      OR (
        e.payload->>'entity_type' = 'Property'
        AND NOT EXISTS (
          SELECT 1 FROM leasemind_app.property p
          WHERE p.property_id::text = e.payload->>'entity_id'
        )
      )
      OR (
        e.payload->>'entity_type' = 'TenantRequest'
        AND NOT EXISTS (
          SELECT 1 FROM leasemind_app.tenant_request t
          WHERE t.tenant_request_id::text = e.payload->>'entity_id'
        )
      )
      OR NOT EXISTS (
        SELECT 1 FROM leasemind_app.campaign_current_state_projection c
        WHERE c.campaign_id = e.campaign_id
      )
    );
  IF invalid_count > 0 THEN
    RAISE EXCEPTION
      'ANALYSIS_SNAPSHOT_BACKFILL_INVALID_SOURCE_EVENTS: % campaign.subject_linked.v1 row(s) fail explicit shape/reference validation',
      invalid_count;
  END IF;

  SELECT count(*) INTO invalid_count FROM (
    SELECT campaign_id
    FROM leasemind_app.campaign_event_log
    WHERE event_type = 'campaign.subject_linked.v1'
    GROUP BY campaign_id
    HAVING count(*) > 1
  ) duplicates;
  IF invalid_count > 0 THEN
    RAISE EXCEPTION
      'ANALYSIS_SNAPSHOT_BACKFILL_DUPLICATE_CAMPAIGN_LINK: % campaign_id value(s) have more than one subject_linked event',
      invalid_count;
  END IF;

  SELECT count(*) INTO invalid_count FROM (
    SELECT
      e.payload->>'source_technical_assignment_id' AS ta_id,
      (e.payload->>'source_revision')::integer AS rev
    FROM leasemind_app.campaign_event_log e
    WHERE e.event_type = 'campaign.subject_linked.v1'
    GROUP BY 1, 2
    HAVING count(DISTINCT e.campaign_id) > 1
  ) contradictory;
  IF invalid_count > 0 THEN
    RAISE EXCEPTION
      'ANALYSIS_SNAPSHOT_BACKFILL_CONTRADICTORY_LINK: % (technical_assignment_id, source_revision) pair(s) linked to more than one campaign_id',
      invalid_count;
  END IF;
END;
$$;

INSERT INTO leasemind_app.campaign_subject_link_projection (
  campaign_id, scenario, property_id, tenant_request_id, source_revision,
  source_schema_version, linked_at, authorization_contract_version,
  analysis_snapshot_id, authorized_analysis_kind, authorized_analysis_status
)
SELECT
  e.campaign_id,
  CASE e.payload->>'entity_type'
    WHEN 'Property' THEN 'need_tenant'
    WHEN 'TenantRequest' THEN 'need_property'
  END,
  CASE WHEN e.payload->>'entity_type' = 'Property'
    THEN (e.payload->>'entity_id')::uuid ELSE NULL END,
  CASE WHEN e.payload->>'entity_type' = 'TenantRequest'
    THEN (e.payload->>'entity_id')::uuid ELSE NULL END,
  (e.payload->>'source_revision')::integer,
  e.payload->>'source_schema_version',
  e.occurred_at,
  'legacy_v1',
  NULL,
  NULL,
  NULL
FROM leasemind_app.campaign_event_log e
WHERE e.event_type = 'campaign.subject_linked.v1';

REVOKE ALL ON leasemind_app.campaign_subject_link_projection FROM PUBLIC;
REVOKE ALL ON leasemind_app.analysis_snapshot FROM PUBLIC;
REVOKE ALL ON leasemind_app.analysis_snapshot_idempotency_mapping FROM PUBLIC;

GRANT USAGE ON SCHEMA leasemind_app TO lmapp_analysis_writer;
GRANT EXECUTE ON FUNCTION leasemind_app.jsonb_object_key_count(jsonb)
  TO lmapp_analysis_writer;
GRANT EXECUTE ON FUNCTION leasemind_app.is_valid_metric_envelope(jsonb)
  TO lmapp_analysis_writer;

GRANT SELECT (
  property_id, revision, lifecycle_status, created_at, updated_at,
  property_type, property_country_code, property_region, property_city, property_districts,
  property_area_sqm, property_floor, property_total_floors, property_entrance_type, property_condition,
  property_available_from, property_monthly_rent_rub, property_operating_expenses_included,
  property_utilities_included, property_security_deposit_rub, property_min_lease_months,
  property_allowed_business_categories, property_excluded_business_categories,
  property_target_tenant_categories, property_power_kw, property_ceiling_height_m, property_features,
  property_parking_spaces, property_loading_access, property_access_mode, property_deal_priority
) ON leasemind_app.property TO lmapp_analysis_writer;

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
) ON leasemind_app.tenant_request TO lmapp_analysis_writer;

GRANT SELECT ON leasemind_app.campaign_subject_link_projection TO lmapp_analysis_writer;

GRANT SELECT (
  analysis_snapshot_id, technical_assignment_id, source_revision, scenario, analysis_kind,
  campaign_id, calculation_attempt, status, schema_version, method_version,
  country_code, currency, locale, area_unit, rent_period,
  input_fingerprint, evidence_dataset_revision, evidence_as_of,
  results, failure, created_at, generated_at
) ON leasemind_app.analysis_snapshot TO lmapp_analysis_writer;

GRANT INSERT (
  analysis_snapshot_id, property_id, tenant_request_id, source_revision, scenario,
  analysis_kind, campaign_id, calculation_attempt, status, schema_version, method_version,
  country_code, currency, locale, area_unit, rent_period, input_fingerprint
) ON leasemind_app.analysis_snapshot TO lmapp_analysis_writer;

GRANT UPDATE (
  status, generated_at, results, failure, evidence_as_of, evidence_dataset_revision
) ON leasemind_app.analysis_snapshot TO lmapp_analysis_writer;

GRANT SELECT (idempotency_key, command_hash, analysis_snapshot_id, retry_of_analysis_snapshot_id)
  ON leasemind_app.analysis_snapshot_idempotency_mapping TO lmapp_analysis_writer;
GRANT INSERT (idempotency_key, command_hash, analysis_snapshot_id, retry_of_analysis_snapshot_id)
  ON leasemind_app.analysis_snapshot_idempotency_mapping TO lmapp_analysis_writer;

GRANT SELECT (
  analysis_snapshot_id, technical_assignment_id, source_revision, scenario, analysis_kind,
  campaign_id, calculation_attempt, status, schema_version, method_version,
  country_code, currency, locale, area_unit, rent_period,
  input_fingerprint, evidence_dataset_revision, evidence_as_of,
  results, failure, created_at, generated_at
) ON leasemind_app.analysis_snapshot TO lmapp_api_reader;
GRANT SELECT (campaign_id, scenario, technical_assignment_id, source_revision)
  ON leasemind_app.campaign_subject_link_projection TO lmapp_api_reader;

GRANT SELECT (
  analysis_snapshot_id, technical_assignment_id, scenario, source_revision,
  analysis_kind, status, campaign_id, evidence_dataset_revision
) ON leasemind_app.analysis_snapshot TO lmapp_campaign_writer;
GRANT SELECT, INSERT ON leasemind_app.campaign_subject_link_projection TO lmapp_campaign_writer;
