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

test('both legacy checkout paths preserve POST-only behavior and fail closed without Stripe configuration', async () => {
  for (const path of ['/api/checkout', '/api/create-checkout-session']) {
    const wrongMethod = await worker.fetch(request(path), env());
    assert.equal(wrongMethod.status, 405, `${path} must reject GET`);

    const response = await worker.fetch(request(path, 'POST'), env());
    const body = await response.json();
    assert.equal(response.status, 503, `${path} must remain unavailable without Stripe configuration`);
    assert.match(body.error, /checkout is not configured/i, path);
  }
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


test('legacy metrics endpoint rejects mutation methods', async () => {
  const response = await worker.fetch(request('/api/metrics', 'POST'), env());
  assert.equal(response.status, 405);
});

test('legacy checkout alias rejects non-POST requests', async () => {
  const response = await worker.fetch(request('/api/checkout'), env());
  assert.equal(response.status, 405);
});

test('allowed-origin preflight includes the expected CORS contract', async () => {
  const response = await worker.fetch(new Request('https://thelingolegacy.com/api/health', {
    method: 'OPTIONS',
    headers: {
      Origin: 'https://www.thelingolegacy.com',
      'Access-Control-Request-Method': 'GET',
    },
  }), env());

  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-allow-origin'), 'https://www.thelingolegacy.com');
  assert.match(response.headers.get('access-control-allow-methods') || '', /GET/);
  assert.equal(response.headers.get('vary'), 'Origin');
});

test('untrusted origins do not receive an allow-origin header', async () => {
  const response = await worker.fetch(new Request('https://thelingolegacy.com/api/health', {
    headers: { Origin: 'https://untrusted.example' },
  }), env());

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('access-control-allow-origin'), null);
});

test('legacy API success and fail-closed responses retain the required security headers', async () => {
  const cases = [
    ['/api/health', 'GET', 200],
    ['/api/health', 'POST', 405],
    ['/api/checkout', 'GET', 405],
    ['/api/checkout', 'POST', 503],
    ['/api/create-checkout-session', 'GET', 405],
    ['/api/create-checkout-session', 'POST', 503],
    ['/api/metrics', 'GET', 503],
    ['/api/metrics', 'POST', 405],
    ['/api/rewards/claim', 'POST', 503],
    ['/api/rewards/claim', 'GET', 405],
  ];
  const requiredHeaders = {
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'strict-transport-security': 'max-age=63072000; includeSubDomains; preload',
    'content-security-policy': "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self' mailto:; img-src 'self' data: https:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; upgrade-insecure-requests",
    'cache-control': 'no-store',
    'x-lingo-runtime': '2026.2.0',
  };

  for (const [path, method, expectedStatus] of cases) {
    const response = await worker.fetch(request(path, method), env());
    assert.equal(response.status, expectedStatus, `${method} ${path}`);
    for (const [name, value] of Object.entries(requiredHeaders)) {
      assert.equal(response.headers.get(name), value, `${method} ${path}: ${name}`);
    }
  }
});
