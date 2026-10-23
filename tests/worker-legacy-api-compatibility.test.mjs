import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

const source = await fs.readFile(new URL('../worker.js', import.meta.url), 'utf8');
const { default: worker } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

function request(path, method = 'GET') {
  return new Request(`https://thelingolegacy.com${path}`, { method });
}

function env(overrides = {}) {
  return {
    CANONICAL_DOMAIN: 'thelingolegacy.com',
    ASSETS: { fetch: async () => new Response('asset', { status: 200 }) },
    ...overrides,
  };
}

test('legacy health endpoint reports process health without claiming release readiness', async () => {
  const response = await worker.fetch(request('/api/health'), env());
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.release.status, 'PROTECTED_HOLD');
  assert.equal(body.release.promotion_authorized, false);
  assert.equal(body.dependencies.verified, false);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
});

test('legacy health endpoint rejects non-GET methods', async () => {
  const response = await worker.fetch(request('/api/health', 'POST'), env());
  assert.equal(response.status, 405);
});

test('legacy metrics endpoint fails closed until a metrics backend is configured', async () => {
  const response = await worker.fetch(request('/api/metrics'), env());
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.equal(body.available, false);
  assert.equal(body.release_status, 'PROTECTED_HOLD');
});

test('legacy checkout path reaches the existing checkout handler rather than API 404', async () => {
  const response = await worker.fetch(request('/api/checkout', 'POST'), env());
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.match(body.error, /checkout is not configured/i);
});

test('rewards claim fails closed until durable ledger and authorization checks exist', async () => {
  const response = await worker.fetch(request('/api/rewards/claim', 'POST'), env());
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.equal(body.available, false);
  assert.match(body.error, /durable ledger/i);
});

test('rewards claim rejects methods other than POST', async () => {
  const response = await worker.fetch(request('/api/rewards/claim'), env());
  assert.equal(response.status, 405);
});

test('versioned runtime contract remains available', async () => {
  const response = await worker.fetch(request('/api/v1/runtime'), env());
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.runtime, 'cloudflare-worker');
});

test('unknown API paths still return 404', async () => {
  const response = await worker.fetch(request('/api/not-a-real-route'), env());
  assert.equal(response.status, 404);
});
