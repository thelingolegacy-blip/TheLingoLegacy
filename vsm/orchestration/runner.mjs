import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import {
  createRunConfig, preflightSecrets, scopedTrackEnvironment, retryDecision,
  transientRetryDelayMs, createBudgetLedger, chargeBudget, structuredRunEvent,
  RUN_DEFAULTS
} from "./run-contract.mjs";

const EXECUTABLES = new Set(["node", "npm"]);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const iso = () => new Date().toISOString();

function redactText(value, secrets) {
  let output = String(value ?? "");
  for (const secret of secrets) if (typeof secret === "string" && secret.length) output = output.split(secret).join("[REDACTED]");
  return output;
}

async function atomicJson(file, value) {
  const temp = file + "." + process.pid + "." + Math.random().toString(16).slice(2) + ".tmp";
  await fs.writeFile(temp, JSON.stringify(value, null, 2) + "\n", { mode: 0o600 });
  await fs.rename(temp, file);
}

function validateTrack(track) {
  if (!Array.isArray(track.steps)) throw new Error("Every track must declare a steps array.");
  for (const step of track.steps) {
    if (!step || !EXECUTABLES.has(step.command) || !Array.isArray(step.args) || step.args.some(arg => typeof arg !== "string")) {
      throw new Error("Track steps must use node/npm with a string args array and no shell.");
    }
    if (step.timeout_ms !== undefined && (!Number.isInteger(step.timeout_ms) || step.timeout_ms < 1000 || step.timeout_ms > 30 * 60_000)) {
      throw new Error("Step timeout_ms must be between 1 second and 30 minutes.");
    }
    if (step.cost_usd !== undefined && (!Number.isFinite(step.cost_usd) || step.cost_usd < 0)) throw new Error("Step cost_usd must be a non-negative estimate.");
    if (step.id !== undefined && !/^[a-zA-Z0-9._-]{1,60}$/.test(step.id)) throw new Error("Step id is invalid.");
  }
}

async function pruneArtifacts(root, retentionDays = RUN_DEFAULTS.ARTIFACT_RETENTION_DAYS) {
  await fs.mkdir(root, { recursive: true, mode: 0o700 });
  const cutoff = Date.now() - retentionDays * 86_400_000;
  for (const item of await fs.readdir(root, { withFileTypes: true })) {
    if (!item.isDirectory() || !/^[A-Za-z0-9][A-Za-z0-9._-]{2,79}$/.test(item.name)) continue;
    const target = path.join(root, item.name);
    if ((await fs.stat(target)).mtimeMs < cutoff) await fs.rm(target, { recursive: true, force: true });
  }
}

export function createRunController(input, options = {}) {
  const abort = new AbortController();
  let paused = false;
  const control = {
    cancel: reason => abort.abort(reason || "human-cancelled"),
    pause: () => { paused = true; },
    resume: () => { paused = false; },
    get paused() { return paused; },
    get cancelled() { return abort.signal.aborted; }
  };
  control.promise = executeRun(input, { ...options, signal: abort.signal, control });
  return control;
}

export async function executeRun(input, {
  environment = process.env,
  rootDir = process.cwd(),
  artifactsDir = path.join(rootDir, "artifacts"),
  signal: externalSignal,
  control = null,
  notifyOwner = async () => {},
  now = () => Date.now(),
  random = Math.random
} = {}) {
  const config = createRunConfig(input);
  if (config.target === "production") return { run_id: config.run_id, status: "PRODUCTION_TARGET_BLOCKED", tracks: {} };
  for (const track of config.tracks) validateTrack(track);

  const required = [...new Set([...config.SECRETS_REQUIRED, ...config.tracks.flatMap(track => track.required_secrets)])];
  const secretCheck = preflightSecrets(required, environment);
  const runRoot = path.resolve(artifactsDir);
  await pruneArtifacts(runRoot);
  const runDir = path.join(runRoot, config.run_id);
  try { await fs.mkdir(runDir, { recursive: false, mode: 0o700 }); }
  catch (error) { if (error.code === "EEXIST") return { run_id: config.run_id, status: "RUN_ID_CONFLICT", tracks: {} }; throw error; }

  const aliasGroups = [["FIREBASE_SERVICE_ACCOUNT", "FIREBASE_TOKEN"], ["CI_DEPLOY_KEY", "GITHUB_TOKEN"]];
  const secretValues = required.flatMap(name => (aliasGroups.find(group => group.includes(name)) || [name]).map(key => environment[key])).filter(value => typeof value === "string" && value.length > 0);
  const ledger = createBudgetLedger(config, now());
  const controllers = new Map();
  const results = {};
  let cancelled = false;
  let cancelReason = null;
  let pauseRequested = Boolean(control?.paused);
  const eventFile = path.join(runDir, "events.jsonl");
  const statusFile = path.join(runDir, "status.json");

  const updateStatus = async status => atomicJson(statusFile, {
    run_id: config.run_id, status, updated_at: iso(),
    budget: { tool_calls: ledger.tool_calls, cost_usd: ledger.cost_usd, max_tool_calls: ledger.max_tool_calls, max_cost_usd: ledger.max_cost_usd, deadline_ms: ledger.deadline_ms },
    tracks: Object.fromEntries(Object.entries(ledger.tracks).map(([id, item]) => [id, { status: item.status, tool_calls: item.tool_calls, cost_usd: item.cost_usd }]))
  });
  const emit = async event => {
    const safe = structuredRunEvent({ ...event, secretValues });
    await fs.appendFile(eventFile, JSON.stringify(safe) + "\n", { mode: 0o600 });
    await updateStatus(ledger.status);
  };
  const cancelAll = reason => {
    if (cancelled) return;
    cancelled = true;
    cancelReason = reason;
    for (const controller of controllers.values()) controller.abort(reason);
  };
  if (externalSignal) {
    if (externalSignal.aborted) cancelAll("human-cancelled");
    else externalSignal.addEventListener("abort", () => cancelAll("human-cancelled"), { once: true });
  }
  if (control) {
    const originalPause = control.pause;
    const originalResume = control.resume;
    control.pause = () => { pauseRequested = true; originalPause(); };
    control.resume = () => { pauseRequested = false; originalResume(); };
    const originalCancel = control.cancel;
    control.cancel = reason => { originalCancel(reason); cancelAll(reason || "human-cancelled"); };
  }

  if (!secretCheck.ok) {
    const summary = { run_id: config.run_id, status: "PREFLIGHT_FAILED", missing_secrets: secretCheck.missing, invalid_secrets: secretCheck.invalid, secrets_used: [], tracks: {}, finished_at: iso() };
    await atomicJson(path.join(runDir, "summary.json"), summary);
    await updateStatus("PREFLIGHT_FAILED");
    return summary;
  }

  const runProcess = async (step, track, trackDir, trackEnv, signal) => {
    const charge = chargeBudget(ledger, track.id, { toolCalls: 1, costUsd: step.cost_usd || 0, now: now() });
    if (!charge.ok) {
      ledger.status = "BUDGET_EXCEEDED";
      cancelAll("budget-exceeded:" + charge.reason);
      return { ok: false, error: Object.assign(new Error("Budget exceeded: " + charge.reason), { code: "BUDGET_EXCEEDED" }), output_bytes: 0 };
    }
    const child = spawn(step.command, step.args, { cwd: trackDir, env: trackEnv, shell: false, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
    let output = "";
    let outputBytes = 0;
    const append = chunk => {
      outputBytes += chunk.length;
      let value = chunk.toString("utf8");
      for (const secret of secretValues) value = value.split(secret).join("[REDACTED]");
      output = (output + value).slice(-256_000);
    };
    child.stdout.on("data", append);
    child.stderr.on("data", append);
    const terminate = () => { try { child.kill("SIGTERM"); } catch {} };
    let forceTimer;
    const abortHandler = () => {
      terminate();
      forceTimer = setTimeout(() => { try { child.kill("SIGKILL"); } catch {} }, RUN_DEFAULTS.CANCEL_GRACE_MS);
      forceTimer.unref?.();
    };
    signal.addEventListener("abort", abortHandler, { once: true });
    let timedOut = false;
    const timeout = setTimeout(() => { timedOut = true; abortHandler(); }, step.timeout_ms || 5 * 60_000);
    const result = await new Promise(resolve => {
      child.once("error", error => resolve({ code: -1, error }));
      child.once("close", (code, childSignal) => resolve({ code, signal: childSignal }));
    });
    clearTimeout(timeout);
    clearTimeout(forceTimer);
    signal.removeEventListener("abort", abortHandler);
    const safeOutput = output.split(/\r?\n/).map(line => line.slice(0, 4000)).join("\n");
    await fs.writeFile(path.join(trackDir, (step.id || "step") + ".log"), safeOutput, { mode: 0o600 });
    if (timedOut) return { ok: false, error: Object.assign(new Error("Step timeout exceeded."), { name: "TimeoutError" }), output_bytes: outputBytes };
    if (signal.aborted) return { ok: false, error: Object.assign(new Error("Step cancelled."), { name: "AbortError" }), output_bytes: outputBytes };
    if (result.error) return { ok: false, error: result.error, output_bytes: outputBytes };
    return { ok: result.code === 0, error: result.code === 0 ? null : Object.assign(new Error("Step exited with code " + result.code), { code: "EXIT_" + result.code }), output_bytes: outputBytes };
  };

  const runTrack = async track => {
    const trackDir = path.join(runDir, "tracks", track.id);
    await fs.mkdir(trackDir, { recursive: true, mode: 0o700 });
    const abort = new AbortController();
    controllers.set(track.id, abort);
    if (cancelled) abort.abort(cancelReason);
    const ledgerTrack = ledger.tracks[track.id];
    ledgerTrack.status = "RUNNING";
    const trackStarted = now();
    await emit({ runId: config.run_id, trackId: track.id, status: "STARTED", startedAt: trackStarted });
    const trackEnv = scopedTrackEnvironment(track, environment, {
      PATH: environment.PATH || "", HOME: trackDir, TMPDIR: trackDir,
      VSM_RUN_ID: config.run_id, VSM_TRACK_ID: track.id,
      VSM_DRY_RUN: String(config.DRY_RUN), CI: "1"
    });
    let outcome = "SUCCESS";
    try {
      for (let index = 0; index < track.steps.length; index++) {
        const step = track.steps[index];
        const stepName = step.id || String(index + 1);
        const stepStarted = now();
        let attempt = 1;
        let emptyAttempts = 0;
        let transientRetries = 0;
        while (true) {
          if (cancelled || abort.signal.aborted) throw Object.assign(new Error("Run cancelled."), { name: "AbortError" });
          while (pauseRequested && !cancelled) await sleep(100);
          await emit({ runId: config.run_id, trackId: track.id, step: stepName, status: "STARTED", attempt, startedAt: now() });
          const result = await runProcess(step, track, trackDir, trackEnv, abort.signal);
          if (result.ok && step.require_nonempty_log && result.output_bytes === 0) {
            emptyAttempts++;
            const decision = retryDecision({ attempt: emptyAttempts, emptyLog: true, maxAttempts: config.RETRY_MAX_ATTEMPTS });
            if (decision.retry) { attempt++; continue; }
            throw new Error("Empty-log rejection after maximum attempts.");
          }
          if (result.ok) {
            await emit({ runId: config.run_id, trackId: track.id, step: stepName, status: "SUCCESS", attempt, startedAt: stepStarted });
            break;
          }
          const decision = retryDecision({ error: result.error, attempt: transientRetries + 1, startedAt: stepStarted, now: now() });
          if (decision.retry && transientRetries < RUN_DEFAULTS.TRANSIENT_MAX_RETRIES) {
            const delay = transientRetryDelayMs(transientRetries + 1, random);
            if (now() - stepStarted + delay > RUN_DEFAULTS.TRANSIENT_RETRY_WINDOW_MS) throw result.error;
            transientRetries++;
            attempt++;
            await sleep(delay);
            continue;
          }
          throw result.error;
        }
      }
    } catch (error) {
      outcome = abort.signal.aborted ? "CANCELLED" : "FAILED";
      await emit({ runId: config.run_id, trackId: track.id, status: outcome, startedAt: trackStarted, detail: { error: redactText(error.message, secretValues) } });
    } finally {
      for (const name of track.required_secrets) delete trackEnv[name];
      for (const name of Object.keys(trackEnv)) if (/(secret|token|password|credential|authorization|api[_-]?key|private[_-]?key)/i.test(name)) delete trackEnv[name];
      controllers.delete(track.id);
    }
    ledgerTrack.status = outcome;
    results[track.id] = outcome;
    await emit({ runId: config.run_id, trackId: track.id, status: outcome, startedAt: trackStarted });
    if (outcome === "FAILED" && track.criticality === "critical") cancelAll("critical-track-failed");
    return outcome;
  };

  await updateStatus("RUNNING");
  const watchdog = setTimeout(() => cancelAll("run-duration-exceeded"), config.RUN_MAX_DURATION_MINUTES * 60_000);
  watchdog.unref?.();
  try {
    await Promise.all(config.tracks.map(runTrack));
  } finally {
    clearTimeout(watchdog);
  }

  const failedCritical = config.tracks.some(track => track.criticality === "critical" && results[track.id] === "FAILED");
  const anyFailed = Object.values(results).some(value => value === "FAILED");
  const finalStatus = ledger.status === "BUDGET_EXCEEDED" ? "BUDGET_EXCEEDED" :
    cancelReason === "human-cancelled" ? "CANCELLED" :
    cancelReason === "run-duration-exceeded" ? "FAILED" :
    failedCritical ? "FAILED" : anyFailed ? "PARTIAL" :
    cancelled ? "CANCELLED" : "SUCCESS";
  const summary = {
    run_id: config.run_id, status: finalStatus,
    started_at: new Date(ledger.started_at_ms).toISOString(), finished_at: iso(),
    secrets_used: required.sort(),
    budget: { tool_calls: ledger.tool_calls, cost_usd: ledger.cost_usd, duration_ms: now() - ledger.started_at_ms, max_duration_minutes: config.RUN_MAX_DURATION_MINUTES, max_tool_calls: ledger.max_tool_calls, max_cost_usd: ledger.max_cost_usd },
    tracks: Object.fromEntries(config.tracks.map(track => [track.id, { criticality: track.criticality, status: results[track.id] || "CANCELLED" }])),
    cancellation_reason: cancelReason, artifact_directory: runDir,
    artifact_retention_days: RUN_DEFAULTS.ARTIFACT_RETENTION_DAYS,
    artifact_upload: "NOT_CONFIGURED", owner_notification: "NOT_CONFIGURED"
  };
  await atomicJson(path.join(runDir, "summary.json"), summary);
  await updateStatus(finalStatus);
  try { await notifyOwner({ run_id: config.run_id, status: finalStatus, summary_path: path.join(runDir, "summary.json") }); }
  catch (error) {
    summary.owner_notification = "FAILED";
    summary.notification_error = redactText(error.message, secretValues);
    await atomicJson(path.join(runDir, "summary.json"), summary);
  }
  return summary;
}
