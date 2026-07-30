-- 003_least_privilege_grants.up.sql
-- Grants exactly the privileges each constrained runtime identity needs on
-- objects created by migrations 001/002. No tables, columns, constraints,
-- Campaign statuses or business data are touched. Must be applied by the
-- schema owner (lmapp_migrator) -- GRANT/REVOKE on an object requires
-- ownership, not superuser. The three target roles (lmapp_migrator,
-- lmapp_maintainer, lmapp_api_reader) must already exist -- see
-- apps/api/src/db/provisionRoles.ts, run separately before migrate:up.
-- See 03_ARCHITECTURE/decisions/ADR-0005-least-privilege-database-boundary.md.

-- Explicit and defensive: 001/002 never granted anything to PUBLIC on this
-- schema or its tables, so this changes nothing today, but documents and
-- protects the invariant going forward.
REVOKE ALL ON SCHEMA leasemind_app FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA leasemind_app FROM PUBLIC;

-- PostgreSQL grants EXECUTE on newly created functions to PUBLIC by
-- default. Remove it from the existing trigger function (002) and from any
-- future function lmapp_migrator creates in this schema.
REVOKE EXECUTE ON FUNCTION leasemind_app.reject_campaign_event_log_mutation() FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE lmapp_migrator IN SCHEMA leasemind_app
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE lmapp_migrator IN SCHEMA leasemind_app
  REVOKE ALL ON TABLES FROM PUBLIC;

-- API reader: read-only access to exactly the one table the four
-- documented HTTP endpoints use (ADR-0004). No access to
-- campaign_event_log, campaign_stream_head or schema_migrations.
GRANT USAGE ON SCHEMA leasemind_app TO lmapp_api_reader;
GRANT SELECT ON leasemind_app.campaign_current_state_projection TO lmapp_api_reader;

-- Maintenance: exactly the operations apps/api/src/db/campaignEvents.ts
-- performs (append + rebuild). UPDATE on campaign_stream_head is required
-- both for the explicit UPDATE statement and for SELECT ... FOR UPDATE
-- locking. SELECT on campaign_current_state_projection is required by
-- PostgreSQL for INSERT ... ON CONFLICT DO UPDATE even though the SET
-- clause only references EXCLUDED -- confirmed empirically (seed fails
-- with "permission denied" without it). No DELETE, no TRUNCATE, no DDL, no
-- access to schema_migrations.
GRANT USAGE ON SCHEMA leasemind_app TO lmapp_maintainer;
GRANT SELECT, INSERT ON leasemind_app.campaign_event_log TO lmapp_maintainer;
GRANT SELECT, INSERT, UPDATE ON leasemind_app.campaign_stream_head TO lmapp_maintainer;
GRANT SELECT, INSERT, UPDATE ON leasemind_app.campaign_current_state_projection TO lmapp_maintainer;
