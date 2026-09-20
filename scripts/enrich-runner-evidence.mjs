import fs from 'node:fs';
import crypto from 'node:crypto';

function sha256(value) {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
}

function enrich(runtimeBundle, authoritativeRun) {
  const merged = {
    ...runtimeBundle,
    run: {
      ...runtimeBundle.run,
      id: authoritativeRun.run?.id ?? runtimeBundle.run?.id,
      headSha: authoritativeRun.run?.headSha ?? runtimeBundle.run?.headSha
    },
    job: {
      ...runtimeBundle.job,
      runId: authoritativeRun.job?.runId ?? runtimeBundle.job?.runId,
      jobName: authoritativeRun.job?.jobName ?? runtimeBundle.job?.jobName,
      workspace: authoritativeRun.job?.workspace ?? runtimeBundle.job?.workspace
    },
    workflow: {
      ...runtimeBundle.workflow,
      runId: authoritativeRun.workflow?.runId ?? runtimeBundle.workflow?.runId,
      jobName: authoritativeRun.workflow?.jobName ?? runtimeBundle.workflow?.jobName,
      headSha: authoritativeRun.workflow?.headSha ?? runtimeBundle.workflow?.headSha,
      status: authoritativeRun.workflow?.status ?? runtimeBundle.workflow?.status,
      conclusion: authoritativeRun.workflow?.conclusion ?? runtimeBundle.workflow?.conclusion,
      startedAt: authoritativeRun.workflow?.startedAt ?? runtimeBundle.workflow?.startedAt,
      completedAt: authoritativeRun.workflow?.completedAt ?? runtimeBundle.workflow?.completedAt,
      durationMs: authoritativeRun.workflow?.durationMs ?? runtimeBundle.workflow?.durationMs
    },
    logs: {
      ...runtimeBundle.logs,
      available: authoritativeRun.logs?.available ?? runtimeBundle.logs?.available,
      source: authoritativeRun.logs?.source ?? runtimeBundle.logs?.source
    },
    authoritativeEvidence: true
  };

  const canonical = JSON.stringify(merged);
  return {
    ...merged,
    evidenceDigest: sha256(canonical)
  };
}

const [runtimePath, authoritativePath, outputPath = 'constellation-evidence-enriched.json'] = process.argv.slice(2);
if (!runtimePath || !authoritativePath) {
  console.error('usage: node scripts/enrich-runner-evidence.mjs <runtime-bundle.json> <authoritative-run.json> [output.json]');
  process.exit(2);
}

const runtimeBundle = JSON.parse(fs.readFileSync(runtimePath, 'utf8'));
const authoritativeRun = JSON.parse(fs.readFileSync(authoritativePath, 'utf8'));
const enriched = enrich(runtimeBundle, authoritativeRun);
fs.writeFileSync(outputPath, JSON.stringify(enriched, null, 2) + '\n');
console.log(JSON.stringify({
  status: 'ENRICHED',
  outputPath,
  evidenceDigest: enriched.evidenceDigest,
  authoritativeEvidence: enriched.authoritativeEvidence
}, null, 2));

export { enrich };
