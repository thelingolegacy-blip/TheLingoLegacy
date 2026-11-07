import assert from 'node:assert/strict';
import test from 'node:test';
import { createSign, generateKeyPairSync } from 'node:crypto';
import { verifyFirebaseIdToken } from '../../src/auth/firebase-id-token.mjs';

const projectId = 'lingo-legacy-production';
const now = 1_800_000_000;
const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { format: 'jwk' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});
const kid = 'lingo-test-key';
const jwk = { ...publicKey, kid, alg: 'RS256', use: 'sig' };

function encode(value) { return Buffer.from(JSON.stringify(value)).toString('base64url'); }
function makeToken(overrides = {}) {
  const header = encode({ alg: 'RS256', typ: 'JWT', kid });
  const claims = encode({
    aud: projectId,
    iss: `https://securetoken.google.com/${projectId}`,
    sub: 'firebase-test-user-001',
    exp: now + 3600,
    iat: now - 10,
    auth_time: now - 20,
    ...overrides,
  });
  const data = `${header}.${claims}`;
  const signer = createSign('RSA-SHA256');
  signer.update(data);
  signer.end();
  return `${data}.${signer.sign(privateKey).toString('base64url')}`;
}
function fetchJwks() {
  return async () => new Response(JSON.stringify({ keys: [jwk] }), {
    status: 200,
    headers: { 'cache-control': 'public, max-age=300', 'content-type': 'application/json' },
  });
}

test('Firebase verifier accepts a correctly signed token for the configured project', async () => {
  const result = await verifyFirebaseIdToken(makeToken(), projectId, {
    fetchImpl: fetchJwks(), nowSeconds: now, certUrl: 'https://unit.test/jwks-valid',
  });
  assert.equal(result.ok, true);
  assert.equal(result.uid, 'firebase-test-user-001');
});

test('Firebase verifier rejects an invalid signature', async () => {
  const token = makeToken();
  const tampered = `${token.slice(0, -1)}${token.endsWith('A') ? 'B' : 'A'}`;
  const result = await verifyFirebaseIdToken(tampered, projectId, {
    fetchImpl: fetchJwks(), nowSeconds: now, certUrl: 'https://unit.test/jwks-badsig',
  });
  assert.equal(result.ok, false);
  assert.equal(result.code, 'INVALID_TOKEN');
});

test('Firebase verifier rejects wrong audience and expired tokens before key lookup', async () => {
  const neverFetch = async () => { throw new Error('must not fetch keys for invalid claims'); };
  const wrongAudience = await verifyFirebaseIdToken(makeToken({ aud: 'other-project' }), projectId, {
    fetchImpl: neverFetch, nowSeconds: now, certUrl: 'https://unit.test/jwks-wrongaud',
  });
  const expired = await verifyFirebaseIdToken(makeToken({ exp: now - 1 }), projectId, {
    fetchImpl: neverFetch, nowSeconds: now, certUrl: 'https://unit.test/jwks-expired',
  });
  assert.equal(wrongAudience.code, 'INVALID_TOKEN');
  assert.equal(expired.code, 'INVALID_TOKEN');
});

test('Firebase verifier fails closed when signing keys cannot be retrieved', async () => {
  const result = await verifyFirebaseIdToken(makeToken(), projectId, {
    fetchImpl: async () => { throw new Error('offline'); }, nowSeconds: now, certUrl: 'https://unit.test/jwks-unavailable',
  });
  assert.equal(result.ok, false);
  assert.equal(result.code, 'TOKEN_VERIFICATION_UNAVAILABLE');
});
