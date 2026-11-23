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
  const bucketKey = `${uid}:${routeKey}:${windowStart}`;
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
