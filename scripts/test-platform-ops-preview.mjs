import assert from 'node:assert/strict';
import fs from 'node:fs';

const page = fs.readFileSync('render-staging/index.html', 'utf8');
const status = JSON.parse(fs.readFileSync('render-staging/status.json', 'utf8'));
const manifest = JSON.parse(fs.readFileSync('docs/inventory/repository-file-manifest-2026-11-02.json', 'utf8'));
const firebase = JSON.parse(fs.readFileSync('firebase.json', 'utf8'));
const worker = fs.readFileSync('cloudflare/world-engine-staging-worker.js', 'utf8');

assert.ok(page.includes('Platform Control Center'));
assert.ok(page.includes('STAGING / READ-ONLY CONTROL SURFACE'));
assert.equal(status.cloudflare.world_engine_d1.tables, 12);
assert.equal(status.cloudflare.world_engine_d1.indexes, 9);
assert.equal(status.cloudflare.world_engine_d1.triggers, 8);
assert.equal(status.render.static_preview_services, 1);
assert.equal(status.render.deploy_status, 'live');
assert.equal(status.cloudflare.staging_worker.workers_dev, 'enabled');
assert.equal(manifest.file_count, manifest.files.length);
assert.equal(manifest.asset_file_count, manifest.files.filter(x => x.category === 'asset').length);
assert.equal(firebase.hosting.public, 'build/web');
assert.match(worker, /request\.method !== "GET"/);
assert.match(worker, /lifecycle_state = 'published'/);
assert.doesNotMatch(worker, /INSERT INTO|UPDATE\s+worlds|DELETE FROM/i);
assert.doesNotMatch(page + JSON.stringify(status), /GR\d{7,}|runners_token|BEGIN RSA PRIVATE KEY/i);
console.log('Platform operations preview, inventory, Firebase boundary and read-only Worker contract: PASS');
