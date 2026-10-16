import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const sha256Pattern = /^[a-f0-9]{64}$/;

export function verifyReleaseAttestation({ attestation, probes, versionEvidence, expectedCommit, expectedManifestSha256 }) {
  if (!attestation || typeof attestation !== 'object') throw new Error('Missing release attestation');
  if (!probes || typeof probes !== 'object') throw new Error('Missing live probe evidence');
  if (!versionEvidence || typeof versionEvidence !== 'object') throw new Error('Missing Cloudflare version evidence');
  if (attestation.schemaVersion !== '1.0' || attestation.status !== 'STAGING_DEPLOYED_PROBES_PASS_NOT_CERTIFIED') {
    throw new Error('Attestation is not in an accepted staging-evidence state');
  }
  if (attestation.sourceCommit !== expectedCommit) throw new Error('Attestation source commit mismatch');
  if (!sha256Pattern.test(expectedManifestSha256 || '') || attestation.bundleManifestSha256 !== expectedManifestSha256) {
    throw new Error('Attestation manifest digest mismatch');
  }
  if (!sha256Pattern.test(attestation.sanitizerSha256 || '') || !sha256Pattern.test(attestation.stagingConfigSha256 || '')) {
    throw new Error('Attestation is missing source/config SHA-256 evidence');
  }
  if (attestation.workerName !== 'thelingolegacy-staging') throw new Error('Attestation Worker identity mismatch');
  if (!attestation.workerEntrypoint || !/^[\w.-]+\.m?js$/.test(attestation.workerEntrypoint)) throw new Error('Invalid Worker entrypoint');
  if (attestation.probeOutcome !== 'success') throw new Error('Staging probe step did not succeed');
  if (!attestation.cloudflareVersionId || !attestation.cloudflareEtag) throw new Error('Missing Cloudflare version identity or ETag');
  if (versionEvidence.confirmedByCloudflareApi !== true ||
      versionEvidence.workerName !== 'thelingolegacy-staging' ||
      versionEvidence.versionId !== attestation.cloudflareVersionId ||
      versionEvidence.etag !== attestation.cloudflareEtag) {
    throw new Error('Cloudflare version evidence does not correlate to the attestation');
  }
  if (probes.status !== 'PASS' || attestation.probes?.status !== 'PASS') throw new Error('Live probe evidence did not pass');
  if (!Array.isArray(probes.probes) || probes.probes.length === 0 || probes.probes.some((probe) => probe.status !== 'PASS')) {
    throw new Error('One or more live probes failed or are missing');
  }
  if (JSON.stringify(attestation.probes) !== JSON.stringify(probes)) throw new Error('Embedded probes differ from uploaded probe evidence');
  return {
    status: 'PASS_NOT_CERTIFIED',
    sourceCommit: attestation.sourceCommit,
    bundleManifestSha256: attestation.bundleManifestSha256,
    workerName: attestation.workerName,
    cloudflareVersionId: attestation.cloudflareVersionId,
    probeCount: probes.probes.length,
    certificationIssued: false
  };
}

if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) {
  const root = process.env.EVIDENCE_DIR || 'release-deployment-evidence';
  const attestation = JSON.parse(readFileSync(join(root, 'release-attestation.json'), 'utf8'));
  const probes = JSON.parse(readFileSync(join(root, 'live-probes.json'), 'utf8'));
  const versionEvidence = JSON.parse(readFileSync(join(root, 'version-evidence.json'), 'utf8'));
  const result = verifyReleaseAttestation({
    attestation, probes, versionEvidence,
    expectedCommit: process.env.EXPECTED_SOURCE_COMMIT,
    expectedManifestSha256: process.env.EXPECTED_MANIFEST_SHA256
  });
  console.log(JSON.stringify(result));
}
