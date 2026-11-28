import assert from 'node:assert/strict';
import test from 'node:test';
import { createSign, generateKeyPairSync } from 'node:crypto';
import { verifyCloudflareAccessJwt } from '../../src/auth/cloudflare-access-jwt.mjs';

const teamDomain = 'morning-pine-9393.cloudflareaccess.com';
const audience = 'staging-access-app-audience';
const issuer = `https://${teamDomain}`;
const now = 1_800_000_000;
const kid = 'cloudflare-access-test-key';
const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { format: 'jwk' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});
const jwk = { ...publicKey, kid, alg: 'RS256', use: 'sig' };

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}
function makeToken(overrides = {}, signing = { kid, privateKey }) {
  const header = encode({ alg: 'RS256', typ: 'JWT', kid: signing.kid });
  const claims = encode({
    iss: issuer, aud: [audience], sub: 'immutable-operator-subject-001',
    email: 'operator@example.invalid', iat: now - 10, nbf: now - 10, exp: now + 600,
    ...overrides,
  });
  const payload = `${header}.${claims}`;
  const signer = createSign('RSA-SHA256');
  signer.update(payload);
  signer.end();
  return `${payload}.${signer.sign(signing.privateKey).toString('base64url')}`;
}
function fetchJwks() {
  return async () => new Response(JSON.stringify({ keys: [jwk] }), {
    status: 200,
    headers: { 'cache-control': 'public, max-age=300', 'content-type': 'application/json' },
  });
}
const config = {
  teamDomain, audience, nowSeconds: now,
  certsUrl: 'https://unit.test/access-jwks',
  fetchImpl: fetchJwks(),
};

test('accepts a valid signed Access JWT and returns the immutable subject', async () => {
  const result = await verifyCloudflareAccessJwt(makeToken(), config);
  assert.equal(result.ok, true);
  assert.equal(result.subject, 'immutable-operator-subject-001');
  assert.equal(result.email, 'operator@example.invalid');
  assert.equal(result.issuer, issuer);
});

test('refreshes a still-fresh JWKS cache when a newly rotated kid is requested', async () => {
  const rotatedKid = 'cloudflare-access-rotated-test-key';
  const rotatedPair = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { format: 'jwk' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  const rotatedJwk = { ...rotatedPair.publicKey, kid: rotatedKid, alg: 'RS256', use: 'sig' };
  let fetchCount = 0;
  const rotationConfig = {
    ...config,
    certsUrl: 'https://unit.test/access-jwks-rotation',
    fetchImpl: async () => {
      fetchCount += 1;
      const keys = fetchCount === 1 ? [jwk] : [rotatedJwk];
      return new Response(JSON.stringify({ keys }), {
        status: 200,
        headers: { 'cache-control': 'public, max-age=300', 'content-type': 'application/json' },
      });
    },
  };

  const original = await verifyCloudflareAccessJwt(makeToken(), rotationConfig);
  assert.equal(original.ok, true);
  const rotated = await verifyCloudflareAccessJwt(
    makeToken({}, { kid: rotatedKid, privateKey: rotatedPair.privateKey }),
    rotationConfig
  );
  assert.equal(rotated.ok, true);
  assert.equal(rotated.subject, 'immutable-operator-subject-001');
  assert.equal(fetchCount, 2);
});

test('rejects invalid signatures', async () => {
  const token = makeToken();
  const tampered = `${token.slice(0, -1)}${token.endsWith('A') ? 'B' : 'A'}`;
  const result = await verifyCloudflareAccessJwt(tampered, config);
  assert.equal(result.ok, false);
  assert.equal(result.code, 'ACCESS_TOKEN_INVALID');
});

test('rejects wrong issuer, audience, expired and not-yet-valid tokens before key lookup', async () => {
  const noFetch = { ...config, fetchImpl: async () => { throw new Error('must not fetch'); }, certsUrl: 'https://unit.test/no-fetch' };
  for (const claims of [
    { iss: 'https://wrong.cloudflareaccess.com' },
    { aud: ['wrong-audience'] },
    { exp: now - 1 },
    { nbf: now + 1 },
  ]) {
    const result = await verifyCloudflareAccessJwt(makeToken(claims), noFetch);
    assert.equal(result.code, 'ACCESS_TOKEN_INVALID');
  }
});

test('rejects missing or malformed audience configuration and malformed tokens', async () => {
  assert.equal((await verifyCloudflareAccessJwt('not-a-jwt', config)).code, 'ACCESS_TOKEN_INVALID');
  assert.equal((await verifyCloudflareAccessJwt(makeToken(), { ...config, audience: '' })).code, 'ACCESS_CONFIGURATION_INVALID');
  assert.equal((await verifyCloudflareAccessJwt(makeToken(), { ...config, teamDomain: 'example.com' })).code, 'ACCESS_CONFIGURATION_INVALID');
});

test('fails closed when Access signing keys are unavailable', async () => {
  const result = await verifyCloudflareAccessJwt(makeToken(), {
    ...config, certsUrl: 'https://unit.test/access-jwks-unavailable',
    fetchImpl: async () => { throw new Error('offline'); },
  });
  assert.equal(result.ok, false);
  assert.equal(result.code, 'ACCESS_SIGNING_KEYS_UNAVAILABLE');
});
