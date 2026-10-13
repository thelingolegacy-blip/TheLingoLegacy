import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker.js';

const env = {
  CANONICAL_DOMAIN: 'thelingolegacy.com',
  ASSETS: {
    async fetch(request) {
      const url = new URL(request.url);
      if (url.pathname === '/sample.html') {
        return new Response('<!doctype html><html><head><title>Sample</title></head><body>hello</body></html>', {
          status: 200,
          headers: { 'content-type': 'text/html; charset=utf-8' },
        });
      }
      if (url.pathname === '/sample.txt') {
        return new Response('plain text', { status: 200, headers: { 'content-type': 'text/plain; charset=utf-8' } });
      }
      return new Response('not found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
    },
  },
};

async function fetch(path, init = {}, host = 'thelingolegacy.com') {
  return worker.fetch(new Request(`https://${host}${path}`, init), env);
}

test('health endpoint is no-store, plain text, and includes baseline security headers', async () => {
  const response = await fetch('/healthz');
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'ok\n');
  assert.match(response.headers.get('content-type'), /text\/plain/);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-frame-options'), 'SAMEORIGIN');
  assert.equal(response.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
  assert.equal(response.headers.get('permissions-policy'), 'camera=(), microphone=(), geolocation=(), payment=()');
  assert.equal(response.headers.get('x-lingo-runtime'), '5.0.0-studio-platform');
});

test('platform gate endpoint reports fail-closed state and denies promotion', async () => {
  const response = await fetch('/api/v1/platform/gates');
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.fail_closed, true);
  assert.equal(body.mutation_freeze, true);
  assert.equal(body.lkg, 'PROTECTED');
  assert.equal(body.gates.G02_RUNNER, 'FAIL / UNVERIFIED');
});

test('documented platform API routes return structured JSON', async () => {
  for (const route of [
    '/api/v1/runtime',
    '/api/v1/platform/manifest',
    '/api/v1/platform/status',
    '/api/v1/platform/modules',
    '/api/v1/site/context',
  ]) {
    const response = await fetch(route);
    assert.equal(response.status, 200, route);
    assert.match(response.headers.get('content-type'), /application\/json/, route);
    const body = await response.json();
    assert.equal(body.ok, true, route);
  }
});

test('unknown API paths fail closed with a JSON 404 and do not fall through to assets', async () => {
  const response = await fetch('/api/v1/not-a-real-route');
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { ok: false, error: 'API route not found.' });
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('HTML asset fallback is dynamically decorated and not cacheable', async () => {
  const response = await fetch('/sample.html');
  assert.equal(response.status, 200);
  const body = await response.text();
  assert.match(body, /name="lingo-runtime"/);
  assert.match(body, /studio-ui-runtime\.css/);
  assert.match(body, /window\.__LINGO_RUNTIME__/);
  assert.equal(response.headers.get('cache-control'), 'no-store, must-revalidate');
  assert.equal(response.headers.get('x-lingo-dynamic'), 'true');
});

test('non-HTML asset fallback remains unmodified apart from security headers', async () => {
  const response = await fetch('/sample.txt');
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'plain text');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('cache-control'), null);
});

test('unknown static asset fallback preserves upstream 404', async () => {
  const response = await fetch('/missing.css');
  assert.equal(response.status, 404);
  assert.equal(await response.text(), 'not found');
});

test('www requests redirect to canonical apex while preserving path and query', async () => {
  const response = await fetch('/some/path?source=test', {}, 'www.thelingolegacy.com');
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('location'), 'https://thelingolegacy.com/some/path?source=test');
  assert.equal(response.headers.get('x-frame-options'), 'SAMEORIGIN');
});

test('CORS reflects only configured canonical origins', async () => {
  const allowed = await fetch('/api/v1/platform/gates', { headers: { Origin: 'https://www.thelingolegacy.com' } });
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'https://www.thelingolegacy.com');
  const denied = await fetch('/api/v1/platform/gates', { headers: { Origin: 'https://attacker.example' } });
  assert.equal(denied.headers.get('access-control-allow-origin'), null);
});

test('OPTIONS requests are answered without reaching asset fallback', async () => {
  const response = await fetch('/api/v1/platform/gates', { method: 'OPTIONS' });
  assert.equal(response.status, 204);
  assert.equal(await response.text(), '');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
});

test('asset runtime exceptions become generic no-store errors without leaking details', async () => {
  const brokenEnv = { ...env, ASSETS: { fetch: async () => { throw new Error('private internal detail'); } } };
  const response = await worker.fetch(new Request('https://thelingolegacy.com/boom'), brokenEnv);
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), { ok: false, error: 'Request could not be completed right now.' });
  assert.equal(response.headers.get('cache-control'), 'no-store');
});
