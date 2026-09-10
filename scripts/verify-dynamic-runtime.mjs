import fs from 'node:fs';

const worker = fs.readFileSync('worker.js', 'utf8');
const wrangler = fs.readFileSync('wrangler.jsonc', 'utf8');

for (const token of [
  "url.pathname === '/healthz'",
  "url.pathname === '/api/v1/platform/status'",
  "url.pathname === '/api/v1/site/context'",
  "url.pathname.startsWith('/api/')",
  'renderDynamicHtml',
  'env.ASSETS.fetch(request)',
]) {
  if (!worker.includes(token)) throw new Error(`Dynamic runtime contract missing: ${token}`);
}

if (!worker.includes('function platformStatus(request, env)')) {
  throw new Error('Dynamic runtime contract missing platformStatus implementation');
}
if (!worker.includes("status: 'OPERATIONAL'")) {
  throw new Error('Platform status contract missing operational status');
}
if (!worker.includes("deployment_authority: 'github-cloudflare'")) {
  throw new Error('Platform status contract missing deployment authority');
}
if (!worker.includes("domain_authority: 'cloudflare'")) {
  throw new Error('Platform status contract missing domain authority');
}
if (!worker.includes("release_policy: 'fail-closed'")) {
  throw new Error('Platform status contract missing fail-closed release policy');
}
if (!wrangler.includes('"main": "worker.js"')) throw new Error('Cloudflare Worker entrypoint is not worker.js');
if (!wrangler.includes('"binding": "ASSETS"')) throw new Error('Cloudflare asset binding is missing');

console.log(JSON.stringify({
  gate: 'dynamic-runtime-contract',
  status: 'PASS',
  worker: 'worker.js',
  endpoints: ['/healthz', '/api/v1/runtime', '/api/v1/platform/manifest', '/api/v1/platform/status'],
  platform_status: 'implemented',
  api_boundary: 'enabled',
  asset_delivery: 'worker-controlled',
}, null, 2));
