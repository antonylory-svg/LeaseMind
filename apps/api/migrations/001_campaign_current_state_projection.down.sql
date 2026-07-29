-- 001_campaign_current_state_projection.down.sql
-- Fully removes the app-foundation synthetic schema created by the matching
-- up migration: the Campaign Current State Projection table, its status
-- enum, and the migration ledger itself (co-located in the same schema so
-- "down" leaves no residue at all).
DROP SCHEMA IF EXISTS leasemind_app CASCADE;
