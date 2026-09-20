import fs from 'node:fs';
import crypto from 'node:crypto';

function sha256(value) {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
}

function enrich(runtimeBundle, authoritativeRun) {
  const authoritative = authoritativeRun || {};
  const merged = {
    ...runtimeBundle,
    run: {
      ...runtimeBundle.run,
      id: authoritative.run?.id ?? runtimeBundle.run?.id,
      headSha: authoritative.run?.headSha ?? runtimeBundle.run?.headSha
    },
    job: {
      ...runtimeBundle.job,
      id: authoritative.job?.id ?? runtimeBundle.job?.id,
      runId: authoritative.job?.runId ?? runtimeBundle.job?.runId,
      jobName: authoritative.job?.jobName ?? runtimeBundle.job?.jobName,
      workspace: authoritative.job?.workspace ?? runtimeBundle.job?.workspace
    },
    runner: {
      ...runtimeBundle.runner,
      id: authoritative.runner?.id ?? runtimeBundle.runner?.id,
      name: authoritative.runner?.name ?? runtimeBundle.runner?.name,
      os: authoritative.runner?.os ?? runtimeBundle.runner?.os,
      arch: authoritative.runner?.arch ?? runtimeBundle.runner?.arch,
      temp: authoritative.runner?.temp ?? runtimeBundle.runner?.temp,
      workspace: authoritative.runner?.workspace ?? runtimeBundle.runner?.workspace,
      toolCache: authoritative.runner?.toolCache ?? runtimeBundle.runner?.toolCache,
      allocatedAt: authoritative.runner?.allocatedAt ?? runtimeBundle.runner?.allocatedAt,
      releasedAt: authoritative.runner?.releasedAt ?? runtimeBundle.runner?.releasedAt
    },
    steps: Array.isArray(authoritative.steps) ? authoritative.steps : runtimeBundle.steps,
    verifier: {
      ...runtimeBundle.verifier,
      ...authoritative.verifier
    },
    commit: {
      ...runtimeBundle.commit,
      sha: authoritative.commit?.sha ?? authoritative.run?.headSha ?? runtimeBundle.commit?.sha ?? runtimeBundle.run?.headSha
    },
    workflow: {
      ...runtimeBundle.workflow,
      runId: authoritative.workflow?.runId ?? runtimeBundle.workflow?.runId,
      jobName: authoritative.workflow?.jobName ?? runtimeBundle.workflow?.jobName,
      headSha: authoritative.workflow?.headSha ?? runtimeBundle.workflow?.headSha,
      status: authoritative.workflow?.status ?? runtimeBundle.workflow?.status,
      conclusion: authoritative.workflow?.conclusion ?? runtimeBundle.workflow?.conclusion,
      startedAt: authoritative.workflow?.startedAt ?? runtimeBundle.workflow?.startedAt,
      completedAt: authoritative.workflow?.completedAt ?? runtimeBundle.workflow?.completedAt,
      durationMs: authoritative.workflow?.durationMs ?? runtimeBundle.workflow?.durationMs
    },
    logs: {
      ...runtimeBundle.logs,
      ...authoritative.logs
    },
    authoritativeEvidence: authoritative.authoritativeEvidence === true,
    authoritativeSource: authoritative.authoritativeSource || 'github-post-run-metadata'
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
