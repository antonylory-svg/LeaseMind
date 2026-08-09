-- 005_technical_assignment.up.sql
-- Property and TenantRequest tables implementing the Technical Assignment
-- data contract (02_PRODUCT/CAMPAIGN_TECHNICAL_ASSIGNMENT.md v1.0, PRODUCT
-- approved with non-blocking comments). See
-- 03_ARCHITECTURE/decisions/ADR-0008-technical-assignment-implementation.md.
--
-- TechnicalAssignment is not a separate domain entity (doc §9.1.1): its
-- envelope fields (schema_version, revision, lifecycle_status, timestamps)
-- are columns directly on Property/TenantRequest. `scenario` is not a
-- stored column -- it is implied by which of the two tables a row lives
-- in, so it cannot be spoofed independently of the row's own identity.
-- `technical_assignment_id` and the entity primary key
-- (Property.property_id / TenantRequest.tenant_request_id) are the same
-- server-generated UUID, minted once at first draft save and never
-- reissued.
--
-- Exactly 30 Property fields and 29 TenantRequest fields per the document
-- (doc §7.2 / §8.2), no additions. `property_exact_address` is one of the
-- 30 fields but is physically separated into its own protected table
-- (doc §9.2) so ordinary reads of `property` never see it.

CREATE TABLE leasemind_app.property (
  property_id uuid PRIMARY KEY,
  idempotency_key text NOT NULL,
  schema_version text NOT NULL DEFAULT '1.0',
  revision integer NOT NULL DEFAULT 1,
  lifecycle_status text NOT NULL DEFAULT 'draft',

  property_type text,
  property_type_other text,
  property_country_code text,
  property_region text,
  property_city text,
  property_districts text[] NOT NULL DEFAULT '{}',
  property_area_sqm numeric(10,2),
  property_floor integer,
  property_total_floors integer,
  property_entrance_type text,
  property_condition text,
  property_available_from date,
  property_monthly_rent_rub integer,
  property_operating_expenses_included boolean,
  property_utilities_included boolean,
  property_security_deposit_rub integer,
  property_min_lease_months integer,
  property_allowed_business_categories text[] NOT NULL DEFAULT '{}',
  property_excluded_business_categories text[] NOT NULL DEFAULT '{}',
  property_target_tenant_categories text[] NOT NULL DEFAULT '{}',
  property_business_category_other text,
  property_power_kw numeric(6,2),
  property_ceiling_height_m numeric(4,2),
  property_features text[] NOT NULL DEFAULT '{}',
  property_parking_spaces integer,
  property_loading_access text,
  property_access_mode text,
  property_deal_priority text,
  property_additional_requirements text,

  -- Denormalized flag, never the address itself: lets read-only callers
  -- (lmapp_api_reader) answer "is a protected address on file" without any
  -- grant on property_protected_address (doc 9.2; ADR-0008). Maintained
  -- only by apps/api/src/db/technicalAssignment.ts, in the same statement
  -- that writes property_protected_address.
  has_exact_address boolean NOT NULL DEFAULT false,

  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),

  CONSTRAINT property_lifecycle_status_valid
    CHECK (lifecycle_status IN ('draft', 'ready_for_analysis', 'campaign_started')),
  CONSTRAINT property_revision_positive CHECK (revision >= 1),
  CONSTRAINT property_updated_at_after_created CHECK (updated_at >= created_at)
);

CREATE UNIQUE INDEX property_idempotency_key_key ON leasemind_app.property (idempotency_key);

-- Protected commercial data (doc §9.2): separate table, separate grants.
-- Never joined into ordinary Property reads by application code.
CREATE TABLE leasemind_app.property_protected_address (
  property_id uuid PRIMARY KEY REFERENCES leasemind_app.property (property_id),
  exact_address text,
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE leasemind_app.tenant_request (
  tenant_request_id uuid PRIMARY KEY,
  idempotency_key text NOT NULL,
  schema_version text NOT NULL DEFAULT '1.0',
  revision integer NOT NULL DEFAULT 1,
  lifecycle_status text NOT NULL DEFAULT 'draft',

  request_business_category text,
  request_business_category_other text,
  request_business_stage text,
  request_expected_occupancy_people integer,
  request_country_code text,
  request_region text,
  request_cities text[] NOT NULL DEFAULT '{}',
  request_districts text[] NOT NULL DEFAULT '{}',
  request_location_priorities text[] NOT NULL DEFAULT '{}',
  request_property_types text[] NOT NULL DEFAULT '{}',
  request_property_type_other text,
  request_area_min_sqm numeric(10,2),
  request_area_max_sqm numeric(10,2),
  request_monthly_budget_max_rub integer,
  request_budget_includes_operating_expenses boolean,
  request_condition_options text[] NOT NULL DEFAULT '{}',
  request_move_in_by date,
  request_min_lease_months integer,
  request_power_min_kw numeric(6,2),
  request_ceiling_height_min_m numeric(4,2),
  request_entrance_requirement text,
  request_floor_options text[] NOT NULL DEFAULT '{}',
  request_parking_min_spaces integer,
  request_loading_access_required boolean,
  request_access_mode text,
  request_required_features text[] NOT NULL DEFAULT '{}',
  request_excluded_features text[] NOT NULL DEFAULT '{}',
  request_deal_priority text,
  request_additional_requirements text,

  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),

  CONSTRAINT tenant_request_lifecycle_status_valid
    CHECK (lifecycle_status IN ('draft', 'ready_for_analysis', 'campaign_started')),
  CONSTRAINT tenant_request_revision_positive CHECK (revision >= 1),
  CONSTRAINT tenant_request_updated_at_after_created CHECK (updated_at >= created_at)
);

CREATE UNIQUE INDEX tenant_request_idempotency_key_key ON leasemind_app.tenant_request (idempotency_key);

-- Provenance linkage event type (additive, doc §9.1.4 / §10) is appended
-- to the existing leasemind_app.campaign_event_log by application code
-- (apps/api/src/db/launchCampaign.ts) -- no schema change needed there,
-- event_type/payload are already generic (002_campaign_event_log.up.sql).

REVOKE ALL ON leasemind_app.property FROM PUBLIC;
REVOKE ALL ON leasemind_app.property_protected_address FROM PUBLIC;
REVOKE ALL ON leasemind_app.tenant_request FROM PUBLIC;

-- lmapp_ta_writer: the only role that writes Property/TenantRequest and
-- the only role with any access at all to the protected address table.
GRANT USAGE ON SCHEMA leasemind_app TO lmapp_ta_writer;
GRANT SELECT, INSERT, UPDATE ON leasemind_app.property TO lmapp_ta_writer;
GRANT SELECT, INSERT, UPDATE ON leasemind_app.property_protected_address TO lmapp_ta_writer;
GRANT SELECT, INSERT, UPDATE ON leasemind_app.tenant_request TO lmapp_ta_writer;

-- lmapp_campaign_writer: full-table SELECT (needed to read every payload
-- column for the atomic launch's state check, and because SELECT ... FOR
-- UPDATE row locking requires it) plus a column-level UPDATE restricted to
-- exactly lifecycle_status/updated_at -- launching a Campaign transitions
-- the Technical Assignment to campaign_started, but this role can never
-- write any commercial-fact column (rent, area, categories, ...) even at
-- the database level, and never gets access to property_protected_address.
GRANT SELECT ON leasemind_app.property TO lmapp_campaign_writer;
GRANT UPDATE (lifecycle_status, updated_at) ON leasemind_app.property TO lmapp_campaign_writer;
GRANT SELECT ON leasemind_app.tenant_request TO lmapp_campaign_writer;
GRANT UPDATE (lifecycle_status, updated_at) ON leasemind_app.tenant_request TO lmapp_campaign_writer;

-- lmapp_api_reader: read-only visibility for GET /api/v1/technical-assignments/{id}.
-- Never gets access to property_protected_address.
GRANT SELECT ON leasemind_app.property TO lmapp_api_reader;
GRANT SELECT ON leasemind_app.tenant_request TO lmapp_api_reader;
