-- Staging-only privileged provisioning evidence schema.
-- This adds a separate administrative request/audit plane; it does not grant access,
-- mutate principals/memberships/grants, or alter the runtime authorization path.
-- Do not apply until separately reviewed and staging D1 validation passes.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS lingo_saaae_provisioning_requests (
  request_id TEXT PRIMARY KEY,
  environment TEXT NOT NULL CHECK (environment = 'staging'),
  target_firebase_project TEXT NOT NULL,
  target_firebase_uid TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  operation TEXT NOT NULL,
  effect TEXT NOT NULL CHECK (effect IN ('allow','deny')),
  valid_from TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (length(trim(reason)) BETWEEN 8 AND 1000),
  ticket_reference TEXT NOT NULL,
  request_digest TEXT NOT NULL CHECK (length(request_digest) = 64),
  requester_operator_id TEXT NOT NULL,
  reviewer_operator_id TEXT,
  executor_operator_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','executed','expired','cancelled')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  reviewed_at TEXT,
  executed_at TEXT,
  CHECK (reviewer_operator_id IS NULL OR reviewer_operator_id <> requester_operator_id),
  CHECK (executor_operator_id IS NULL OR executor_operator_id <> requester_operator_id),
  CHECK (executor_operator_id IS NULL OR executor_operator_id <> reviewer_operator_id),
  CHECK (
    (status = 'pending' AND reviewer_operator_id IS NULL AND reviewed_at IS NULL
      AND executor_operator_id IS NULL AND executed_at IS NULL)
    OR (status IN ('approved','rejected') AND reviewer_operator_id IS NOT NULL
      AND reviewed_at IS NOT NULL AND executor_operator_id IS NULL AND executed_at IS NULL)
    OR (status = 'executed' AND reviewer_operator_id IS NOT NULL
      AND reviewed_at IS NOT NULL AND executor_operator_id IS NOT NULL AND executed_at IS NOT NULL)
    OR (status IN ('expired','cancelled'))
  )
);

CREATE INDEX IF NOT EXISTS idx_lingo_saaae_provisioning_target
  ON lingo_saaae_provisioning_requests(target_firebase_uid, tenant_id, product_id, resource_id, operation);
CREATE INDEX IF NOT EXISTS idx_lingo_saaae_provisioning_status
  ON lingo_saaae_provisioning_requests(status, created_at);

CREATE TABLE IF NOT EXISTS lingo_saaae_provisioning_audit (
  event_id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  correlation_id TEXT NOT NULL,
  actor_operator_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'request_submitted','request_approved','request_rejected',
    'request_executed','request_expired','request_cancelled',
    'provisioning_denied','request_replay'
  )),
  reason_code TEXT NOT NULL,
  request_digest TEXT NOT NULL CHECK (length(request_digest) = 64),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY (request_id) REFERENCES lingo_saaae_provisioning_requests(request_id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_lingo_saaae_provisioning_audit_request
  ON lingo_saaae_provisioning_audit(request_id, created_at);


-- Requests may only enter through the pending state. Terminal/approved states
-- require a reviewed transition and cannot be forged by the initial insert.
CREATE TRIGGER IF NOT EXISTS lingo_saaae_provisioning_request_initial_pending
BEFORE INSERT ON lingo_saaae_provisioning_requests
WHEN NEW.status <> 'pending'
BEGIN
  SELECT RAISE(ABORT, 'SAAAE_PROVISIONING_INITIAL_STATE_MUST_BE_PENDING');
END;

-- Expired/cancelled records retain the metadata appropriate to the state
-- from which they transitioned: pending requests have no reviewer/executor;
-- approved requests retain reviewer evidence and have no executor evidence.
CREATE TRIGGER IF NOT EXISTS lingo_saaae_provisioning_terminal_state_metadata
BEFORE UPDATE ON lingo_saaae_provisioning_requests
WHEN NEW.status IN ('expired','cancelled')
 AND NOT (
   (OLD.status = 'pending' AND NEW.reviewer_operator_id IS NULL
     AND NEW.reviewed_at IS NULL AND NEW.executor_operator_id IS NULL
     AND NEW.executed_at IS NULL)
   OR
   (OLD.status = 'approved' AND NEW.reviewer_operator_id IS OLD.reviewer_operator_id
     AND NEW.reviewed_at IS OLD.reviewed_at AND NEW.executor_operator_id IS NULL
     AND NEW.executed_at IS NULL)
 )
BEGIN
  SELECT RAISE(ABORT, 'SAAAE_PROVISIONING_TERMINAL_STATE_METADATA_INVALID');
END;

-- Audit rows must carry the exact immutable digest of their parent request.
CREATE TRIGGER IF NOT EXISTS lingo_saaae_provisioning_audit_digest_match
BEFORE INSERT ON lingo_saaae_provisioning_audit
WHEN NEW.request_digest <> (
  SELECT request_digest FROM lingo_saaae_provisioning_requests
  WHERE request_id = NEW.request_id
)
BEGIN
  SELECT RAISE(ABORT, 'SAAAE_PROVISIONING_AUDIT_DIGEST_MISMATCH');
END;

CREATE TRIGGER IF NOT EXISTS lingo_saaae_provisioning_request_binding_immutable
BEFORE UPDATE ON lingo_saaae_provisioning_requests
WHEN NEW.request_id IS NOT OLD.request_id
  OR NEW.environment IS NOT OLD.environment
  OR NEW.target_firebase_project IS NOT OLD.target_firebase_project
  OR NEW.target_firebase_uid IS NOT OLD.target_firebase_uid
  OR NEW.tenant_id IS NOT OLD.tenant_id
  OR NEW.product_id IS NOT OLD.product_id
  OR NEW.resource_id IS NOT OLD.resource_id
  OR NEW.operation IS NOT OLD.operation
  OR NEW.effect IS NOT OLD.effect
  OR NEW.valid_from IS NOT OLD.valid_from
  OR NEW.expires_at IS NOT OLD.expires_at
  OR NEW.reason IS NOT OLD.reason
  OR NEW.ticket_reference IS NOT OLD.ticket_reference
  OR NEW.request_digest IS NOT OLD.request_digest
  OR NEW.requester_operator_id IS NOT OLD.requester_operator_id
  OR NEW.created_at IS NOT OLD.created_at
BEGIN
  SELECT RAISE(ABORT, 'SAAAE_PROVISIONING_REQUEST_BINDING_IMMUTABLE');
END;

CREATE TRIGGER IF NOT EXISTS lingo_saaae_provisioning_request_state_machine
BEFORE UPDATE ON lingo_saaae_provisioning_requests
WHEN NOT (
  (OLD.status = 'pending' AND NEW.status IN ('approved','rejected','expired','cancelled'))
  OR (OLD.status = 'approved' AND NEW.status IN ('executed','expired','cancelled'))
)
BEGIN
  SELECT RAISE(ABORT, 'SAAAE_PROVISIONING_INVALID_STATE_TRANSITION');
END;

CREATE TRIGGER IF NOT EXISTS lingo_saaae_provisioning_request_no_delete
BEFORE DELETE ON lingo_saaae_provisioning_requests
BEGIN
  SELECT RAISE(ABORT, 'SAAAE_PROVISIONING_REQUEST_RETAINED');
END;

CREATE TRIGGER IF NOT EXISTS lingo_saaae_provisioning_audit_no_update
BEFORE UPDATE ON lingo_saaae_provisioning_audit
BEGIN
  SELECT RAISE(ABORT, 'SAAAE_PROVISIONING_AUDIT_APPEND_ONLY');
END;

CREATE TRIGGER IF NOT EXISTS lingo_saaae_provisioning_audit_no_delete
BEFORE DELETE ON lingo_saaae_provisioning_audit
BEGIN
  SELECT RAISE(ABORT, 'SAAAE_PROVISIONING_AUDIT_APPEND_ONLY');
END;
