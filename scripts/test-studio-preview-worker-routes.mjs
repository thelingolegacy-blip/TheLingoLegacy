import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const snapshotPath = fileURLToPath(new URL('../docs/evidence/snapshots/2026-11-06-cloudflare-studio-preview-worker-v6.md', import.meta.url));
const snapshot = fs.readFileSync(snapshotPath, 'utf8');
const sourceMatch = snapshot.match(/```javascript\n([\s\S]*?)\n```/);
assert.ok(sourceMatch, 'forensic snapshot must contain the captured JavaScript source');
const workerModule = await import(`data:text/javascript;base64,${Buffer.from(sourceMatch[1], 'utf8').toString('base64')}`);
const worker = workerModule.default;
assert.equal(typeof worker?.fetch, 'function', 'captured Worker must expose a fetch handler');

async function withMockFetch(mockFetch, run) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = mockFetch;
  try {
    return await run();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

test('static Next.js chunks proxy to the Universe origin and preserve query/method', async () => {
  let upstream;
  const response = await withMockFetch(async (request) => {
    upstream = request;
    return new Response('chunk-fixture', { status: 200, headers: { 'content-type': 'application/javascript' } });
  }, () => worker.fetch(new Request('https://preview.example/_next/static/chunks/pages/index-test.js?v=1', {
    headers: { accept: 'application/javascript', 'accept-language': 'en-US', cookie: 'must-not-forward' },
  })));

  assert.equal(upstream.url, 'https://lingolegacy-universe-gateway-h6kqu4.v2.appdeploy.ai/_next/static/chunks/pages/index-test.js?v=1');
  assert.equal(upstream.method, 'GET');
  assert.equal(upstream.redirect, 'manual');
  assert.equal(upstream.headers.get('accept'), 'application/javascript');
  assert.equal(upstream.headers.get('cookie'), null);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'application/javascript');
  assert.equal(await response.text(), 'chunk-fixture');
});

test('allowlisted Next.js page data proxies the exact build path and slug query', async () => {
  let upstream;
  const response = await withMockFetch(async (request) => {
    upstream = request;
    return new Response('{"pageProps":{}}', { status: 200, headers: { 'content-type': 'application/json' } });
  }, () => worker.fetch(new Request('https://preview.example/_next/data/build_123/legacy.json?slug=legacy')));

  assert.equal(upstream.url, 'https://lingolegacy-universe-gateway-h6kqu4.v2.appdeploy.ai/_next/data/build_123/legacy.json?slug=legacy');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /application\/json/);
});

test('prefixed app static assets proxy to the registered app origin', async () => {
  let upstream;
  const response = await withMockFetch(async (request) => {
    upstream = request;
    return new Response('prefixed-chunk-fixture', { status: 200, headers: { 'content-type': 'application/javascript' } });
  }, () => worker.fetch(new Request('https://preview.example/apps/universe/_next/static/chunks/pages/index-test.js')));

  assert.equal(upstream.url, 'https://lingolegacy-universe-gateway-h6kqu4.v2.appdeploy.ai/_next/static/chunks/pages/index-test.js');
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'prefixed-chunk-fixture');
});

test('prefixed app page-data paths remain blocked by the generic proxy guard', async () => {
  let called = false;
  const response = await withMockFetch(async () => {
    called = true;
    return new Response('unexpected');
  }, () => worker.fetch(new Request('https://preview.example/apps/universe/_next/data/build_123/legacy.json?slug=legacy')));

  assert.equal(response.status, 403);
  assert.equal(called, false);
});

test('page-data proxy rejects unapproved slugs and duplicate or mismatched slug parameters', async (t) => {
  for (const path of [
    '/_next/data/build_123/not-registered.json?slug=not-registered',
    '/_next/data/build_123/legacy.json?slug=studio',
    '/_next/data/build_123/legacy.json?slug=legacy&slug=legacy',
    '/_next/data/build_123/legacy.json?slug=legacy&other=1',
  ]) {
    await t.test(path, async () => {
      let called = false;
      const response = await withMockFetch(async () => {
        called = true;
        return new Response('unexpected');
      }, () => worker.fetch(new Request(`https://preview.example${path}`)));
      assert.equal(response.status, 403);
      assert.equal(called, false);
    });
  }
});

test('KottonsCode world images proxy to the Kotton’s Code origin', async () => {
  let upstream;
  const response = await withMockFetch(async (request) => {
    upstream = request;
    return new Response('jpeg-fixture', { status: 200, headers: { 'content-type': 'image/jpeg' } });
  }, () => worker.fetch(new Request('https://preview.example/resources/KottonsCode-world-3.jpeg')));

  assert.equal(upstream.url, 'https://kotton-s-code-cartoon-studio-509py3.v2.appdeploy.ai/resources/KottonsCode-world-3.jpeg');
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'image/jpeg');
  assert.equal(await response.text(), 'jpeg-fixture');
});

test('read-only guard rejects mutation methods without calling an origin', async () => {
  let called = false;
  const response = await withMockFetch(async () => {
    called = true;
    return new Response('unexpected');
  }, () => worker.fetch(new Request('https://preview.example/_next/static/test.js', { method: 'POST' })));

  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'GET, HEAD');
  assert.equal(called, false);
});

test('protected API paths are not proxied', async () => {
  let called = false;
  const response = await withMockFetch(async () => {
    called = true;
    return new Response('unexpected');
  }, () => worker.fetch(new Request('https://preview.example/api/private')));

  assert.equal(response.status, 403);
  assert.equal(called, false);
});

test('upstream redirects are rejected instead of followed', async () => {
  const response = await withMockFetch(async () => new Response(null, {
    status: 302,
    headers: { location: 'https://outside.example/redirect' },
  }), () => worker.fetch(new Request('https://preview.example/_next/static/chunks/app.js')));

  assert.equal(response.status, 502);
  assert.match(await response.text(), /redirect blocked/i);
});
