-- 004_campaign_command_grants.down.sql
-- Reverts exactly the grants added by the matching up migration. Does not
-- touch tables, columns, business data, or anything owned by migrations
-- 001/002/003. Requires lmapp_campaign_writer to still exist (provisioned
-- separately -- see apps/api/src/db/provisionRoles.ts).

REVOKE SELECT, INSERT, UPDATE ON leasemind_app.campaign_current_state_projection FROM lmapp_campaign_writer;
REVOKE SELECT, INSERT, UPDATE ON leasemind_app.campaign_stream_head FROM lmapp_campaign_writer;
REVOKE SELECT, INSERT ON leasemind_app.campaign_event_log FROM lmapp_campaign_writer;
REVOKE USAGE ON SCHEMA leasemind_app FROM lmapp_campaign_writer;
