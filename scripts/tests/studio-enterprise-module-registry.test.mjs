import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validateRegistry } from '../validate-studio-enterprise-module-registry.mjs';

const registryPath = new URL('../../studio/enterprise-module-registry.json', import.meta.url);
const registry = JSON.parse(fs.readFileSync(fileURLToPath(registryPath), 'utf8'));

test('canonical Studio enterprise registry passes its contract', () => {
  assert.deepEqual(validateRegistry(registry), []);
  assert.equal(registry.modules.length, 19);
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
    ['water-wastewater-operations', 'utilities:read'],
  ]) {
    const module = registry.modules.find(item => item.id === id);
    assert.ok(module, `missing ${id}`);
    assert.ok(module.permissions.includes(scope), `${id} missing ${scope}`);
    assert.equal(module.writeAuthority, false);
  }
});

test('infrastructure domains require jurisdiction, GIS and asset evidence', () => {
  for (const id of ['residential-property-operations','hospitality-operations','transport-infrastructure','street-lighting-operations','water-wastewater-operations']) {
    const module = registry.modules.find(item => item.id === id);
    assert.ok(module.requiredEvidence.includes('jurisdiction'));
    assert.ok(module.requiredEvidence.includes('GISReference'));
    assert.ok(module.requiredEvidence.includes('assetRegistry'));
  }
});
