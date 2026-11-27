const MAX_ID = 128;

function safeId(value, field) {
  if (typeof value !== 'string' || value.length < 1 || value.length > MAX_ID) {
    throw new TypeError(`${field} is invalid`);
  }
  return value;
}

export function requestCorrelationId(request) {
  const supplied = request.headers.get('x-correlation-id') || '';
  return /^[A-Za-z0-9._:-]{1,128}$/.test(supplied) ? supplied : crypto.randomUUID();
}

export async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function audit(db, {
  correlationId, uid, tenantId, productId, resourceId, operation, decision, reasonCode, requestDigest = null,
}) {
  await db.prepare(`
    INSERT INTO lingo_saaae_audit_events
      (event_id, correlation_id, actor_uid, tenant_id, product_id, resource_id, operation, decision, reason_code, request_digest)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    crypto.randomUUID(), correlationId, uid, tenantId, productId, resourceId,
    operation, decision, reasonCode, requestDigest,
  ).run();
}

export async function authorizeD1Request(db, {
  uid, authTime, tenantId, productId, resourceId, operation, routeKey,
  correlationId, requestDigest = null, nowEpoch = Math.floor(Date.now() / 1000),
  rateLimit = 30, windowSeconds = 60,
}) {
  safeId(uid, 'uid');
  safeId(tenantId, 'tenantId');
  safeId(productId, 'productId');
  safeId(resourceId, 'resourceId');
  safeId(operation, 'operation');
  safeId(routeKey, 'routeKey');

  const scope = { correlationId, uid, tenantId, productId, resourceId, operation, requestDigest };
  const principal = await db.prepare(`
    SELECT status, token_valid_after_epoch
      FROM lingo_saaae_principals
     WHERE firebase_uid = ?
  `).bind(uid).first();

  let reasonCode = 'ALLOW';
  if (!principal || principal.status !== 'active' || !Number.isSafeInteger(authTime)
      || authTime < principal.token_valid_after_epoch) {
    reasonCode = 'PRINCIPAL_INACTIVE_OR_REVOKED';
  }

  if (reasonCode === 'ALLOW') {
    const membership = await db.prepare(`
      SELECT status FROM lingo_saaae_tenant_memberships
       WHERE firebase_uid = ? AND tenant_id = ?
    `).bind(uid, tenantId).first();
    if (!membership || membership.status !== 'active') reasonCode = 'TENANT_MEMBERSHIP_REQUIRED';
  }

  if (reasonCode === 'ALLOW') {
    const grants = await db.prepare(`
      SELECT effect
        FROM lingo_saaae_grants
       WHERE firebase_uid = ? AND tenant_id = ? AND product_id = ?
         AND resource_id = ? AND operation = ? AND status = 'active'
         AND valid_from <= strftime('%Y-%m-%dT%H:%M:%fZ','now')
         AND (expires_at IS NULL OR expires_at > strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    `).bind(uid, tenantId, productId, resourceId, operation).all();
    const effects = grants?.results?.map((row) => row.effect) || [];
    if (effects.includes('deny')) reasonCode = 'EXPLICIT_DENY_GRANT';
    else if (!effects.includes('allow')) reasonCode = 'EXACT_SCOPE_GRANT_REQUIRED';
  }

  if (reasonCode !== 'ALLOW') {
    await audit(db, { ...scope, decision: 'deny', reasonCode });
    return { ok: false, reasonCode };
  }

  const windowStart = Math.floor(nowEpoch / windowSeconds) * windowSeconds;
  const bucketKey = await sha256Hex(JSON.stringify([uid, routeKey, windowStart]));
  const bucket = await db.prepare(`
    INSERT INTO lingo_saaae_rate_limit_buckets
      (bucket_key, firebase_uid, route_key, window_start_epoch, request_count)
    VALUES (?, ?, ?, ?, 1)
    ON CONFLICT(bucket_key) DO UPDATE SET
      request_count = lingo_saaae_rate_limit_buckets.request_count + 1,
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
    WHERE lingo_saaae_rate_limit_buckets.request_count < ?
    RETURNING request_count
  `).bind(bucketKey, uid, routeKey, windowStart, rateLimit).first();

  if (!bucket) {
    await audit(db, { ...scope, decision: 'rate_limited', reasonCode: 'RATE_LIMIT_EXCEEDED' });
    return { ok: false, reasonCode: 'RATE_LIMIT_EXCEEDED' };
  }

  await audit(db, { ...scope, decision: 'allow', reasonCode: 'EXACT_SCOPE_GRANT_MATCH' });
  return { ok: true, correlationId, remaining: Math.max(0, rateLimit - bucket.request_count) };
}

export async function verifyPendingApproval(db, {
  approvalId, uid, tenantId, productId, resourceId, operation, actionDigest,
}) {
  if (typeof approvalId !== 'string' || approvalId.length < 1 || approvalId.length > MAX_ID) return false;
  const row = await db.prepare(`
    SELECT approval_id
      FROM lingo_saaae_approvals
     WHERE approval_id = ? AND requester_uid = ? AND tenant_id = ?
       AND product_id = ? AND resource_id = ? AND operation = ?
       AND action_digest = ? AND status = 'approved'
       AND expires_at > strftime('%Y-%m-%dT%H:%M:%fZ','now')
  `).bind(approvalId, uid, tenantId, productId, resourceId, operation, actionDigest).first();
  return Boolean(row);
}

export async function issueSpinApprovalD1(db, {
  approvalId, requesterUid, approverUid, approverAuthTime, tenantId, productId,
  resourceId, actionDigest, expiresAt, correlationId, nowMs = Date.now(),
}) {
  safeId(approvalId, 'approvalId');
  safeId(requesterUid, 'requesterUid');
  safeId(approverUid, 'approverUid');
  safeId(tenantId, 'tenantId');
  safeId(productId, 'productId');
  safeId(resourceId, 'resourceId');
  safeId(correlationId, 'correlationId');
  if (requesterUid === approverUid) throw new TypeError('requester and approver must differ');
  if (!Number.isSafeInteger(approverAuthTime)) throw new TypeError('approverAuthTime is invalid');
  if (typeof actionDigest !== 'string' || !/^[0-9a-f]{64}$/.test(actionDigest)) {
    throw new TypeError('actionDigest is invalid');
  }
  const expiryMs = Date.parse(expiresAt);
  if (!Number.isFinite(expiryMs) || expiryMs <= nowMs || expiryMs > nowMs + 5 * 60 * 1000
      || new Date(expiryMs).toISOString() !== expiresAt) {
    throw new TypeError('approval expiry must be ISO-8601 and no more than five minutes ahead');
  }

  const insert = db.prepare(`
    INSERT INTO lingo_saaae_approvals
      (approval_id, tenant_id, product_id, resource_id, operation, action_digest,
       requester_uid, approver_uid, approver_auth_time_epoch, status, expires_at)
    SELECT ?, ?, ?, ?, 'spin', ?, ?, ?, ?, 'approved', ?
     WHERE ? <> ?
       AND EXISTS (
         SELECT 1 FROM lingo_saaae_principals p
          WHERE p.firebase_uid = ? AND p.status = 'active'
       )
       AND EXISTS (
         SELECT 1 FROM lingo_saaae_tenant_memberships m
          WHERE m.firebase_uid = ? AND m.tenant_id = ? AND m.status = 'active'
       )
       AND EXISTS (
         SELECT 1 FROM lingo_saaae_grants g
          WHERE g.firebase_uid = ? AND g.tenant_id = ? AND g.product_id = ?
            AND g.resource_id = ? AND g.operation = 'spin'
            AND g.effect = 'allow' AND g.status = 'active'
            AND g.valid_from <= strftime('%Y-%m-%dT%H:%M:%fZ','now')
            AND (g.expires_at IS NULL OR g.expires_at > strftime('%Y-%m-%dT%H:%M:%fZ','now'))
       )
       AND NOT EXISTS (
         SELECT 1 FROM lingo_saaae_grants g
          WHERE g.firebase_uid = ? AND g.tenant_id = ? AND g.product_id = ?
            AND g.resource_id = ? AND g.operation = 'spin'
            AND g.effect = 'deny' AND g.status = 'active'
            AND g.valid_from <= strftime('%Y-%m-%dT%H:%M:%fZ','now')
            AND (g.expires_at IS NULL OR g.expires_at > strftime('%Y-%m-%dT%H:%M:%fZ','now'))
       )
       AND EXISTS (
         SELECT 1 FROM lingo_saaae_principals p
          WHERE p.firebase_uid = ? AND p.status = 'active'
            AND p.token_valid_after_epoch <= ?
       )
       AND EXISTS (
         SELECT 1 FROM lingo_saaae_tenant_memberships m
          WHERE m.firebase_uid = ? AND m.tenant_id = ? AND m.status = 'active'
       )
       AND EXISTS (
         SELECT 1 FROM lingo_saaae_grants g
          WHERE g.firebase_uid = ? AND g.tenant_id = ? AND g.product_id = ?
            AND g.resource_id = ? AND g.operation = 'approval.approve'
            AND g.effect = 'allow' AND g.status = 'active'
            AND g.valid_from <= strftime('%Y-%m-%dT%H:%M:%fZ','now')
            AND (g.expires_at IS NULL OR g.expires_at > strftime('%Y-%m-%dT%H:%M:%fZ','now'))
       )
       AND NOT EXISTS (
         SELECT 1 FROM lingo_saaae_grants g
          WHERE g.firebase_uid = ? AND g.tenant_id = ? AND g.product_id = ?
            AND g.resource_id = ? AND g.operation = 'approval.approve'
            AND g.effect = 'deny' AND g.status = 'active'
            AND g.valid_from <= strftime('%Y-%m-%dT%H:%M:%fZ','now')
            AND (g.expires_at IS NULL OR g.expires_at > strftime('%Y-%m-%dT%H:%M:%fZ','now'))
       )
  `).bind(
    approvalId, tenantId, productId, resourceId, actionDigest,
    requesterUid, approverUid, approverAuthTime, expiresAt, requesterUid, approverUid,
    requesterUid, requesterUid, tenantId,
    requesterUid, tenantId, productId, resourceId,
    requesterUid, tenantId, productId, resourceId,
    approverUid, approverAuthTime, approverUid, tenantId,
    approverUid, tenantId, productId, resourceId,
    approverUid, tenantId, productId, resourceId,
  );

  const auditIssued = db.prepare(`
    INSERT INTO lingo_saaae_audit_events
      (event_id, correlation_id, actor_uid, tenant_id, product_id, resource_id,
       operation, decision, reason_code, request_digest)
    SELECT ?, ?, ?, ?, ?, ?, 'approval.issue', 'approval_issued', 'APPROVAL_ISSUED', ?
     WHERE EXISTS (SELECT 1 FROM lingo_saaae_approvals WHERE approval_id = ?)
  `).bind(
    crypto.randomUUID(), correlationId, approverUid, tenantId, productId,
    resourceId, actionDigest, approvalId,
  );

  await db.batch([insert, auditIssued]);
  const issued = await db.prepare(
    'SELECT approval_id FROM lingo_saaae_approvals WHERE approval_id = ?'
  ).bind(approvalId).first();
  if (issued) return { ok: true, approvalId, expiresAt };

  await audit(db, {
    correlationId, uid: approverUid, tenantId, productId, resourceId,
    operation: 'approval.issue', decision: 'deny',
    reasonCode: 'REQUESTER_NOT_ELIGIBLE_FOR_SPIN_APPROVAL', requestDigest: actionDigest,
  });
  return { ok: false, reasonCode: 'REQUESTER_NOT_ELIGIBLE_FOR_SPIN_APPROVAL' };
}
