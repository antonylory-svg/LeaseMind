-- 007_tenant_request_rent_rate.up.sql
-- Russia-pilot additive constraint: a tenant may cap both the total monthly
-- rent and the monthly rent rate per square metre. The total remains the
-- backward-compatible required field; the rate is nullable when the user
-- chooses total-budget entry mode.

ALTER TABLE leasemind_app.tenant_request
  ADD COLUMN request_monthly_rent_rate_max_rub_per_sqm numeric(12,2);
