-- Add only the additional grant-expiry lookup index not covered by the existing grants_scope_lookup index.
-- Existing principals unique index, audit_tenant_time, approvals_action_lookup,
-- and rate-limit primary key already cover the other proposed lookup patterns.
-- Apply only after staging schema review and with separate migration approval.
CREATE INDEX IF NOT EXISTS grants_scope_expiry
ON grants (principal_id, tenant_id, product_id, resource_type, resource_id, operation, environment, status, expires_at);
