import test from 'node:test';
import assert from 'node:assert/strict';
import { validateGatewayRequest } from './gateway-request-validation.mjs';

test('chat accepts a bounded message and optional known provider', () => {
  const result = validateGatewayRequest('chat', { message: '  Hello LINGO  ', provider: 'openai' });
  assert.equal(result.ok, true);
  assert.deepEqual(result.value, { message: 'Hello LINGO', provider: 'openai' });
});

test('chat rejects unknown fields, unknown providers, empty and oversized messages', () => {
  for (const body of [
    { message: 'hello', provider: 'unknown' },
    { message: 'hello', tenant_id: 'attacker-tenant' },
    { message: '   ' },
    { message: 'x'.repeat(2001) }
  ]) assert.equal(validateGatewayRequest('chat', body).ok, false);
});

test('compare requires two to four unique known providers', () => {
  const valid = validateGatewayRequest('compare', {
    message: 'Compare independently',
    providers: ['openai', 'claude', 'gemini']
  });
  assert.equal(valid.ok, true);
  for (const providers of [
    ['openai'], ['openai', 'openai'],
    ['openai', 'claude', 'gemini', 'grok', 'openai'],
    ['openai', 'unknown']
  ]) {
    assert.equal(validateGatewayRequest('compare', { message: 'hello', providers }).ok, false);
  }
});

test('compare rejects client-supplied identity, budget, and policy fields', () => {
  const result = validateGatewayRequest('compare', {
    message: 'hello',
    providers: ['openai', 'claude'],
    tenant_id: 'tenant-override',
    max_spend: 999999,
    tool_scopes: ['admin']
  });
  assert.deepEqual(result, { ok: false, status: 400, code: 'AI_COMPARE_REQUEST_INVALID' });
});

test('agent requests accept only a safe agent identifier and bounded task', () => {
  const valid = validateGatewayRequest('agents', { agent_id: 'research_assistant-2', task: 'Summarize sources' });
  assert.equal(valid.ok, true);
  for (const agent_id of ['../admin', 'Agent', 'x'.repeat(65), '']) {
    assert.equal(validateGatewayRequest('agents', { agent_id, task: 'Do work' }).ok, false);
  }
});

test('agent requests cannot grant tools, roles, tenant IDs, or approvals', () => {
  const result = validateGatewayRequest('agents', {
    agent_id: 'researcher',
    task: 'Do work',
    tools: ['shell'],
    approved: true,
    role: 'admin'
  });
  assert.equal(result.ok, false);
});

test('developer requests enforce language allowlist and bounded task/code', () => {
  const result = validateGatewayRequest('developer', {
    language: 'typescript',
    task: 'Review this code',
    code: 'const answer: string = "ok";'
  });
  assert.equal(result.ok, true);
  assert.equal(result.value.code, 'const answer: string = "ok";');
  for (const body of [
    { language: 'bash', task: 'Run this' },
    { language: 'javascript', task: 'x'.repeat(2001) },
    { language: 'python', task: 'Review', code: 'x'.repeat(12001) }
  ]) assert.equal(validateGatewayRequest('developer', body).ok, false);
});

test('all request kinds reject arrays, null, primitives, and unsupported kinds', () => {
  for (const body of [null, [], 'hello', 7]) {
    assert.equal(validateGatewayRequest('chat', body).ok, false);
  }
  assert.deepEqual(validateGatewayRequest('unknown', {}), {
    ok: false, status: 400, code: 'AI_REQUEST_KIND_UNSUPPORTED'
  });
});

test('text fields reject control characters while code preserves normal line breaks', () => {
  assert.equal(validateGatewayRequest('chat', { message: 'hello\\u0000world' }).ok, false);
  const code = validateGatewayRequest('developer', {
    language: 'python', task: 'Review code', code: 'def f():\\n\\treturn 1'
  });
  assert.equal(code.ok, true);
});

test('normalized values are frozen and never include unrecognized input keys', () => {
  const result = validateGatewayRequest('chat', { message: 'hello' });
  assert.equal(Object.isFrozen(result.value), true);
  assert.deepEqual(Object.keys(result.value), ['message']);
});
