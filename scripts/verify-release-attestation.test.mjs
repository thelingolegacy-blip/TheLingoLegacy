import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyReleaseAttestation } from './verify-release-attestation.mjs';

const expectedCommit = 'a'.repeat(40);
const expectedManifestSha256 = 'b'.repeat(64);
function fixture() {
  const probes = { gate:'live-probes', base:'https://thelingolegacy-staging.thelingolegacy.workers.dev', timestamp:'2026-10-16T00:00:00.000Z', status:'PASS', probes:[{path:'/healthz',actual:200,status:'PASS'}] };
  const versionEvidence = { workerName:'thelingolegacy-staging', versionId:'version-123', etag:'etag-123', confirmedByCloudflareApi:true };
  const attestation = { schemaVersion:'1.0', status:'STAGING_DEPLOYED_PROBES_PASS_NOT_CERTIFIED', sourceCommit:expectedCommit, sanitizerSha256:'c'.repeat(64), stagingConfigSha256:'d'.repeat(64), bundleManifestSha256:expectedManifestSha256, workerName:'thelingolegacy-staging', workerEntrypoint:'worker.js', cloudflareVersionId:'version-123', cloudflareEtag:'etag-123', probeOutcome:'success', probes };
  return { attestation, probes, versionEvidence, expectedCommit, expectedManifestSha256 };
}

test('accepts correlated staging evidence without issuing certification', () => {
  const result = verifyReleaseAttestation(fixture());
  assert.equal(result.status,'PASS_NOT_CERTIFIED');
  assert.equal(result.certificationIssued,false);
});

test('rejects missing attestation', () => {
  const f = fixture(); f.attestation = null;
  assert.throws(() => verifyReleaseAttestation(f), /Missing release attestation/);
});

test('rejects a wrong commit', () => {
  const f = fixture(); f.attestation.sourceCommit = 'e'.repeat(40);
  assert.throws(() => verifyReleaseAttestation(f), /source commit mismatch/);
});

test('rejects tampered manifest digest', () => {
  const f = fixture(); f.attestation.bundleManifestSha256 = 'f'.repeat(64);
  assert.throws(() => verifyReleaseAttestation(f), /manifest digest mismatch/);
});

test('rejects a failed probe', () => {
  const f = fixture(); f.probes.probes[0].status = 'FAIL'; f.attestation.probes = f.probes;
  assert.throws(() => verifyReleaseAttestation(f), /did not pass|failed or are missing/);
});

test('rejects mismatched Cloudflare version identity', () => {
  const f = fixture(); f.versionEvidence.versionId = 'different-version';
  assert.throws(() => verifyReleaseAttestation(f), /does not correlate/);
});

test('rejects production Worker identity', () => {
  const f = fixture(); f.attestation.workerName = 'thelingolegacy';
  assert.throws(() => verifyReleaseAttestation(f), /Worker identity mismatch/);
});
