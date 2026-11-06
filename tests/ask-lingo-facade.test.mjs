import test from 'node:test';
import assert from 'node:assert/strict';
import { handleAskLingoRequest } from '../src/ai/ask-lingo-facade.mjs';

function makeRequest({ method = 'POST', headers = {}, body = { message: 'Hello from LINGO', surface: 'web', locale: 'en-US' } } = {}) {
  return new Request('https://lingo.test/api/v1/ask-lingo/query', {
    method,
    headers: { 'content-type': 'application/json', authorization: 'Bearer test.firebase.token', 'cf-connecting-ip': '192.0.2.10', ...headers },
    body: method === 'GET' ? undefined : JSON.stringify(body)
  });
}
const validIdentity = async () => ({ ok: true, uid: 'test-user-' + crypto.randomUUID() });

test('requires Firebase bearer authentication', async () => {
  const response = await handleAskLingoRequest(makeRequest({ headers: { authorization: '' } }), { FIREBASE_PROJECT_ID: 'lingo-legacy-production' });
  assert.equal(response.status, 401);
  assert.equal((await response.json()).code, 'AUTHENTICATION_REQUIRED');
});

test('rejects invalid Firebase identity before accepting request content', async () => {
  const response = await handleAskLingoRequest(makeRequest(), { FIREBASE_PROJECT_ID: 'lingo-legacy-production' }, {
    verifyToken: async () => ({ ok: false, code: 'INVALID_TOKEN' })
  });
  assert.equal(response.status, 401);
  assert.equal((await response.json()).code, 'INVALID_IDENTITY');
});

test('fails closed when Firebase project configuration is missing', async () => {
  const response = await handleAskLingoRequest(makeRequest(), {}, {
    verifyToken: async () => ({ ok: false, code: 'FIREBASE_PROJECT_NOT_CONFIGURED' })
  });
  assert.equal(response.status, 503);
  assert.equal((await response.json()).code, 'IDENTITY_PROVIDER_UNAVAILABLE');
});

test('requires JSON content type', async () => {
  const response = await handleAskLingoRequest(makeRequest({ headers: { 'content-type': 'text/plain' } }), { FIREBASE_PROJECT_ID: 'lingo-legacy-production' });
  assert.equal(response.status, 415);
});

test('rejects unknown request fields', async () => {
  const response = await handleAskLingoRequest(makeRequest({ body: { message: 'hello', uid: 'spoofed-user' } }), { FIREBASE_PROJECT_ID: 'lingo-legacy-production' }, { verifyToken: validIdentity });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).code, 'INVALID_REQUEST_FIELDS');
});

test('authenticated requests never invoke paid inference in zero-spend mode', async () => {
  const response = await handleAskLingoRequest(makeRequest(), { FIREBASE_PROJECT_ID: 'lingo-legacy-production' }, { verifyToken: validIdentity });
  assert.equal(response.status, 423);
  const body = await response.json();
  assert.equal(body.code, 'ASKLINGO_DISABLED');
  assert.equal(body.status, 'not_available');
  assert.equal(body.message.includes('No AI request was sent.'), true);
});

test('rejects unsupported client surface', async () => {
  const response = await handleAskLingoRequest(makeRequest({ body: { message: 'hello', surface: 'unknown', locale: 'en-US' } }), { FIREBASE_PROJECT_ID: 'lingo-legacy-production' }, { verifyToken: validIdentity });
  assert.equal(response.status, 400);
});

test('rejects oversized messages', async () => {
  const response = await handleAskLingoRequest(makeRequest({ body: { message: 'x'.repeat(2001), surface: 'web', locale: 'en-US' } }), { FIREBASE_PROJECT_ID: 'lingo-legacy-production' }, { verifyToken: validIdentity });
  assert.equal(response.status, 400);
});

test('rejects non-POST methods', async () => {
  const response = await handleAskLingoRequest(makeRequest({ method: 'GET' }), { FIREBASE_PROJECT_ID: 'lingo-legacy-production' });
  assert.equal(response.status, 405);
});

test('streaming oversized askLINGO body without content-length is rejected', async () => {
  const stream = new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode('x'.repeat(9000))); controller.close(); } });
  const response = await handleAskLingoRequest(
    new Request('https://lingo.test/api/v1/ask-lingo/query', {
      method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer test.firebase.token' },
      body: stream, duplex: 'half'
    }),
    { FIREBASE_PROJECT_ID: 'lingo-legacy-production' },
    { verifyToken: validIdentity }
  );
  assert.equal(response.status, 413);
  assert.equal((await response.json()).code, 'REQUEST_TOO_LARGE');
});
