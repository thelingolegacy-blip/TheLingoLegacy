const SCOPE_FIELDS = Object.freeze([
  'tenantId', 'productId', 'resourceType', 'resourceId', 'operation', 'environment'
]);
const RISK_TIERS = new Set(['low', 'medium', 'high', 'critical']);
const APPROVAL_RISK_TIERS = new Set(['high', 'critical']);

/**
 * Evaluate one exact, server-side authorization request.
 * This is a policy primitive, not an identity provider or persistence layer.
 * principal.verified must only be set after trusted server-side verification.
 */
export function evaluateAskLingoPolicy({ principal, action, grants, now = Date.now() } = {}) {
  if (!Number.isFinite(now)) return deny('INVALID_EVALUATION_TIME');
  if (!isVerifiedPrincipal(principal, now)) return deny('IDENTITY_NOT_VERIFIED');
  if (!isValidAction(action)) return deny('INVALID_OR_AMBIGUOUS_SCOPE');
  if (!Array.isArray(grants)) return deny('GRANTS_UNAVAILABLE');

  const grant = grants.find((candidate) => matchesGrant(candidate, principal, action, now));
  if (!grant) return deny('NO_EXACT_SCOPE_GRANT');

  const approvalRequired = action.requiresApproval === true || APPROVAL_RISK_TIERS.has(action.riskTier);
  return {
    decision: approvalRequired ? 'ALLOW_PENDING_APPROVAL' : 'ALLOW',
    reason: approvalRequired ? 'EXACT_GRANT_APPROVAL_REQUIRED' : 'EXACT_GRANT_MATCHED',
    approvalRequired,
    grantId: grant.grantId,
    policyVersion: 'asklingo-saaae-v2.0.0'
  };
}

/** Build a deterministic SHA-256 digest for the exact action being approved. */
export async function digestAskLingoAction(action) {
  if (!isValidAction(action)) throw new TypeError('Action scope is invalid or ambiguous.');
  const canonical = canonicalize({
    tenantId: action.tenantId,
    productId: action.productId,
    resourceType: action.resourceType,
    resourceId: action.resourceId,
    operation: action.operation,
    environment: action.environment,
    capability: action.capability,
    riskTier: action.riskTier,
    requiresApproval: action.requiresApproval === true,
    idempotencyKey: action.idempotencyKey ?? null,
    payload: action.payload ?? null
  });
  const bytes = new TextEncoder().encode(canonical);
  const subtle = globalThis.crypto?.subtle;
  if (!subtle?.digest) throw new Error('SHA-256 digest is unavailable.');
  const digest = await subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate a persisted approval snapshot against the exact action.
 * A successful result is NOT a substitute for atomic single-use consumption
 * in the authoritative approval store at execution time.
 */
export function evaluateAskLingoApproval({ record, action, actionDigest, requesterSubjectId, now = Date.now() } = {}) {
  if (!Number.isFinite(now) || !isValidAction(action)) return { valid: false, reason: 'INVALID_APPROVAL_CONTEXT' };
  if (!record || typeof record !== 'object' || Array.isArray(record)) return { valid: false, reason: 'APPROVAL_NOT_FOUND' };
  if (record.status !== 'APPROVED') return { valid: false, reason: 'APPROVAL_NOT_APPROVED' };
  if (typeof record.approvalId !== 'string' || !record.approvalId.trim()) return { valid: false, reason: 'APPROVAL_ID_MISSING' };
  if (typeof requesterSubjectId !== 'string' || !requesterSubjectId || record.requesterSubjectId !== requesterSubjectId) {
    return { valid: false, reason: 'APPROVAL_REQUESTER_MISMATCH' };
  }
  if (typeof record.approverSubjectId !== 'string' || !record.approverSubjectId
    || record.approverSubjectId === requesterSubjectId) {
    return { valid: false, reason: 'SEPARATION_OF_DUTIES_VIOLATION' };
  }
  if (typeof actionDigest !== 'string' || !/^[a-f0-9]{64}$/.test(actionDigest)
    || record.actionDigest !== actionDigest) {
    return { valid: false, reason: 'ACTION_DIGEST_MISMATCH' };
  }
  if (!Number.isFinite(record.expiresAt) || record.expiresAt <= now) return { valid: false, reason: 'APPROVAL_EXPIRED' };
  if (record.consumedAt !== null) return { valid: false, reason: 'APPROVAL_ALREADY_CONSUMED' };
  if (record.revokedAt !== null) return { valid: false, reason: 'APPROVAL_REVOKED_OR_UNVERIFIED' };
  if (!sameScope(record.scope, action)) return { valid: false, reason: 'APPROVAL_SCOPE_MISMATCH' };
  return { valid: true, reason: 'APPROVAL_MATCHED', approvalId: record.approvalId };
}

function isVerifiedPrincipal(principal, now) {
  return Boolean(principal && typeof principal === 'object'
    && principal.verified === true
    && principal.status === 'ACTIVE'
    && typeof principal.subjectId === 'string' && principal.subjectId.trim()
    && Number.isFinite(principal.expiresAt) && principal.expiresAt > now);
}

function isValidAction(action) {
  if (!action || typeof action !== 'object' || Array.isArray(action)) return false;
  if (!SCOPE_FIELDS.every((field) => typeof action[field] === 'string' && action[field].trim() && action[field] !== '*')) return false;
  if (!RISK_TIERS.has(action.riskTier)) return false;
  if (typeof action.capability !== 'string' || !action.capability.trim()) return false;
  if (action.requiresApproval !== undefined && typeof action.requiresApproval !== 'boolean') return false;
  if (action.idempotencyKey !== undefined && (typeof action.idempotencyKey !== 'string' || action.idempotencyKey.length < 16 || action.idempotencyKey.length > 128)) return false;
  try { canonicalize(action.payload ?? null); } catch { return false; }
  return true;
}

function matchesGrant(grant, principal, action, now) {
  return Boolean(grant && typeof grant === 'object'
    && grant.status === 'ACTIVE'
    && grant.subjectId === principal.subjectId
    && grant.capability === action.capability
    && typeof grant.grantId === 'string' && grant.grantId.trim()
    && Number.isFinite(grant.notBefore) && grant.notBefore <= now
    && Number.isFinite(grant.expiresAt) && grant.expiresAt > now
    && SCOPE_FIELDS.every((field) => grant[field] === action[field] && grant[field] !== '*'));
}

function sameScope(scope, action) {
  return Boolean(scope && typeof scope === 'object'
    && SCOPE_FIELDS.every((field) => scope[field] === action[field] && scope[field] !== '*'));
}

function deny(reason) {
  return { decision: 'DENY', reason, approvalRequired: false, policyVersion: 'asklingo-saaae-v2.0.0' };
}

function canonicalize(value, seen = new Set()) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number' && Number.isFinite(value)) return JSON.stringify(value);
  if (Array.isArray(value)) {
    if (seen.has(value)) throw new TypeError('Cyclic data is not supported.');
    seen.add(value);
    const result = '[' + Array.from(value, (entry) => canonicalize(entry, seen)).join(',') + ']';
    seen.delete(value);
    return result;
  }
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    if (seen.has(value)) throw new TypeError('Cyclic data is not supported.');
    seen.add(value);
    const keys = Object.keys(value).sort();
    const result = '{' + keys.map((key) => JSON.stringify(key) + ':' + canonicalize(value[key], seen)).join(',') + '}';
    seen.delete(value);
    return result;
  }
  throw new TypeError('Only plain JSON-compatible data is supported.');
}
