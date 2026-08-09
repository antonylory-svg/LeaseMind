-- 004_campaign_command_grants.up.sql
-- Grants exactly the privileges the synthetic Campaign creation HTTP command
-- (apps/api/src/db/createCampaign.ts) needs, to a role dedicated to that one
-- HTTP-triggered write path -- never lmapp_migrator, lmapp_maintainer or the
-- bootstrap identity. Same object-level shape as lmapp_maintainer's grants
-- (003), but a distinct role/credential so the HTTP runtime process never
-- holds the same privileges as offline migration/maintenance tooling. Must
-- be applied by the schema owner (lmapp_migrator). The role must already
-- exist -- see apps/api/src/db/provisionRoles.ts, run separately before
-- migrate:up. See
-- 03_ARCHITECTURE/decisions/ADR-0007-synthetic-campaign-creation-command-boundary.md.

GRANT USAGE ON SCHEMA leasemind_app TO lmapp_campaign_writer;
GRANT SELECT, INSERT ON leasemind_app.campaign_event_log TO lmapp_campaign_writer;
GRANT SELECT, INSERT, UPDATE ON leasemind_app.campaign_stream_head TO lmapp_campaign_writer;
GRANT SELECT, INSERT, UPDATE ON leasemind_app.campaign_current_state_projection TO lmapp_campaign_writer;
