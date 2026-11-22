import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateAskLingoPolicy, digestAskLingoAction, evaluateAskLingoApproval } from '../../src/ai/v2/policy.mjs';

const now = 1_800_000_000_000;
const principal = { subjectId: 'user-1', verified: true, status: 'ACTIVE', expiresAt: now + 60_000 };
const action = {
  tenantId: 'tenant-a', productId: 'asklingo', resourceType: 'conversation', resourceId: 'conversation-1',
  operation: 'READ', environment: 'staging', capability: 'CAN_ANSWER', riskTier: 'low',
  idempotencyKey: 'asklingo-test-request-0001', payload: { prompt: 'hello', options: { temperature: 0 } }
};
const grant = {
  grantId: 'grant-1', subjectId: 'user-1', status: 'ACTIVE', capability: 'CAN_ANSWER',
  tenantId: 'tenant-a', productId: 'asklingo', resourceType: 'conversation', resourceId: 'conversation-1',
  operation: 'READ', environment: 'staging', notBefore: now - 1000, expiresAt: now + 30_000
};

test('denies missing or unverified identity by default', () => {
  assert.equal(evaluateAskLingoPolicy({ action, grants: [grant], now }).decision, 'DENY');
  assert.equal(evaluateAskLingoPolicy({ principal: { ...principal, verified: false }, action, grants: [grant], now }).reason, 'IDENTITY_NOT_VERIFIED');
});

test('allows only an active exact-scope grant', () => {
  const result = evaluateAskLingoPolicy({ principal, action, grants: [grant], now });
  assert.equal(result.decision, 'ALLOW');
  assert.equal(result.approvalRequired, false);
  assert.equal(result.grantId, 'grant-1');
});

test('denies cross-tenant, cross-product, resource, operation, and environment scope drift', () => {
  for (const field of ['tenantId', 'productId', 'resourceType', 'resourceId', 'operation', 'environment']) {
    const wrong = { ...grant, [field]: 'other-scope' };
    assert.equal(evaluateAskLingoPolicy({ principal, action, grants: [wrong], now }).decision, 'DENY', field);
  }
});

test('denies expired, not-yet-valid, revoked, or wrong-subject grants', () => {
  for (const patch of [
    { expiresAt: now }, { notBefore: now + 1 }, { status: 'REVOKED' }, { subjectId: 'user-2' }
  ]) assert.equal(evaluateAskLingoPolicy({ principal, action, grants: [{ ...grant, ...patch }], now }).decision, 'DENY');
});

test('denies wildcard scope and missing capability rather than broadening access', () => {
  assert.equal(evaluateAskLingoPolicy({ principal, action, grants: [{ ...grant, resourceId: '*' }], now }).decision, 'DENY');
  assert.equal(evaluateAskLingoPolicy({ principal, action: { ...action, capability: 'CAN_EXECUTE' }, grants: [grant], now }).decision, 'DENY');
});

test('requires approval for high-risk and explicitly approval-gated operations', () => {
  for (const patch of [{ riskTier: 'high' }, { riskTier: 'critical' }, { requiresApproval: true }]) {
    const result = evaluateAskLingoPolicy({ principal, action: { ...action, ...patch }, grants: [grant], now });
    assert.equal(result.decision, 'ALLOW_PENDING_APPROVAL');
    assert.equal(result.approvalRequired, true);
  }
});

test('denies malformed scope and unavailable grants', () => {
  assert.equal(evaluateAskLingoPolicy({ principal, action: { ...action, productId: '*' }, grants: [grant], now }).decision, 'DENY');
  assert.equal(evaluateAskLingoPolicy({ principal, action, now }).reason, 'GRANTS_UNAVAILABLE');
});

test('action digest is deterministic and changes when the payload or target changes', async () => {
  const first = await digestAskLingoAction(action);
  const reordered = await digestAskLingoAction({ ...action, payload: { options: { temperature: 0 }, prompt: 'hello' } });
  const changed = await digestAskLingoAction({ ...action, payload: { prompt: 'changed' } });
  assert.equal(first, reordered);
  assert.notEqual(first, changed);
  assert.match(first, /^[a-f0-9]{64}$/);
});

test('approval must be persistent-state snapshot, approved, exact-action, unexpired, and unconsumed', async () => {
  const highRiskAction = { ...action, riskTier: 'high' };
  const actionDigest = await digestAskLingoAction(highRiskAction);
  const record = {
    approvalId: 'approval-1', status: 'APPROVED', requesterSubjectId: 'user-1', approverSubjectId: 'reviewer-2',
    actionDigest, expiresAt: now + 10_000, consumedAt: null, revokedAt: null,
    scope: Object.fromEntries(['tenantId','productId','resourceType','resourceId','operation','environment'].map((key) => [key, highRiskAction[key]]))
  };
  assert.equal(evaluateAskLingoApproval({ record, action: highRiskAction, actionDigest, requesterSubjectId: 'user-1', now }).valid, true);
  assert.equal(evaluateAskLingoApproval({ record: { ...record, approverSubjectId: 'user-1' }, action: highRiskAction, actionDigest, requesterSubjectId: 'user-1', now }).reason, 'SEPARATION_OF_DUTIES_VIOLATION');
  assert.equal(evaluateAskLingoApproval({ record: { ...record, consumedAt: now }, action: highRiskAction, actionDigest, requesterSubjectId: 'user-1', now }).reason, 'APPROVAL_ALREADY_CONSUMED');
  assert.equal(evaluateAskLingoApproval({ record: { ...record, expiresAt: now }, action: highRiskAction, actionDigest, requesterSubjectId: 'user-1', now }).reason, 'APPROVAL_EXPIRED');
  assert.equal(evaluateAskLingoApproval({ record: { ...record, actionDigest: '0'.repeat(64) }, action: highRiskAction, actionDigest, requesterSubjectId: 'user-1', now }).reason, 'ACTION_DIGEST_MISMATCH');
});

test('approval cannot be reused for a different tenant, product, resource, or operation', async () => {
  const highRiskAction = { ...action, riskTier: 'high' };
  const actionDigest = await digestAskLingoAction(highRiskAction);
  const record = {
    approvalId: 'approval-2', status: 'APPROVED', requesterSubjectId: 'user-1', approverSubjectId: 'reviewer-2',
    actionDigest, expiresAt: now + 10_000, consumedAt: null, revokedAt: null,
    scope: Object.fromEntries(['tenantId','productId','resourceType','resourceId','operation','environment'].map((key) => [key, highRiskAction[key]]))
  };
  for (const field of ['tenantId', 'productId', 'resourceType', 'resourceId', 'operation', 'environment']) {
    const changed = { ...highRiskAction, [field]: 'other-scope' };
    const changedDigest = await digestAskLingoAction(changed);
    assert.equal(evaluateAskLingoApproval({ record, action: changed, actionDigest: changedDigest, requesterSubjectId: 'user-1', now }).reason, 'ACTION_DIGEST_MISMATCH');
  }
});
