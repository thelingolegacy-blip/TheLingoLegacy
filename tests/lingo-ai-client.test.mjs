import test from 'node:test';
import assert from 'node:assert/strict';
import { createLingoAIClient, LingoAIError } from '../src/ai/lingo-ai-client.mjs';

test('requires HTTPS for non-local API origins', () => {
  assert.throws(() => createLingoAIClient({ baseUrl: 'http://lingo.example', getIdToken: async () => 'x'.repeat(24) }), TypeError);
});

test('rejects invalid messages before requesting an ID token', async () => {
  let tokenRequested = false;
  const client = createLingoAIClient({ baseUrl: 'https://thelingolegacy.com', getIdToken: async () => { tokenRequested = true; return 'x'.repeat(24); } });
  await assert.rejects(() => client.query({ message: '   ' }), (error) => error instanceof LingoAIError && error.code === 'INVALID_MESSAGE');
  assert.equal(tokenRequested, false);
});

test('requires a signed-in Firebase identity', async () => {
  const client = createLingoAIClient({ baseUrl: 'https://thelingolegacy.com', getIdToken: async () => null });
  await assert.rejects(() => client.query({ message: 'hello' }), (error) => error.code === 'AUTHENTICATION_REQUIRED' && error.status === 401);
});

test('sends Firebase bearer token and no cookies or provider secrets', async () => {
  let captured;
  const client = createLingoAIClient({
    baseUrl: 'https://thelingolegacy.com',
    getIdToken: async () => 'firebase-id-token-placeholder',
    fetchImpl: async (url, options) => {
      captured = { url: String(url), options };
      return new Response(JSON.stringify({ ok: false, code: 'ASKLINGO_DISABLED', message: 'No AI request was sent.' }), { status: 423 });
    }
  });
  await assert.rejects(() => client.query({ message: ' hello ', surface: 'web', locale: 'en-US' }), (error) => error.status === 423 && error.code === 'ASKLINGO_DISABLED');
  assert.equal(captured.url, 'https://thelingolegacy.com/api/v1/ask-lingo/query');
  assert.equal(captured.options.headers.authorization, 'Bearer firebase-id-token-placeholder');
  assert.equal(captured.options.credentials, 'omit');
  assert.equal(captured.options.cache, 'no-store');
  assert.equal(captured.options.headers['content-type'], 'application/json');
  assert.deepEqual(JSON.parse(captured.options.body), { message: 'hello', surface: 'web', locale: 'en-US' });
});

test('maps network failures to a sanitized client error', async () => {
  const client = createLingoAIClient({
    baseUrl: 'https://thelingolegacy.com',
    getIdToken: async () => 'firebase-id-token-placeholder',
    fetchImpl: async () => { throw new Error('private network details'); }
  });
  await assert.rejects(() => client.query({ message: 'hello' }), (error) => error.code === 'NETWORK_UNAVAILABLE' && !error.message.includes('private network details'));
});

test('rejects HTTPS origins outside the LINGO allowlist', () => {
  assert.throws(() => createLingoAIClient({ baseUrl: 'https://attacker.example', getIdToken: async () => 'x'.repeat(24) }), TypeError);
});
