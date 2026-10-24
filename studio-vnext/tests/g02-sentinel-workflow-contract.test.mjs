import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const workflow = readFileSync(new URL("../../.github/workflows/g02-self-hosted-sentinel.yml", import.meta.url), "utf8");

test("G02 self-hosted sentinel is manual-only and targets dedicated labels", () => {
  assert.match(workflow, /workflow_dispatch:/);
  assert.doesNotMatch(workflow, /^\s*pull_request:/m);
  assert.match(workflow, /runs-on: \[self-hosted, linux, x64, lingo-g02\]/);
  assert.match(workflow, /required: true/);
});

test("G02 sentinel records runtime evidence and checksum without checkout or secrets", () => {
  for (const field of ["RUN_ID", "RUNNER_NAME", "RUNNER_OS", "RUNNER_ARCH", "COMMIT_SHA"]) {
    assert.ok(workflow.includes(field), "missing runtime evidence field: " + field);
  }
  assert.match(workflow, /G02_SENTINEL_EXECUTED/);
  assert.match(workflow, /sha256sum/);
  assert.match(workflow, /actions\/upload-artifact@v4/);
  assert.doesNotMatch(workflow, /actions\/checkout|secrets\./);
});
