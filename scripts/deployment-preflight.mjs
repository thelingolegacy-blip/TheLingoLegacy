import fs from 'node:fs';

const failures = [];
const warnings = [];
const read = (path) => {
  if (!fs.existsSync(path)) {
    failures.push(`required file missing: ${path}`);
    return null;
  }
  return fs.readFileSync(path, 'utf8');
};

const parseJson = (path, text) => {
  if (text === null) return null;
  try { return JSON.parse(text); }
  catch (error) {
    failures.push(`${path} must be valid JSON/JSONC without comments: ${error.message}`);
    return null;
  }
};

const wranglerText = read('wrangler.jsonc');
const config = parseJson('wrangler.jsonc', wranglerText);
const worker = read('worker.js');
const assetsIgnore = read('.assetsignore');
const productionText = read('config/production.json');
const production = parseJson('config/production.json', productionText);
const envContractText = read('config/production/env-contract.json');
const envContract = parseJson('config/production/env-contract.json', envContractText);

if (config) {
  if (config.main !== 'worker.js') failures.push('Wrangler main must be worker.js');
  if (config.name !== 'thelingolegacyv-5') failures.push('Wrangler Worker name does not match the approved runtime identity');
  if (config.workers_dev !== false) failures.push('workers_dev must remain disabled for the canonical production Worker');
  if (config.assets?.directory !== '.') failures.push('asset directory drift: preflight currently expects repository root (.)');
  if (config.assets?.binding !== 'ASSETS') failures.push('static asset binding must be ASSETS');
  if (!Array.isArray(config.routes)) failures.push('Wrangler routes must be an array');
  else {
    for (const route of ['thelingolegacy.com/*', 'www.thelingolegacy.com/*']) {
      if (!config.routes.some((entry) => entry.pattern === route && entry.zone_name === 'thelingolegacy.com')) {
        failures.push(`required canonical route missing or mismatched: ${route}`);
      }
    }
  }
  if (config.vars?.CANONICAL_DOMAIN !== 'thelingolegacy.com') failures.push('CANONICAL_DOMAIN must be the canonical apex');
  if (config.vars?.PUBLIC_SITE_URL !== 'https://thelingolegacy.com') failures.push('PUBLIC_SITE_URL must be the canonical HTTPS apex');
  if (!config.observability?.enabled) warnings.push('Wrangler observability is not enabled');
}

if (worker) {
  for (const marker of [
    "url.pathname === '/healthz'",
    "url.pathname === '/api/v1/platform/gates'",
    "url.pathname === '/api/v1/platform/modules'",
    "url.pathname === '/api/v1/platform/status'",
    "url.pathname === '/api/v1/site/context'",
    "url.pathname.startsWith('/api/')",
    'env.ASSETS.fetch(request)',
  ]) {
    if (!worker.includes(marker)) failures.push(`Worker runtime contract missing: ${marker}`);
  }
  if (!worker.includes("G02_RUNNER: 'FAIL / UNVERIFIED'")) failures.push('G02 must remain fail-closed until verified');
  if (!worker.includes("production_promotion: false")) failures.push('production promotion must remain unauthorized in runtime status');
}

if (assetsIgnore) {
  const lines = new Set(assetsIgnore.split(/\r?\n/).map((line) => line.trim()));
  for (const pattern of ['/worker.js', '/wrangler.jsonc', '/.github/**', '/ops/**', '/scripts/**', '/tests/**', '/release/evidence/**', '/.env*', '/.dev.vars*']) {
    if (!lines.has(pattern)) failures.push(`.assetsignore missing required exclusion: ${pattern}`);
  }
} else {
  failures.push('.assetsignore is required because assets.directory is repository root');
}

if (production) {
  if (production.canonicalDomain !== 'thelingolegacy.com') failures.push('production authority canonicalDomain mismatch');
  if (production.activation?.failClosed !== true) failures.push('production activation failClosed must be true');
  if (production.activation?.allowManualActivation !== false) failures.push('manual production activation must remain disabled');
  if (production.authorityChain?.enforcement !== 'strict' || production.authorityChain?.onMismatch !== 'BLOCK') {
    failures.push('production authority chain must enforce strict BLOCK-on-mismatch behavior');
  }
}

if (envContract) {
  if (!Array.isArray(envContract.forbiddenInRepo) || !envContract.forbiddenInRepo.length) failures.push('environment contract must enumerate forbidden secret classes');
  const keys = new Set((envContract.requiredProduction || []).map((entry) => entry.key));
  for (const key of ['SITE_URL', 'PUBLIC_SITE_URL', 'NEXT_PUBLIC_FIREBASE_API_KEY', 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'NEXT_PUBLIC_FIREBASE_APP_ID']) {
    if (!keys.has(key)) failures.push(`environment contract missing documented key: ${key}`);
  }
}

const result = {
  gate: 'cloudflare-deployment-preflight',
  status: failures.length ? 'FAIL' : 'PASS',
  mode: 'read-only',
  deploymentPerformed: false,
  productionMutationPerformed: false,
  canonicalDomain: production?.canonicalDomain || null,
  worker: config?.name || null,
  entrypoint: config?.main || null,
  assetDirectory: config?.assets?.directory || null,
  failures,
  warnings,
  timestamp: new Date().toISOString(),
};
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
