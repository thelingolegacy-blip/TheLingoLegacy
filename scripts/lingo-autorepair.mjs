import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const changed = [];
const warnings = [];
const failures = [];

function exists(p) { return fs.existsSync(path.join(root, p)); }
function read(p) { return fs.readFileSync(path.join(root, p), 'utf8'); }
function write(p, content) {
  const abs = path.join(root, p);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  if (!fs.existsSync(abs) || fs.readFileSync(abs, 'utf8') !== content) {
    fs.writeFileSync(abs, content);
    changed.push(p);
  }
}

// Never invent credentials, IDs, database names, Firebase projects, or production secrets.
// This artifact repairs deterministic repository contracts only.

if (!exists('wrangler.jsonc')) {
  failures.push('wrangler.jsonc is missing; production deployment configuration cannot be safely inferred.');
} else {
  const w = read('wrangler.jsonc');
  for (const token of ['"main": "worker.js"', '"binding": "ASSETS"', '"pattern": "thelingolegacy.com/*"', '"pattern": "www.thelingolegacy.com/*"']) {
    if (!w.includes(token)) failures.push(`Cloudflare contract missing: ${token}`);
  }
}

if (!exists('worker.js')) failures.push('worker.js is missing; Cloudflare Worker entrypoint cannot be inferred.');
if (!exists('config/production.json')) warnings.push('config/production.json is absent; no production identity was invented.');

if (exists('pubspec.yaml') || exists('apps')) {
  if (exists('pubspec.yaml')) {
    const pubspec = read('pubspec.yaml');
    if (!pubspec.includes('firebase_core')) warnings.push('Flutter project detected without firebase_core in pubspec.yaml.');
  }
  if (!exists('android') && !exists('ios') && !exists('lib')) warnings.push('Flutter marker detected but standard platform/lib directories were not found.');
} else {
  warnings.push('No Flutter project detected in this repository; Flutter changes are not fabricated.');
}

if (exists('firebase.json')) {
  const firebase = read('firebase.json');
  if (!firebase.trim()) failures.push('firebase.json exists but is empty.');
} else {
  warnings.push('firebase.json not present; Firebase project identity is not invented.');
}

const packageJson = exists('package.json') ? JSON.parse(read('package.json')) : null;
if (packageJson && packageJson.engines?.node && Number.parseInt(String(packageJson.engines.node).replace(/[^0-9]/g, ''), 10) < 22) {
  failures.push(`package.json requires an older Node runtime (${packageJson.engines.node}); refusing silent runtime drift.`);
}

const evidence = {
  artifact: 'LINGO_LEGACY_FULL_STACK_AUTOREPAIR',
  version: '1.0.0',
  generatedAt: new Date().toISOString(),
  repository: process.env.GITHUB_REPOSITORY || 'local',
  commit: process.env.GITHUB_SHA || 'unknown',
  policy: {
    deterministic_only: true,
    no_secret_creation: true,
    no_production_gate_bypass: true,
    preserve_lkg_on_failure: true
  },
  checks: {
    cloudflare: exists('wrangler.jsonc') && exists('worker.js'),
    firebase: exists('firebase.json'),
    flutter: exists('pubspec.yaml'),
    node: Boolean(packageJson)
  },
  changed,
  warnings,
  failures
};

write('release/evidence/lingo-autorepair-report.json', JSON.stringify(evidence, null, 2) + '\n');

if (failures.length) {
  console.error(JSON.stringify(evidence, null, 2));
  process.exit(1);
}

console.log(JSON.stringify(evidence, null, 2));
