import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
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
      { id: "alpha", criticality: "critical", required_secrets: [], steps: [{ id: "alpha-check", command: "node", args: ["-e", "process.stdout.write(process.env.TRACK_MARK || 'missing-value')"], require_nonempty_log: true }] },
      { id: "beta", criticality: "important", required_secrets: ["CLOUDFLARE_API_TOKEN"], steps: [{ id: "beta-check", command: "node", args: ["-e", "process.stdout.write(process.env.CLOUDFLARE_API_TOKEN || 'missing')"], require_nonempty_log: true }] }
    ]), { rootDir, environment: { PATH: process.env.PATH, CLOUDFLARE_API_TOKEN: "cloudflare-test-token-12345", TRACK_MARK: "must-not-leak" } });
    assert.equal(summary.status, "SUCCESS");
    assert.equal(summary.tracks.alpha.status, "SUCCESS");
    assert.equal(summary.tracks.beta.status, "SUCCESS");
    assert.deepEqual(summary.secrets_used, ["CLOUDFLARE_API_TOKEN"]);
    const alphaLog = await fs.readFile(path.join(summary.artifact_directory, "tracks", "alpha", "alpha-check.log"), "utf8");
    const betaLog = await fs.readFile(path.join(summary.artifact_directory, "tracks", "beta", "beta-check.log"), "utf8");
    assert.equal(alphaLog, "missing-value");
    assert.equal(betaLog, "[REDACTED]");
    assert.equal((await fs.stat(path.join(summary.artifact_directory, "status.json"))).isFile(), true);
  } finally { await fs.rm(rootDir, { recursive: true, force: true }); }
});

test("Firebase service-account private-key material is redacted from child logs", async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "lingo-vsm-firebase-secret-"));
  const privateKey = "-----BEGIN PRIVATE KEY-----\nprivate-key-material-should-never-appear\n-----END PRIVATE KEY-----";
  const startedAt = Date.now();
  const serviceAccount = JSON.stringify({ type: "service_account", project_id: "lingo-stage", client_email: "runner@lingo-stage.iam.gserviceaccount.com", private_key: privateKey });
  try {
    const notifications = [];
    const summary = await executeRun(base([
      { id: "firebase-check", criticality: "critical", required_secrets: ["FIREBASE_SERVICE_ACCOUNT"], steps: [{ id: "print-key", command: "node", args: ["-e", "process.stdout.write(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT).private_key); setInterval(()=>{},1000)"], require_nonempty_log: true }] }
    ]), { rootDir, environment: { PATH: process.env.PATH, FIREBASE_SERVICE_ACCOUNT: serviceAccount }, notifyOwner: async event => notifications.push(event) });
    assert.equal(summary.status, "SECURITY_ABORT");
    assert.ok(Date.now() - startedAt < 5000, "credential exposure should terminate the child promptly");
    assert.equal(summary.owner_notification, "SENT");
    assert.equal(notifications.length, 1);
    assert.equal(notifications[0].status, "SECURITY_ABORT");
    const log = await fs.readFile(path.join(summary.artifact_directory, "tracks", "firebase-check", "print-key.log"), "utf8");
    assert.equal(log, "[REDACTED]");
    assert.equal(log.includes("private-key-material"), false);
  } finally { await fs.rm(rootDir, { recursive: true, force: true }); }
});

test("rejects credentials embedded in run configuration arguments before any track starts", async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "lingo-vsm-args-secret-"));
  try {
    const token = "ghp_test_token_must_not_be_embedded";
    const summary = await executeRun(base([
      { id: "bad-args", criticality: "critical", required_secrets: [], steps: [{ command: "node", args: ["-e", "process.stdout.write('never')", token] }] }
    ]), { rootDir, environment: { PATH: process.env.PATH, GITHUB_TOKEN: token } });
    assert.equal(summary.status, "SECURITY_ABORT");
    assert.deepEqual(summary.exposed_secret_names, ["GITHUB_TOKEN"]);
    assert.equal(summary.tracks && Object.keys(summary.tracks).length, 0);
  } finally { await fs.rm(rootDir, { recursive: true, force: true }); }
});

test("missing required secrets abort before tracks and notify the owner outbox", async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "lingo-vsm-missing-secret-"));
  const notifications = [];
  try {
    const summary = await executeRun(base([
      { id: "needs-cloudflare", criticality: "critical", required_secrets: ["CLOUDFLARE_API_TOKEN"], steps: [{ command: "node", args: ["-e", "process.exit(0)"] }] }
    ]), { rootDir, environment: { PATH: process.env.PATH }, notifyOwner: async event => notifications.push(event) });
    assert.equal(summary.status, "PREFLIGHT_FAILED");
    assert.deepEqual(summary.missing_secrets, ["CLOUDFLARE_API_TOKEN"]);
    assert.equal(summary.owner_notification, "SENT");
    assert.equal(notifications.length, 1);
    assert.equal(notifications[0].missing_secrets[0], "CLOUDFLARE_API_TOKEN");
  } finally { await fs.rm(rootDir, { recursive: true, force: true }); }
});

test("watchdog records crashes but ignores a clean orchestrator exit", async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "lingo-vsm-watchdog-"));
  const watchdogPath = path.resolve("orchestration/watchdog.mjs");
  const runWatchdog = (pid, pidFile, crashFile) => spawn(process.execPath, [watchdogPath, String(pid), pidFile, crashFile], { stdio: "ignore" });
  const waitForExit = child => new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (code, signal) => resolve({ code, signal }));
  });
  try {
    const crashDir = path.join(rootDir, "crashed-run");
    await fs.mkdir(crashDir);
    const crashPidFile = path.join(crashDir, "child-processes.json");
    const crashReport = path.join(crashDir, "crash-report.json");
    await fs.writeFile(crashPidFile, "[]");
    const crashedParent = spawn(process.execPath, ["-e", "setTimeout(()=>process.exit(0),100)"], { stdio: "ignore" });
    const crashWatchdog = runWatchdog(crashedParent.pid, crashPidFile, crashReport);
    await Promise.all([waitForExit(crashedParent), waitForExit(crashWatchdog)]);
    const report = JSON.parse(await fs.readFile(crashReport, "utf8"));
    assert.equal(report.status, "ORCHESTRATOR_CRASH");
    assert.equal(JSON.parse(await fs.readFile(path.join(crashDir, "status.json"), "utf8")).status, "ORCHESTRATOR_CRASH");
    assert.equal(JSON.parse(await fs.readFile(path.join(crashDir, "owner-notification.json"), "utf8")).delivery, "LOCAL_OWNER_OUTBOX");

    const cleanDir = path.join(rootDir, "clean-run");
    await fs.mkdir(cleanDir);
    const cleanPidFile = path.join(cleanDir, "child-processes.json");
    const cleanCrashReport = path.join(cleanDir, "crash-report.json");
    const completedFile = path.join(cleanDir, "completed.json");
    await fs.writeFile(cleanPidFile, "[]");
    const cleanParent = spawn(process.execPath, ["-e", "const fs=require('fs');setTimeout(()=>{fs.writeFileSync(process.argv[1],'{}');process.exit(0)},100)", completedFile], { stdio: "ignore" });
    const cleanWatchdog = runWatchdog(cleanParent.pid, cleanPidFile, cleanCrashReport);
    await Promise.all([waitForExit(cleanParent), waitForExit(cleanWatchdog)]);
    await assert.rejects(fs.access(cleanCrashReport));
    await assert.rejects(fs.access(path.join(cleanDir, "owner-notification.json")));
  } finally { await fs.rm(rootDir, { recursive: true, force: true }); }
});

test("runner executes steps from the configured execution root", async () => {
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

test("staging network preflight retries transient 5xx responses within its bounded window", async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "lingo-vsm-network-retry-"));
  let calls = 0;
  try {
    const summary = await executeRun({
      run_id: "runner-stage-retry-01", run_type: "staging-validation", target: "staging",
      PREFLIGHT_NETWORK: true, RUN_MAX_DURATION_MINUTES: 1, RUN_MAX_TOOL_CALLS: 10, RUN_MAX_COST_USD: 1,
      tracks: [{ id: "cloudflare-probe", criticality: "critical", required_secrets: ["CLOUDFLARE_API_TOKEN"], steps: [] }]
    }, {
      rootDir,
      environment: { PATH: process.env.PATH, CLOUDFLARE_API_TOKEN: "cloudflare-valid-token-123456" },
      random: () => 0,
      fetchImpl: async () => {
        calls++;
        return calls === 1
          ? { ok: false, status: 503, json: async () => ({ success: false }) }
          : { ok: true, status: 200, json: async () => ({ success: true }) };
      }
    });
    assert.equal(summary.status, "SUCCESS");
    assert.equal(calls, 2);
    assert.equal(summary.budget.tool_calls, 2);
    assert.equal(summary.network_check.results[0].attempts, 2);
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

test("cancelling one non-critical track yields a partial run while other tracks finish", async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "lingo-vsm-track-cancel-"));
  try {
    const controller = createRunController(base([
      { id: "optional", criticality: "best-effort", required_secrets: [], steps: [{ command: "node", args: ["-e", "setTimeout(()=>process.exit(0), 1000)"] }] },
      { id: "required", criticality: "important", required_secrets: [], steps: [{ command: "node", args: ["-e", "process.stdout.write('done-complete')"], require_nonempty_log: true }] }
    ]), { rootDir, environment: { PATH: process.env.PATH } });
    assert.equal(controller.cancelTrack("optional"), true);
    const summary = await controller.promise;
    assert.equal(summary.status, "PARTIAL");
    assert.equal(summary.tracks.optional.status, "CANCELLED");
    assert.equal(summary.tracks.required.status, "SUCCESS");
  } finally { await fs.rm(rootDir, { recursive: true, force: true }); }
});

test("credential exposure in child output aborts all tracks, redacts evidence and notifies owner", async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "lingo-vsm-secret-leak-"));
  const token = "cloudflare-secret-material-123456";
  const notifications = [];
  try {
    const summary = await executeRun(base([
      { id: "leaker", criticality: "critical", required_secrets: ["CLOUDFLARE_API_TOKEN"], steps: [{ id: "leak-attempt", command: "node", args: ["-e", "setTimeout(()=>process.stdout.write(process.env.CLOUDFLARE_API_TOKEN),100)"] }] },
      { id: "parallel", criticality: "important", required_secrets: [], steps: [{ id: "wait", command: "node", args: ["-e", "setTimeout(()=>process.exit(0),5000)"] }] }
    ]), {
      rootDir, environment: { PATH: process.env.PATH, CLOUDFLARE_API_TOKEN: token },
      notifyOwner: async event => notifications.push(event)
    });
    assert.equal(summary.status, "SECURITY_ABORT");
    assert.equal(summary.tracks.leaker.status, "FAILED");
    assert.equal(summary.owner_notification, "SENT");
    assert.equal(notifications.length, 1);
    const log = await fs.readFile(path.join(summary.artifact_directory, "tracks", "leaker", "leak-attempt.log"), "utf8");
    assert.equal(log, "[REDACTED]");
    assert.equal(log.includes(token), false);
  } finally { await fs.rm(rootDir, { recursive: true, force: true }); }
});

test("credential values embedded in run configuration abort before any track starts", async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "lingo-vsm-secret-config-"));
  const token = "github-secret-material-123456";
  const notifications = [];
  try {
    const summary = await executeRun(base([
      { id: "unsafe-config", criticality: "critical", required_secrets: ["GITHUB_TOKEN"], steps: [{ command: "node", args: ["-e", token] }] }
    ]), {
      rootDir, environment: { PATH: process.env.PATH, GITHUB_TOKEN: token },
      notifyOwner: async event => notifications.push(event)
    });
    assert.equal(summary.status, "SECURITY_ABORT");
    assert.deepEqual(summary.exposed_secret_names, ["GITHUB_TOKEN"]);
    assert.equal(Object.keys(summary.tracks).length, 0);
    assert.equal(summary.owner_notification, "SENT");
    assert.equal(notifications.length, 1);
  } finally { await fs.rm(rootDir, { recursive: true, force: true }); }
});

test("step emits a soft-timeout warning before its hard timeout", async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "lingo-vsm-soft-timeout-"));
  try {
    const summary = await executeRun(base([
      { id: "slow-check", criticality: "critical", required_secrets: [], steps: [{ id: "slow", command: "node", args: ["-e", "setTimeout(()=>process.stdout.write('finished-ok'),1200)"], soft_timeout_ms: 1000, timeout_ms: 2500 }] }
    ]), { rootDir, environment: { PATH: process.env.PATH } });
    assert.equal(summary.status, "SUCCESS");
    const events = await fs.readFile(path.join(summary.artifact_directory, "events.jsonl"), "utf8");
    assert.match(events, /"status":"STEP_TIMEOUT_WARNING"/);
  } finally { await fs.rm(rootDir, { recursive: true, force: true }); }
});

test("near-empty successful logs are rejected and retried within the attempt limit", async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "lingo-vsm-near-empty-"));
  try {
    const summary = await executeRun(base([
      { id: "evidence", criticality: "critical", required_secrets: [], steps: [{ id: "short-output", command: "node", args: ["-e", "process.stdout.write('tiny')"], require_nonempty_log: true, min_log_bytes: 8 }] }
    ]), { rootDir, environment: { PATH: process.env.PATH } });
    assert.equal(summary.status, "FAILED");
    const events = await fs.readFile(path.join(summary.artifact_directory, "events.jsonl"), "utf8");
    assert.equal((events.match(/"status":"STARTED"/g) || []).length >= 3, true);
    assert.match(events, /"reason":"empty-log"/);
    assert.match(events, /"status":"RETRYING"/);
  } finally { await fs.rm(rootDir, { recursive: true, force: true }); }
});

test("cancelling a critical track cancels the whole run without mislabeling it as a failure", async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "lingo-vsm-critical-cancel-"));
  try {
    const controller = createRunController(base([
      { id: "critical", criticality: "critical", required_secrets: [], steps: [{ command: "node", args: ["-e", "setTimeout(()=>process.exit(0),1000)"] }] },
      { id: "support", criticality: "important", required_secrets: [], steps: [{ command: "node", args: ["-e", "setTimeout(()=>process.exit(0),5000)"] }] }
    ]), { rootDir, environment: { PATH: process.env.PATH } });
    assert.equal(controller.cancelTrack("critical"), true);
    const summary = await controller.promise;
    assert.equal(summary.status, "CANCELLED");
    assert.equal(summary.tracks.critical.status, "CANCELLED");
    assert.equal(summary.tracks.support.status, "CANCELLED");
  } finally { await fs.rm(rootDir, { recursive: true, force: true }); }
});

test("permanent step failures emit a terminal FAILED event", async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "lingo-vsm-step-fail-"));
  try {
    const summary = await executeRun(base([
      { id: "compile", criticality: "critical", required_secrets: [], steps: [{ id: "bad-build", command: "node", args: ["-e", "process.exit(7)"] }] }
    ]), { rootDir, environment: { PATH: process.env.PATH } });
    assert.equal(summary.status, "FAILED");
    const events = await fs.readFile(path.join(summary.artifact_directory, "events.jsonl"), "utf8");
    assert.match(events, /"step":"bad-build","status":"FAILED"/);
  } finally { await fs.rm(rootDir, { recursive: true, force: true }); }
});

test("runner supports per-track cancellation without aborting non-critical siblings", async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "lingo-vsm-track-cancel-"));
  try {
    const controller = createRunController(base([
      { id: "primary", criticality: "critical", required_secrets: [], steps: [{ command: "node", args: ["-e", "setTimeout(()=>process.exit(0), 500)"], timeout_ms: 5000 }] },
      { id: "optional", criticality: "best-effort", required_secrets: [], steps: [{ command: "node", args: ["-e", "setTimeout(()=>process.exit(0), 5000)"], timeout_ms: 7000 }] }
    ]), { rootDir, environment: { PATH: process.env.PATH } });
    let optionalActive = false;
    for (let attempt = 0; attempt < 50; attempt++) {
      try {
        const state = JSON.parse(await fs.readFile(path.join(rootDir, "artifacts", "runner-test-001", "status.json"), "utf8"));
        if (state.tracks.optional?.status === "RUNNING") { optionalActive = true; break; }
      } catch {}
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    assert.equal(optionalActive, true);
    assert.equal(controller.cancelTrack("optional"), true);
    const summary = await controller.promise;
    assert.equal(summary.tracks.primary.status, "SUCCESS");
    assert.equal(summary.tracks.optional.status, "CANCELLED");
    assert.equal(summary.status, "PARTIAL");
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
