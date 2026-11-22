import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const path = new URL('../config/lingo-campaign-baseline.v1.json', import.meta.url);
const baseline = JSON.parse(readFileSync(path, 'utf8'));

assert.equal(baseline.schema_version, '1.0.0');
assert.equal(baseline.baseline_id, 'LINGO_CAMPAIGN_BASELINE_31');
assert.equal(baseline.authority, 'LINGOlegacy_MASTER');
assert.equal(baseline.total_count, 31);

const expectedFamilies = new Map([
  ['LINGOlane', 1],
  ['LINGOslots', 5],
  ['LINGOarcade', 5],
  ['LINGOlibrary', 5],
  ['LINGOmedia', 2],
  ['LINGOworld', 11],
  ['Independent', 2],
]);

assert.equal(baseline.families.length, expectedFamilies.size);
const allEntries = [];
for (const family of baseline.families) {
  assert.equal(expectedFamilies.get(family.family), family.count, `unexpected count for ${family.family}`);
  assert.equal(family.entries.length, family.count, `entry count mismatch for ${family.family}`);
  allEntries.push(...family.entries);
}
assert.equal(allEntries.length, 31);
assert.equal(new Set(allEntries.map((entry) => entry.id)).size, 31, 'campaign IDs must be unique');
assert.equal(new Set(allEntries.map((entry) => entry.name)).size, 31, 'canonical campaign names must be unique');

for (const name of [
  'LegacyXclub',
  'THE PRESTIGIOUS HOUSE OF DUSSE',
  'KottonsCode',
  'Loyalty Lane Cycle',
]) {
  const found = allEntries.some((entry) => entry.name === name)
    || baseline.nested_operating_lines_not_separately_counted.some((entry) => entry.name === name);
  assert.ok(found, `missing canonical portfolio identity: ${name}`);
}

for (const name of ['Bulldog Legacy Bridge', 'Events by the Lane', 'Zay Zay’s Water Ice', 'Sonic Boom']) {
  assert.ok(baseline.unclassified_outside_baseline.includes(name), `unclassified record lost: ${name}`);
}

console.log(JSON.stringify({
  status: 'PASS',
  declared: baseline.total_count,
  actual: allEntries.length,
  uniqueIds: new Set(allEntries.map((entry) => entry.id)).size,
  uniqueNames: new Set(allEntries.map((entry) => entry.name)).size,
  families: baseline.families.map(({ family, count }) => ({ family, count })),
  unclassifiedPreserved: baseline.unclassified_outside_baseline.length,
}, null, 2));
