import fs from 'node:fs';

const file = 'creative/asset-manifest.json';
const errors = [];
const products = new Set(['LINGOlegacy', 'LINGOlane', 'LINGOslots', 'LINGOarcade', 'LINGOlibrary', 'LINGOmedia', 'LINGOworld', 'LegacyXclub']);
const mediaTypes = new Set(['image', 'vector', 'video', 'audio', 'document', 'font', 'ui-component', '3d', 'other']);
const licenseStatuses = new Set(['UNKNOWN', 'EVIDENCE_REQUESTED', 'IN_REVIEW', 'CLEARED_WITH_LIMITS', 'NOT_CLEARED', 'EXPIRED', 'CLEARED']);
const publicationStatuses = new Set(['DRAFT', 'IN_REVIEW', 'APPROVED_FOR_PUBLICATION', 'PROTECTED_HOLD', 'ARCHIVED']);
if (!fs.existsSync(file)) { console.error(JSON.stringify({ ok: false, gate: 'CREATIVE_ASSET_MANIFEST', errors: [file + ': missing'] }, null, 2)); process.exit(1); }
let manifest;
try { manifest = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (error) { console.error(JSON.stringify({ ok: false, gate: 'CREATIVE_ASSET_MANIFEST', errors: ['invalid JSON: ' + error.message] }, null, 2)); process.exit(1); }
if (manifest?.schemaVersion !== 1) errors.push('schemaVersion must equal 1');
if (!Array.isArray(manifest?.assets)) errors.push('assets must be an array');
const assets = Array.isArray(manifest?.assets) ? manifest.assets : [];
const ids = new Set();
for (const [index, asset] of assets.entries()) {
  const label = 'assets[' + index + ']';
  if (!asset || typeof asset !== 'object' || Array.isArray(asset)) { errors.push(label + ' must be an object'); continue; }
  for (const field of ['id', 'title', 'product', 'mediaType', 'source', 'creator', 'createdAt', 'licenseStatus', 'usageScope', 'publicationStatus']) {
    if (typeof asset[field] !== 'string' || !asset[field].trim()) errors.push(label + '.' + field + ' is required');
  }
  if (asset.id) { if (ids.has(asset.id)) errors.push(label + '.id duplicates ' + asset.id); ids.add(asset.id); }
  if (asset.product && !products.has(asset.product)) errors.push(label + '.product is not a canonical product family: ' + asset.product);
  if (asset.mediaType && !mediaTypes.has(asset.mediaType)) errors.push(label + '.mediaType is invalid: ' + asset.mediaType);
  if (asset.licenseStatus && !licenseStatuses.has(asset.licenseStatus)) errors.push(label + '.licenseStatus is invalid: ' + asset.licenseStatus);
  if (asset.publicationStatus && !publicationStatuses.has(asset.publicationStatus)) errors.push(label + '.publicationStatus is invalid: ' + asset.publicationStatus);
  if (asset.publicationStatus === 'APPROVED_FOR_PUBLICATION') {
    for (const field of ['source', 'creator', 'createdAt', 'usageScope', 'approvalOwner', 'licenseEvidenceUrl', 'canvaDesignUrl']) if (!asset[field] || String(asset[field]).includes('UNKNOWN')) errors.push(label + ' cannot be approved: ' + field + ' lacks evidence');
    if (!['CLEARED', 'CLEARED_WITH_LIMITS'].includes(asset.licenseStatus)) errors.push(label + ' cannot be approved with licenseStatus=' + asset.licenseStatus);
  }
}
if (errors.length) { console.error(JSON.stringify({ ok: false, gate: 'CREATIVE_ASSET_MANIFEST', assetCount: assets.length, errors }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok: true, gate: 'CREATIVE_ASSET_MANIFEST', assetCount: assets.length, emptyManifestIsNotCompletenessEvidence: assets.length === 0, approvalRequiresEvidence: true }, null, 2));
