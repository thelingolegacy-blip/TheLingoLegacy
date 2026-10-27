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
const autoRepair = read('.github/workflows/lingo-autorepair-deploy.yml');
const sentinel = read('.github/workflows/g02-self-hosted-sentinel.yml');
const authority = read('SYSTEM-ACTIVATION-AUTHORITY.md');
const dockerWorkflow = read('.github/workflows/docker-image.yml');
const dockerReadme = read('docker/README.md');
const circleci = read('.circleci/config.yml');
const gitlab = read('.gitlab-ci.yml');
const jenkins = read('Jenkinsfile');
const studioConfig = read('cloudflare/wrangler.toml');
const studioWorkflow = read('.github/workflows/studio-surface-integrity.yml');
const surfaceGate = read('scripts/sanitize-cloudflare-only-surface.mjs');
const staticGateRunner = read('scripts/run-static-gates.mjs');
const promotionPolicy = JSON.parse(read('config/release/promotion-policy.json'));
const certificateGenerator = read('scripts/generate-release-certificate.mjs');
const launchFoundation = JSON.parse(read('config/production/launch-foundation.json'));
const casinoMaster = JSON.parse(read('config/casino/master.json'));

check('canonical-worker-name', config.name === 'thelingolegacyv-5', `expected thelingolegacyv-5; found ${config.name || 'missing'}`);
check('worker-entrypoint', config.main === 'worker.js', `expected worker.js; found ${config.main || 'missing'}`);
check('compatibility-date', config.compatibility_date === '2026-09-01', `expected 2026-09-01; found ${config.compatibility_date || 'missing'}`);
check('assets-binding', config.assets?.binding === 'ASSETS', `expected ASSETS; found ${config.assets?.binding || 'missing'}`);

const routePatterns = new Set((config.routes || []).map((route) => route.pattern));
check('apex-route', routePatterns.has('thelingolegacy.com/*'), 'canonical apex route must be declared');
check('www-route', routePatterns.has('www.thelingolegacy.com/*'), 'www route must be declared');
check('route-zone', (config.routes || []).filter((route) => routePatterns.has(route.pattern)).every((route) => route.zone_name === 'thelingolegacy.com'), 'both canonical routes must target thelingolegacy.com zone');

const headerContracts = [
  { id: 'content-type-policy', token: "'x-content-type-options': 'nosniff'", directive: 'X-Content-Type-Options: nosniff' },
  { id: 'frame-policy', token: "'x-frame-options': 'DENY'", directive: 'X-Frame-Options: DENY' },
  { id: 'referrer-policy', token: "'referrer-policy': 'strict-origin-when-cross-origin'", directive: 'Referrer-Policy: strict-origin-when-cross-origin' },
  { id: 'permissions-policy', token: "'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=()'", directive: 'Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()' },
  { id: 'hsts-policy', token: "'strict-transport-security': 'max-age=63072000; includeSubDomains; preload'", directive: 'Strict-Transport-Security: max-age=63072000; includeSubDomains; preload' },
  { id: 'content-security-policy', token: ` 'content-security-policy': "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self' mailto:; img-src 'self' data: https:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; upgrade-insecure-requests"`, directive: "Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self' mailto:; img-src 'self' data: https:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; upgrade-insecure-requests" },
  { id: 'cross-origin-opener-policy', token: "'cross-origin-opener-policy': 'same-origin'", directive: 'Cross-Origin-Opener-Policy: same-origin' },
  { id: 'dns-prefetch-policy', token: "'x-dns-prefetch-control': 'off'", directive: 'X-DNS-Prefetch-Control: off' },
];
for (const item of headerContracts) {
  check(`worker-${item.id}`, worker.includes(item.token), `Worker must set ${item.directive}`);
  check(`assets-${item.id}`, headers.includes(item.directive), `_headers must set ${item.directive}`);
}

check('readme-runtime-identity', readme.includes('thelingolegacyv-5') && readme.includes('2026-09-01'), 'README must document the same Worker name and compatibility date as Wrangler');
check('studio-worker-identity', studioConfig.includes('name = "lingo-legacy-studio-build"') && studioConfig.includes('main = "cloudflare/studio-worker.js"') && studioConfig.includes('compatibility_date = "2026-10-04"'), 'Studio build Worker name, entrypoint, and compatibility date must match its dedicated config');
check('studio-wrangler-pinned-dry-run', studioWorkflow.includes('npx --yes wrangler@4 deploy --dry-run --config cloudflare/wrangler.toml') && !studioWorkflow.includes('wrangler@latest'), 'Studio Worker validation must use Wrangler v4 and remain dry-run-only');
check('readme-studio-identity', readme.includes('lingo-legacy-studio-build') && readme.includes('2026-10-04') && readme.includes('not the apex/www production Worker'), 'README must distinguish the Studio build Worker from the apex/www production Worker');
check('surface-gate-read-only', surfaceGate.includes("mode: 'read-only'") && !/\\bwriteFileSync\\b|\\bwriteFile\\s*\\(/.test(surfaceGate), 'Cloudflare-only surface validation must never rewrite release source files');
check('surface-gate-regression-wired', staticGateRunner.includes('scripts/test-sanitize-cloudflare-only-surface.mjs') && staticGateRunner.includes("id: 'verify-cloudflare-only-surface'"), 'Static gates must test the read-only surface verifier and label it as verification, not sanitization');
check('promotion-policy-gate-alignment', promotionPolicy.noLegacyHostingExecutionPath === true && promotionPolicy.promotionSequence.includes('cloudflare-only-runtime') && promotionPolicy.promotionSequence.includes('cloudflare-only-static-surface') && !promotionPolicy.promotionSequence.includes('vercel-eradication'), 'Promotion policy must require the current Cloudflare runtime and static-surface gate IDs');
check('certificate-gate-alignment', certificateGenerator.includes("'cloudflare-only-runtime'") && certificateGenerator.includes("'cloudflare-only-static-surface'") && !certificateGenerator.includes('vercel-eradication'), 'Release certificate must consume the same Cloudflare gate IDs as the promotion policy');
check('launch-observability-provider-alignment', launchFoundation.observability?.performanceMonitoring?.includes('Cloudflare deployment metadata') && !launchFoundation.observability.performanceMonitoring.includes('Vercel'), 'Launch observability instructions must use the current Cloudflare evidence source');
check('casino-provider-plan-alignment', casinoMaster.principles?.deployment?.includes('Cloudflare Worker') && casinoMaster.principles?.storagePlan?.relational?.includes('planned only') && casinoMaster.principles?.storagePlan?.cache?.includes('planned only') && !JSON.stringify(casinoMaster).includes('Vercel Marketplace'), 'Game manifest must distinguish Cloudflare static delivery from unverified planned backend services');
check('canonical-g02-labels-promotion', promotion.includes('runs-on: [self-hosted, linux, x64, lingo-g02]'), 'production-promotion must retain the canonical G02 runner labels');
check('canonical-g02-labels-sentinel', sentinel.includes('runs-on: [self-hosted, linux, x64, lingo-g02]'), 'G02 sentinel must retain the canonical runner labels');
check('production-job-remains-held', promotion.includes('if: ${{ false }}'), 'Cloudflare promotion job must remain disabled until separate authorization and acceptance');
check('auto-repair-deploy-hold', autoRepair.includes('if: ${{ false }}'), 'Cloudflare auto-repair deployment job must remain disabled until separate authorization and acceptance');
check('canonical-g02-labels-auto-repair', autoRepair.includes('runs-on: [self-hosted, linux, x64, lingo-g02]'), 'auto-repair workflow must retain the canonical G02 runner labels');
check('authority-document-superseded', authority.includes('SUPERSEDED HISTORICAL RECORD — NOT AN ACTIVE AUTHORIZATION'), 'legacy activation document must explicitly defer to current gates');
check('docker-ci-targets-runner-image', dockerWorkflow.includes('--file ops/github-runner/Dockerfile') && dockerWorkflow.includes('ops/github-runner') && !dockerWorkflow.includes('--file Dockerfile'), 'Docker CI must build the defined runner image, not a nonexistent root application Dockerfile');
check('runner-image-build-inputs', fs.existsSync('ops/github-runner/Dockerfile') && fs.existsSync('ops/github-runner/entrypoint.sh'), 'runner image Dockerfile and entrypoint must both exist');
check('docker-application-boundary', dockerReadme.includes('application image intentionally not defined') && dockerReadme.includes('does not publish an image'), 'Docker documentation must distinguish runner-image validation from application-image publication');
check('circleci-is-validation-only', !/\\b(?:wrangler|firebase)\\s+deploy\\b|docker\\s+push|kubectl\\s+apply/i.test(circleci) && /ignore:\\s*main/.test(circleci), 'CircleCI must remain non-production validation and ignore main');
check('gitlab-production-deploy-denied', gitlab.includes('PRODUCTION_DEPLOYMENT=NOT_AUTHORIZED') && gitlab.includes('G02_ACCEPTANCE=NOT_EVALUATED'), 'GitLab must explicitly disclaim production authorization and G02 acceptance');
check('jenkins-production-deploy-denied', jenkins.includes('PRODUCTION_DEPLOYMENT=NOT_AUTHORIZED') && jenkins.includes('KUBERNETES_DEPLOYMENT=NOT_AUTHORIZED'), 'Jenkins must explicitly disclaim production and Kubernetes deployment authority');

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
