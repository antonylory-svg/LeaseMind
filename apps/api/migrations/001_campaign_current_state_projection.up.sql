-- 001_campaign_current_state_projection.up.sql
-- Derived READ projection only. This is NOT the canonical source of Campaign
-- business events; the Immutable Event Log (future, separate write-side
-- stage) remains authoritative. Source of the 11 approved Campaign statuses:
-- 03_ARCHITECTURE/ai-manager/LeaseMind_AI_MANAGER_ARCHITECTURE_v1.0.md
-- (Approved, Version 1.0, section 5.1 "Current State Projection" / 5.3
-- "Статусы Campaign"). No PII, payments, Matching, Reveal or Introduction
-- Record data may ever be stored in this schema.

CREATE SCHEMA IF NOT EXISTS leasemind_app;

COMMENT ON SCHEMA leasemind_app IS
  'LeaseMind application-foundation synthetic schema. Contains only derived read projections (e.g. Campaign Current State Projection), never the canonical event source of truth.';

CREATE TYPE leasemind_app.campaign_status AS ENUM (
  'Created',
  'Analyzing',
  'Strategy Building',
  'Searching',
  'Qualifying',
  'Negotiating',
  'Viewing',
  'Deal Support',
  'Completed',
  'Paused',
  'Failed'
);

COMMENT ON TYPE leasemind_app.campaign_status IS
  'Exact 11 approved Campaign statuses (LeaseMind_AI_MANAGER_ARCHITECTURE_v1.0.md, Approved v1.0, section 5.3). No additions, renames or removals without a new approved architecture version.';

CREATE TABLE leasemind_app.campaign_current_state_projection (
  campaign_id uuid PRIMARY KEY
    CHECK (campaign_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[47][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  status leasemind_app.campaign_status NOT NULL,
  aggregate_version bigint NOT NULL DEFAULT 1 CHECK (aggregate_version >= 1),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CHECK (updated_at >= created_at)
);

COMMENT ON TABLE leasemind_app.campaign_current_state_projection IS
  'Derived Current State Projection for synthetic-only Campaign read access (see LeaseMind_AI_MANAGER_ARCHITECTURE_v1.0.md section 5.1). NOT the canonical event source of truth -- the future Immutable Event Log is authoritative. No PII, payments, Matching, Reveal or Introduction Record data permitted.';
COMMENT ON COLUMN leasemind_app.campaign_current_state_projection.campaign_id IS
  'Campaign identity, UUID v4 or v7 only. Derived projection key, not a write-side aggregate root.';
COMMENT ON COLUMN leasemind_app.campaign_current_state_projection.status IS
  'One of the 11 approved Campaign statuses. Read-only derived value, never written by this projection directly.';
COMMENT ON COLUMN leasemind_app.campaign_current_state_projection.aggregate_version IS
  'Monotonic version of the projected state, derived from the future Immutable Event Log.';
COMMENT ON COLUMN leasemind_app.campaign_current_state_projection.created_at IS
  'Server-owned timestamp; never derived from client input.';
COMMENT ON COLUMN leasemind_app.campaign_current_state_projection.updated_at IS
  'Server-owned timestamp; never derived from client input. Never earlier than created_at.';
