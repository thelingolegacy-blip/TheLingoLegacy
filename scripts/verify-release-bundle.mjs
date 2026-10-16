import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const sha256 = (value) => createHash('sha256').update(value).digest('hex');

export function verifyReleaseBundle(root, expectedManifestSha256, expectedSourceCommit) {
  const manifestPath = join(root, 'release-manifest.json');
  const manifestBytes = readFileSync(manifestPath);
  const digest = sha256(manifestBytes);
  if (!/^[a-f0-9]{64}$/.test(expectedManifestSha256 || '') || digest !== expectedManifestSha256) {
    throw new Error('Manifest digest differs from trusted build-job output');
  }
  if (readFileSync(join(root, 'release-manifest.sha256'), 'utf8').trim() !== digest) {
    throw new Error('Detached manifest digest mismatch');
  }
  const manifest = JSON.parse(manifestBytes.toString('utf8'));
  if (manifest.status !== 'SEALED_NOT_CERTIFIED' || manifest.sourceCommit !== expectedSourceCommit) {
    throw new Error('Manifest state/source mismatch');
  }
  for (const key of ['sanitizerSha256', 'stagingConfigSha256']) {
    if (!/^[a-f0-9]{64}$/.test(manifest[key] || '')) throw new Error('Invalid SHA-256 provenance: ' + key);
  }
  if (!/^[a-f0-9]{40}$/.test(manifest.sourceCommit || '')) throw new Error('Invalid source commit');
  if (!/^[\w.-]+\.m?js$/.test(manifest.workerEntrypoint || '')) throw new Error('Invalid Worker entrypoint');

  const expected = new Map(manifest.files.map((file) => [file.path, file]));
  if (expected.size !== manifest.files.length) throw new Error('Duplicate manifest paths');
  const actual = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isSymbolicLink()) throw new Error('Symlink forbidden: ' + full);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) {
        const path = relative(root, full).split(sep).join('/');
        if (path === 'release-manifest.json' || path === 'release-manifest.sha256') continue;
        actual.push(path);
        const record = expected.get(path);
        if (!record) throw new Error('Unexpected file: ' + path);
        if (lstatSync(full).size !== record.bytes || sha256(readFileSync(full)) !== record.sha256) {
          throw new Error('File hash/size mismatch: ' + path);
        }
      } else throw new Error('Unsupported filesystem entry: ' + full);
    }
  };
  walk(root);
  if (actual.length !== expected.size || [...expected.keys()].some((path) => !actual.includes(path))) {
    throw new Error('Bundle file set differs from manifest');
  }
  for (const path of ['wrangler.deploy.jsonc', 'evidence-tools/live-probes.mjs', 'staging-public/index.html']) {
    if (!expected.has(path)) throw new Error('Required file missing: ' + path);
  }
  const config = JSON.parse(readFileSync(join(root, 'wrangler.deploy.jsonc'), 'utf8'));
  if (config.name !== 'thelingolegacy-staging' || config.workers_dev !== true ||
      (config.routes || []).length !== 0 || config.main !== manifest.workerEntrypoint ||
      config.assets?.directory !== './staging-public') {
    throw new Error('Deployment config violates staging isolation');
  }
  return { status: 'PASS', sourceCommit: manifest.sourceCommit, manifestSha256: digest, fileCount: actual.length, workerEntrypoint: manifest.workerEntrypoint };
}

if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) {
  const root = process.argv[2] || '.wrangler-build';
  const result = verifyReleaseBundle(root, process.env.EXPECTED_MANIFEST_SHA256, process.env.EXPECTED_SOURCE_COMMIT);
  console.log(JSON.stringify(result));
}
