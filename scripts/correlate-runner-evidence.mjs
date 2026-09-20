function nonEmpty(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function correlationResult(run, job, steps, runner, logs, workflow, expectedSha) {
  const runJob = Number(job?.runId) > 0 && Number(job?.runId) === Number(run?.id);
  const jobSteps = nonEmpty(job?.jobName) &&
    Array.isArray(steps) &&
    steps.length > 0 &&
    steps.every(step => step?.jobName === job.jobName);
  const runnerJob = nonEmpty(runner?.workspace) &&
    nonEmpty(job?.workspace) &&
    runner.workspace === job.workspace;
  const stepsLogs = Array.isArray(steps) &&
    steps.length > 0 &&
    steps.every(step => nonEmpty(step?.logs?.stdout) || nonEmpty(step?.logs?.stderr)) &&
    logs?.available === true;
  const workflowJob = Number(workflow?.runId) > 0 &&
    Number(workflow?.runId) === Number(job?.runId) &&
    workflow?.jobName === job?.jobName;
  const commitMatch =
    run?.headSha === expectedSha &&
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
