-- 009_post_launch_refresh_intent.down.sql
-- Reverts only migration 009. The bootstrap NOLOGIN owner role persists.

REVOKE SELECT (
  property_id, revision, lifecycle_status, created_at, updated_at,
  property_type, property_country_code, property_region, property_city, property_districts,
  property_area_sqm, property_floor, property_total_floors, property_entrance_type, property_condition,
  property_available_from, property_monthly_rent_rub, property_operating_expenses_included,
  property_utilities_included, property_security_deposit_rub, property_min_lease_months,
  property_allowed_business_categories, property_excluded_business_categories,
  property_target_tenant_categories, property_power_kw, property_ceiling_height_m, property_features,
  property_parking_spaces, property_loading_access, property_access_mode, property_deal_priority
) ON leasemind_app.property FROM lmapp_analysis_worker;

REVOKE SELECT (
  tenant_request_id, revision, lifecycle_status, created_at, updated_at,
  request_business_category, request_business_stage, request_expected_occupancy_people,
  request_country_code, request_region, request_cities, request_districts, request_location_priorities,
  request_property_types, request_area_min_sqm, request_area_max_sqm, request_monthly_budget_max_rub,
  request_monthly_rent_rate_max_rub_per_sqm, request_budget_includes_operating_expenses,
  request_condition_options, request_move_in_by, request_min_lease_months, request_power_min_kw,
  request_ceiling_height_min_m, request_entrance_requirement, request_floor_options,
  request_parking_min_spaces, request_loading_access_required, request_access_mode,
  request_required_features, request_excluded_features, request_deal_priority
) ON leasemind_app.tenant_request FROM lmapp_analysis_worker;

REVOKE UPDATE (
  status, generated_at, results, failure, evidence_as_of, evidence_dataset_revision
) ON leasemind_app.analysis_snapshot FROM lmapp_analysis_worker;
REVOKE INSERT (
  analysis_snapshot_id, property_id, tenant_request_id, source_revision, scenario,
  analysis_kind, campaign_id, calculation_attempt, status, schema_version, method_version,
  country_code, currency, locale, area_unit, rent_period, input_fingerprint
) ON leasemind_app.analysis_snapshot FROM lmapp_analysis_worker;
REVOKE SELECT (
  analysis_snapshot_id, technical_assignment_id, source_revision, scenario, analysis_kind,
  campaign_id, calculation_attempt, status, schema_version, method_version,
  country_code, currency, locale, area_unit, rent_period,
  input_fingerprint, evidence_dataset_revision, evidence_as_of,
  results, failure, created_at, generated_at
) ON leasemind_app.analysis_snapshot FROM lmapp_analysis_worker;

REVOKE INSERT (idempotency_key, command_hash, analysis_snapshot_id, retry_of_analysis_snapshot_id)
  ON leasemind_app.analysis_snapshot_idempotency_mapping FROM lmapp_analysis_worker;
REVOKE SELECT (idempotency_key, command_hash, analysis_snapshot_id, retry_of_analysis_snapshot_id)
  ON leasemind_app.analysis_snapshot_idempotency_mapping FROM lmapp_analysis_worker;
REVOKE EXECUTE ON FUNCTION leasemind_app.is_valid_metric_envelope(jsonb)
  FROM lmapp_analysis_worker;
REVOKE EXECUTE ON FUNCTION leasemind_app.jsonb_object_key_count(jsonb)
  FROM lmapp_analysis_worker;
REVOKE USAGE ON SCHEMA leasemind_app FROM lmapp_analysis_worker;

SET ROLE lmapp_post_launch_refresh_owner;

REVOKE INSERT (
  campaign_id, property_id, tenant_request_id, scenario, source_revision,
  analysis_kind, status, launched_at
) ON leasemind_app.post_launch_refresh_intent FROM lmapp_campaign_writer;

REVOKE EXECUTE ON FUNCTION leasemind_app.claim_post_launch_refresh_intent(text, integer)
  FROM lmapp_analysis_worker;
REVOKE EXECUTE ON FUNCTION leasemind_app.renew_post_launch_refresh_intent_lease(uuid, text, integer)
  FROM lmapp_analysis_worker;
REVOKE EXECUTE ON FUNCTION leasemind_app.complete_post_launch_refresh_intent(uuid, text, integer, uuid)
  FROM lmapp_analysis_worker;
REVOKE EXECUTE ON FUNCTION leasemind_app.fail_post_launch_refresh_intent(uuid, text, integer, uuid)
  FROM lmapp_analysis_worker;
REVOKE EXECUTE ON FUNCTION leasemind_app.mark_post_launch_refresh_intent_sla_breach(uuid)
  FROM lmapp_analysis_worker;
REVOKE EXECUTE ON FUNCTION leasemind_app.request_post_launch_refresh_retry(uuid, uuid)
  FROM lmapp_analysis_writer;

DROP FUNCTION IF EXISTS leasemind_app.mark_post_launch_refresh_intent_sla_breach(uuid);
DROP FUNCTION IF EXISTS leasemind_app.request_post_launch_refresh_retry(uuid, uuid);
DROP FUNCTION IF EXISTS leasemind_app.fail_post_launch_refresh_intent(uuid, text, integer, uuid);
DROP FUNCTION IF EXISTS leasemind_app.complete_post_launch_refresh_intent(uuid, text, integer, uuid);
DROP FUNCTION IF EXISTS leasemind_app.renew_post_launch_refresh_intent_lease(uuid, text, integer);
DROP FUNCTION IF EXISTS leasemind_app.claim_post_launch_refresh_intent(text, integer);

DROP TRIGGER IF EXISTS post_launch_refresh_intent_enforce_transition
  ON leasemind_app.post_launch_refresh_intent;
DROP TRIGGER IF EXISTS post_launch_refresh_intent_reject_delete
  ON leasemind_app.post_launch_refresh_intent;
DROP FUNCTION IF EXISTS leasemind_app.enforce_post_launch_refresh_intent_transition();
DROP TABLE IF EXISTS leasemind_app.post_launch_refresh_intent;

RESET ROLE;

REVOKE SELECT (
  analysis_snapshot_id, status, failure, technical_assignment_id, source_revision,
  analysis_kind, campaign_id, calculation_attempt
) ON leasemind_app.analysis_snapshot FROM lmapp_post_launch_refresh_owner;
REVOKE SELECT (analysis_snapshot_id, retry_of_analysis_snapshot_id)
  ON leasemind_app.analysis_snapshot_idempotency_mapping
  FROM lmapp_post_launch_refresh_owner;
REVOKE USAGE ON SCHEMA leasemind_app FROM lmapp_post_launch_refresh_owner;
