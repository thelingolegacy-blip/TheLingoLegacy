-- Add lookup indexes to the existing dedicated askLINGO staging D1 schema.
-- Apply only after reviewing the migration against the live staging database.
CREATE INDEX IF NOT EXISTS idx_principals_issuer_subject_status ON principals (issuer, subject, status);
CREATE INDEX IF NOT EXISTS idx_grants_scope_active ON grants (principal_id, tenant_id, product_id, resource_type, resource_id, operation, environment, status, expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_events_tenant_time ON audit_events (tenant_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_approvals_tenant_status_expiry ON approvals (tenant_id, status, expires_at);
CREATE INDEX IF NOT EXISTS idx_rate_limit_buckets_updated ON rate_limit_buckets (updated_at);
