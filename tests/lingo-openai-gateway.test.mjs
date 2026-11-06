import test from 'node:test';
import assert from 'node:assert/strict';
import { handleLingoAIRequest } from '../src/ai/openai-gateway.js';

const request = (path, method = 'GET', body) => new Request(`https://lingo.test${path}`, {
  method,
  headers: body === undefined ? {} : { 'content-type': 'application/json' },
  body: body === undefined ? undefined : JSON.stringify(body)
});

test('status is explicitly zero-spend disabled by default', async () => {
  const response = await handleLingoAIRequest(request('/api/v1/ai/status'), {});
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.mode, 'ZERO_SPEND_DISABLED');
  assert.equal(body.paid_inference_enabled, false);
});

test('paid inference is blocked before any upstream request', async () => {
  let called = false;
  const response = await handleLingoAIRequest(
    request('/api/v1/ai/responses', 'POST', { input: 'hello' }),
    {},
    async () => { called = true; throw new Error('must not be called'); }
  );
  assert.equal(response.status, 423);
  assert.equal((await response.json()).code, 'PAID_INFERENCE_DISABLED');
  assert.equal(called, false);
});

test('enabled requests reject missing server credentials', async () => {
  const response = await handleLingoAIRequest(
    request('/api/v1/ai/responses', 'POST', { input: 'hello' }),
    { LINGO_AI_PAID_API_ENABLED: 'true' }
  );
  assert.equal(response.status, 503);
});

test('enabled requests use Responses API and return output text', async () => {
  let captured;
  const response = await handleLingoAIRequest(
    request('/api/v1/ai/responses', 'POST', { input: 'hello' }),
    { LINGO_AI_PAID_API_ENABLED: 'true', OPENAI_API_KEY: 'test-secret' },
    async (url, options) => {
      captured = { url, options };
      return new Response(JSON.stringify({ output_text: 'hello back' }), { status: 200 });
    }
  );
  assert.equal(response.status, 200);
  assert.equal((await response.json()).output_text, 'hello back');
  assert.equal(captured.url, 'https://api.openai.com/v1/responses');
  assert.equal(captured.options.headers.authorization, 'Bearer test-secret');
  assert.equal(JSON.parse(captured.options.body).model, 'gpt-6-astra');
});

test('oversized input is rejected without an upstream call', async () => {
  let called = false;
  const response = await handleLingoAIRequest(
    request('/api/v1/ai/responses', 'POST', { input: 'x'.repeat(4001) }),
    { LINGO_AI_PAID_API_ENABLED: 'true', OPENAI_API_KEY: 'test-secret' },
    async () => { called = true; }
  );
  assert.equal(response.status, 400);
  assert.equal(called, false);
});
