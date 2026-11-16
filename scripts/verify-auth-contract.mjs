import fs from 'node:fs';
import assert from 'node:assert/strict';

const path = 'infrastructure/registry/authentication-integrations.json';
const registry = JSON.parse(fs.readFileSync(path, 'utf8'));
assert.equal(registry.schema_version, '1.0.0');
assert.equal(registry.repository.full_name, 'thelingolegacy-blip/TheLingoLegacy');
assert.equal(registry.repository.repository_id, '1279436411');
assert.equal(registry.repository.release_posture, 'PROTECTED_HOLD');
assert.ok(Array.isArray(registry.integrations) && registry.integrations.length >= 15);
const ids = new Set();
const allowed = new Set(registry.states);
for (const item of registry.integrations) {
  assert.ok(item.id && !ids.has(item.id), `missing or duplicate integration id: ${item.id}`);
  ids.add(item.id);
  assert.ok(allowed.has(item.state), `invalid state for ${item.id}: ${item.state}`);
  assert.ok(item.surface && item.provider && item.identity_type && item.scope && item.evidence,
    `incomplete integration record: ${item.id}`);
  if (item.state === 'CONNECTED_VERIFIED') {
    assert.ok(item.evidence.startsWith('PASS:'),
      `verified state requires evidence prefixed with PASS:: ${item.id}`);
  }
}
assert.equal(registry.secret_policy.source_of_truth, 'approved Secret Manager');
assert.equal(registry.secret_policy.never_commit_values, true);
assert.equal(registry.secret_policy.never_store_in_firestore_or_cloud_sql, true);
assert.equal(registry.secret_policy.production_requires_separate_release_acceptance, true);
console.log(`AUTH_INTEGRATION_REGISTRY_PASS count=${registry.integrations.length}`);
console.log('AUTH_POLICY=FAIL_CLOSED');
console.log('PRODUCTION_DEPLOYMENT=NOT_AUTHORIZED');
