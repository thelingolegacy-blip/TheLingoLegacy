import { createHash } from 'node:crypto';
import { readFile, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SHA_RE = /^[a-f0-9]{40}$/;
const DIGEST_RE = /^[a-f0-9]{64}$/;
const RUN_ID_RE = /^[1-9][0-9]*$/;
const TIMESTAMP_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

/**
 * Validate the integrity and expected identity fields of an isolated diagnostic bundle.
 *
 * IMPORTANT: this is not an attestation verifier and does not authenticate the workflow,
 * the GitHub runner, or human approval. Its output can never authorize a release.
 * A trusted consumer must separately verify GitHub's signed attestation and fetch approval
 * state from GitHub's control plane before relying on any evidence for a release decision.
 */
export async function verifyDetachedEvidence(bundleDirectory, expected, options = {}) {
  const failures = [];
  const nowMs = options.nowMs ?? Date.now();
  const maxAgeHours = options.maxAgeHours ?? 24;
  const root = path.resolve(bundleDirectory);

  if (!expected || typeof expected !== 'object') {
    return { structurallyValid: false, releaseAuthorized: false, failures: ['Expected identity constraints are required.'] };
  }
  for (const field of ['repository', 'repositoryId', 'candidateSha', 'workflowPath', 'workflowRef', 'workflowRevisionSha', 'runId', 'runAttempt']) {
    if (typeof expected[field] !== 'string' || expected[field].length === 0) {
      failures.push(`Expected identity field ${field} is required.`);
    }
  }
  if (!SHA_RE.test(expected.candidateSha ?? '')) failures.push('Expected candidate SHA must be a lowercase 40-character commit SHA.');
  if (!SHA_RE.test(expected.workflowRevisionSha ?? '')) failures.push('Expected workflow revision must be a lowercase 40-character commit SHA.');
  if (!RUN_ID_RE.test(expected.runId ?? '')) failures.push('Expected run ID must be a positive decimal integer.');
  if (!RUN_ID_RE.test(expected.runAttempt ?? '')) failures.push('Expected run attempt must be a positive decimal integer.');
  if (!Number.isFinite(maxAgeHours) || maxAgeHours <= 0) failures.push('Maximum evidence age must be a positive number of hours.');
  if (failures.length) return { structurallyValid: false, releaseAuthorized: false, failures };

  let summary;
  try {
    summary = JSON.parse(await readFile(path.join(root, 'run-summary.json'), 'utf8'));
  } catch (error) {
    return { structurallyValid: false, releaseAuthorized: false, failures: [`Cannot read run-summary.json: ${error.message}`] };
  }

  if (summary.schemaVersion !== 'ir06-isolated-test-run/0.1') failures.push('Unsupported run summary schema.');
  for (const field of ['repository', 'repositoryId', 'candidateSha', 'workflowPath', 'workflowRef', 'workflowRevisionSha', 'runId', 'runAttempt']) {
    if (String(summary[field] ?? '') !== String(expected[field])) failures.push(`${field} does not match the independently expected value.`);
  }
  if (!Number.isInteger(summary.exitCode) || summary.exitCode !== 0) failures.push('Candidate test exitCode must be integer 0.');
  if (summary.trustStatus !== 'UNTRUSTED_CANDIDATE_JOB_NO_ATTESTATION') failures.push('Unexpected trustStatus; diagnostic evidence must be explicitly marked untrusted.');
  if (typeof summary.testCommand !== 'string' || !summary.testCommand.startsWith('node --test ')) failures.push('testCommand is missing or unexpected.');
  if (typeof summary.nodeVersion !== 'string' || !/^v\d+\.\d+\.\d+/.test(summary.nodeVersion)) failures.push('nodeVersion is missing or malformed.');

  let capturedAtMs;
  if (typeof summary.capturedAt !== 'string' || !TIMESTAMP_RE.test(summary.capturedAt)) {
    failures.push('capturedAt must be a strict UTC timestamp (YYYY-MM-DDTHH:mm:ssZ).');
  } else {
    capturedAtMs = Date.parse(summary.capturedAt);
    if (!Number.isFinite(capturedAtMs) || new Date(capturedAtMs).toISOString().replace('.000Z', 'Z') !== summary.capturedAt) {
      failures.push('capturedAt is not a valid calendar timestamp.');
    } else {
      if (capturedAtMs > nowMs + 5 * 60 * 1000) failures.push('capturedAt is beyond allowed future clock skew.');
      if (nowMs - capturedAtMs > maxAgeHours * 60 * 60 * 1000) failures.push('Diagnostic evidence is stale.');
    }
  }

  let sums;
  try {
    sums = await readFile(path.join(root, 'SHA256SUMS'), 'utf8');
  } catch (error) {
    failures.push(`Cannot read SHA256SUMS: ${error.message}`);
  }
  if (sums !== undefined) {
    const listed = new Map();
    for (const line of sums.split(/\r?\n/).filter(Boolean)) {
      const match = /^([a-f0-9]{64})  ([A-Za-z0-9._-]+)$/.exec(line);
      if (!match) {
        failures.push('SHA256SUMS contains a malformed entry or unsafe path.');
        continue;
      }
      if (listed.has(match[2])) failures.push(`SHA256SUMS contains duplicate path ${match[2]}.`);
      listed.set(match[2], match[1]);
    }
    const allowed = (await readdir(root)).filter((name) => name !== 'SHA256SUMS').sort();
    const listedNames = [...listed.keys()].sort();
    if (JSON.stringify(allowed) !== JSON.stringify(listedNames)) failures.push('SHA256SUMS file set does not exactly match bundle contents.');
    const realRoot = await realpath(root);
    for (const [name, expectedDigest] of listed) {
      try {
        const filePath = path.join(root, name);
        const realFile = await realpath(filePath);
        const relative = path.relative(realRoot, realFile);
        if (relative.startsWith('..') || path.isAbsolute(relative)) {
          failures.push(`Bundle path escapes its root: ${name}.`);
          continue;
        }
        const bytes = await readFile(realFile);
        const actual = createHash('sha256').update(bytes).digest('hex');
        if (!DIGEST_RE.test(expectedDigest) || actual !== expectedDigest) failures.push(`SHA-256 mismatch for ${name}.`);
      } catch (error) {
        failures.push(`Cannot verify bundle file ${name}: ${error.message}`);
      }
    }
  }

  return {
    structurallyValid: failures.length === 0,
    releaseAuthorized: false,
    failures,
    trustBoundary: 'STRUCTURAL_ONLY_REQUIRES_INDEPENDENT_SIGNATURE_AND_APPROVAL_VERIFICATION'
  };
}

async function main() {
  const [, , bundleDirectory, expectedJsonPath] = process.argv;
  if (!bundleDirectory || !expectedJsonPath) {
    console.error('Usage: node scripts/verify-detached-evidence.mjs <bundle-directory> <expected-identity.json>');
    process.exitCode = 2;
    return;
  }
  let expected;
  try {
    expected = JSON.parse(await readFile(path.resolve(expectedJsonPath), 'utf8'));
  } catch (error) {
    console.error('DETACHED_EVIDENCE=BLOCKED');
    console.error(`Cannot read expected identity: ${error.message}`);
    process.exitCode = 1;
    return;
  }
  const result = await verifyDetachedEvidence(bundleDirectory, expected);
  if (!result.structurallyValid) {
    console.error('DETACHED_EVIDENCE=BLOCKED');
    for (const failure of result.failures) console.error(`- ${failure}`);
    process.exitCode = 1;
    return;
  }
  console.log('DETACHED_EVIDENCE=STRUCTURALLY_VALID_ONLY');
  console.log('RELEASE_AUTHORIZED=false');
  console.log(result.trustBoundary);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await main();
