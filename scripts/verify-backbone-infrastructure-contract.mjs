import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || process.cwd());
const checks = [];

function record(id, pass, detail, blocking = true) {
  checks.push({ id, status: pass ? 'PASS' : (blocking ? 'FAIL' : 'BLOCKED'), detail });
}

function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

export function validatePreviewIsolation(production, preview, contract) {
  const routes = Array.isArray(preview.routes) ? preview.routes : [];
  const routeText = String(preview.__raw || '');
  const nameDistinct = Boolean(production.name && preview.name && production.name !== preview.name);
  const workersDev = preview.workers_dev === true;
  // Fail closed on either standard TOML route tables or a top-level routes assignment.
  // The preview contract forbids every custom-domain route, not only production-domain routes.
  const hasRouteTable = /^\\s*\\[\\[\\s*routes\\s*\\]\\]\\s*(?:#.*)?$/m.test(routeText);
  const hasRoutesAssignment = /^\s*routes\s*=/m.test(routeText);
  const noDeclaredRoutes = routes.length === 0 && !hasRouteTable && !hasRoutesAssignment;
  const noProductionPattern = !/(thelingolegacy\.com\/\*|www\.thelingolegacy\.com\/\*|pattern\s*=\s*["']thelingolegacy\.com)/i.test(routeText);
  return [
    { id: 'preview-worker-name-distinct', pass: nameDistinct, detail: 'preview Worker identity differs from production' },
    { id: 'preview-workers-dev', pass: workersDev, detail: 'preview uses workers.dev' },
    { id: 'preview-no-routes', pass: noDeclaredRoutes, detail: 'preview declares no custom-domain routes' },
    { id: 'preview-no-production-pattern', pass: noProductionPattern, detail: 'preview contains no production route pattern' },
    { id: 'preview-contract-isolated', pass: contract.isolation.previewMustNotDeclareCustomDomainRoutes === true && contract.isolation.previewWorker !== contract.isolation.productionWorker, detail: 'machine contract requires separate Worker identity and no production routes' },
  ];
}

export function validateProductionRoutes(production, contract) {
  const actualRoutes = Array.isArray(production?.routes)
    ? production.routes.map((route) => route?.pattern).filter((pattern) => typeof pattern === 'string').sort()
    : [];
  const expectedRoutes = Array.isArray(contract?.isolation?.productionRoutes)
    ? [...contract.isolation.productionRoutes].sort()
    : [];
  const pass = expectedRoutes.length > 0 && JSON.stringify(actualRoutes) === JSON.stringify(expectedRoutes);
  return {
    id: 'production-routes-exact-baseline',
    pass,
    detail: pass
      ? 'production route set exactly matches the approved baseline'
      : `production route set differs from approved baseline: expected=${JSON.stringify(expectedRoutes)}, actual=${JSON.stringify(actualRoutes)}`,
  };
}

export function validateGateEvidence(evidence) {
  const allowed = new Set(['PASS', 'FAIL', 'BLOCKED']);
  if (!evidence || typeof evidence !== 'object' || Array.isArray(evidence)) {
    return { pass: false, status: 'FAIL', detail: 'evidence must be an object' };
  }
  if (!allowed.has(evidence.status)) {
    return { pass: false, status: 'FAIL', detail: 'status must be PASS, FAIL, or BLOCKED' };
  }
  if (evidence.status !== 'PASS') {
    return { pass: true, status: evidence.status, detail: 'non-PASS status is preserved without promotion' };
  }
  const required = ['gateId', 'commitSha', 'workflowRunId', 'jobId', 'artifactName', 'artifactSha256', 'verifiedAt', 'verifier'];
  const missing = required.filter((key) => evidence[key] === undefined || evidence[key] === null || String(evidence[key]).trim() === '');
  const validDigest = /^[a-f0-9]{64}$/i.test(String(evidence.artifactSha256 || ''));
  const validSha = /^[a-f0-9]{40}$/i.test(String(evidence.commitSha || ''));
  const validTimestamp = !Number.isNaN(Date.parse(evidence.verifiedAt || '')) && /(?:Z|\+00:00)$/.test(String(evidence.verifiedAt || ''));
  const pass = missing.length === 0 && validDigest && validSha && validTimestamp;
  return {
    pass,
    status: pass ? 'PASS' : 'FAIL',
    detail: pass ? 'PASS evidence is complete, commit-bound, digest-backed, and UTC-timestamped' : `incomplete or invalid PASS evidence: missing=[${missing.join(',')}], validCommitSha=${validSha}, validDigest=${validDigest}, validUtcTimestamp=${validTimestamp}`,
  };
}

export function verify(rootDir = root) {
  const result = [];
  const add = (id, pass, detail, blocking = true) => result.push({ id, status: pass ? 'PASS' : (blocking ? 'FAIL' : 'BLOCKED'), detail });
  const readAt = (relative) => fs.readFileSync(path.join(rootDir, relative), 'utf8');

  let contract;
  let production;
  let release;
  let worker;
  let previewRaw;
  let previewName = '';
  let previewWorkersDev = false;
  let previewRoutes = [];
  try { contract = JSON.parse(readAt('config/backbone-infrastructure-architecture-v2.1.json')); add('contract-json', true, 'architecture contract parses'); }
  catch (error) { add('contract-json', false, String(error)); return { status: 'FAIL', checks: result }; }

  try { production = JSON.parse(readAt('wrangler.jsonc')); add('production-config-json', true, 'wrangler.jsonc parses as JSON-compatible configuration'); }
  catch (error) { add('production-config-json', false, String(error)); }
  try { release = JSON.parse(readAt('config/release/lingo-legacy-v1.0.0-rc.json')); add('release-manifest-json', true, 'release manifest parses'); }
  catch (error) { add('release-manifest-json', false, String(error)); }

  try {
    previewRaw = readAt('wrangler.flagship-preview.toml');
    previewName = previewRaw.match(/^\s*name\s*=\s*["']([^"']+)["']/m)?.[1] || '';
    previewWorkersDev = /^\s*workers_dev\s*=\s*true\s*$/m.test(previewRaw);
    const routeSection = previewRaw.match(/^\s*\[\[routes\]\]\s*$[\s\S]*?(?=^\s*\[|\s*$)/m);
    if (routeSection) previewRoutes.push(routeSection[0]);
    add('preview-config-present', true, 'isolated preview config exists');
  } catch (error) { add('preview-config-present', false, String(error)); previewRaw = ''; }

  try { worker = readAt('worker.js'); add('worker-source-present', true, 'runtime source exists'); }
  catch (error) { add('worker-source-present', false, String(error)); worker = ''; }

  if (production) {
    add('production-worker-identity', production.name === contract.isolation.productionWorker, `expected ${contract.isolation.productionWorker}; found ${production.name || 'missing'}`);
    add('production-entrypoint', production.main === 'worker.js', 'production entrypoint remains worker.js');
    const routeCheck = validateProductionRoutes(production, contract);
    add(routeCheck.id, routeCheck.pass, routeCheck.detail);
  }

  if (previewRaw) {
    const preview = { name: previewName, workers_dev: previewWorkersDev, routes: previewRoutes, __raw: previewRaw };
    for (const check of validatePreviewIsolation(production || {}, preview, contract)) add(check.id, check.pass, check.detail);
    add('preview-entrypoint', /^\s*main\s*=\s*["']cloudflare\/flagship-root\/preview-worker\.js["']\s*$/m.test(previewRaw), 'preview entrypoint points to the isolated wrapper');
    add('preview-assets-binding', /binding\s*=\s*["']ASSETS["']/.test(previewRaw) && /directory\s*=\s*["']\.["']/.test(previewRaw), 'preview asset binding and directory are explicit');
  }

  if (worker) {
    for (const endpoint of [contract.runtime.healthPath, ...contract.runtime.manifestPaths, contract.runtime.statusPath, contract.runtime.gatesPath, contract.runtime.modulesPath, contract.runtime.siteContextPath]) {
      const pass = worker.includes(`url.pathname === '${endpoint}'`);
      add(`runtime-endpoint-${endpoint.replaceAll('/', '-')}`, pass, `${endpoint} is explicitly routed in worker.js`);
    }
    add('g02-stays-blocked', contract.g02.status === 'BLOCKED' && /G02_RUNNER:\s*'FAIL \/ UNVERIFIED'/.test(worker), 'contract and runtime source preserve the blocked G02 state');
    add('fail-closed-release-policy', /release_policy:\s*'fail-closed'/.test(worker) && /production_mutation:\s*'FROZEN'/.test(worker), 'runtime declares fail-closed release policy and frozen production mutation');
  }

  add('allowed-gate-states', JSON.stringify(contract.releaseGates.allowedStates) === JSON.stringify(['PASS', 'FAIL', 'BLOCKED']), 'only PASS, FAIL, BLOCKED are allowed');
  add('evidence-required-fields', contract.releaseGates.requiredEvidenceFields.includes('commitSha') && contract.releaseGates.requiredEvidenceFields.includes('artifactSha256') && contract.releaseGates.requiredEvidenceFields.includes('workflowRunId'), 'evidence contract binds commit, artifact digest, and workflow run');
  add('production-mutation-disabled', contract.authority.productionMutationAllowed === false && contract.authority.mergeAllowed === false && contract.authority.gatePromotionAllowed === false, 'production mutation, merge, and gate promotion are disabled by contract');
  add('g02-evidence-not-fabricated', contract.g02.acceptancePredicate.length >= 7 && contract.g02.status === 'BLOCKED', 'G02 requires runner/job/steps/logs/artifact evidence and remains BLOCKED');

  const failed = result.filter((item) => item.status === 'FAIL').length;
  return { status: failed ? 'FAIL' : 'PASS', checks: result };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const report = verify();
  process.stdout.write(JSON.stringify({ schemaVersion: '1.0', ...report }, null, 2) + '\n');
  if (report.status !== 'PASS') process.exitCode = 1;
}
