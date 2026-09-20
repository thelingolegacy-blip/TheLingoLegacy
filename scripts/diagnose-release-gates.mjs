import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const warnings = [];
const checks = [];

function read(rel) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    failures.push(`${rel}: missing`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

function check(name, ok, detail) {
  checks.push({ name, ok, detail });
  if (!ok) failures.push(`${name}: ${detail}`);
}

const wrangler = read('wrangler.jsonc');
const runner = read('.github/workflows/runner-probe.yml');
const ci = read('.github/workflows/jekyll-docker.yml');
const worker = read('worker.js');

check('wrangler worker identity', /"name"\s*:\s*"thelingolegacy"/.test(wrangler), 'expected production worker name thelingolegacy');
check('wrangler canonical domain', /thelingolegacy\.com/.test(wrangler), 'canonical domain is absent');
check('wrangler www route', /www\.thelingolegacy\.com\/\*/.test(wrangler), 'www route is absent');
check('runner probe uses hosted runner', /runs-on:\s*ubuntu-latest/.test(runner), 'ubuntu-latest is not configured');
check('runner probe has push trigger', /push:\s*\n\s*branches:\s*\[\s*"feat\/dynamic-master-hub-runtime"\s*\]/.test(runner), 'push trigger for diagnostic branch is absent');
check('runner probe emits identity', /RUNNER_NAME/.test(runner) && /GITHUB_RUN_ID/.test(runner) && /GITHUB_SHA/.test(runner), 'runner identity fields are incomplete');
check('runner probe uploads evidence', /actions\/upload-artifact@v4/.test(runner) && /runner-probe\.txt/.test(runner), 'runner evidence artifact is not configured');
check('CI uses hosted runner', /runs-on:\s*ubuntu-latest/.test(ci), 'CI does not use ubuntu-latest');
check('CI debug enabled', /ACTIONS_RUNNER_DEBUG:\s*true/.test(ci) && /ACTIONS_STEP_DEBUG:\s*true/.test(ci), 'Actions debug flags are not enabled');
check('CI uploads evidence', /actions\/upload-artifact@v4/.test(ci) && /runner-evidence\.log/.test(ci), 'CI evidence artifact is incomplete');
check('dynamic route registry', /\/api\/v1\/platform\/routes/.test(worker), 'dynamic route registry is absent from worker');
check('Cloudflare-only authority', /domain_authority:\s*['"]cloudflare['"]/.test(worker), 'worker does not declare Cloudflare authority');
check('fail-closed policy', /release_policy:\s*['"]fail-closed['"]/.test(worker), 'worker does not declare fail-closed release policy');

const report = {
  generated_at: new Date().toISOString(),
  expected: {
    worker: 'thelingolegacy',
    domain: 'thelingolegacy.com',
    runner: 'ubuntu-latest',
    diagnostic_branch: 'feat/dynamic-master-hub-runtime'
  },
  checks,
  failures,
  warnings,
  interpretation: failures.length === 0
    ? 'Repository-side configuration checks passed. This does not prove runner allocation, CI execution, Cloudflare deployment, live activation, or production certification.'
    : 'Repository-side configuration has one or more failures. External execution/deployment evidence must still be collected independently.'
};

fs.writeFileSync('release-gate-diagnosis.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
