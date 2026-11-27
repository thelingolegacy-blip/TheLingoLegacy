import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { executeRun, createRunController } from "../orchestration/runner.mjs";

const base = (tracks, extra = {}) => ({
  run_id: "runner-test-001", run_type: "local-validation", target: "local",
  RUN_MAX_DURATION_MINUTES: 1, RUN_MAX_TOOL_CALLS: 20, RUN_MAX_COST_USD: 2,
  tracks, ...extra
});

test("runner executes tracks in parallel with isolated environments and run-scoped artifacts", async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "lingo-vsm-run-"));
  try {
    const summary = await executeRun(base([
      { id: "alpha", criticality: "critical", required_secrets: [], steps: [{ id: "alpha-check", command: "node", args: ["-e", "process.stdout.write(process.env.TRACK_MARK || 'missing')"], require_nonempty_log: true }] },
      { id: "beta", criticality: "important", required_secrets: ["CLOUDFLARE_API_TOKEN"], steps: [{ id: "beta-check", command: "node", args: ["-e", "process.stdout.write(process.env.CLOUDFLARE_API_TOKEN || 'missing')"], require_nonempty_log: true }] }
    ]), { rootDir, environment: { PATH: process.env.PATH, CLOUDFLARE_API_TOKEN: "cloudflare-test-token-12345", TRACK_MARK: "must-not-leak" } });
    assert.equal(summary.status, "SUCCESS");
    assert.equal(summary.tracks.alpha.status, "SUCCESS");
    assert.equal(summary.tracks.beta.status, "SUCCESS");
    assert.deepEqual(summary.secrets_used, ["CLOUDFLARE_API_TOKEN"]);
    const alphaLog = await fs.readFile(path.join(summary.artifact_directory, "tracks", "alpha", "alpha-check.log"), "utf8");
    const betaLog = await fs.readFile(path.join(summary.artifact_directory, "tracks", "beta", "beta-check.log"), "utf8");
    assert.equal(alphaLog, "missing");
    assert.equal(betaLog, "[REDACTED]");
    assert.equal((await fs.stat(path.join(summary.artifact_directory, "status.json"))).isFile(), true);
  } finally { await fs.rm(rootDir, { recursive: true, force: true }); }
});

test("runner aborts before tracks when a required credential is missing", async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "lingo-vsm-preflight-"));
  try {
    const summary = await executeRun(base([
      { id: "deploy", criticality: "critical", required_secrets: ["CLOUDFLARE_API_TOKEN"], steps: [{ command: "node", args: ["-e", "process.exit(0)"] }] }
    ]), { rootDir, environment: { PATH: process.env.PATH } });
    assert.equal(summary.status, "PREFLIGHT_FAILED");
    assert.deepEqual(summary.missing_secrets, ["CLOUDFLARE_API_TOKEN"]);
    assert.equal(summary.tracks.deploy, undefined);
  } finally { await fs.rm(rootDir, { recursive: true, force: true }); }
});

test("runner enforces projected cost ceiling before invoking a step", async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "lingo-vsm-budget-"));
  try {
    const summary = await executeRun(base([
      { id: "expensive", criticality: "critical", required_secrets: [], cost_budget_usd: 1, tool_call_budget: 5, steps: [{ command: "node", args: ["-e", "process.exit(0)"], cost_usd: 1.01 }] }
    ]), { rootDir, environment: { PATH: process.env.PATH } });
    assert.equal(summary.status, "BUDGET_EXCEEDED");
    assert.equal(summary.budget.tool_calls, 0);
  } finally { await fs.rm(rootDir, { recursive: true, force: true }); }
});

test("runner controller supports human pause, resume and cancellation", async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "lingo-vsm-control-"));
  try {
    const controller = createRunController(base([
      { id: "slow", criticality: "best-effort", required_secrets: [], steps: [{ command: "node", args: ["-e", "setTimeout(()=>process.exit(0), 2000)"], timeout_ms: 5000 }] }
    ]), { rootDir, environment: { PATH: process.env.PATH } });
    controller.pause();
    controller.resume();
    controller.cancel("human-cancelled");
    const summary = await controller.promise;
    assert.equal(summary.status, "CANCELLED");
  } finally { await fs.rm(rootDir, { recursive: true, force: true }); }
});
