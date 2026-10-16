import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const sha256Pattern = /^[a-f0-9]{64}$/;

export function verifyStagingTokenPolicy({ policy, policyBytes, expectedPolicySha256, expectedTokenId, observedTokenId, accountId }) {
  if (!policy || typeof policy !== 'object') throw new Error('Missing administrator-approved token policy');
  const actualPolicySha256 = createHash('sha256').update(policyBytes).digest('hex');
  if (!sha256Pattern.test(expectedPolicySha256 || '') || actualPolicySha256 !== expectedPolicySha256) {
    throw new Error('Token policy digest is absent or differs from the protected environment value');
  }
  if (policy.status !== 'APPROVED_BY_ADMIN') throw new Error('Token policy has not been administrator-approved');
  if (!expectedTokenId || !observedTokenId || expectedTokenId !== observedTokenId || policy.tokenId !== observedTokenId) {
    throw new Error('Observed Cloudflare token ID does not match the approved token identity');
  }
  if (!accountId || policy.accountId !== accountId) throw new Error('Token policy account identity mismatch');
  if (policy.workerName !== 'thelingolegacy-staging') throw new Error('Policy is not restricted to the staging Worker');
  if (JSON.stringify(policy.permissions) !== JSON.stringify(['Individual Workers Editor'])) {
    throw new Error('Token permissions must be exactly Individual Workers Editor');
  }
  const scope = policy.resourceScope;
  if (!scope || Object.keys(scope).sort().join(',') !== 'workers,zones' ||
      !Array.isArray(scope.workers) || scope.workers.length !== 1 || scope.workers[0] !== 'thelingolegacy-staging' ||
      !Array.isArray(scope.zones) || scope.zones.length !== 0) {
    throw new Error('Token resource scope must be exactly the staging Worker with no zone scope');
  }
  if (policy.productionWorkerWrite !== false || policy.customRouteWrite !== false) {
    throw new Error('Policy must explicitly deny production Worker and custom-route write authority');
  }
  if (!policy.approvedBy || !policy.approvedAt || !policy.evidenceRef) {
    throw new Error('Administrator approval provenance is incomplete');
  }
  return { status: 'PASS', tokenId: observedTokenId, policySha256: actualPolicySha256, workerName: policy.workerName, productionWorkerWrite: false, customRouteWrite: false };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const policyPath = process.env.CLOUDFLARE_STAGING_TOKEN_POLICY_PATH || 'security/cloudflare-staging-token-policy.json';
  const policyBytes = readFileSync(policyPath);
  const policy = JSON.parse(policyBytes.toString('utf8'));
  const token = process.env.CLOUDFLARE_STAGING_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (!token || !accountId) throw new Error('Dedicated staging token or account ID is missing');
  const response = await fetch('https://api.cloudflare.com/client/v4/accounts/' + accountId + '/tokens/verify', {
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' }
  });
  if (!response.ok) throw new Error('Cloudflare token identity verification failed with HTTP ' + response.status);
  const body = await response.json();
  if (body.success !== true || body.result?.status !== 'active' || !body.result?.id) {
    throw new Error('Cloudflare did not confirm an active token identity');
  }
  const result = verifyStagingTokenPolicy({
    policy, policyBytes, expectedPolicySha256: process.env.CLOUDFLARE_STAGING_TOKEN_POLICY_SHA256,
    expectedTokenId: process.env.CLOUDFLARE_STAGING_TOKEN_ID, observedTokenId: body.result.id, accountId
  });
  console.log(JSON.stringify(result));
}
