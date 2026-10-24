import fs from 'node:fs';

const worker = fs.readFileSync('worker.js', 'utf8');
const wrangler = fs.readFileSync('wrangler.jsonc', 'utf8');

const requiredWorkerContracts = [
  "url.pathname === '/healthz'",
  "url.pathname === '/api/health'",
  "url.pathname === '/api/metrics'",
  "url.pathname === '/api/checkout'",
  "url.pathname === '/api/rewards/claim'",
  "url.pathname === '/api/v1/runtime'",
  "url.pathname === '/api/v1/platform/manifest'",
  "url.pathname === '/api/v1/platform/status'",
  "url.pathname === '/api/v1/platform/gates'",
  "url.pathname === '/api/v1/platform/modules'",
  "url.pathname === '/api/v1/site/context'",
  "url.pathname.startsWith('/api/')",
  'renderDynamicHtml',
  'env.ASSETS.fetch(request)',
  "'x-frame-options': 'DENY'",
];

const failures = [];
for (const token of requiredWorkerContracts) {
  if (!worker.includes(token)) failures.push(`Worker runtime contract missing: ${token}`);
}
if (!wrangler.includes('"main": "worker.js"')) failures.push('Cloudflare Worker entrypoint is not worker.js');
if (!wrangler.includes('"binding": "ASSETS"')) failures.push('Cloudflare asset binding is missing');
if (wrangler.toLowerCase().includes('vercel')) failures.push('Retired Vercel reference remains in Wrangler configuration');

const result = {
  gate: 'dynamic-runtime-contract',
  status: failures.length ? 'FAIL' : 'PASS',
  worker: 'worker.js',
  requiredRoutes: requiredWorkerContracts.slice(0, 12),
  edgeHtmlRuntime: 'renderDynamicHtml',
  assetDelivery: 'worker-controlled',
  retiredProvider: 'vercel',
  failures,
};
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
