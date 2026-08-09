-- 005_technical_assignment.down.sql
-- Reverts exactly what the matching up migration created. Requires
-- lmapp_ta_writer, lmapp_campaign_writer and lmapp_api_reader to still
-- exist (provisioned separately -- see apps/api/src/db/provisionRoles.ts).

REVOKE SELECT ON leasemind_app.tenant_request FROM lmapp_api_reader;
REVOKE SELECT ON leasemind_app.property FROM lmapp_api_reader;

REVOKE UPDATE (lifecycle_status, updated_at) ON leasemind_app.tenant_request FROM lmapp_campaign_writer;
REVOKE SELECT ON leasemind_app.tenant_request FROM lmapp_campaign_writer;
REVOKE UPDATE (lifecycle_status, updated_at) ON leasemind_app.property FROM lmapp_campaign_writer;
REVOKE SELECT ON leasemind_app.property FROM lmapp_campaign_writer;

REVOKE SELECT, INSERT, UPDATE ON leasemind_app.tenant_request FROM lmapp_ta_writer;
REVOKE SELECT, INSERT, UPDATE ON leasemind_app.property_protected_address FROM lmapp_ta_writer;
REVOKE SELECT, INSERT, UPDATE ON leasemind_app.property FROM lmapp_ta_writer;
REVOKE USAGE ON SCHEMA leasemind_app FROM lmapp_ta_writer;

DROP TABLE IF EXISTS leasemind_app.tenant_request;
DROP TABLE IF EXISTS leasemind_app.property_protected_address;
DROP TABLE IF EXISTS leasemind_app.property;
