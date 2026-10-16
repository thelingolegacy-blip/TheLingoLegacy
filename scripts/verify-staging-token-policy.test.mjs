import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { verifyStagingTokenPolicy } from './verify-staging-token-policy.mjs';

function fixture() {
  const policy = {
    schemaVersion:'1.0', status:'APPROVED_BY_ADMIN', tokenId:'token-id-123', accountId:'account-id-123',
    workerName:'thelingolegacy-staging', permissions:['Workers Scripts:Edit'],
    resourceScope:{workers:['thelingolegacy-staging'],zones:[]}, productionWorkerWrite:false, customRouteWrite:false,
    approvedBy:'cloudflare-admin', approvedAt:'2026-10-16T12:00:00Z', evidenceRef:'admin-audit-001'
  };
  const policyBytes = Buffer.from(JSON.stringify(policy,null,2)+'\n');
  return { policy, policyBytes, expectedPolicySha256:createHash('sha256').update(policyBytes).digest('hex'), expectedTokenId:'token-id-123', observedTokenId:'token-id-123', accountId:'account-id-123' };
}

test('accepts administrator-approved exact staging policy', () => {
  assert.equal(verifyStagingTokenPolicy(fixture()).status,'PASS');
});

test('rejects unapproved policy', () => {
  const f=fixture(); f.policy.status='NOT_APPROVED'; f.policyBytes=Buffer.from(JSON.stringify(f.policy,null,2)+'\n'); f.expectedPolicySha256=createHash('sha256').update(f.policyBytes).digest('hex');
  assert.throws(() => verifyStagingTokenPolicy(f), /not been administrator-approved/);
});

test('rejects broad permission groups', () => {
  const f=fixture(); f.policy.permissions.push('Workers Routes:Edit'); f.policyBytes=Buffer.from(JSON.stringify(f.policy,null,2)+'\n'); f.expectedPolicySha256=createHash('sha256').update(f.policyBytes).digest('hex');
  assert.throws(() => verifyStagingTokenPolicy(f), /permissions must be exactly/);
});

test('rejects production/custom-route authority', () => {
  const f=fixture(); f.policy.customRouteWrite=true; f.policyBytes=Buffer.from(JSON.stringify(f.policy,null,2)+'\n'); f.expectedPolicySha256=createHash('sha256').update(f.policyBytes).digest('hex');
  assert.throws(() => verifyStagingTokenPolicy(f), /explicitly deny production Worker/);
});

test('rejects token identity mismatch', () => {
  const f=fixture(); f.observedTokenId='unexpected-token';
  assert.throws(() => verifyStagingTokenPolicy(f), /does not match/);
});

test('rejects policy digest mismatch', () => {
  const f=fixture(); f.expectedPolicySha256='0'.repeat(64);
  assert.throws(() => verifyStagingTokenPolicy(f), /differs from the protected environment value/);
});
