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

test("runner executes steps from the configured workspace, not the artifact directory", async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "lingo-vsm-workspace-"));
  try {
    const summary = await executeRun(base([
      { id: "workspace", criticality: "critical", required_secrets: [], steps: [{ id: "cwd", command: "node", args: ["-e", "process.stdout.write(process.cwd())"], require_nonempty_log: true }] }
    ]), { rootDir, environment: { PATH: process.env.PATH } });
    assert.equal(summary.status, "SUCCESS");
    const log = await fs.readFile(path.join(summary.artifact_directory, "tracks", "workspace", "cwd.log"), "utf8");
    assert.equal(log, rootDir);
  } finally { await fs.rm(rootDir, { recursive: true, force: true }); }
});

test("runner records a soft timeout without terminating a step", async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "lingo-vsm-soft-timeout-"));
  try {
    const summary = await executeRun(base([
      { id: "soft-timeout", criticality: "critical", required_secrets: [], steps: [{ id: "wait", command: "node", args: ["-e", "setTimeout(()=>process.exit(0), 1200)"], soft_timeout_ms: 1000, timeout_ms: 5000 }] }
    ]), { rootDir, environment: { PATH: process.env.PATH } });
    assert.equal(summary.status, "SUCCESS");
    const events = await fs.readFile(path.join(summary.artifact_directory, "events.jsonl"), "utf8");
    assert.ok(events.includes("STEP_SOFT_TIMEOUT"));
  } finally { await fs.rm(rootDir, { recursive: true, force: true }); }
});

test("runner clears a soft timeout when a step finishes early", async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "lingo-vsm-soft-timeout-clear-"));
  try {
    const summary = await executeRun(base([
      { id: "quick", criticality: "critical", required_secrets: [], steps: [{ id: "done", command: "node", args: ["-e", "process.exit(0)"], soft_timeout_ms: 2000, timeout_ms: 5000 }] }
    ]), { rootDir, environment: { PATH: process.env.PATH } });
    assert.equal(summary.status, "SUCCESS");
    const events = await fs.readFile(path.join(summary.artifact_directory, "events.jsonl"), "utf8");
    assert.equal(events.includes("STEP_SOFT_TIMEOUT"), false);
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

test("staging run validates required service reachability and credentials before tracks", async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "lingo-vsm-network-"));
  const requests = [];
  try {
    const summary = await executeRun({
      run_id: "runner-stage-check-01", run_type: "staging-validation", target: "staging",
      PREFLIGHT_NETWORK: true, RUN_MAX_DURATION_MINUTES: 1, RUN_MAX_TOOL_CALLS: 10, RUN_MAX_COST_USD: 1,
      tracks: [{ id: "cloudflare-probe", criticality: "critical", required_secrets: ["CLOUDFLARE_API_TOKEN"], steps: [] }]
    }, {
      rootDir,
      environment: { PATH: process.env.PATH, CLOUDFLARE_API_TOKEN: "cloudflare-valid-token-123456" },
      fetchImpl: async (url, options) => {
        requests.push({ url, authorization: options.headers.Authorization });
        return { ok: true, status: 200, json: async () => ({ success: true }) };
      }
    });
    assert.equal(requests.length, 1);
    assert.equal(requests[0].url, "https://api.cloudflare.com/client/v4/user/tokens/verify");
    assert.equal(requests[0].authorization, "Bearer cloudflare-valid-token-123456");
    assert.equal(summary.status, "SUCCESS");
    assert.equal(summary.budget.tool_calls, 1);
    assert.equal(summary.secrets_used.includes("CLOUDFLARE_API_TOKEN"), true);
  } finally { await fs.rm(rootDir, { recursive: true, force: true }); }
});

test("runner persists a fail-closed status when staging network preflight is rejected", async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "lingo-vsm-network-fail-"));
  try {
    const summary = await executeRun({
      run_id: "runner-stage-rejected-01", run_type: "staging-validation", target: "staging",
      PREFLIGHT_NETWORK: true, RUN_MAX_DURATION_MINUTES: 1, RUN_MAX_TOOL_CALLS: 10, RUN_MAX_COST_USD: 1,
      tracks: [{ id: "cloudflare-probe", criticality: "critical", required_secrets: ["CLOUDFLARE_API_TOKEN"], steps: [] }]
    }, {
      rootDir,
      environment: { PATH: process.env.PATH, CLOUDFLARE_API_TOKEN: "cloudflare-valid-token-123456" },
      fetchImpl: async () => ({ ok: false, status: 401, json: async () => ({ success: false }) })
    });
    assert.equal(summary.status, "PREFLIGHT_FAILED");
    assert.equal(summary.network_check.ok, false);
    const status = JSON.parse(await fs.readFile(path.join(summary.artifact_directory, "status.json"), "utf8"));
    assert.equal(status.status, "PREFLIGHT_FAILED");
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

test("runner rejects destructive steps unless explicitly authorized and idempotent", async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "lingo-vsm-destructive-"));
  try {
    await assert.rejects(executeRun(base([
      { id: "unsafe", criticality: "critical", required_secrets: [], steps: [{ command: "node", args: ["-e", "process.exit(0)"], mutating: true }] }
    ]), { rootDir, environment: { PATH: process.env.PATH } }), /ALLOW_DESTRUCTIVE/);
    const summary = await executeRun(base([
      { id: "safe-mutation", criticality: "critical", required_secrets: [], steps: [{ command: "node", args: ["-e", "process.exit(0)"], mutating: true, idempotent: true }] }
    ], { ALLOW_DESTRUCTIVE: true }), { rootDir, environment: { PATH: process.env.PATH } });
    assert.equal(summary.status, "SUCCESS");
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
