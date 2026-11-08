import test from 'node:test';
import assert from 'node:assert/strict';
import { createAiGatewayHandler } from './gateway-handler.mjs';

function dependencies(overrides = {}) {
  const calls = [];
  return {
    calls,
    authenticate: async (_request, scope) => { calls.push(['authenticate', scope]); return { ok: true, principal: { userId: 'user-1', tenantId: 'tenant-1' } }; },
    authorize: async (value) => { calls.push(['authorize', value]); return { ok: true }; },
    moderateInput: async (value) => { calls.push(['moderateInput', value]); return { ok: true }; },
    reserveBudget: async (value) => { calls.push(['reserveBudget', value]); return { ok: true, reservation: 'reservation-1' }; },
    dispatch: async (value) => { calls.push(['dispatch', value]); return { ok: true, data: { answer: 'LLG test response' }, usage: { input_tokens: 2, output_tokens: 3 } }; },
    moderateOutput: async (value) => { calls.push(['moderateOutput', value]); return { ok: true }; },
    settleBudget: async (value) => { calls.push(['settleBudget', value]); return { ok: true }; },
    ...overrides
  };
}

function post(path = '/api/ai/v1/chat', body = { provider: 'openai', message: 'Hello' }, headers = {}) {
  return new Request(`https://gateway.example.test${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body)
  });
}

test('handler fails closed when a required policy or execution dependency is missing', async () => {
  const handler = createAiGatewayHandler({});
  const response = await handler(post());
  assert.equal(response.status, 500);
  assert.equal((await response.json()).error.code, 'AI_GATEWAY_CONFIGURATION_INVALID');
});

test('unknown routes are rejected and agent execution remains disabled', async () => {
  const handler = createAiGatewayHandler(dependencies());
  assert.equal((await handler(post('/api/ai/v1/unknown'))).status, 404);
  const run = await handler(post('/api/ai/v1/agents/run', { agent_id: 'researcher', task: 'Run' }));
  assert.equal(run.status, 503);
  assert.equal((await run.json()).error.code, 'AI_AGENT_EXECUTION_DISABLED');
});

test('known routes reject non-POST methods with an Allow header', async () => {
  const handler = createAiGatewayHandler(dependencies());
  const response = await handler(new Request('https://gateway.example.test/api/ai/v1/chat'));
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'POST');
});

test('authentication runs before body parsing and rejects unauthenticated callers', async () => {
  const deps = dependencies({ authenticate: async () => ({ ok: false, status: 401, code: 'AUTHENTICATION_REQUIRED' }) });
  const handler = createAiGatewayHandler(deps);
  const response = await handler(new Request('https://gateway.example.test/api/ai/v1/chat', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: '{'
  }));
  assert.equal(response.status, 401);
  assert.deepEqual(deps.calls, []);
});

test('request content type and byte limits are enforced before dispatch', async () => {
  const deps = dependencies();
  const handler = createAiGatewayHandler(deps);
  const wrongType = await handler(post('/api/ai/v1/chat', { provider: 'openai', message: 'Hi' }, { 'content-type': 'text/plain' }));
  assert.equal(wrongType.status, 415);
  const oversized = await handler(post('/api/ai/v1/chat', { provider: 'openai', message: 'Hi' }, { 'content-length': '20000' }));
  assert.equal(oversized.status, 413);
  assert.equal(deps.calls.some(([name]) => name === 'dispatch'), false);
});

test('invalid request fields are rejected before authorization or budget reservation', async () => {
  const deps = dependencies();
  const handler = createAiGatewayHandler(deps);
  const response = await handler(post('/api/ai/v1/chat', {
    provider: 'openai', message: 'Hi', tenant_id: 'tenant-evil'
  }));
  assert.equal(response.status, 400);
  assert.equal(deps.calls.some(([name]) => name === 'authorize' || name === 'reserveBudget'), false);
});

test('authorization denial blocks moderation, budget reservation, and dispatch', async () => {
  const deps = dependencies({ authorize: async () => ({ ok: false }) });
  const handler = createAiGatewayHandler(deps);
  const response = await handler(post());
  assert.equal(response.status, 403);
  assert.equal(deps.calls.some(([name]) => name === 'reserveBudget' || name === 'dispatch'), false);
});

test('input policy denial blocks budget reservation and provider dispatch', async () => {
  const deps = dependencies({ moderateInput: async () => ({ ok: false }) });
  const handler = createAiGatewayHandler(deps);
  const response = await handler(post());
  assert.equal(response.status, 403);
  assert.equal(deps.calls.some(([name]) => name === 'reserveBudget' || name === 'dispatch'), false);
});

test('budget denial prevents provider dispatch', async () => {
  const deps = dependencies({ reserveBudget: async () => ({ ok: false }) });
  const handler = createAiGatewayHandler(deps);
  const response = await handler(post());
  assert.equal(response.status, 429);
  assert.equal(deps.calls.some(([name]) => name === 'dispatch'), false);
});

test('successful chat executes gates in order and reconciles budget before returning output', async () => {
  const deps = dependencies();
  const handler = createAiGatewayHandler(deps);
  const response = await handler(post());
  const payload = await response.json();
  assert.equal(response.status, 200);
  assert.equal(payload.ok, true);
  assert.equal(payload.capability, 'ai:chat');
  assert.deepEqual(payload.data, { answer: 'LLG test response' });
  assert.deepEqual(deps.calls.map(([name]) => name), [
    'authenticate', 'authorize', 'moderateInput', 'reserveBudget',
    'dispatch', 'moderateOutput', 'settleBudget'
  ]);
  assert.equal(deps.calls[1][1].providerIds[0], 'openai');
  assert.equal(deps.calls.at(-1)[1].outcome, 'succeeded');
});

test('compare sends the selected provider set through authorization and budget gates', async () => {
  const deps = dependencies();
  const handler = createAiGatewayHandler(deps);
  const response = await handler(post('/api/ai/v1/compare', {
    providers: ['openai', 'claude'], message: 'Compare'
  }));
  assert.equal(response.status, 200);
  assert.deepEqual(deps.calls.find(([name]) => name === 'authorize')[1].providerIds, ['openai', 'claude']);
});

test('dispatch failure reconciles the reservation and returns a normalized error', async () => {
  const deps = dependencies({ dispatch: async () => ({ ok: false, error: 'secret upstream detail' }) });
  const handler = createAiGatewayHandler(deps);
  const response = await handler(post());
  assert.equal(response.status, 502);
  assert.equal((await response.json()).error.code, 'AI_EXECUTION_FAILED');
  assert.equal(deps.calls.at(-1)[1].outcome, 'failed');
});

test('output policy denial reconciles the reservation and withholds the output', async () => {
  const deps = dependencies({ moderateOutput: async () => ({ ok: false }) });
  const handler = createAiGatewayHandler(deps);
  const response = await handler(post());
  assert.equal(response.status, 403);
  assert.equal((await response.json()).error.code, 'AI_OUTPUT_POLICY_BLOCKED');
  assert.equal(deps.calls.at(-1)[1].outcome, 'blocked');
});

test('budget reconciliation failure prevents a success response', async () => {
  const deps = dependencies({ settleBudget: async () => ({ ok: false }) });
  const handler = createAiGatewayHandler(deps);
  const response = await handler(post());
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error.code, 'AI_BUDGET_RECONCILIATION_UNAVAILABLE');
});
