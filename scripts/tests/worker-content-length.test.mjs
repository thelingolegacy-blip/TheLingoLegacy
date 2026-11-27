import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../../worker.js';

const url = 'https://thelingolegacy.com/api/beacon-text-alerts';
const env = { CANONICAL_DOMAIN: 'thelingolegacy.com' };

function request(body, contentLength) {
  return new Request(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'content-length': String(contentLength),
    },
    body,
  });
}

test('accepts a valid decimal Content-Length and validates the beacon payload', async () => {
  const body = JSON.stringify({
    phone: '+12155550123',
    zone: 'full-entity-simulcast',
    source: 'worker-regression-test',
    consent: true,
  });
  const response = await worker.fetch(request(body, Buffer.byteLength(body)), env);
  assert.equal(response.status, 202);
  const result = await response.json();
  assert.equal(result.ok, true);
  assert.equal(result.staged, true);
});

test('rejects a non-decimal Content-Length', async () => {
  const body = JSON.stringify({ phone: '+12155550123' });
  const response = await worker.fetch(request(body, 'not-a-number'), env);
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /Invalid Content-Length/);
});

test('rejects a Content-Length above the beacon body limit', async () => {
  const body = 'x'.repeat(2049);
  const response = await worker.fetch(request(body, Buffer.byteLength(body)), env);
  assert.equal(response.status, 413);
  assert.match((await response.json()).error, /too large/);
});
