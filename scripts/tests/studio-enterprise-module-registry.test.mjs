import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validateRegistry } from '../validate-studio-enterprise-module-registry.mjs';

const registryPath = new URL('../../studio/enterprise-module-registry.json', import.meta.url);
const registry = JSON.parse(fs.readFileSync(fileURLToPath(registryPath), 'utf8'));

test('canonical Studio enterprise registry passes its contract', () => {
  assert.deepEqual(validateRegistry(registry), []);
  assert.equal(registry.modules.length, 22);
});

test('duplicate module identifiers fail closed', () => {
  const copy = structuredClone(registry);
  copy.modules.push(structuredClone(copy.modules[0]));
  assert.ok(validateRegistry(copy).some(error => error.includes('duplicate module id')));
});

test('write authority cannot be enabled through a module record', () => {
  const copy = structuredClone(registry);
  copy.modules.find(module => module.id === 'hr-payroll').writeAuthority = true;
  assert.ok(validateRegistry(copy).some(error => error.includes('must not have write authority')));
});

test('unknown readiness values are rejected', () => {
  const copy = structuredClone(registry);
  copy.modules[0].status = 'MAGICALLY_LIVE';
  assert.ok(validateRegistry(copy).some(error => error.includes('unknown status')));
});

test('sensitive operational domains retain separate permission scopes', () => {
  for (const [id, scope] of [
    ['workforce-operations', 'workforce:read'],
    ['hr-payroll', 'payroll:read'],
    ['residential-property-operations', 'property:read'],
    ['hospitality-operations', 'hospitality:read'],
    ['transport-infrastructure', 'transport:read'],
    ['street-lighting-operations', 'lighting:read'],
    ['water-distribution-operations', 'water:read'],
    ['wastewater-drainage-operations', 'wastewater:read'],
    ['world-engine-studio', 'world:read'],
    ['game-liveops-studio', 'gameops:read'],
  ]) {
    const module = registry.modules.find(item => item.id === id);
    assert.ok(module, `missing ${id}`);
    assert.ok(module.permissions.includes(scope), `${id} missing ${scope}`);
    assert.equal(module.writeAuthority, false);
  }
});

test('infrastructure domains require jurisdiction, GIS and asset evidence', () => {
  for (const id of ['residential-property-operations','hospitality-operations','transport-infrastructure','street-lighting-operations','water-distribution-operations','wastewater-drainage-operations']) {
    const module = registry.modules.find(item => item.id === id);
    assert.ok(module.requiredEvidence.includes('jurisdiction'));
    assert.ok(module.requiredEvidence.includes('GISReference'));
    assert.ok(module.requiredEvidence.includes('assetRegistry'));
  }
});

test('world and live-operations modules require simulation and trust evidence', () => {
  const world = registry.modules.find(item => item.id === 'world-engine-studio');
  const liveops = registry.modules.find(item => item.id === 'game-liveops-studio');
  for (const evidence of ['worldSchema','assetRights','simulationTests','contentSafety','runtimeAdapter']) assert.ok(world.requiredEvidence.includes(evidence));
  for (const evidence of ['sessionContract','antiCheatTests','moderationPolicy','telemetryRedaction','rollbackEvidence']) assert.ok(liveops.requiredEvidence.includes(evidence));
});

const dashboardPath = new URL('../../studio/index.html', import.meta.url);
const dashboard = fs.readFileSync(fileURLToPath(dashboardPath), 'utf8');
const workerPath = new URL('../../worker.js', import.meta.url);
const worker = fs.readFileSync(fileURLToPath(workerPath), 'utf8');

test('Studio dashboard consumes the canonical registry rather than the runtime product list', () => {
  assert.match(dashboard, /\/studio\/enterprise-module-registry\.json/);
  assert.match(dashboard, /registry\.modules\.map/);
  assert.match(dashboard, /registry\.providerReadiness/);
  assert.match(dashboard, /Module registration is not proof/);
});

test('Studio dashboard separates live probes from connector-only observations', () => {
  assert.match(dashboard, /api\.github\.com\/repos\/thelingolegacy-blip\/TheLingoLegacy/);
  assert.match(dashboard, /\/api\/v1\/platform\/status/);
  assert.match(dashboard, /session-observed connector snapshot/);
  assert.match(dashboard, /workspace selection/);
  assert.match(dashboard, /No credentials are requested or displayed/);
});

test('GitHub metadata probe is narrowly permitted by the Worker CSP', () => {
  assert.match(worker, /connect-src 'self' https:\/\/api\.github\.com/);
  assert.doesNotMatch(worker, /connect-src[^;]*\*/);
});

test('dashboard never embeds provider credentials and has valid script closure', () => {
  assert.match(dashboard, /<\/script><\/body><\/html>$/);
  assert.doesNotMatch(dashboard, /(?:ghp_|github_pat_|sk-[A-Za-z0-9]{12,}|sb_secret_|AIza[0-9A-Za-z_-]{20,})/);
});


test('LIVE_VERIFIED modules require actual correlated evidence values', () => {
  const copy = structuredClone(registry);
  const module = copy.modules.find(item => item.id === 'cloud-studio');
  module.status = 'LIVE_VERIFIED';
  delete module.evidence;
  assert.ok(validateRegistry(copy).some(error => error.includes('LIVE_VERIFIED requires an evidence object')));
  module.evidence = { source: 'Cloudflare API readback', observedAt: '2026-11-23T00:00:00Z', confidence: 'high', correlationId: '' };
  assert.ok(validateRegistry(copy).some(error => error.includes('LIVE_VERIFIED evidence missing value: correlationId')));
});
