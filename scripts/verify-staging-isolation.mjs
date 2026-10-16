import fs from 'node:fs';

const fail = [];
const readJson = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const production = readJson('wrangler.jsonc');
const staging = readJson('wrangler.staging.jsonc');
const worker = fs.readFileSync('worker.js', 'utf8');
const ignore = fs.readFileSync('.assetsignore', 'utf8')
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'));
const ignored = new Set(ignore);
const productionRoutes = ['thelingolegacy.com/*', 'www.thelingolegacy.com/*'];

if (production.name !== 'thelingolegacyv-5') fail.push('production Worker name changed from the reviewed baseline');
if (!Array.isArray(production.routes) || !productionRoutes.every((pattern) => production.routes.some((route) => route.pattern === pattern))) {
  fail.push('production Wrangler routes differ from the reviewed baseline');
}
if (staging.name !== 'thelingolegacy-staging') fail.push('staging Worker must have its own explicit name');
if (staging.name === production.name) fail.push('staging Worker name must differ from production');
if (staging.workers_dev !== true) fail.push('staging must use its isolated workers.dev endpoint');
if ('routes' in staging && (!Array.isArray(staging.routes) || staging.routes.length !== 0)) fail.push('staging configuration must not declare custom routes');
if (staging.vars?.LINGO_ENVIRONMENT !== 'staging') fail.push('LINGO_ENVIRONMENT must equal staging');
if (staging.vars?.CANONICAL_DOMAIN !== 'staging.invalid') fail.push('staging canonical-domain sentinel must not point at production');
if (staging.vars?.PUBLIC_SITE_URL !== 'https://staging.invalid') fail.push('staging public URL sentinel must not point at production');
if (staging.vars?.CANONICAL_DOMAIN === 'thelingolegacy.com' || staging.vars?.PUBLIC_SITE_URL?.includes('thelingolegacy.com')) fail.push('production hostname found in staging vars');
if (Object.keys(staging).some((key) => ['d1_databases', 'kv_namespaces', 'r2_buckets', 'services', 'durable_objects', 'queues'].includes(key))) {
  fail.push('staging must not inherit undeclared production resource bindings');
}
if (staging.assets?.binding !== 'ASSETS' || staging.assets?.directory !== '.') fail.push('staging asset binding/directory differs from the reviewed contract');
const requiredExclusions = [".github/",".git/",".wrangler/","ops/","scripts/","docs/","config/",".env*",".dev.vars*","*.pem","*.key","*.jsonc","/worker.js","firebase.json","firebase.client.json","admin-command-center/","asset-request-queue/","auth0-details/","auth0-implementation/","casino-config/","casino-upgrade/","content-approvals/","content-calendar/","creator-outreach/","daily-standup/","dashboard-integration-links/","day-one-monitoring/","economy-command-center/","email-announcement/","exa-readiness/","exact-dashboard-links/","feedback-summary/","installed-integrations/","integration-action-plan/","integration-configurations/","integration-dashboard-snapshot/","integration-decision-queue/","integration-ids-register/","integration-links-register/","integration-management/","integration-os/","integration-qa-matrix/","integration-resource-assignment/","integrations-console-checklist/","integrations-dashboard-status/","integrations-readiness/","launch-decision-log/","launch-metrics-glossary/","launch-readiness-scorecard/","launch-retrospective/","launch-risk-register/","launch-verification/","launch-war-room/","live-readiness/","live-test-run/","known-issues/","next-sprint-plan/","post-launch-ops/","post-launch-recap/","press-kit-checklist/","production-lock/","protected-routes/","provider-handoff/","release-notes/","rollback-drill/","session-test/","shopify-readiness/","stakeholder-update/","tester-feedback/","tester-invite/","tester-results-log/","trust-compliance/","studio-sites/","studio/"];
for (const entry of requiredExclusions) {
  if (!ignored.has(entry)) fail.push(`.assetsignore is missing required exclusion: ${entry}`);
}
if (!worker.includes("String(env.LINGO_ENVIRONMENT || '').toLowerCase() === 'staging'")) fail.push('Worker lacks explicit staging environment handling');
if (!worker.includes("String(env.LINGO_ENVIRONMENT || '').toLowerCase() !== 'staging' && url.hostname")) fail.push('www-to-apex production redirect is not disabled for staging');
if (!worker.includes('allowedOrigins(request, env)')) fail.push('staging CORS origin isolation is missing');

const report = {
  gate: 'staging-isolation-contract',
  status: fail.length ? 'FAIL' : 'PASS',
  production_config: 'wrangler.jsonc',
  staging_config: 'wrangler.staging.jsonc',
  staging_worker: staging.name,
  workers_dev_only: staging.workers_dev === true && !('routes' in staging),
  production_route_baseline_preserved: productionRoutes.every((pattern) => production.routes?.some((route) => route.pattern === pattern)),
  required_asset_exclusions_checked: requiredExclusions.length,
  failures: fail
};
console.log(JSON.stringify(report, null, 2));
if (fail.length) process.exit(1);
