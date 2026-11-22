import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createActionDigest,
  evaluateAuthorization
} from '../../src/ai/saaae-policy-engine.mjs';

const NOW = 1_800_000_000_000;
const scope = Object.freeze({
  tenantId: 'tenant-a',
  productId: 'asklingo',
  resourceType: 'conversation',
  resourceId: 'conversation-17',
  operation: 'respond',
  environment: 'staging'
});

function fixture(overrides = {}) {
  const request = { ...scope, actionDigest: 'a'.repeat(64) };
  return {
    subject: { id: 'user-1', status: 'active', tenantId: scope.tenantId },
    request,
    grant: {
      subjectId: 'user-1',
      status: 'active',
      ...scope,
      notBefore: NOW - 1_000,
      expiresAt: NOW + 60_000
    },
    policy: { available: true, version: 'policy-v1', requireApproval: false },
    revocation: { status: 'clear' },
    ...overrides
  };
}

test('denies by default when authority context is missing or malformed', () => {
  assert.equal(evaluateAuthorization(null, NOW).decision, 'DENY');
  assert.equal(evaluateAuthorization({}, NOW).reason, 'MISSING_AUTHORITY_CONTEXT');
});

test('allows an active subject with an exact, current, scoped grant', () => {
  assert.deepEqual(evaluateAuthorization(fixture(), NOW), {
    decision: 'ALLOW',
    reason: 'POLICY_AND_SCOPE_MATCH',
    policyVersion: 'policy-v1'
  });
});

test('denies when the policy service is unavailable or has no version', () => {
  assert.equal(evaluateAuthorization(fixture({ policy: { available: false, version: 'v1' } }), NOW).reason, 'POLICY_UNAVAILABLE');
  assert.equal(evaluateAuthorization(fixture({ policy: { available: true, version: 'v1' } }), NOW).reason, 'POLICY_CONFIGURATION_INVALID');
});

test('denies inactive identities and tenant substitution', () => {
  assert.equal(evaluateAuthorization(fixture({ subject: { id: 'user-1', status: 'suspended', tenantId: scope.tenantId } }), NOW).reason, 'IDENTITY_INACTIVE');
  assert.equal(evaluateAuthorization(fixture({ request: { ...scope, tenantId: 'tenant-b' } }), NOW).reason, 'SUBJECT_TENANT_MISMATCH');
});

test('denies if revocation cannot be authoritatively cleared', () => {
  assert.equal(evaluateAuthorization(fixture({ revocation: { status: 'unknown' } }), NOW).reason, 'REVOCATION_UNVERIFIED');
});

test('denies incomplete requests and any grant scope drift', () => {
  const incomplete = { ...scope, resourceId: '' };
  assert.equal(evaluateAuthorization(fixture({ request: incomplete }), NOW).reason, 'REQUEST_SCOPE_INCOMPLETE');
  const grant = { ...fixture().grant, productId: 'other-product' };
  assert.equal(evaluateAuthorization(fixture({ grant }), NOW).reason, 'GRANT_SCOPE_MISMATCH');
});

test('denies wrong principal, inactive grant, and expired/not-yet-valid grants', () => {
  assert.equal(evaluateAuthorization(fixture({ grant: { ...fixture().grant, subjectId: 'user-2' } }), NOW).reason, 'GRANT_NOT_ACTIVE');
  assert.equal(evaluateAuthorization(fixture({ grant: { ...fixture().grant, status: 'revoked' } }), NOW).reason, 'GRANT_NOT_ACTIVE');
  assert.equal(evaluateAuthorization(fixture({ grant: { ...fixture().grant, expiresAt: NOW } }), NOW).reason, 'GRANT_OUTSIDE_VALIDITY');
  assert.equal(evaluateAuthorization(fixture({ grant: { ...fixture().grant, notBefore: NOW + 1 } }), NOW).reason, 'GRANT_OUTSIDE_VALIDITY');
});

test('requires a separate, approved, unconsumed approval when policy demands it', () => {
  const policy = { available: true, version: 'policy-v1', requireApproval: true };
  assert.equal(evaluateAuthorization(fixture({ policy }), NOW).reason, 'APPROVAL_REQUIRED');
  const approval = {
    status: 'approved',
    consumed: false,
    requesterId: 'user-1',
    approverId: 'reviewer-2',
    actionDigest: 'a'.repeat(64),
    scope: { ...scope },
    expiresAt: NOW + 30_000
  };
  assert.equal(evaluateAuthorization(fixture({ policy, approval }), NOW).decision, 'ALLOW');
});

test('denies self-approval, consumed, expired, mismatched, and scope-drifted approvals', () => {
  const policy = { available: true, version: 'policy-v1', requireApproval: true };
  const valid = {
    status: 'approved', consumed: false, requesterId: 'user-1',
    approverId: 'reviewer-2', actionDigest: 'a'.repeat(64),
    scope: { ...scope }, expiresAt: NOW + 30_000
  };
  assert.equal(evaluateAuthorization(fixture({ policy, approval: { ...valid, approverId: 'user-1' } }), NOW).reason, 'APPROVAL_SEPARATION_OF_DUTIES');
  assert.equal(evaluateAuthorization(fixture({ policy, approval: { ...valid, consumed: true } }), NOW).reason, 'APPROVAL_NOT_USABLE');
  assert.equal(evaluateAuthorization(fixture({ policy, approval: { ...valid, expiresAt: NOW } }), NOW).reason, 'APPROVAL_EXPIRED');
  assert.equal(evaluateAuthorization(fixture({ policy, approval: { ...valid, actionDigest: 'b'.repeat(64) } }), NOW).reason, 'APPROVAL_ACTION_MISMATCH');
  assert.equal(evaluateAuthorization(fixture({ policy, approval: { ...valid, scope: { ...scope, resourceId: 'other' } } }), NOW).reason, 'APPROVAL_SCOPE_MISMATCH');
});

test('canonical action digest is stable across object key order and changes with material input', async () => {
  const first = await createActionDigest({ operation: 'publish', resource: { id: 'r1', type: 'post' }, amount: 4 });
  const reordered = await createActionDigest({ amount: 4, resource: { type: 'post', id: 'r1' }, operation: 'publish' });
  const changed = await createActionDigest({ amount: 5, resource: { id: 'r1', type: 'post' }, operation: 'publish' });
  assert.equal(first, reordered);
  assert.notEqual(first, changed);
  assert.match(first, /^[a-f0-9]{64}$/);
});

test('action digest rejects invalid descriptors', async () => {
  await assert.rejects(() => createActionDigest(null), TypeError);
  await assert.rejects(() => createActionDigest({ amount: Number.NaN }), TypeError);
});

test('action digest preserves top-level and nested __proto__ keys as data', async () => {
  const first = JSON.parse('{"__proto__":{"role":"reader"},"nested":{"__proto__":{"scope":"one"}}}');
  const second = JSON.parse('{"__proto__":{"role":"writer"},"nested":{"__proto__":{"scope":"one"}}}');
  const third = JSON.parse('{"__proto__":{"role":"reader"},"nested":{"__proto__":{"scope":"two"}}}');
  assert.notEqual(await createActionDigest(first), await createActionDigest(second));
  assert.notEqual(await createActionDigest(first), await createActionDigest(third));
});

test('action digest rejects cyclic and sparse descriptors deterministically', async () => {
  const cyclic = {};
  cyclic.self = cyclic;
  await assert.rejects(() => createActionDigest(cyclic), /cycle/);
  const sparse = [];
  sparse.length = 1;
  await assert.rejects(() => createActionDigest({ sparse }), /sparse array/);
});
