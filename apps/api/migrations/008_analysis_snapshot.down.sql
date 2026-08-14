-- 008_analysis_snapshot.down.sql
-- Reverts only migration 008. Migration 010 and 009 must already be down.

REVOKE SELECT (
  property_id, revision, lifecycle_status, created_at, updated_at,
  property_type, property_country_code, property_region, property_city, property_districts,
  property_area_sqm, property_floor, property_total_floors, property_entrance_type, property_condition,
  property_available_from, property_monthly_rent_rub, property_operating_expenses_included,
  property_utilities_included, property_security_deposit_rub, property_min_lease_months,
  property_allowed_business_categories, property_excluded_business_categories,
  property_target_tenant_categories, property_power_kw, property_ceiling_height_m, property_features,
  property_parking_spaces, property_loading_access, property_access_mode, property_deal_priority
) ON leasemind_app.property FROM lmapp_analysis_writer;

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
) ON leasemind_app.tenant_request FROM lmapp_analysis_writer;

REVOKE SELECT, INSERT ON leasemind_app.campaign_subject_link_projection FROM lmapp_campaign_writer;
REVOKE SELECT (campaign_id, scenario, technical_assignment_id, source_revision)
  ON leasemind_app.campaign_subject_link_projection FROM lmapp_api_reader;
REVOKE SELECT ON leasemind_app.campaign_subject_link_projection FROM lmapp_analysis_writer;

REVOKE SELECT (
  analysis_snapshot_id, technical_assignment_id, scenario, source_revision,
  analysis_kind, status, campaign_id, evidence_dataset_revision
) ON leasemind_app.analysis_snapshot FROM lmapp_campaign_writer;

REVOKE SELECT (
  analysis_snapshot_id, technical_assignment_id, source_revision, scenario, analysis_kind,
  campaign_id, calculation_attempt, status, schema_version, method_version,
  country_code, currency, locale, area_unit, rent_period,
  input_fingerprint, evidence_dataset_revision, evidence_as_of,
  results, failure, created_at, generated_at
) ON leasemind_app.analysis_snapshot FROM lmapp_api_reader;

REVOKE UPDATE (
  status, generated_at, results, failure, evidence_as_of, evidence_dataset_revision
) ON leasemind_app.analysis_snapshot FROM lmapp_analysis_writer;
REVOKE INSERT (
  analysis_snapshot_id, property_id, tenant_request_id, source_revision, scenario,
  analysis_kind, campaign_id, calculation_attempt, status, schema_version, method_version,
  country_code, currency, locale, area_unit, rent_period, input_fingerprint
) ON leasemind_app.analysis_snapshot FROM lmapp_analysis_writer;
REVOKE SELECT (
  analysis_snapshot_id, technical_assignment_id, source_revision, scenario, analysis_kind,
  campaign_id, calculation_attempt, status, schema_version, method_version,
  country_code, currency, locale, area_unit, rent_period,
  input_fingerprint, evidence_dataset_revision, evidence_as_of,
  results, failure, created_at, generated_at
) ON leasemind_app.analysis_snapshot FROM lmapp_analysis_writer;

REVOKE INSERT (idempotency_key, command_hash, analysis_snapshot_id, retry_of_analysis_snapshot_id)
  ON leasemind_app.analysis_snapshot_idempotency_mapping FROM lmapp_analysis_writer;
REVOKE SELECT (idempotency_key, command_hash, analysis_snapshot_id, retry_of_analysis_snapshot_id)
  ON leasemind_app.analysis_snapshot_idempotency_mapping FROM lmapp_analysis_writer;

REVOKE EXECUTE ON FUNCTION leasemind_app.is_valid_metric_envelope(jsonb)
  FROM lmapp_analysis_writer;
REVOKE EXECUTE ON FUNCTION leasemind_app.jsonb_object_key_count(jsonb)
  FROM lmapp_analysis_writer;
REVOKE USAGE ON SCHEMA leasemind_app FROM lmapp_analysis_writer;

REVOKE EXECUTE ON FUNCTION leasemind_app.reject_analysis_snapshot_idempotency_mapping_mutation() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION leasemind_app.reject_analysis_snapshot_immutable_mutation() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION leasemind_app.is_valid_metric_envelope(jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION leasemind_app.jsonb_object_key_count(jsonb) FROM PUBLIC;

DROP TRIGGER IF EXISTS analysis_snapshot_idempotency_mapping_reject_delete
  ON leasemind_app.analysis_snapshot_idempotency_mapping;
DROP TRIGGER IF EXISTS analysis_snapshot_idempotency_mapping_reject_update
  ON leasemind_app.analysis_snapshot_idempotency_mapping;
DROP FUNCTION IF EXISTS leasemind_app.reject_analysis_snapshot_idempotency_mapping_mutation();

DROP TRIGGER IF EXISTS analysis_snapshot_reject_invalid_update
  ON leasemind_app.analysis_snapshot;
DROP TRIGGER IF EXISTS analysis_snapshot_reject_delete
  ON leasemind_app.analysis_snapshot;
DROP FUNCTION IF EXISTS leasemind_app.reject_analysis_snapshot_immutable_mutation();

ALTER TABLE leasemind_app.campaign_subject_link_projection
  DROP CONSTRAINT IF EXISTS campaign_subject_link_projection_analysis_snapshot_fk;

DROP TABLE IF EXISTS leasemind_app.analysis_snapshot_idempotency_mapping;
DROP TABLE IF EXISTS leasemind_app.analysis_snapshot;
DROP TABLE IF EXISTS leasemind_app.campaign_subject_link_projection;
DROP FUNCTION IF EXISTS leasemind_app.is_valid_metric_envelope(jsonb);
DROP FUNCTION IF EXISTS leasemind_app.jsonb_object_key_count(jsonb);
