import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { verifyReleaseBundle } from './verify-release-bundle.mjs';

const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'lingo-bundle-'));
  mkdirSync(join(root, 'staging-public'));
  mkdirSync(join(root, 'evidence-tools'));
  const content = {
    'worker.js': 'export default { fetch(){ return new Response("ok"); } };\n',
    'staging-public/index.html': '<html>staging</html>\n',
    'evidence-tools/live-probes.mjs': 'console.log("{}");\n',
    'wrangler.deploy.jsonc': JSON.stringify({ name:'thelingolegacy-staging', main:'worker.js', workers_dev:true, routes:[], assets:{directory:'./staging-public'} })
  };
  for (const [path, value] of Object.entries(content)) {
    const full = join(root, path);
    mkdirSync(join(full, '..'), { recursive: true });
    writeFileSync(full, value);
  }
  const files = Object.entries(content).map(([path, value]) => ({ path, bytes: Buffer.byteLength(value), sha256: sha(Buffer.from(value)) }));
  const manifest = { schemaVersion:'1.0', status:'SEALED_NOT_CERTIFIED', sourceCommit:'a'.repeat(40), sanitizerSha256:'b'.repeat(64), stagingConfigSha256:'c'.repeat(64), workerEntrypoint:'worker.js', files };
  writeFileSync(join(root,'release-manifest.json'), JSON.stringify(manifest, null, 2)+'\n');
  writeFileSync(join(root,'release-manifest.sha256'), sha(readFileSync(join(root,'release-manifest.json')))+'\n');
  const digest = sha(readFileSync(join(root,'release-manifest.json')));
  return { root, digest, cleanup:() => rmSync(root,{recursive:true,force:true}) };
}

test('accepts exact sealed staging bundle', () => {
  const f = fixture();
  try { assert.equal(verifyReleaseBundle(f.root, f.digest, 'a'.repeat(40)).status, 'PASS'); }
  finally { f.cleanup(); }
});

test('rejects tampered bundle file', () => {
  const f = fixture();
  try {
    writeFileSync(join(f.root,'worker.js'),'tampered');
    assert.throws(() => verifyReleaseBundle(f.root, f.digest, 'a'.repeat(40)), /hash\/size mismatch/);
  } finally { f.cleanup(); }
});

test('rejects an unexpected file', () => {
  const f = fixture();
  try {
    writeFileSync(join(f.root,'unexpected.txt'),'unexpected');
    assert.throws(() => verifyReleaseBundle(f.root, f.digest, 'a'.repeat(40)), /Unexpected file/);
  } finally { f.cleanup(); }
});

test('rejects a missing manifest', () => {
  const f = fixture();
  try {
    rmSync(join(f.root,'release-manifest.json'));
    assert.throws(() => verifyReleaseBundle(f.root, f.digest, 'a'.repeat(40)));
  } finally { f.cleanup(); }
});

test('rejects invalid staging route configuration', () => {
  const f = fixture();
  try {
    writeFileSync(join(f.root,'wrangler.deploy.jsonc'), JSON.stringify({ name:'thelingolegacy-staging', main:'worker.js', workers_dev:true, routes:[{pattern:'thelingolegacy.com/*'}], assets:{directory:'./staging-public'} }));
    const manifest = JSON.parse(readFileSync(join(f.root,'release-manifest.json'),'utf8'));
    const data = readFileSync(join(f.root,'wrangler.deploy.jsonc'));
    const record = manifest.files.find((x) => x.path === 'wrangler.deploy.jsonc');
    record.bytes = data.length; record.sha256 = sha(data);
    writeFileSync(join(f.root,'release-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
    writeFileSync(join(f.root,'release-manifest.sha256'),sha(readFileSync(join(f.root,'release-manifest.json')))+'\n');
    const digest = sha(readFileSync(join(f.root,'release-manifest.json')));
    assert.throws(() => verifyReleaseBundle(f.root, digest, 'a'.repeat(40)), /staging isolation/);
  } finally { f.cleanup(); }
});
