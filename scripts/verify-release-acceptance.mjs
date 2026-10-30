import fs from 'node:fs';

const file = 'release/acceptance-gates.json';
const matrix = JSON.parse(fs.readFileSync(file, 'utf8'));
const errors = [];
const allowed = new Set(['SOURCE_PRESENT', 'PENDING', 'BLOCKED', 'PASS', 'NOT_APPLICABLE']);
const ids = new Set();

if (matrix.schemaVersion !== 1) errors.push('Unsupported acceptance matrix schemaVersion.');
if (matrix.policy !== 'fail-closed') errors.push('Release policy must be fail-closed.');
if (matrix.promotionAllowed !== false) errors.push('Promotion must remain disabled in this baseline.');
if (!Array.isArray(matrix.gates) || matrix.gates.length < 20) errors.push('Expected the complete master gate set.');

for (const gate of matrix.gates || []) {
  if (!gate.id || ids.has(gate.id)) errors.push('Missing or duplicate gate ID: ' + gate.id);
  ids.add(gate.id);
  if (!allowed.has(gate.status)) errors.push('Invalid status for ' + gate.id + ': ' + gate.status);
  if (!Array.isArray(gate.requiredEvidence) || gate.requiredEvidence.length === 0) errors.push('No evidence predicates for ' + gate.id);
  if (!Array.isArray(gate.evidence)) errors.push('Evidence must be an array for ' + gate.id);
  if (gate.status === 'PASS') {
    const present = new Set((gate.evidence || []).filter(e => e && e.verified === true && e.uri && e.sha256 && e.reviewer && e.acceptedAt).map(e => e.predicate));
    for (const predicate of gate.requiredEvidence || []) {
      if (!present.has(predicate)) errors.push(gate.id + ' marked PASS without verified evidence for ' + predicate);
    }
  }
  if (gate.status === 'NOT_APPLICABLE' && (!gate.notes || !gate.owner)) errors.push(gate.id + ' N/A requires rationale and owner.');
}
for (const [gateId, predicates] of Object.entries({
  G07: ['server_authoritative_rng'],
  G09: ['shared_rate_limit'],
  G10: ['public_asset_boundary_probe'],
})) {
  const gate = (matrix.gates || []).find(item => item.id === gateId);
  for (const predicate of predicates) {
    if (!gate?.requiredEvidence?.includes(predicate)) {
      errors.push(gateId + ' must require ' + predicate + ' before acceptance.');
    }
  }
}
for (const required of ['G00','G01','G02','G03','G05','G07','G08','G10','G14','G16','G20','G21']) {
  if (!ids.has(required)) errors.push('Required release gate missing: ' + required);
}
if (errors.length) {
  console.error('RELEASE_ACCEPTANCE_MATRIX=FAIL');
  for (const error of errors) console.error('- ' + error);
  process.exit(1);
}
console.log('RELEASE_ACCEPTANCE_MATRIX=PASS');
console.log('GATE_COUNT=' + matrix.gates.length);
console.log('PROMOTION_ALLOWED=' + matrix.promotionAllowed);
console.log('NOTE=Schema integrity only; this does not certify any product or release gate.');
