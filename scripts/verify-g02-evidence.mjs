#!/usr/bin/env node
/**
 * Fail-closed G02 evidence-bundle verifier.
 *
 * Expected bundle:
 *   run.json       raw GitHub Actions run object
 *   job.json       raw job object from the run's jobs API
 *   steps.json     raw steps array from the job API
 *   logs.txt       retrieved, non-empty raw job log text
 *   artifact.zip   retrieved evidence artifact archive
 *   acceptance.json independent acceptance record, completed after evidence review
 *
 * This verifier never promotes a release. It only validates the bundle's
 * consistency and explicit acceptance record. Missing evidence always fails.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const dir = path.resolve(process.argv[2] || 'evidence/g02');
const failures = [];
const pass = (message) => console.log(`PASS ${message}`);
const fail = (message) => failures.push(message);
const readJson = (name) => {
  const file = path.join(dir, name);
  if (!fs.existsSync(file)) {
    fail(`missing required file: ${name}`);
    return null;
  }
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) { fail(`invalid JSON in ${name}: ${error instanceof Error ? error.message : String(error)}`); return null; }
};
const readBytes = (name) => {
  const file = path.join(dir, name);
  if (!fs.existsSync(file)) { fail(`missing required file: ${name}`); return null; }
  const value = fs.readFileSync(file);
  if (!value.length) { fail(`empty required file: ${name}`); return null; }
  return value;
};
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const positiveId = (value) => Number.isSafeInteger(Number(value)) && Number(value) > 0;
const shaPattern = /^[0-9a-f]{40}$/i;
const run = readJson('run.json');
const job = readJson('job.json');
const steps = readJson('steps.json');
const logs = readBytes('logs.txt');
const artifact = readBytes('artifact.zip');
const acceptance = readJson('acceptance.json');

if (run) {
  if (!positiveId(run.id)) fail('P1: run.json must contain a positive run id');
  else pass('run ID is positive');
  if (run.status !== 'completed' || run.conclusion !== 'success') fail('run must be completed with conclusion=success');
  else pass('workflow run completed successfully');
  if (!shaPattern.test(String(run.head_sha || ''))) fail('run.head_sha must be a 40-character commit SHA');
}
if (job) {
  if (!positiveId(job.id)) fail('P2: job.json must contain a positive job id');
  else pass('job ID is positive');
  if (!positiveId(job.runner_id)) fail('P3: runner_id must be > 0');
  else pass('runner assignment has a real runner ID');
  if (job.runner_name !== 'lingo-legacy-g02') fail('P4: runner_name must equal lingo-legacy-g02');
  else pass('runner name matches lingo-legacy-g02');
  if (job.runner_os !== 'Linux' || job.runner_arch !== 'X64') fail('runner OS/architecture must be Linux/X64');
  if (job.status !== 'completed' || job.conclusion !== 'success') fail('sentinel job must be completed with conclusion=success');
}
if (run && job) {
  if (String(job.run_id) !== String(run.id)) fail('run/job IDs are not correlated');
  if (job.head_sha && run.head_sha && job.head_sha !== run.head_sha) fail('run/job commit SHAs do not match');
  if (positiveId(job.id) && positiveId(run.id)) pass('run and job identity correlated');
}
if (!Array.isArray(steps) || steps.length === 0) fail('P5: steps.json must be a non-empty array');
else {
  const incomplete = steps.filter((step) => step.status !== 'completed' || step.conclusion !== 'success');
  if (incomplete.length) fail(`all job steps must be completed successfully; ${incomplete.length} failed or incomplete`);
  else pass(`all ${steps.length} job steps completed successfully`);
}
if (logs) {
  const text = logs.toString('utf8');
  if (!text.trim()) fail('P6: retrieved job logs are blank');
  else if (!text.includes('RUNNER_EXECUTION_SENTINEL=PASS')) fail('retrieved logs do not contain RUNNER_EXECUTION_SENTINEL=PASS');
  else pass('retrieved logs contain execution sentinel');
  if (text.includes('G02_FORENSIC_EXIT_STATUS=0')) pass('logs contain zero-exit forensic marker');
  else fail('logs must contain G02_FORENSIC_EXIT_STATUS=0');
}
if (artifact) pass(`evidence artifact retrieved (${artifact.length} bytes)`);

if (acceptance) {
  if (acceptance.decision !== 'ACCEPTED') fail('acceptance.json decision must be ACCEPTED');
  if (acceptance.independent_verification !== true) fail('independent_verification must be true');
  if (acceptance.formal_acceptance !== true) fail('formal_acceptance must be true');
  if (!String(acceptance.reviewer || '').trim()) fail('acceptance reviewer identity is required');
  if (!acceptance.reviewed_at || Number.isNaN(Date.parse(acceptance.reviewed_at))) fail('acceptance reviewed_at must be a valid timestamp');
  const predicates = acceptance.predicates || {};
  for (const p of ['P1','P2','P3','P4','P5','P6','P7','P8','P9']) {
    if (predicates[p] !== true) fail(`acceptance predicate ${p} must be explicitly true`);
  }
  if (run && String(acceptance.run_id) !== String(run.id)) fail('acceptance run_id does not match run.json');
  if (job && String(acceptance.job_id) !== String(job.id)) fail('acceptance job_id does not match job.json');
  if (run && acceptance.commit_sha !== run.head_sha) fail('acceptance commit_sha does not match run.json');
  if (job && String(acceptance.runner_id) !== String(job.runner_id)) fail('acceptance runner_id does not match job.json');
  if (job && acceptance.runner_name !== job.runner_name) fail('acceptance runner_name does not match job.json');
  if (logs && acceptance.logs_sha256 !== sha256(logs)) fail('acceptance logs_sha256 does not match retrieved logs');
  if (artifact && acceptance.artifact_sha256 !== sha256(artifact)) fail('acceptance artifact_sha256 does not match retrieved artifact');
  if (run && acceptance.reviewer && run.actor?.login && acceptance.reviewer === run.actor.login) fail('independent reviewer must differ from the workflow actor');
  if (acceptance.evidence_source !== 'independent-github-api-review') fail('acceptance evidence_source must be independent-github-api-review');
}
if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  console.error(`G02_EVIDENCE_ACCEPTANCE=FAIL failures=${failures.length}`);
  process.exitCode = 1;
} else {
  console.log('G02_EVIDENCE_ACCEPTANCE=PASS');
  console.log('This result validates the bundle only; production promotion still requires separate release authorization.');
}
