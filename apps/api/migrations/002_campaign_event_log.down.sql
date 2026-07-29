-- 002_campaign_event_log.down.sql
-- Fully removes everything created by the matching up migration: the
-- immutability triggers and their function, the stream head cursor table,
-- and the Campaign Event Log itself. Does not touch leasemind_app or the
-- Current State Projection (migration 001), which is dropped separately by
-- 001's own down migration.
DROP TRIGGER IF EXISTS campaign_event_log_reject_delete ON leasemind_app.campaign_event_log;
DROP TRIGGER IF EXISTS campaign_event_log_reject_update ON leasemind_app.campaign_event_log;
DROP FUNCTION IF EXISTS leasemind_app.reject_campaign_event_log_mutation();
DROP TABLE IF EXISTS leasemind_app.campaign_stream_head;
DROP TABLE IF EXISTS leasemind_app.campaign_event_log;
