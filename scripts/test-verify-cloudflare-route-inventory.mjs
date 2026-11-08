import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const verifier = fileURLToPath(new URL('./verify-cloudflare-route-inventory.mjs', import.meta.url));
const routes = ['thelingolegacy.com/*', 'www.thelingolegacy.com/*', 'lingo.thelingolegacy.com/*'];
const exceptions = [{ pattern: 'launch.thelingolegacy.com/*', script: 'lingo-static-backup-proxy' }];

function runVerifier(overrides = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lingo-cloudflare-routes-'));
  fs.mkdirSync(path.join(root, 'config/cloudflare'), { recursive: true });
  const config = {
    name: 'thelingolegacyv-5', workers_dev: false,
    routes: routes.map((pattern) => ({ pattern, zone_name: 'thelingolegacy.com' })),
    observability: { enabled: true, redact_query_string: true, head_sampling_rate: 0.1,
      logs: { enabled: true, invocation_logs: true, persist: true, head_sampling_rate: 0.1 },
      traces: { enabled: false, persist: false } },
    ...overrides.config,
  };
  const manifest = { zoneName: 'thelingolegacy.com', workerName: 'thelingolegacyv-5', workersDev: false, routes, otherWorkerRoutes: exceptions, ...overrides.manifest };
  fs.writeFileSync(path.join(root, 'wrangler.jsonc'), JSON.stringify(config));
  fs.writeFileSync(path.join(root, 'config/cloudflare/production-worker-routes.json'), JSON.stringify(manifest));
  const result = spawnSync(process.execPath, [verifier], { cwd: root, encoding: 'utf8' });
  fs.rmSync(root, { recursive: true, force: true });
  return result;
}

test('accepts exact route and privacy-safe observability contract', () => {
  const result = runVerifier();
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /CLOUDFLARE_ROUTE_INVENTORY/);
});

test('rejects a missing live route', () => {
  const result = runVerifier({ config: { routes: [{ pattern: 'thelingolegacy.com/*', zone_name: 'thelingolegacy.com' }] } });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /missing from Wrangler config/);
});

test('rejects an extra unreviewed route', () => {
  const result = runVerifier({ config: { routes: [...routes.map((pattern) => ({ pattern, zone_name: 'thelingolegacy.com' })), { pattern: 'other.thelingolegacy.com/*', zone_name: 'thelingolegacy.com' }] } });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /not present in the reviewed live manifest/);
});

test('rejects a route assigned to the wrong Worker zone', () => {
  const result = runVerifier({ config: { routes: [{ pattern: 'thelingolegacy.com/*', zone_name: 'wrong.example' }] } });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /canonical zone/);
});

test('rejects public workers.dev exposure', () => {
  const result = runVerifier({ config: { workers_dev: true } });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /workers_dev/);
});

test('rejects query strings in observability logs', () => {
  const result = runVerifier({ config: { observability: { enabled: true, redact_query_string: false, head_sampling_rate: 0.1, logs: { enabled: true, invocation_logs: true, persist: true, head_sampling_rate: 0.1 }, traces: { enabled: false, persist: false } } } });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Query strings must be redacted/);
});
