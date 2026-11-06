import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const workerSource = await read('../../worker.js');
const rootWorkerSource = await read('../../cloudflare/flagship-root/worker.js');
const wrangler = JSON.parse(await read('../../wrangler.jsonc'));
const routeManifest = JSON.parse(await read('../../studio/routes.json'));

const importSource = async (source) => {
  const encoded = Buffer.from(source).toString('base64');
  return import(`data:text/javascript;base64,${encoded}`);
};

const { default: worker } = await importSource(workerSource);
const { default: rootWorker } = await importSource(rootWorkerSource);

assert.equal(wrangler.name, 'thelingolegacyv-5');
assert.ok(wrangler.routes.some((route) => route.pattern === 'thelingolegacy.com/*'));
assert.ok(wrangler.routes.some((route) => route.pattern === 'www.thelingolegacy.com/*'));
assert.equal(routeManifest.canonicalHost, 'thelingolegacy.com');
assert.ok(routeManifest.routes.some((route) => route.path === '/' && route.surface === 'legacy-hq'));

const rootResponse = await rootWorker.fetch(new Request('https://thelingolegacy.com/'));
assert.equal(rootResponse.status, 200);
const rootHtml = await rootResponse.text();
assert.match(rootHtml, /Candidate experience/);

async function exists(relativePath) {
  try {
    await readFile(new URL(relativePath, import.meta.url));
    return true;
  } catch {
    return false;
  }
}

const localLinks = [...rootHtml.matchAll(/(?:href|src)="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((value) => value.startsWith('/') && !value.startsWith('//'));

for (const link of localLinks) {
  const routePath = new URL(link, 'https://thelingolegacy.com').pathname;
  const repoPath = routePath.replace(/^\\/|\\/$/g, '');
  const candidates = [
    `../../${repoPath}/index.html`,
    `../../${repoPath}.html`,
    `../../${repoPath}`,
  ];
  let found = false;
  for (const candidate of candidates) {
    if (await exists(candidate)) {
      found = true;
      break;
    }
  }
  assert.equal(found, true, `homepage link has no matching repository asset: ${link}`);
}

assert.doesNotMatch(rootHtml, /asklingo-dock|pwa-register\\.js|tv-navigation\\.js/);

const deepPathResponse = await rootWorker.fetch(new Request('https://thelingolegacy.com/studio-sites/'));
assert.equal(deepPathResponse.status, 404, 'the exact-root Worker must not be mistaken for the deep-route Worker');

const env = {
  CANONICAL_DOMAIN: 'thelingolegacy.com',
  ASSETS: { fetch: async () => new Response('asset') },
};

const health = await worker.fetch(new Request('https://thelingolegacy.com/healthz'), env);
assert.equal(health.status, 200);
assert.equal(await health.text(), 'ok\n');

const manifestResponse = await worker.fetch(new Request('https://thelingolegacy.com/api/v1/runtime'), env);
assert.equal(manifestResponse.status, 200);
const manifest = await manifestResponse.json();
assert.equal(manifest.billing.checkout, false);
assert.equal(manifest.billing.cash_out, false);
assert.equal(manifest.safety.real_money_gameplay, false);
assert.equal(manifest.integrations.firebase, false);
assert.equal(manifest.integrations.d1, false);
assert.equal(manifest.integrations.kv, false);
assert.equal(manifest.integrations.r2, false);

const statusResponse = await worker.fetch(new Request('https://thelingolegacy.com/api/v1/platform/status'), env);
const status = await statusResponse.json();
assert.equal(status.status, 'SERVING / RELEASE-LOCKED');
assert.equal(status.production_mutation, 'FROZEN');
assert.equal(status.lkg, 'PROTECTED');
assert.equal(status.authorization.production_promotion, false);

const checkoutResponse = await worker.fetch(new Request('https://thelingolegacy.com/api/create-checkout-session', { method: 'POST' }), env);
assert.equal(checkoutResponse.status, 410);
assert.equal((await checkoutResponse.json()).code, 'BILLING_DISABLED');

assert.doesNotMatch(workerSource, /firebaseAPI\s*\(/, 'the standalone Firebase helper must not be mistaken for an integrated Worker API');

console.log('FLAGSHIP_ROUTE_CONTRACT=PASS');
console.log('EXACT_ROOT_AND_CATCH_ALL=SEPARATE');
console.log('BILLING_AND_CASH_OUT=FAIL_CLOSED');
console.log('FIREBASE_AND_PERSISTENT_DATA=NOT_CONNECTED');
console.log('PRODUCTION_PROMOTION=BLOCKED');
