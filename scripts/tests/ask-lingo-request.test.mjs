import assert from 'node:assert/strict';
import test from 'node:test';
import { validateAskLingoQueryRequest } from '../../src/ai/v2/request.mjs';

const valid = {
  message: '  Help me understand this product.  ',
  mode: 'chat',
  surface: 'web',
  locale: 'en-US',
  client_request_id: 'client-req-2026-11-21-001'
};

test('normalizes a valid request and defaults locale', () => {
  const result = validateAskLingoQueryRequest({ message: ' Hello ', mode: 'research', surface: 'ios' });
  assert.equal(result.ok, true);
  assert.deepEqual(result.value, { message: 'Hello', mode: 'research', surface: 'ios', locale: 'en-US' });
});

test('accepts the optional opaque client correlation hint', () => {
  const result = validateAskLingoQueryRequest(valid);
  assert.equal(result.ok, true);
  assert.equal(result.value.clientRequestId, valid.client_request_id);
});

test('rejects missing, non-object, array, and empty requests', () => {
  for (const input of [null, undefined, [], 'hello', {}, { ...valid, message: '   ' }]) {
    assert.equal(validateAskLingoQueryRequest(input).ok, false);
  }
});

test('rejects oversized messages', () => {
  assert.equal(validateAskLingoQueryRequest({ ...valid, message: 'x'.repeat(12001) }).code, 'INVALID_REQUEST');
});

test('rejects unknown and unregistered modes rather than falling back', () => {
  assert.equal(validateAskLingoQueryRequest({ ...valid, mode: 'not-a-mode' }).code, 'INVALID_MODE');
  assert.equal(validateAskLingoQueryRequest({ ...valid, mode: 'law_enforcement' }).ok, true);
});

test('rejects client-supplied identity, scope, tool, approval, and conversation fields', () => {
  for (const field of ['user_id','tenant_id','product_id','grants','role','tool','approval_id','conversation_id','context']) {
    assert.equal(validateAskLingoQueryRequest({ ...valid, [field]: 'untrusted' }).code, 'INVALID_REQUEST', field);
  }
});

test('rejects unsupported surfaces and malformed locales', () => {
  assert.equal(validateAskLingoQueryRequest({ ...valid, surface: 'unknown' }).ok, false);
  assert.equal(validateAskLingoQueryRequest({ ...valid, locale: 'en US' }).ok, false);
});

test('rejects malformed client correlation hints', () => {
  assert.equal(validateAskLingoQueryRequest({ ...valid, client_request_id: 'has spaces' }).ok, false);
  assert.equal(validateAskLingoQueryRequest({ ...valid, client_request_id: 'x'.repeat(129) }).ok, false);
});

test('does not mutate the caller input', () => {
  const input = { ...valid };
  const before = JSON.stringify(input);
  validateAskLingoQueryRequest(input);
  assert.equal(JSON.stringify(input), before);
});
