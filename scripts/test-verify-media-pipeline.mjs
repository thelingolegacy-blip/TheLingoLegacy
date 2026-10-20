import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const validator = fileURLToPath(new URL('./verify-media-pipeline.mjs', import.meta.url));
const stages = ['INGEST','TOUCH','TRANSFORM','QC','BRAND','CROP','VARIANTS','OPTIMIZE','APPROVE','PUBLISH','ACTIVE','REALTIME'];

function makeRoot(assetsValue, { omitAssets = false } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lingo-media-validator-'));
  fs.mkdirSync(path.join(root, 'config/assets'), { recursive: true });
  fs.mkdirSync(path.join(root, 'assets/studio/manifests'), { recursive: true });
  fs.writeFileSync(path.join(root, 'config/assets/media-pipeline-contract.json'), JSON.stringify({
    pipeline: stages,
    enabled: false,
    state: 'staged',
    releaseGate: 'G02',
    authorizationBoundaries: {
      approveToPublish: { automatic: false },
      publishToRealtime: { automatic: false }
    },
    identity: { immutableVersions: true },
    rollback: { destructive: false, preserveHistory: true },
    requiredAssetFields: ['asset_id','version_id','variant_id','source','owner','sha256','media_type','rights_status','quality_status','brand_status','pipeline_status']
  }));
  const manifest = {
    schema: 'lingo-studio-media',
    version: '1.0.0',
    integrityPolicy: { required: true, algorithm: 'sha256' }
  };
  if (!omitAssets) manifest.assets = assetsValue;
  fs.writeFileSync(path.join(root, 'assets/studio/manifests/runtime-media.json'), JSON.stringify(manifest));
  return root;
}

function runValidator(root) {
  return spawnSync(process.execPath, [validator, root], { encoding: 'utf8' });
}

test('missing assets property returns a clear validation error, not a runtime exception', (t) => {
  const root = makeRoot(undefined, { omitAssets: true });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = runValidator(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /runtime-media manifest assets must be an array/);
  assert.doesNotMatch(result.stderr, /TypeError|entries is not a function/);
});

test('non-array assets value returns a clear validation error, not a runtime exception', (t) => {
  const root = makeRoot({ unexpected: true });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = runValidator(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /runtime-media manifest assets must be an array/);
  assert.doesNotMatch(result.stderr, /TypeError|entries is not a function/);
});

test('an empty assets array is accepted', (t) => {
  const root = makeRoot([]);
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = runValidator(root);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /"runtimeAssets": 0/);
});

test('a valid asset list is accepted', (t) => {
  const root = makeRoot([{
    asset_id: 'asset-1',
    version_id: 'v1',
    variant_id: 'original',
    source: 'verified-source',
    owner: 'lingo-legacy',
    sha256: 'a'.repeat(64),
    media_type: 'image/webp',
    rights_status: 'approved',
    quality_status: 'passed',
    brand_status: 'approved',
    pipeline_status: 'PUBLISHED',
    runtimeReferenced: true
  }]);
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = runValidator(root);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /"runtimeAssets": 1/);
});

test('null manifest asset fails with a validation error, not a TypeError', (t) => {
  const root = makeRoot([null]);
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = runValidator(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /runtime-media asset\[0\] must be an object/);
  assert.doesNotMatch(result.stderr, /TypeError/);
});

test('malformed requiredAssetFields contract fails closed', (t) => {
  const root = makeRoot([]);
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const contractPath = path.join(root, 'config/assets/media-pipeline-contract.json');
  const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
  contract.requiredAssetFields = 'asset_id';
  fs.writeFileSync(contractPath, JSON.stringify(contract));
  const result = runValidator(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /requiredAssetFields must be an array/);
});
