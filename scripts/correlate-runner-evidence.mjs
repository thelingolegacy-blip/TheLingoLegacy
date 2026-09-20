function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function correlationResult(run, job, steps, runner, logs, workflow, expectedSha) {
  const runJob = Number(job?.runId) > 0 && Number(job?.runId) === Number(run?.id);
  const jobSteps = Array.isArray(steps) && steps.length > 0 &&
    steps.every(step => Number(step?.jobId) === Number(job?.id));
  const runnerJob = isNonEmptyString(runner?.name) &&
    isNonEmptyString(runner?.workspace) &&
    isNonEmptyString(job?.workspace) &&
    runner.workspace === job.workspace;
  const stepsLogs = Array.isArray(steps) && steps.length > 0 &&
    steps.every(step => isNonEmptyString(step?.logs?.stdout) || isNonEmptyString(step?.logs?.stderr)) &&
    logs?.available === true;
  const workflowJob = Number(workflow?.runId) > 0 &&
    Number(workflow?.runId) === Number(job?.runId);
  const commitMatch = run?.headSha === expectedSha &&
    job?.headSha === expectedSha &&
    workflow?.headSha === expectedSha;

  return {
    runJob,
    jobSteps,
    runnerJob,
    stepsLogs,
    workflowJob,
    commitMatch,
    all: runJob && jobSteps && runnerJob && stepsLogs && workflowJob && commitMatch
  };
}

export { correlationResult };
