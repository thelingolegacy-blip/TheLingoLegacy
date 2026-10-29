import test from 'node:test';
import assert from 'node:assert/strict';
import { validateGateEvidence, validatePreviewIsolation, validateProductionRoutes } from './verify-backbone-infrastructure-contract.mjs';

const contract = {
  isolation: {
    productionWorker: 'thelingolegacyv-5',
    previewWorker: 'lingo-legacy-flagship-preview',
    previewMustNotDeclareCustomDomainRoutes: true,
  },
};

const production = { name: 'thelingolegacyv-5' };
const safePreview = {
  name: 'lingo-legacy-flagship-preview',
  workers_dev: true,
  routes: [],
  __raw: 'name = "lingo-legacy-flagship-preview"\nworkers_dev = true\n',
};

test('accepts isolated preview identity with no production routes', () => {
  const checks = validatePreviewIsolation(production, safePreview, contract);
  assert.ok(checks.every((check) => check.pass), JSON.stringify(checks));
});

test('rejects preview that reuses the production Worker identity', () => {
  const checks = validatePreviewIsolation(production, { ...safePreview, name: production.name }, contract);
  assert.equal(checks.find((check) => check.id === 'preview-worker-name-distinct').pass, false);
});

test('rejects preview that declares a production custom-domain route', () => {
  const unsafe = {
    ...safePreview,
    __raw: 'name = "lingo-legacy-flagship-preview"\nworkers_dev = true\n[[routes]]\npattern = "thelingolegacy.com/*"\n',
  };
  const checks = validatePreviewIsolation(production, unsafe, contract);
  assert.equal(checks.find((check) => check.id === 'preview-no-routes').pass, false);
  assert.equal(checks.find((check) => check.id === 'preview-no-production-pattern').pass, false);
});

test('rejects any custom-domain route table, even when it is not a production domain', () => {
  const unsafe = {
    ...safePreview,
    __raw: 'name = "lingo-legacy-flagship-preview"\nworkers_dev = true\n[[routes]]\npattern = "preview.example.net/*"\n',
  };
  const checks = validatePreviewIsolation(production, unsafe, contract);
  assert.equal(checks.find((check) => check.id === 'preview-no-routes').pass, false);
  assert.equal(checks.find((check) => check.id === 'preview-no-production-pattern').pass, true);
});

test('rejects a top-level routes assignment as well as TOML route tables', () => {
  const unsafe = {
    ...safePreview,
    __raw: 'name = "lingo-legacy-flagship-preview"\nworkers_dev = true\nroutes = [{ pattern = "thelingolegacy.com/*" }]\n',
  };
  const checks = validatePreviewIsolation(production, unsafe, contract);
  assert.equal(checks.find((check) => check.id === 'preview-no-routes').pass, false);
  assert.equal(checks.find((check) => check.id === 'preview-no-production-pattern').pass, false);
});

test('preserves BLOCKED without promoting missing evidence', () => {
  const result = validateGateEvidence({ gateId: 'G02', status: 'BLOCKED' });
  assert.equal(result.pass, true);
  assert.equal(result.status, 'BLOCKED');
});

test('rejects PASS when evidence fields are missing', () => {
  const result = validateGateEvidence({ gateId: 'G02', status: 'PASS' });
  assert.equal(result.pass, false);
  assert.equal(result.status, 'FAIL');
});

test('accepts PASS only with commit-bound artifact digest and UTC verification time', () => {
  const result = validateGateEvidence({
    gateId: 'G02',
    status: 'PASS',
    commitSha: 'a'.repeat(40),
    workflowRunId: '12345',
    jobId: '67890',
    artifactName: 'g02-evidence.zip',
    artifactSha256: 'b'.repeat(64),
    verifiedAt: '2026-10-29T18:00:00Z',
    verifier: 'independent-review',
  });
  assert.equal(result.pass, true);
  assert.equal(result.status, 'PASS');
});

test('rejects malformed commit SHA, digest, and non-UTC timestamp', () => {
  const result = validateGateEvidence({
    gateId: 'G02',
    status: 'PASS',
    commitSha: 'latest',
    workflowRunId: '12345',
    jobId: '67890',
    artifactName: 'g02-evidence.zip',
    artifactSha256: 'not-a-digest',
    verifiedAt: '2026-10-29T18:00:00-04:00',
    verifier: 'independent-review',
  });
  assert.equal(result.pass, false);
  assert.equal(result.status, 'FAIL');
});

test('rejects a route table with a trailing TOML comment', () => {
  const unsafe = {
    ...safePreview,
    __raw: 'name = "lingo-legacy-flagship-preview"\\nworkers_dev = true\\n[[routes]] # route table hidden by a comment\\npattern = "preview.example.net/*"\\n',
  };
  const checks = validatePreviewIsolation(production, unsafe, contract);
  assert.equal(checks.find((check) => check.id === 'preview-no-routes').pass, false);
});

test('accepts only the exact approved production route set', () => {
  const approved = {
    name: 'thelingolegacyv-5',
    routes: [{ pattern: 'thelingolegacy.com/*' }, { pattern: 'www.thelingolegacy.com/*' }],
  };
  assert.equal(validateProductionRoutes(approved, contract).pass, true);
  const extra = { ...approved, routes: [...approved.routes, { pattern: 'unexpected.example/*' }] };
  assert.equal(validateProductionRoutes(extra, contract).pass, false);
  const missing = { ...approved, routes: approved.routes.slice(0, 1) };
  assert.equal(validateProductionRoutes(missing, contract).pass, false);
});
