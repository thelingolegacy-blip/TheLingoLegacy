import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const failures = [];
const checks = [];
const check = (id, pass, detail) => {
  checks.push({ id, status: pass ? 'PASS' : 'FAIL', detail });
  if (!pass) failures.push(id);
};

let config;
try {
  config = JSON.parse(read('wrangler.jsonc'));
  check('wrangler-json-valid', true, 'wrangler.jsonc parses as JSON-compatible configuration');
} catch (error) {
  check('wrangler-json-valid', false, String(error));
  config = {};
}

const worker = read('worker.js');
const headers = read('_headers');
const readme = read('README.md');
const promotion = read('.github/workflows/production-promotion.yml');
const sentinel = read('.github/workflows/g02-sentinel.yml');
const authority = read('SYSTEM-ACTIVATION-AUTHORITY.md');

check('canonical-worker-name', config.name === 'thelingolegacyv-5', `expected thelingolegacyv-5; found ${config.name || 'missing'}`);
check('worker-entrypoint', config.main === 'worker.js', `expected worker.js; found ${config.main || 'missing'}`);
check('compatibility-date', config.compatibility_date === '2026-09-01', `expected 2026-09-01; found ${config.compatibility_date || 'missing'}`);
check('assets-binding', config.assets?.binding === 'ASSETS', `expected ASSETS; found ${config.assets?.binding || 'missing'}`);

const routePatterns = new Set((config.routes || []).map((route) => route.pattern));
check('apex-route', routePatterns.has('thelingolegacy.com/*'), 'canonical apex route must be declared');
check('www-route', routePatterns.has('www.thelingolegacy.com/*'), 'www route must be declared');
check('route-zone', (config.routes || []).filter((route) => routePatterns.has(route.pattern)).every((route) => route.zone_name === 'thelingolegacy.com'), 'both canonical routes must target thelingolegacy.com zone');

const headerContracts = [
  { id: 'frame-policy', token: "'x-frame-options': 'DENY'", directive: 'X-Frame-Options: DENY' },
  { id: 'referrer-policy', token: "'referrer-policy': 'strict-origin-when-cross-origin'", directive: 'Referrer-Policy: strict-origin-when-cross-origin' },
  { id: 'permissions-policy', token: "'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=()'", directive: 'Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()' },
  { id: 'hsts-policy', token: "'strict-transport-security': 'max-age=63072000; includeSubDomains; preload'", directive: 'Strict-Transport-Security: max-age=63072000; includeSubDomains; preload' },
];
for (const item of headerContracts) {
  check(`worker-${item.id}`, worker.includes(item.token), `Worker must set ${item.directive}`);
  check(`assets-${item.id}`, headers.includes(item.directive), `_headers must set ${item.directive}`);
}

check('readme-runtime-identity', readme.includes('thelingolegacyv-5') && readme.includes('2026-09-01'), 'README must document the same Worker name and compatibility date as Wrangler');
check('canonical-g02-labels-promotion', promotion.includes('runs-on: [self-hosted, linux, x64, lingo-g02]'), 'production-promotion must retain the canonical G02 runner labels');
check('canonical-g02-labels-sentinel', sentinel.includes('runs-on: [self-hosted, linux, x64, lingo-g02]'), 'G02 sentinel must retain the canonical runner labels');
check('production-job-remains-held', promotion.includes('if: ${{ false }}'), 'Cloudflare promotion job must remain disabled until separate authorization and acceptance');
check('authority-document-superseded', authority.includes('SUPERSEDED HISTORICAL RECORD — NOT AN ACTIVE AUTHORIZATION'), 'legacy activation document must explicitly defer to current gates');

const result = {
  gate: 'release-configuration-consistency',
  status: failures.length ? 'FAIL' : 'PASS',
  worker: config.name || null,
  entrypoint: config.main || null,
  compatibilityDate: config.compatibility_date || null,
  checks,
  failures,
  note: 'Static consistency evidence only; this does not prove Cloudflare account configuration, runner execution, preview acceptance, or production health.'
};
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
