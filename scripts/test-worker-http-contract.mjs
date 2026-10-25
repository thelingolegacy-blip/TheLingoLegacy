import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const workerPath = fileURLToPath(new URL('../worker.js', import.meta.url));
const workerSource = fs.readFileSync(workerPath, 'utf8');
const { default: worker } = await import(`data:text/javascript;base64,${Buffer.from(workerSource).toString('base64')}`);

function env(overrides = {}) {
  return {
    CANONICAL_DOMAIN: 'thelingolegacy.com',
    ASSETS: { fetch: async () => new Response('<!doctype html><html><head></head><body>home</body></html>', {
      headers: { 'content-type': 'text/html; charset=utf-8' },
    }) },
    ...overrides,
  };
}

async function call(url, method = 'GET', headers = {}, bindings = env()) {
  return worker.fetch(new Request(url, { method, headers }), bindings);
}

test('health check returns a no-store response with baseline security headers', async () => {
  const response = await call('https://thelingolegacy.com/healthz');
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'ok\n');
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-frame-options'), 'DENY');
  assert.equal(response.headers.get('x-lingo-runtime'), '5.0.0-studio-platform');
});

test('HEAD health check has no body and preserves health response status', async () => {
  const response = await call('https://thelingolegacy.com/healthz', 'HEAD');
  assert.equal(response.status, 200);
  assert.equal(await response.text(), '');
  assert.equal(response.headers.get('content-type'), 'text/plain; charset=utf-8');
});

test('www host redirects to canonical host while preserving path and query', async () => {
  const response = await call('https://www.thelingolegacy.com/studio?mode=preview');
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('location'), 'https://thelingolegacy.com/studio?mode=preview');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
});

test('HTML responses receive dynamic runtime metadata and shared studio assets', async () => {
  const response = await call('https://thelingolegacy.com/');
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /name="lingo-runtime" content="5\.0\.0-studio-platform"/);
  assert.match(html, /name="lingo-dynamic" content="true"/);
  assert.match(html, /\/assets\/lingo-design-tokens\.css/);
  assert.match(html, /\/assets\/studio-ui-runtime\.js/);
  assert.match(html, /window\.__LINGO_RUNTIME__/);
  assert.equal(response.headers.get('cache-control'), 'no-store, must-revalidate');
  assert.equal(response.headers.get('x-lingo-dynamic'), 'true');
});

test('CORS allows canonical origins and does not reflect an untrusted origin', async () => {
  const allowed = await call('https://thelingolegacy.com/api/v1/platform/gates', 'OPTIONS', {
    Origin: 'https://www.thelingolegacy.com',
  });
  assert.equal(allowed.status, 204);
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'https://www.thelingolegacy.com');

  const denied = await call('https://thelingolegacy.com/api/v1/platform/gates', 'OPTIONS', {
    Origin: 'https://attacker.example',
  });
  assert.equal(denied.status, 204);
  assert.equal(denied.headers.get('access-control-allow-origin'), null);
});

test('asset backend errors return a generic error without leaking exception details', async () => {
  const response = await call('https://thelingolegacy.com/', 'GET', {}, env({
    ASSETS: { fetch: async () => { throw new Error('sensitive-internal-detail'); } },
  }));
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: 'Request could not be completed right now.',
  });
  assert.doesNotMatch(await (async () => JSON.stringify({}))(), /sensitive-internal-detail/);
});
