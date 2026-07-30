-- 003_least_privilege_grants.down.sql
-- Reverts exactly the grants and default privileges added by the matching
-- up migration. Does not touch tables, columns, business data, or anything
-- owned by migrations 001/002. Requires lmapp_maintainer and
-- lmapp_api_reader to still exist (they are provisioned separately from
-- the migration ledger -- see apps/api/src/db/provisionRoles.ts).

REVOKE SELECT, INSERT, UPDATE ON leasemind_app.campaign_stream_head FROM lmapp_maintainer;
REVOKE SELECT, INSERT ON leasemind_app.campaign_event_log FROM lmapp_maintainer;
REVOKE SELECT, INSERT, UPDATE ON leasemind_app.campaign_current_state_projection FROM lmapp_maintainer;
REVOKE USAGE ON SCHEMA leasemind_app FROM lmapp_maintainer;

REVOKE SELECT ON leasemind_app.campaign_current_state_projection FROM lmapp_api_reader;
REVOKE USAGE ON SCHEMA leasemind_app FROM lmapp_api_reader;

-- Only the function EXECUTE default is restored: PostgreSQL's built-in
-- default already grants nothing to PUBLIC on new tables, so there is
-- nothing to restore there (up.sql's table REVOKE was a defensive no-op).
ALTER DEFAULT PRIVILEGES FOR ROLE lmapp_migrator IN SCHEMA leasemind_app
  GRANT EXECUTE ON FUNCTIONS TO PUBLIC;
GRANT EXECUTE ON FUNCTION leasemind_app.reject_campaign_event_log_mutation() TO PUBLIC;
