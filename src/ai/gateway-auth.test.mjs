import test from 'node:test';
import assert from 'node:assert/strict';
import { authenticateGatewayRequest } from './gateway-auth.mjs';

const NOW = 1_800_000_000;
const validClaims = {
  iss: 'https://identity.example.test',
  aud: ['lingo-ai-gateway'],
  sub: 'user-123',
  tenant_id: 'tenant-456',
  sid: 'session-789',
  roles: ['member'],
  scopes: ['ai:chat', 'ai:usage:read'],
  exp: NOW + 300,
  nbf: NOW - 10
};

function request(authorization = 'Bearer valid-token') {
  return new Request('https://gateway.example.test/api/ai/v1/chat', {
    headers: authorization ? { authorization } : {}
  });
}

function options(overrides = {}) {
  return {
    verifyToken: async (token) => {
      assert.equal(token, 'valid-token');
      return validClaims;
    },
    expectedIssuer: 'https://identity.example.test',
    expectedAudience: 'lingo-ai-gateway',
    requiredScopes: ['ai:chat'],
    resolveTenantMembership: async ({ userId, tenantId }) =>
      userId === 'user-123' && tenantId === 'tenant-456',
    nowSeconds: NOW,
    ...overrides
  };
}

test('authenticates verified claims and returns server-derived principal', async () => {
  const result = await authenticateGatewayRequest(request(), options());
  assert.equal(result.ok, true);
  assert.equal(result.principal.userId, 'user-123');
  assert.equal(result.principal.tenantId, 'tenant-456');
  assert.deepEqual(result.principal.scopes.sort(), ['ai:chat', 'ai:usage:read']);
});

test('rejects absent, malformed, oversized, and non-Bearer authorization headers', async () => {
  for (const header of [null, 'Basic abc', 'Bearer ', 'Bearer token with spaces', `Bearer ${'x'.repeat(8193)}`]) {
    const result = await authenticateGatewayRequest(request(header), options());
    assert.equal(result.status, 401);
  }
});

test('rejects a token when cryptographic verification fails', async () => {
  const result = await authenticateGatewayRequest(request(), options({
    verifyToken: async () => { throw new Error('signature mismatch'); }
  }));
  assert.deepEqual(result, { ok: false, status: 401, code: 'AUTHENTICATION_REQUIRED' });
});

test('rejects wrong issuer, audience, expired token, and future not-before claim', async () => {
  const mutations = [
    { iss: 'https://attacker.example' },
    { aud: 'another-service' },
    { exp: NOW },
    { nbf: NOW + 1 },
    { sub: '' },
    { tenant_id: '../other-tenant' }
  ];
  for (const mutation of mutations) {
    const result = await authenticateGatewayRequest(request(), options({
      verifyToken: async () => ({ ...validClaims, ...mutation })
    }));
    assert.equal(result.status, 401);
  }
});

test('rejects missing scopes before checking tenant membership', async () => {
  let membershipLookups = 0;
  const result = await authenticateGatewayRequest(request(), options({
    requiredScopes: ['ai:agents:run'],
    resolveTenantMembership: async () => { membershipLookups += 1; return true; }
  }));
  assert.deepEqual(result, { ok: false, status: 403, code: 'AUTHORIZATION_DENIED' });
  assert.equal(membershipLookups, 0);
});

test('rejects a user who is not a member of the token tenant', async () => {
  const result = await authenticateGatewayRequest(request(), options({
    resolveTenantMembership: async () => false
  }));
  assert.deepEqual(result, { ok: false, status: 403, code: 'AUTHORIZATION_DENIED' });
});

test('fails closed when tenant membership service is unavailable', async () => {
  const result = await authenticateGatewayRequest(request(), options({
    resolveTenantMembership: async () => { throw new Error('database unavailable'); }
  }));
  assert.deepEqual(result, { ok: false, status: 503, code: 'AI_AUTHORIZATION_UNAVAILABLE' });
});

test('fails closed when auth dependencies or issuer configuration are missing', async () => {
  const result = await authenticateGatewayRequest(request(), {
    expectedIssuer: 'https://identity.example.test',
    expectedAudience: 'lingo-ai-gateway',
    requiredScopes: ['ai:chat']
  });
  assert.deepEqual(result, { ok: false, status: 500, code: 'AI_AUTH_CONFIGURATION_INVALID' });
});
