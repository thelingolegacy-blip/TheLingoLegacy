import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker.js';
import { isRestrictedPublicPath } from '../cloudflare/security/restricted-public-paths.mjs';

test('exact restricted registers and identity implementation paths are blocked', () => {
  for (const path of [
    '/integration-configurations/',
    '/integration-ids-register',
    '/integration-links-register/',
    '/dashboard-integration-links/',
    '/exact-dashboard-links/',
    '/auth0-details/',
    '/auth0-implementation/',
    '/admin-command-center/',
    '/economy-command-center/',
  ]) assert.equal(isRestrictedPublicPath(path), true, path);
});

test('restricted register and identity paths also block nested files and assets', () => {
  for (const path of [
    '/integration-configurations/index.html',
    '/integration-ids-register/register.json',
    '/integration-links-register/export.csv',
    '/dashboard-integration-links/index.html',
    '/exact-dashboard-links/private.json',
    '/auth0-details/index.html',
    '/auth0-implementation/config.js',
    '/admin-command-center/assets/app.js',
    '/economy-command-center/index.html',
  ]) assert.equal(isRestrictedPublicPath(path), true, path);
});

test('restricted operational prefixes match only complete path segments', () => {
  for (const path of ['/ops/', '/ops/secrets.json', '/config/ops/', '/docs/ops/runbook.md', '/docs/superpowers/spec.md']) {
    assert.equal(isRestrictedPublicPath(path), true, path);
  }
  for (const path of ['/operations/', '/ops-public/', '/docs/operations/', '/docs/superpowers-public/']) {
    assert.equal(isRestrictedPublicPath(path), false, path);
  }
});

test('matching is case-insensitive and trailing-slash independent', () => {
  assert.equal(isRestrictedPublicPath('/INTEGRATION-CONFIGURATIONS'), true);
  assert.equal(isRestrictedPublicPath('/Auth0-Implementation///'), true);
  assert.equal(isRestrictedPublicPath('/OPS/child'), true);
});

test('malformed, separator-encoded, traversal, and double-encoded paths fail closed', () => {
  for (const path of [
    '/integration-configurations/%ZZ',
    '/%2fops/',
    '/%5cops/',
    '/public/%2e%2e/ops/',
    '/public/%252fops/',
    '/public/%255cops/',
  ]) assert.equal(isRestrictedPublicPath(path), true, path);
});

test('customer-facing product and readiness paths remain public', () => {
  for (const path of [
    '/',
    '/integrations-readiness/',
    '/shopify-readiness/',
    '/exa-readiness/',
    '/integration-management/',
    '/thats-my-lingo/',
    '/kottons-code/',
    '/assets/lingo-design-tokens.css',
  ]) assert.equal(isRestrictedPublicPath(path), false, path);
});

test('beacon endpoint rejects non-JSON content types before parsing', async () => {
  const response = await worker.fetch(new Request('https://thelingolegacy.com/api/beacon-text-alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: '{"phone":"+12155550123","zone":"nyc-crown-zone","consent":true}',
  }), { CANONICAL_DOMAIN: 'thelingolegacy.com' });
  assert.equal(response.status, 415);
});

test('beacon endpoint rejects oversized streamed JSON bodies', async () => {
  const response = await worker.fetch(new Request('https://thelingolegacy.com/api/beacon-text-alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '+12155550123', zone: 'nyc-crown-zone', consent: true, padding: 'x'.repeat(3000) }),
  }), { CANONICAL_DOMAIN: 'thelingolegacy.com' });
  assert.equal(response.status, 413);
});

test('beacon endpoint rejects malformed and non-object JSON', async () => {
  for (const body of ['{invalid', '[]', 'null']) {
    const response = await worker.fetch(new Request('https://thelingolegacy.com/api/beacon-text-alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    }), { CANONICAL_DOMAIN: 'thelingolegacy.com' });
    assert.equal(response.status, 400, body);
  }
});

test('beacon request cap applies per edge IP even when the phone number changes', async () => {
  const ip = '198.51.100.77';
  const env = { CANONICAL_DOMAIN: 'thelingolegacy.com' };
  const send = (suffix) => worker.fetch(new Request('https://thelingolegacy.com/api/beacon-text-alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': ip },
    body: JSON.stringify({ phone: '+1215555' + String(suffix).padStart(4, '0'), zone: 'nyc-crown-zone', consent: true }),
  }), env);
  for (let i = 1; i <= 5; i++) assert.equal((await send(i)).status, 202);
  assert.equal((await send(6)).status, 429);
});

test('Worker denies restricted requests before static asset lookup', async () => {
  const requestedAssets = [];
  const env = {
    CANONICAL_DOMAIN: 'thelingolegacy.com',
    ASSETS: {
      fetch: async (request) => {
        requestedAssets.push(new URL(request.url).pathname);
        return new Response('asset response', { status: 200 });
      },
    },
  };
  const response = await worker.fetch(new Request('https://thelingolegacy.com/integration-configurations/'), env);
  assert.equal(response.status, 404);
  assert.equal(await response.text(), JSON.stringify({ ok: false, error: 'Not found.' }));
  assert.deepEqual(requestedAssets, []);
});

test('Worker rejects ambiguous encoded paths before static asset lookup', async () => {
  const requestedAssets = [];
  const env = {
    CANONICAL_DOMAIN: 'thelingolegacy.com',
    ASSETS: {
      fetch: async (request) => {
        requestedAssets.push(new URL(request.url).pathname);
        return new Response('asset response', { status: 200 });
      },
    },
  };
  const response = await worker.fetch(new Request('https://thelingolegacy.com/public/%252fops/'), env);
  assert.equal(response.status, 404);
  assert.deepEqual(requestedAssets, []);
});

test('Worker preserves customer-facing readiness requests', async () => {
  const requestedAssets = [];
  const env = {
    CANONICAL_DOMAIN: 'thelingolegacy.com',
    ASSETS: {
      fetch: async (request) => {
        requestedAssets.push(new URL(request.url).pathname);
        return new Response('public readiness page', { status: 200, headers: { 'content-type': 'text/plain' } });
      },
    },
  };
  const response = await worker.fetch(new Request('https://thelingolegacy.com/integrations-readiness/'), env);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'public readiness page');
  assert.deepEqual(requestedAssets, ['/integrations-readiness/']);
});
