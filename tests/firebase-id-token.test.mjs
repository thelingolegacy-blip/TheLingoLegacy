import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyFirebaseIdToken } from '../src/auth/firebase-id-token.mjs';

const projectId = 'lingo-legacy-production';
const encoder = new TextEncoder();
const toBase64Url = (bytes) => Buffer.from(bytes).toString('base64url');
const encodeJson = (value) => toBase64Url(encoder.encode(JSON.stringify(value)));

async function signedToken(overrides = {}, kid = 'test-key') {
  const pair = await crypto.subtle.generateKey({
    name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256'
  }, true, ['sign', 'verify']);
  const jwk = await crypto.subtle.exportKey('jwk', pair.publicKey);
  Object.assign(jwk, { kid, alg: 'RS256', use: 'sig' });
  const now = 1_800_000_000;
  const header = encodeJson({ alg: 'RS256', typ: 'JWT', kid });
  const claims = encodeJson({
    aud: projectId,
    iss: 'https://securetoken.google.com/' + projectId,
    sub: 'user-test-123',
    iat: now - 60,
    exp: now + 3600,
    auth_time: now - 120,
    ...overrides
  });
  const signingInput = header + '.' + claims;
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', pair.privateKey, encoder.encode(signingInput));
  return { token: signingInput + '.' + toBase64Url(signature), jwk, now };
}

function certFetcher(jwk) {
  return async (_url, _options) => new Response(JSON.stringify({ keys: [jwk] }), {
    status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' }
  });
}

test('verifies a correctly signed Firebase ID token and returns minimal identity', async () => {
  const certUrl = 'https://test.invalid/certs/valid-' + crypto.randomUUID();
  const fixture = await signedToken();
  const result = await verifyFirebaseIdToken(fixture.token, projectId, {
    fetchImpl: certFetcher(fixture.jwk), nowSeconds: fixture.now, certUrl
  });
  assert.equal(result.ok, true);
  assert.equal(result.uid, 'user-test-123');
  assert.equal(result.claims.aud, projectId);
  assert.equal(JSON.stringify(result).includes('user-test-123'), true);
});

test('rejects expired Firebase ID tokens', async () => {
  const fixture = await signedToken({ exp: 1_799_999_999 });
  const result = await verifyFirebaseIdToken(fixture.token, projectId, {
    fetchImpl: certFetcher(fixture.jwk), nowSeconds: fixture.now, certUrl: 'https://test.invalid/certs/expired-' + crypto.randomUUID()
  });
  assert.equal(result.ok, false);
  assert.equal(result.code, 'INVALID_TOKEN');
});

test('rejects tokens issued for another Firebase project', async () => {
  const fixture = await signedToken({ aud: 'another-project' });
  const result = await verifyFirebaseIdToken(fixture.token, projectId, {
    fetchImpl: certFetcher(fixture.jwk), nowSeconds: fixture.now, certUrl: 'https://test.invalid/certs/audience-' + crypto.randomUUID()
  });
  assert.equal(result.ok, false);
  assert.equal(result.code, 'INVALID_TOKEN');
});

test('rejects tampered signatures', async () => {
  const fixture = await signedToken();
  const parts = fixture.token.split('.');
  parts[2] = toBase64Url(crypto.getRandomValues(new Uint8Array(256)));
  const result = await verifyFirebaseIdToken(parts.join('.'), projectId, {
    fetchImpl: certFetcher(fixture.jwk), nowSeconds: fixture.now, certUrl: 'https://test.invalid/certs/tampered-' + crypto.randomUUID()
  });
  assert.equal(result.ok, false);
  assert.equal(result.code, 'INVALID_TOKEN');
});

test('rejects non-RS256 JWT headers', async () => {
  const result = await verifyFirebaseIdToken(
    encodeJson({ alg: 'none', kid: 'x' }) + '.' + encodeJson({}) + '.signature',
    projectId
  );
  assert.equal(result.ok, false);
  assert.equal(result.code, 'INVALID_TOKEN');
});

test('reports identity verification unavailable when signing keys cannot be fetched', async () => {
  const fixture = await signedToken();
  const result = await verifyFirebaseIdToken(fixture.token, projectId, {
    fetchImpl: async () => { throw new Error('network details must not escape'); },
    nowSeconds: fixture.now, certUrl: 'https://test.invalid/certs/unavailable-' + crypto.randomUUID()
  });
  assert.equal(result.ok, false);
  assert.equal(result.code, 'TOKEN_VERIFICATION_UNAVAILABLE');
});

test('rejects missing or malformed project configuration', async () => {
  const result = await verifyFirebaseIdToken('a.b.c', '', {});
  assert.equal(result.ok, false);
  assert.equal(result.code, 'FIREBASE_PROJECT_NOT_CONFIGURED');
});
