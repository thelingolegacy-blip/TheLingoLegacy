import fs from 'node:fs';

export function validateEvidence(evidence) {
  const errors = [];
  const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
  const nonEmpty = (value) => typeof value === 'string' && value.trim().length > 0;
  const positiveInteger = (value) => Number.isInteger(value) && value > 0;

  if (!isRecord(evidence)) return ['manifest must be a JSON object'];
  if (evidence.schemaVersion !== 1) errors.push('schemaVersion must equal 1');
  if (!nonEmpty(evidence.repository)) errors.push('repository is required');
  if (typeof evidence.commitSha !== 'string' || !/^[a-f0-9]{40}$/i.test(evidence.commitSha)) errors.push('commitSha must be a full 40-character Git SHA');
  if (typeof evidence.capturedAtUtc !== 'string' || !/^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?Z$/.test(evidence.capturedAtUtc) || Number.isNaN(Date.parse(evidence.capturedAtUtc))) errors.push('capturedAtUtc must be a valid UTC ISO-8601 timestamp');

  if (!isRecord(evidence.pullRequest)) {
    errors.push('pullRequest is required');
  } else {
    if (!positiveInteger(evidence.pullRequest.number)) errors.push('pullRequest.number must be a positive integer');
    if (evidence.pullRequest.approved !== true) errors.push('pullRequest.approved must be true');
  }

  if (!isRecord(evidence.workflow)) {
    errors.push('workflow is required');
  } else {
    if (!(positiveInteger(evidence.workflow.runId) || (typeof evidence.workflow.runId === 'string' && /^[1-9]\\d*$/.test(evidence.workflow.runId)))) errors.push('workflow.runId must be a positive integer');
    if (!positiveInteger(evidence.workflow.attempt)) errors.push('workflow.attempt must be a positive integer');
    if (!nonEmpty(evidence.workflow.jobId)) errors.push('workflow.jobId is required');
    if (!positiveInteger(evidence.workflow.runnerId)) errors.push('workflow.runnerId must be a positive integer');
    if (!nonEmpty(evidence.workflow.runnerName)) errors.push('workflow.runnerName is required');
  }

  if (!Array.isArray(evidence.checks) || evidence.checks.length === 0) {
    errors.push('checks must be a non-empty array');
  } else {
    evidence.checks.forEach((check, index) => {
      if (!isRecord(check) || !nonEmpty(check.name)) errors.push(`checks[${index}].name is required`);
      if (!isRecord(check) || check.status !== 'PASS') errors.push(`checks[${index}].status must equal PASS`);
    });
  }

  if (!Array.isArray(evidence.artifacts) || evidence.artifacts.length === 0) {
    errors.push('artifacts must be a non-empty array');
  } else {
    evidence.artifacts.forEach((artifact, index) => {
      if (!isRecord(artifact) || !nonEmpty(artifact.name)) errors.push(`artifacts[${index}].name is required`);
      if (!isRecord(artifact) || typeof artifact.sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(artifact.sha256)) errors.push(`artifacts[${index}].sha256 must be a 64-character SHA-256 checksum`);
    });
  }

  return errors;
}

function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node scripts/verify-release-evidence.mjs <evidence-manifest.json>');
    process.exitCode = 2;
    return;
  }
  let evidence;
  try {
    evidence = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    console.error(`FAIL release-evidence: unable to read valid JSON (${error instanceof Error ? error.message : 'unknown error'})`);
    process.exitCode = 1;
    return;
  }
  const errors = validateEvidence(evidence);
  if (errors.length) {
    for (const error of errors) console.error(`FAIL release-evidence: ${error}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS release-evidence: schema v1; ${evidence.checks.length} checks; ${evidence.artifacts.length} artifacts; commit ${evidence.commitSha}`);
  console.log('NOTE: schema completeness is not deployment authorization or independent evidence verification.');
}

if (process.argv[1] && new URL(import.meta.url).pathname === new URL(`file://${process.argv[1]}`).pathname) main();
