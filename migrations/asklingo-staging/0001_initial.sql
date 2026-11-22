-- askLINGO v2 staging-only schema, migration 0001.
-- No production data. No message/conversation body storage by default.
-- Execute only against asklingo-v2-staging-20261122.

CREATE TABLE IF NOT EXISTS principals (
  principal_id TEXT PRIMARY KEY,
  issuer TEXT NOT NULL,
  subject TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active','suspended','revoked')),
  verified_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE (issuer, subject, tenant_id)
);

CREATE TABLE IF NOT EXISTS grants (
  grant_id TEXT PRIMARY KEY,
  principal_id TEXT NOT NULL REFERENCES principals(principal_id),
  tenant_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  operation TEXT NOT NULL,
  environment TEXT NOT NULL CHECK (environment = 'staging'),
  status TEXT NOT NULL CHECK (status IN ('active','revoked','expired')),
  not_before INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  revoked_at INTEGER,
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  CHECK (expires_at > not_before)
);
CREATE INDEX IF NOT EXISTS grants_scope_lookup
  ON grants(principal_id, tenant_id, product_id, resource_type, resource_id, operation, environment, status);

CREATE TABLE IF NOT EXISTS approvals (
  approval_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  requester_principal_id TEXT NOT NULL REFERENCES principals(principal_id),
  approver_principal_id TEXT REFERENCES principals(principal_id),
  action_digest TEXT NOT NULL,
  scope_json TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending','approved','rejected','consumed','revoked','expired')),
  expires_at INTEGER NOT NULL,
  consumed_at INTEGER,
  consumed_by TEXT REFERENCES principals(principal_id),
  revoked_at INTEGER,
  created_at INTEGER NOT NULL,
  CHECK (approver_principal_id IS NULL OR approver_principal_id <> requester_principal_id),
  CHECK ((status = 'consumed' AND consumed_at IS NOT NULL AND consumed_by IS NOT NULL)
      OR (status <> 'consumed' AND consumed_at IS NULL AND consumed_by IS NULL))
);
CREATE INDEX IF NOT EXISTS approvals_action_lookup
  ON approvals(tenant_id, action_digest, status, expires_at);

CREATE TABLE IF NOT EXISTS audit_events (
  event_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  actor_principal_id TEXT,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('user','service','agent','system')),
  event_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  action_digest TEXT,
  decision TEXT CHECK (decision IS NULL OR decision IN ('allow','deny','approve','reject','consume','revoke')),
  correlation_id TEXT NOT NULL,
  occurred_at INTEGER NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS audit_tenant_time
  ON audit_events(tenant_id, occurred_at);
CREATE INDEX IF NOT EXISTS audit_correlation
  ON audit_events(correlation_id);

CREATE TRIGGER IF NOT EXISTS audit_events_no_update
BEFORE UPDATE ON audit_events
BEGIN
  SELECT RAISE(ABORT, 'audit_events are append-only');
END;
CREATE TRIGGER IF NOT EXISTS audit_events_no_delete
BEFORE DELETE ON audit_events
BEGIN
  SELECT RAISE(ABORT, 'audit_events are append-only');
END;

CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  principal_id TEXT NOT NULL,
  route_key TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  request_count INTEGER NOT NULL CHECK (request_count >= 0),
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (principal_id, route_key, window_start)
);

CREATE TABLE IF NOT EXISTS idempotency_keys (
  tenant_id TEXT NOT NULL,
  principal_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  request_digest TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('started','completed','failed')),
  response_code INTEGER,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  PRIMARY KEY (tenant_id, principal_id, idempotency_key)
);
CREATE INDEX IF NOT EXISTS idempotency_expiry
  ON idempotency_keys(expires_at);
