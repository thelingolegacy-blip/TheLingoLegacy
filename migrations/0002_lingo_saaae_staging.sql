-- SAAAE runtime foundation for the isolated game-engine staging branch.
-- Additive only: preserve all existing wallet/session/ledger rows and triggers.
-- Do not apply to a live D1 database until reviewed migration tests and approvals pass.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS lingo_saaae_principals (
  firebase_uid TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','revoked')),
  token_valid_after_epoch INTEGER NOT NULL DEFAULT 0 CHECK (token_valid_after_epoch >= 0),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS lingo_saaae_tenant_memberships (
  membership_id TEXT PRIMARY KEY,
  firebase_uid TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','revoked')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (firebase_uid, tenant_id),
  FOREIGN KEY (firebase_uid) REFERENCES lingo_saaae_principals(firebase_uid) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS lingo_saaae_grants (
  grant_id TEXT PRIMARY KEY,
  firebase_uid TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  operation TEXT NOT NULL,
  effect TEXT NOT NULL DEFAULT 'allow' CHECK (effect IN ('allow','deny')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked','expired')),
  valid_from TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  expires_at TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY (firebase_uid, tenant_id)
    REFERENCES lingo_saaae_tenant_memberships(firebase_uid, tenant_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS lingo_saaae_approvals (
  approval_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  operation TEXT NOT NULL,
  action_digest TEXT NOT NULL,
  requester_uid TEXT NOT NULL,
  approver_uid TEXT NOT NULL,
  approver_auth_time_epoch INTEGER NOT NULL DEFAULT 0 CHECK (approver_auth_time_epoch >= 0),
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending','approved','rejected','consumed','expired','revoked')),
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  consumed_by TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY (requester_uid) REFERENCES lingo_saaae_principals(firebase_uid) ON DELETE RESTRICT,
  FOREIGN KEY (approver_uid) REFERENCES lingo_saaae_principals(firebase_uid) ON DELETE RESTRICT,
  CHECK (requester_uid <> approver_uid),
  CHECK ((status = 'consumed' AND consumed_at IS NOT NULL AND consumed_by IS NOT NULL)
      OR (status <> 'consumed' AND consumed_at IS NULL AND consumed_by IS NULL))
);

CREATE TABLE IF NOT EXISTS lingo_saaae_audit_events (
  event_id TEXT PRIMARY KEY,
  correlation_id TEXT NOT NULL,
  actor_uid TEXT,
  tenant_id TEXT,
  product_id TEXT,
  resource_id TEXT,
  operation TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('allow','deny','approval_required','approval_issued','approval_consumed','rate_limited','error')),
  reason_code TEXT NOT NULL,
  request_digest TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS lingo_saaae_rate_limit_buckets (
  bucket_key TEXT PRIMARY KEY,
  firebase_uid TEXT NOT NULL,
  route_key TEXT NOT NULL,
  window_start_epoch INTEGER NOT NULL CHECK (window_start_epoch >= 0),
  request_count INTEGER NOT NULL CHECK (request_count >= 0),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY (firebase_uid) REFERENCES lingo_saaae_principals(firebase_uid) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_lingo_saaae_membership_status
  ON lingo_saaae_tenant_memberships(firebase_uid, tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_lingo_saaae_grants_scope
  ON lingo_saaae_grants(firebase_uid, tenant_id, product_id, resource_id, operation, status);
CREATE INDEX IF NOT EXISTS idx_lingo_saaae_approvals_action
  ON lingo_saaae_approvals(tenant_id, product_id, resource_id, operation, action_digest, status);
CREATE INDEX IF NOT EXISTS idx_lingo_saaae_audit_correlation
  ON lingo_saaae_audit_events(correlation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_lingo_saaae_rate_window
  ON lingo_saaae_rate_limit_buckets(firebase_uid, route_key, window_start_epoch);

CREATE TRIGGER IF NOT EXISTS lingo_saaae_audit_no_update
BEFORE UPDATE ON lingo_saaae_audit_events
BEGIN
  SELECT RAISE(ABORT, 'SAAAE_AUDIT_IS_APPEND_ONLY');
END;
CREATE TRIGGER IF NOT EXISTS lingo_saaae_audit_no_delete
BEFORE DELETE ON lingo_saaae_audit_events
BEGIN
  SELECT RAISE(ABORT, 'SAAAE_AUDIT_IS_APPEND_ONLY');
END;
-- Approval bindings are immutable; a consumed approval is terminal and retained.
CREATE TRIGGER IF NOT EXISTS lingo_saaae_approval_binding_immutable
BEFORE UPDATE ON lingo_saaae_approvals
WHEN NEW.approval_id IS NOT OLD.approval_id
  OR NEW.tenant_id IS NOT OLD.tenant_id
  OR NEW.product_id IS NOT OLD.product_id
  OR NEW.resource_id IS NOT OLD.resource_id
  OR NEW.operation IS NOT OLD.operation
  OR NEW.action_digest IS NOT OLD.action_digest
  OR NEW.requester_uid IS NOT OLD.requester_uid
  OR NEW.approver_uid IS NOT OLD.approver_uid
  OR NEW.approver_auth_time_epoch IS NOT OLD.approver_auth_time_epoch
  OR NEW.expires_at IS NOT OLD.expires_at
  OR NEW.created_at IS NOT OLD.created_at
BEGIN
  SELECT RAISE(ABORT, 'SAAAE_APPROVAL_BINDING_IS_IMMUTABLE');
END;

CREATE TRIGGER IF NOT EXISTS lingo_saaae_approval_consumed_terminal
BEFORE UPDATE ON lingo_saaae_approvals
WHEN OLD.status = 'consumed'
BEGIN
  SELECT RAISE(ABORT, 'SAAAE_APPROVAL_CONSUMPTION_IS_TERMINAL');
END;

CREATE TRIGGER IF NOT EXISTS lingo_saaae_approval_no_delete
BEFORE DELETE ON lingo_saaae_approvals
BEGIN
  SELECT RAISE(ABORT, 'SAAAE_APPROVAL_RECORD_IS_RETAINED');
END;
