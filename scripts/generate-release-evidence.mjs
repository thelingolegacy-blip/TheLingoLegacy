import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const run = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8' }).trim();
const commitSha = run('git', ['rev-parse', 'HEAD']);
const buildId = process.env.GITHUB_RUN_ID || `local-${Date.now()}`;
const releaseId = process.env.RELEASE_ID || `LL-${commitSha.slice(0, 8).toUpperCase()}`;
const environment = process.env.ENVIRONMENT || 'staging';
const root = join('release', 'evidence', releaseId);
mkdirSync(root, { recursive: true });

const manifest = {
  schemaVersion: '1.0', releaseId, commitSha, buildId, environment,
  generatedAt: new Date().toISOString(),
  status: 'EVIDENCE_GENERATED',
  certificationStatus: 'NOT_CERTIFIED'
};

const files = {
  'manifest.json': manifest,
  'commit.json': { commitSha, shortSha: commitSha.slice(0, 8), ref: process.env.GITHUB_REF || 'local' },
  'build.json': { buildId, environment, status: 'NOT_RUN', reason: 'Build evidence must be supplied by CI.' },
  'gates.json': { status: 'NOT_RUN', criticalGates: [], policy: 'FAIL_CLOSED' },
  'live-probes.json': { status: 'NOT_RUN', probes: [] },
  'rollback.json': { status: 'NOT_RUN', target: null },
  'certificate.json': { releaseId, status: 'NOT_ISSUED', reason: 'Certification requires live deployment evidence.' }
};

for (const [name, value] of Object.entries(files)) writeFileSync(join(root, name), JSON.stringify(value, null, 2) + '\n');

const digest = createHash('sha256');
for (const name of Object.keys(files).sort()) digest.update(name + '\n' + JSON.stringify(files[name]) + '\n');
const evidenceDigest = digest.digest('hex');
manifest.evidenceDigest = evidenceDigest;
writeFileSync(join(root, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ releaseId, commitSha, buildId, evidenceDigest, path: root }, null, 2));
