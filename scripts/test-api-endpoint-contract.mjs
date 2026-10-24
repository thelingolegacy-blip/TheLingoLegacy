import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const workerPath = fileURLToPath(new URL('../worker.js', import.meta.url));
const workerSource = fs.readFileSync(workerPath, 'utf8');
const { default: worker } = await import(`data:text/javascript;base64,${Buffer.from(workerSource).toString('base64')}`);

async function call(path, method = 'GET', headers = {}) {
  return worker.fetch(new Request(`https://thelingolegacy.com${path}`, { method, headers }), {
    CANONICAL_DOMAIN: 'thelingolegacy.com',
    ASSETS: { fetch: async () => new Response('asset', { status: 200 }) },
  });
}

test('API discovery lists only implemented endpoints and their supported methods', async () => {
  const response = await call('/api/v1');
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.api_version, 'v1');
  assert.ok(body.endpoints.some((endpoint) => endpoint.path === '/api/v1/platform/gates'));
  assert.ok(body.endpoints.some((endpoint) => endpoint.path === '/api/create-checkout-session' && endpoint.methods.includes('POST')));
  assert.ok(body.endpoints.some((endpoint) => endpoint.path === '/api/beacon-text-alerts' && endpoint.methods.includes('POST')));
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
});

test('read-only API endpoints reject unsafe methods and advertise Allow', async () => {
  for (const path of ['/api/v1', '/api/v1/runtime', '/api/v1/platform/manifest', '/api/v1/platform/status', '/api/v1/platform/gates', '/api/v1/platform/modules', '/api/v1/site/context']) {
    const response = await call(path, 'POST');
    assert.equal(response.status, 405, path);
    assert.match(response.headers.get('allow') || '', /GET/);
    assert.match(response.headers.get('allow') || '', /HEAD/);
    assert.match(response.headers.get('allow') || '', /OPTIONS/);
    assert.deepEqual(await response.json(), {
      ok: false,
      error: 'Method not allowed',
      allowed_methods: ['GET', 'HEAD', 'OPTIONS'],
    });
  }
});

test('HEAD on read-only endpoints returns headers without a response body', async () => {
  for (const path of ['/api/v1', '/api/v1/runtime', '/api/v1/platform/gates', '/api/v1/platform/modules']) {
    const response = await call(path, 'HEAD');
    assert.equal(response.status, 200, path);
    assert.equal(await response.text(), '', path);
    assert.equal(response.headers.get('cache-control'), 'no-store');
  }
});

test('release gate endpoint exposes fail-closed status and denies promotion', async () => {
  const response = await call('/api/v1/platform/gates');
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.status, 'PROTECTED_HOLD');
  assert.equal(body.fail_closed, true);
  assert.equal(body.mutation_freeze, true);
  assert.equal(body.lkg, 'PROTECTED');
  assert.equal(body.authorization.production_promotion, false);
  assert.equal(body.authorization.activation, false);
  assert.equal(body.gates.G02_RUNNER, 'FAIL / UNVERIFIED');
  assert.equal(body.gates.G11_ACCEPTANCE, 'BLOCKED');
});

test('runtime integration flags are explicitly documented as binding presence only', async () => {
  const response = await call('/api/v1/runtime');
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.api_version, 'v1');
  assert.equal(body.integration_semantics, 'binding_presence_only_not_health_check');
  assert.equal(body.safety.real_money_gameplay, false);
  assert.equal(body.safety.cash_out, false);
});

test('POST-only commerce endpoints reject GET with accurate Allow headers', async () => {
  for (const path of ['/api/create-checkout-session', '/api/beacon-text-alerts']) {
    const response = await call(path, 'GET');
    assert.equal(response.status, 405, path);
    assert.match(response.headers.get('allow') || '', /POST/);
    assert.match(response.headers.get('allow') || '', /OPTIONS/);
    assert.deepEqual(await response.json(), {
      ok: false,
      error: 'Method not allowed',
      allowed_methods: ['POST', 'OPTIONS'],
    });
  }
});

test('HEAD requests to POST-only endpoints return 405 without a body', async () => {
  for (const path of ['/api/create-checkout-session', '/api/beacon-text-alerts']) {
    const response = await call(path, 'HEAD');
    assert.equal(response.status, 405, path);
    assert.match(response.headers.get('allow') || '', /POST/);
    assert.match(response.headers.get('allow') || '', /OPTIONS/);
    assert.equal(await response.text(), '', path);
  }
});

test('unknown API paths return a no-store JSON 404 without exposing internal details', async () => {
  const response = await call('/api/v1/not-registered');
  assert.equal(response.status, 404);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.deepEqual(await response.json(), { ok: false, error: 'API route not found.' });
});

test('canonical-origin CORS preflight remains available', async () => {
  const response = await call('/api/v1/platform/gates', 'OPTIONS', {
    Origin: 'https://www.thelingolegacy.com',
    'Access-Control-Request-Method': 'GET',
  });
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-allow-origin'), 'https://www.thelingolegacy.com');
});
