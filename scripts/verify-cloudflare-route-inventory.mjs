import fs from 'node:fs';

const config = JSON.parse(fs.readFileSync('wrangler.jsonc', 'utf8'));
const manifest = JSON.parse(fs.readFileSync('config/cloudflare/production-worker-routes.json', 'utf8'));
const errors = [];
const sorted = (values) => [...values].sort();

if (config.name !== manifest.workerName) errors.push('Worker name does not match route manifest.');
if (config.workers_dev !== manifest.workersDev) errors.push('workers_dev does not match the production exposure contract.');
if (!Array.isArray(config.routes)) errors.push('wrangler.jsonc routes must be an array.');
const actualRoutes = Array.isArray(config.routes) ? config.routes.map((route) => route.pattern) : [];
if (new Set(actualRoutes).size !== actualRoutes.length) errors.push('wrangler.jsonc contains duplicate route patterns.');
if (Array.isArray(config.routes) && config.routes.some((route) => route.zone_name !== manifest.zoneName)) {
  errors.push('Every Worker route must target the canonical zone.');
}
const missing = sorted(manifest.routes.filter((pattern) => !actualRoutes.includes(pattern)));
const extra = sorted(actualRoutes.filter((pattern) => !manifest.routes.includes(pattern)));
if (missing.length) errors.push(`Live Worker routes missing from Wrangler config: ${missing.join(', ')}`);
if (extra.length) errors.push(`Wrangler routes not present in the reviewed live manifest: ${extra.join(', ')}`);
for (const exception of manifest.otherWorkerRoutes || []) {
  if (actualRoutes.includes(exception.pattern)) {
    errors.push(`Exception route ${exception.pattern} belongs to ${exception.script}, not ${manifest.workerName}.`);
  }
}

const observability = config.observability || {};
const logs = observability.logs || {};
const traces = observability.traces || {};
if (observability.enabled !== true) errors.push('Worker observability must remain enabled.');
if (observability.redact_query_string !== true) errors.push('Query strings must be redacted from logs/traces.');
if (observability.head_sampling_rate !== 0.1) errors.push('Request observability sampling must remain at 10%.');
if (logs.enabled !== true || logs.invocation_logs !== true || logs.persist !== true) {
  errors.push('Invocation logging and log persistence must remain enabled.');
}
if (logs.head_sampling_rate !== 0.1) errors.push('Log sampling must remain at 10%.');
if (traces.enabled !== false || traces.persist !== false) errors.push('Trace collection and persistence must remain disabled.');

if (errors.length) {
  console.error(JSON.stringify({ ok: false, gate: 'CLOUDFLARE_ROUTE_INVENTORY', errors }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  gate: 'CLOUDFLARE_ROUTE_INVENTORY',
  worker: config.name,
  routeCount: actualRoutes.length,
  separateWorkerExceptions: (manifest.otherWorkerRoutes || []).length,
  workersDev: config.workers_dev,
  queryStringRedaction: observability.redact_query_string,
  requestSampling: observability.head_sampling_rate,
}, null, 2));
