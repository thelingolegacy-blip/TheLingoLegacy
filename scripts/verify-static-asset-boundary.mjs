import fs from 'node:fs';

const ignorePath = '.assetsignore';
const configPath = 'wrangler.jsonc';
const errors = [];
const lines = fs.readFileSync(ignorePath, 'utf8').split(/\r?\n/).map(line => line.trim());
const ignored = new Set(lines.filter(line => line && !line.startsWith('#')));

const required = [
  'release/',
  'auth0-details/',
  'auth0-implementation/',
  'admin-command-center/',
  'economy-command-center/',
  'integration-*/',
  'integrations-*/',
  'launch-*/',
  'production-lock/',
  'tester-*/',
  'asset-request-queue/',
  'content-approvals/',
  'content-calendar/',
  'creator-outreach/',
  'daily-standup/',
  'dashboard-integration-links/',
  'day-one-monitoring/',
  'design-previews/',
  'installed-integrations/',
  'live-readiness/',
  'live-test-run/',
  'monetization-safety/',
  'motherduck-readiness/',
  'observability/',
  'post-launch-*/',
  'provider-handoff/',
  'rollback-drill/',
  'session-test/',
  'shopify-readiness/',
  'social-launch-rollout/',
  'stakeholder-update/',
  'studio-os/',
  'studio-production/',
  'studio-world-os/',
  'trust-compliance/',
  'casino-config/',
  'casino-upgrade/',
  'firebase-worker.js',
  'gateway-router.js',
];

for (const pattern of required) {
  if (!ignored.has(pattern)) errors.push('Missing static-asset exclusion: ' + pattern);
}

const publicPaths = ['index.html', 'assets/', 'studio-sites/', 'manifest.webmanifest', 'robots.txt', 'sitemap.xml'];
for (const path of publicPaths) {
  if (ignored.has(path)) errors.push('Public site path must remain publishable: ' + path);
}

const configText = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configText.replace(/^\s*\/\/.*$/gm, '').replace(/,\s*([}\]])/g, '$1'));
if (config.assets?.directory !== '.') errors.push('Unexpected static asset root; review the publication boundary and this verifier together.');
if (config.assets?.binding !== 'ASSETS') errors.push('Expected the ASSETS binding used by the Worker.');

if (errors.length) {
  console.error('STATIC_ASSET_BOUNDARY=FAIL');
  for (const error of errors) console.error('- ' + error);
  process.exit(1);
}
console.log('STATIC_ASSET_BOUNDARY=PASS');
console.log('ASSET_ROOT=.');
console.log('INTERNAL_EXCLUSION_COUNT=' + required.length);
console.log('NOTE=This source contract check does not replace a deployed-preview HTTP probe.');
