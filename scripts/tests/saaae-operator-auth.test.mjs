import assert from 'node:assert/strict';
import test from 'node:test';
import { authenticateSaaaeOperator } from '../../src/auth/saaae-operator-auth.mjs';

const roster = [
  { subject: 'human-requester', type: 'human', status: 'active', roles: ['requester'], person_ref: 'person-proof-001', independence_attestation_id: 'attestation-proof-001', attestation_issuer: 'workforce-identity-authority' },
  { subject: 'human-reviewer', type: 'human', status: 'active', roles: ['reviewer'], person_ref: 'person-proof-002', independence_attestation_id: 'attestation-proof-002', attestation_issuer: 'workforce-identity-authority' },
  { subject: 'workload-executor', type: 'workload', status: 'active', roles: ['executor'] },
];
const env = {
  CLOUDFLARE_ACCESS_TEAM_DOMAIN: 'morning-pine-9393.cloudflareaccess.com',
  CLOUDFLARE_ACCESS_AUD: 'staging-access-audience',
  SAAAE_OPERATOR_REGISTRY_JSON: JSON.stringify(roster),
  SAAAE_INDEPENDENCE_ATTESTATION_ISSUER: 'workforce-identity-authority',
};
const request = (token = 'signed-token') => new Request('https://staging.invalid/operator', {
  headers: token ? { 'cf-access-jwt-assertion': token } : {},
});
const validVerifier = async () => ({
  ok: true, subject: 'human-reviewer', email: 'ignored@example.invalid',
});

test('missing Access configuration fails closed', async () => {
  const result = await authenticateSaaaeOperator(request(), {}, { verify: validVerifier });
  assert.equal(result.status, 503);
  assert.equal(result.code, 'OPERATOR_AUTH_CONFIGURATION_UNAVAILABLE');
});

test('requires the Cloudflare Access assertion header', async () => {
  const result = await authenticateSaaaeOperator(request(null), env, { verify: validVerifier });
  assert.equal(result.status, 401);
  assert.equal(result.code, 'ACCESS_TOKEN_REQUIRED');
});

test('resolves verified immutable subject to server-side reviewer role', async () => {
  const result = await authenticateSaaaeOperator(request(), env, { verify: validVerifier });
  assert.deepEqual(result, {
    ok: true, subject: 'human-reviewer', type: 'human', roles: ['reviewer'],
  });
});

test('does not authorize an unregistered subject or trust token email', async () => {
  const result = await authenticateSaaaeOperator(request(), env, {
    verify: async () => ({ ok: true, subject: 'unregistered', email: 'human-reviewer@example.invalid' }),
  });
  assert.equal(result.status, 403);
  assert.equal(result.code, 'HUMAN_OPERATOR_NOT_REGISTERED');
});

test('Access human authentication cannot resolve the workload executor identity', async () => {
  const result = await authenticateSaaaeOperator(request(), env, {
    verify: async () => ({ ok: true, subject: 'workload-executor' }),
  });
  assert.equal(result.status, 403);
  assert.equal(result.code, 'HUMAN_OPERATOR_NOT_REGISTERED');
});

test('invalid tokens and unavailable signing keys fail closed', async () => {
  const invalid = await authenticateSaaaeOperator(request(), env, {
    verify: async () => ({ ok: false, code: 'ACCESS_TOKEN_INVALID' }),
  });
  assert.equal(invalid.status, 401);
  const unavailable = await authenticateSaaaeOperator(request(), env, {
    verify: async () => ({ ok: false, code: 'ACCESS_SIGNING_KEYS_UNAVAILABLE' }),
  });
  assert.equal(unavailable.status, 503);
});

test('an incomplete independent roster prevents operator authentication', async () => {
  const incomplete = {
    ...env,
    SAAAE_OPERATOR_REGISTRY_JSON: JSON.stringify([roster[0], roster[2]]),
  };
  const result = await authenticateSaaaeOperator(request(), incomplete, { verify: validVerifier });
  assert.equal(result.status, 503);
  assert.equal(result.code, 'INDEPENDENT_OPERATOR_ROSTER_REQUIRED');
});
