/**
 * askLINGO v2 SAAAE policy decision kernel.
 *
 * Pure, fail-closed policy evaluation only. This module does not authenticate
 * credentials, load authoritative grants, persist approvals/audit events, or
 * execute actions. Callers must supply server-verified records from trusted
 * adapters. It is intentionally not wired into the public facade.
 */

const SCOPE_FIELDS = Object.freeze([
  'tenantId',
  'productId',
  'resourceType',
  'resourceId',
  'operation',
  'environment'
]);

const DENY = (reason, policyVersion = null) => Object.freeze({
  decision: 'DENY',
  reason,
  policyVersion
});

/**
 * Evaluates one action against a server-resolved identity, grant, policy,
 * revocation result, and (when required) a single-use approval record.
 *
 * All scope comparisons are exact. Wildcards and implicit inheritance are
 * deliberately unsupported. Timestamps are Unix milliseconds.
 */
export function evaluateAuthorization(input, nowMs = Date.now()) {
  if (!isRecord(input) || !Number.isFinite(nowMs)) return DENY('INVALID_INPUT');

  const { subject, request, grant, policy, revocation, approval } = input;
  if (!isRecord(subject) || !isRecord(request) || !isRecord(grant)
      || !isRecord(policy) || !isRecord(revocation)) {
    return DENY('MISSING_AUTHORITY_CONTEXT');
  }

  const policyVersion = nonEmpty(policy.version) ? policy.version : null;
  if (policy.available !== true || !policyVersion) return DENY('POLICY_UNAVAILABLE', policyVersion);
  if (typeof policy.requireApproval !== 'boolean') return DENY('POLICY_CONFIGURATION_INVALID', policyVersion);
  if (!nonEmpty(subject.id) || subject.status !== 'active') return DENY('IDENTITY_INACTIVE', policyVersion);
  if (revocation.status !== 'clear') return DENY('REVOCATION_UNVERIFIED', policyVersion);

  if (!SCOPE_FIELDS.every((field) => nonEmpty(request[field]))) {
    return DENY('REQUEST_SCOPE_INCOMPLETE', policyVersion);
  }
  if (request.tenantId !== subject.tenantId) return DENY('SUBJECT_TENANT_MISMATCH', policyVersion);

  if (grant.status !== 'active' || grant.subjectId !== subject.id) {
    return DENY('GRANT_NOT_ACTIVE', policyVersion);
  }
  if (!SCOPE_FIELDS.every((field) => grant[field] === request[field])) {
    return DENY('GRANT_SCOPE_MISMATCH', policyVersion);
  }
  if (!Number.isFinite(grant.notBefore) || !Number.isFinite(grant.expiresAt)
      || nowMs < grant.notBefore || nowMs >= grant.expiresAt) {
    return DENY('GRANT_OUTSIDE_VALIDITY', policyVersion);
  }

  if (policy.requireApproval === true) {
    if (!isRecord(approval)) return DENY('APPROVAL_REQUIRED', policyVersion);
    if (approval.status !== 'approved' || approval.consumed !== false) {
      return DENY('APPROVAL_NOT_USABLE', policyVersion);
    }
    if (!nonEmpty(approval.requesterId) || approval.requesterId !== subject.id
        || !nonEmpty(approval.approverId) || approval.approverId === approval.requesterId) {
      return DENY('APPROVAL_SEPARATION_OF_DUTIES', policyVersion);
    }
    if (!nonEmpty(request.actionDigest) || approval.actionDigest !== request.actionDigest) {
      return DENY('APPROVAL_ACTION_MISMATCH', policyVersion);
    }
    if (!Number.isFinite(approval.expiresAt) || nowMs >= approval.expiresAt) {
      return DENY('APPROVAL_EXPIRED', policyVersion);
    }
    if (!isRecord(approval.scope)
        || !SCOPE_FIELDS.every((field) => approval.scope[field] === request[field])) {
      return DENY('APPROVAL_SCOPE_MISMATCH', policyVersion);
    }
  } else if (approval && approval.status === 'approved'
      && approval.requesterId === approval.approverId) {
    return DENY('APPROVAL_SEPARATION_OF_DUTIES', policyVersion);
  }

  return Object.freeze({
    decision: 'ALLOW',
    reason: 'POLICY_AND_SCOPE_MATCH',
    policyVersion
  });
}

/**
 * Creates a deterministic SHA-256 digest for an action descriptor.
 * The caller must include every material effect/target/amount in descriptor.
 * This helper canonicalizes plain JSON-compatible data; it is not a substitute
 * for validating the descriptor against an authoritative action schema.
 */
export async function createActionDigest(descriptor) {
  if (!isRecord(descriptor)) throw new TypeError('Action descriptor must be an object');
  const canonical = canonicalize(descriptor);
  const bytes = new TextEncoder().encode(JSON.stringify(canonical));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function canonicalize(value) {
  if (value === undefined) throw new TypeError('Action descriptor contains undefined');
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError('Action descriptor must contain plain objects');
    }
    const output = {};
    for (const key of Object.keys(value).sort()) {
      const item = value[key];
      if (item === undefined || typeof item === 'function' || typeof item === 'symbol') {
        throw new TypeError('Action descriptor contains a non-JSON value');
      }
      output[key] = canonicalize(item);
    }
    return output;
  }
  if (typeof value === 'number' && !Number.isFinite(value)) {
    throw new TypeError('Action descriptor contains a non-finite number');
  }
  if (typeof value === 'bigint' || typeof value === 'function' || typeof value === 'symbol') {
    throw new TypeError('Action descriptor contains a non-JSON value');
  }
  return value;
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function nonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}
