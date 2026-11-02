import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const workflow = readFileSync(new URL("../../.github/workflows/studio-vnext-runner-signal.yml", import.meta.url), "utf8");

test("runner signal workflow requests read-only Actions API access", () => {
  assert.match(workflow, /permissions:\s*\n\s*contents: read\s*\n\s*actions: read/);
  assert.doesNotMatch(workflow, /actions: write|contents: write|id-token: write/);
});

test("runner signal resolves numeric job and runner IDs from GitHub's run-jobs API", () => {
  assert.match(workflow, /actions\/runs\/\$RUN_ID\/jobs\?per_page=100/);
  assert.match(workflow, /Number\.isSafeInteger\(job\.id\) && job\.id > 0/);
  assert.match(workflow, /Number\.isSafeInteger\(job\.runner_id\) && job\.runner_id > 0/);
  assert.match(workflow, /matches\.length !== 1/);
  assert.match(workflow, /runner_id: assignment\.runner_id/);
  assert.doesNotMatch(workflow, /runner_id:\s*null|job_id:\s*null/);
});

test("runner signal artifact is checksummed and uploaded with assignment evidence", () => {
  assert.match(workflow, /sha256sum evidence\/runner-assignment\.json evidence\/runner-signal\.json/);
  assert.match(workflow, /evidence\/runner-assignment\.json/);
  assert.match(workflow, /evidence\/runner-signal\.json/);
  assert.match(workflow, /evidence\/SHA256SUMS\.txt/);
  assert.match(workflow, /actions\/upload-artifact@v4/);
});

test("workflow fails closed when actual job or runner identity cannot be verified", () => {
  assert.match(workflow, /Could not uniquely verify this job and its numeric runner ID/);
  assert.match(workflow, /process\.exit\(2\)/);
});
