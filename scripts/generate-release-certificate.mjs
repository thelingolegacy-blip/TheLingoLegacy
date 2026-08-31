import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const evidencePath = process.env.EVIDENCE_MANIFEST || 'release/evidence/current/manifest.json';
const gatesPath = process.env.GATES_FILE || 'release/evidence/current/gates.json';
const livePath = process.env.LIVE_PROBES_FILE || 'release/evidence/current/live-probes.json';
const rollbackPath = process.env.ROLLBACK_FILE || 'release/evidence/current/rollback.json';

const read = (p) => JSON.parse(readFileSync(p, 'utf8'));
const evidence = read(evidencePath);
const gates = read(gatesPath);
const live = read(livePath);
const rollback = read(rollbackPath);
const critical = new Set([
  'source','build','tests','security','secrets','vercel-eradication','routes','interactions','apis','identity',
  'games','commerce','assets','audio','motion','accessibility','performance','cloudflare','live-probes','rollback'
]);
const results = gates.results || {};
const failures = [...critical].filter((g) => results[g] !== 'PASS');
const livePass = live.status === 'PASS';
const rollbackPass = rollback.status === 'PASS' && rollback.target;
const certified = failures.length === 0 && livePass && rollbackPass && evidence.environment === 'production';

const certificate = {
  schemaVersion: '1.0',
  releaseId: evidence.releaseId,
  commitSha: evidence.commitSha,
  artifactDigest: evidence.artifactDigest || null,
  buildId: evidence.buildId,
  environment: evidence.environment,
  registryVersion: evidence.registryVersion || null,
  deploymentId: evidence.deploymentId || null,
  gateResults: results,
  liveProbeResults: live,
  rollbackTarget: rollback.target || null,
  status: certified ? 'CERTIFIED' : 'NOT_ISSUED',
  failures,
  certifiedAt: certified ? new Date().toISOString() : null
};

const canonical = JSON.stringify(certificate, Object.keys(certificate).sort());
certificate.certificateDigest = createHash('sha256').update(canonical).digest('hex');
writeFileSync(process.env.CERTIFICATE_OUTPUT || 'release/evidence/current/certificate.json', JSON.stringify(certificate, null, 2) + '\n');
console.log(JSON.stringify(certificate, null, 2));
if (!certified) process.exit(1);
