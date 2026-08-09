-- 007_tenant_request_rent_rate.down.sql

ALTER TABLE leasemind_app.tenant_request
  DROP COLUMN IF EXISTS request_monthly_rent_rate_max_rub_per_sqm;
