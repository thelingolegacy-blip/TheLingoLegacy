import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || process.cwd());
const errors = [];
function load(relativePath) {
  const file = path.join(root, relativePath);
  if (!fs.existsSync(file)) {
    errors.push(`${relativePath}: missing`);
    return null;
  }
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) {
    errors.push(`${relativePath}: invalid JSON: ${error.message}`);
    return null;
  }
}

const contract = load('config/assets/media-pipeline-contract.json');
const manifest = load('assets/studio/manifests/runtime-media.json');
const expectedStages = ['INGEST','TOUCH','TRANSFORM','QC','BRAND','CROP','VARIANTS','OPTIMIZE','APPROVE','PUBLISH','ACTIVE','REALTIME'];
if (JSON.stringify(contract?.pipeline) !== JSON.stringify(expectedStages)) errors.push('media contract pipeline order does not match canonical stage sequence');
if (contract?.enabled !== false || contract?.state !== 'staged') errors.push('media contract must remain staged and disabled');
if (contract?.releaseGate !== 'G02') errors.push('media contract releaseGate must remain G02');
if (contract?.authorizationBoundaries?.approveToPublish?.automatic !== false) errors.push('APPROVE-to-PUBLISH must require explicit authorization');
if (contract?.authorizationBoundaries?.publishToRealtime?.automatic !== false) errors.push('PUBLISH-to-REALTIME must require explicit activation authorization');
if (contract?.identity?.immutableVersions !== true) errors.push('asset versions must be immutable');
if (contract?.rollback?.destructive !== false || contract?.rollback?.preserveHistory !== true) errors.push('rollback must be non-destructive and preserve history');

if (manifest) {
  if (!Array.isArray(manifest.assets)) errors.push('runtime-media manifest assets must be an array');
  if (manifest.integrityPolicy?.required !== true || manifest.integrityPolicy?.algorithm !== 'sha256') {
    errors.push('runtime-media manifest must require SHA-256 integrity');
  }
  const assets = Array.isArray(manifest.assets) ? manifest.assets : [];
  for (const [index, asset] of assets.entries()) {
    for (const key of contract?.requiredAssetFields || []) {
      if (asset[key] === undefined || asset[key] === null || asset[key] === '') errors.push(`runtime-media asset[${index}] missing ${key}`);
    }
    if (asset.sha256 && !/^[a-f0-9]{64}$/i.test(String(asset.sha256))) errors.push(`runtime-media asset[${index}] has invalid SHA-256`);
    if (asset.runtimeReferenced === true && !['PUBLISHED','ACTIVE'].includes(String(asset.pipeline_status).toUpperCase())) {
      errors.push(`runtime-media asset[${index}] is runtime-referenced before publication/activation`);
    }
  }
}

if (errors.length) {
  console.error(JSON.stringify({ ok: false, gate: 'MEDIA_PIPELINE', errors }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({
  ok: true,
  gate: 'MEDIA_PIPELINE',
  pipelineStages: expectedStages.length,
  runtimeAssets: Array.isArray(manifest.assets) ? manifest.assets.length : 0,
  state: 'staged',
  enabled: false,
  note: 'Static manifest validation only; rights review, visual/audio QA, publication, and live URL checks remain separate gates.',
}, null, 2));
