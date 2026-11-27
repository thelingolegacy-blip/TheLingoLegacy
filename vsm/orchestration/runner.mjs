import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";
import {
  createRunConfig, preflightSecrets, scopedTrackEnvironment, classifyFailure,
  retryDecision, transientRetryDelayMs, createBudgetLedger, chargeBudget,
  structuredRunEvent, RUN_DEFAULTS
} from "./run-contract.mjs";

const EXECUTABLES = new Set(["node", "npm"]);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const nowIso = () => new Date().toISOString();

function safeError(error, secretValues) {
  let message = String(error?.message || error || "Unknown error");
  for (const secret of secretValues) if (secret && message.includes(secret)) message = message.split(secret).join("[REDACTED]");
  return message.slice(0, 1000);
}

async function writeJsonAtomic(file, value) {
  const temp = file + ".tmp";
  await fs.writeFile(temp, JSON.stringify(value, null, 2) + "
", { mode: 0o600 });
  await fs.rename(temp, file);
}

function validateStep(step) {
  if (!step || typeof step.command !== "string" || !EXECUTABLES.has(step.command)) throw new Error("Track steps may invoke only node or npm without a shell.");
  if (!Array.isArray(step.args) || step.args.some(arg => typeof arg !== "string")) throw new Error("Step args must be a string array.");
  if (step.timeout_ms !== undefined && (!Number.isInteger(step.timeout_ms) || step.timeout_ms < 1000 || step.timeout_ms > 30 * 60_000)) throw new Error("Step timeout_ms must be between 1 second and 30 minutes.");
}

export function createRunController(input, options = {}) {
  const control = { cancelled: false, paused: false, cancel: null, pause: () => { control.paused = true; }, resume: () => { control.paused = false; } };
  const abort = new AbortController();
  control.cancel = reason => { control.cancelled = true; abort.abort(reason || "human-cancelled"); };
  control.promise = executeRun(input, { ...options, signal: abort.signal, control });
  return control;
}

export async function executeRun(input, {
  environment = process.env,
  rootDir = process.cwd(),
  artifactsDir = path.join(rootDir, "artifacts"),
  signal: externalSignal,
  notifyOwner = async () => {},
  now = () => Date.now(),
  random = Math.random
} = {}) {
  const config = createRunConfig(input);
  const required = [...new Set([...config.SECRETS_REQUIRED, ...config.tracks.flatMap(track => track.required_secrets)])];
  const secretCheck = preflightSecrets(required, environment);
  if (!secretCheck.ok) {
    return { run_id: config.run_id, status: "PREFLIGHT_FAILED", missing_secrets: secretCheck.missing, invalid_secrets: secretCheck.invalid, tracks: {} };
  }
  for (const track of config.tracks) for (const step of track.steps || []) validateStep(step);

  const runDir = path.join(artifactsDir, config.run_id);
  await fs.mkdir(runDir, { recursive: true, mode: 0o700 });
  const ledger = createBudgetLedger(config, now());
  const events = [];
  const controllers = new Map();
  let cancelled = false;
  let cancelReason = null;
  let pauseRequested = false;
  if (control) { const pauseOriginal = control.pause; const resumeOriginal = control.resume; control.pause = () => { pauseRequested = true; pauseOriginal(); }; control.resume = () => { pauseRequested = false; resumeOriginal(); }; }
  const secretValues = required.flatMap(name => [environment[name]]).filter(value => typeof value === "string" && value.length > 0);

  const emit = async event => {
    const safe = structuredRunEvent({ ...event, secretValues });
    events.push(safe);
    await fs.appendFile(path.join(runDir, "events.jsonl"), JSON.stringify(safe) + "
", { mode: 0o600 });
    await writeJsonAtomic(path.join(runDir, "status.json"), {
      run_id: config.run_id, status: ledger.status, updated_at: nowIso(),
      budget: { tool_calls: ledger.tool_calls, cost_usd: ledger.cost_usd, max_tool_calls: ledger.max_tool_calls, max_cost_usd: ledger.max_cost_usd },
      tracks: Object.fromEntries(Object.entries(ledger.tracks).map(([id, item]) => [id, { status: item.status, tool_calls: item.tool_calls, cost_usd: item.cost_usd }]))
    });
  };

  const cancel = reason => {
    if (cancelled) return;
    cancelled = true; cancelReason = reason;
    for (const controller of controllers.values()) controller.abort(reason);
  };
  if (externalSignal) {
    if (externalSignal.aborted) cancel("human-cancelled");
    else externalSignal.addEventListener("abort", () => cancel("human-cancelled"), { once: true });
  }

  const runTrack = async track => {
    const trackLedger = ledger.tracks[track.id];
    const trackDir = path.join(runDir, "tracks", track.id);
    await fs.mkdir(trackDir, { recursive: true, mode: 0o700 });
    const controller = new AbortController();
    controllers.set(track.id, controller);
    if (cancelled) controller.abort(cancelReason);
    const trackEnv = scopedTrackEnvironment(track, environment, {
      PATH: environment.PATH || "",
      HOME: trackDir,
      TMPDIR: trackDir,
      VSM_RUN_ID: config.run_id,
      VSM_TRACK_ID: track.id,
      VSM_DRY_RUN: String(config.DRY_RUN),
      CI: "1"
    });
    const trackSecrets = (track.required_secrets || []).flatMap(name => {
      const val = trackEnv[name]; return val ? [val] : [];
    });
    const startedTrack = now();
    trackLedger.status = "RUNNING";
    await emit({ runId: config.run_id, trackId: track.id, status: "STARTED", startedAt: startedTrack });
    let trackStatus = "SUCCESS";
    try {
      const steps = track.steps || [];
      for (let index = 0; index < steps.length; index++) {
        const step = steps[index];
        let attempt = 1;
        let stepDone = false;
        const started = now();
        while (!stepDone) {
          if (cancelled || controller.signal.aborted) throw new Error("Run cancelled.");
          while (pauseRequested && !cancelled) await sleep(200);
          await emit({ runId: config.run_id, trackId: track.id, step: step.id || String(index + 1), status: "STARTED", attempt, startedAt: now() });
          const result = await runProcess(step, trackDir, trackEnv, controller.signal, config, ledger, track.id, now, emit, secretValues, trackSecrets, reason => cancel(reason));
          if (result.ok) {
            if (step.require_nonempty_log && result.output_bytes === 0) {
              const decision = retryDecision({ attempt, emptyLog: true, maxAttempts: config.RETRY_MAX_ATTEMPTS });
              if (decision.retry) { attempt++; continue; }
              throw new Error("Empty-log rejection after maximum attempts.");
            }
            stepDone = true;
            await emit({ runId: config.run_id, trackId: track.id, step: step.id || String(index + 1), status: "SUCCESS", attempt, startedAt: started });
          } else {
            const decision = retryDecision({ error: result.error, attempt, startedAt: started, now: now(), maxAttempts: config.RETRY_MAX_ATTEMPTS });
            if (decision.retry) {
              const delay = transientRetryDelayMs(attempt, random);
              if (now() - started + delay > RUN_DEFAULTS.TRANSIENT_RETRY_WINDOW_MS) throw result.error;
              attempt++;
              await sleep(delay);
              continue;
            }
            throw result.error;
          }
        }
      }
    } catch (error) {
      trackStatus = controller.signal.aborted && track.criticality !== "critical" ? "CANCELLED" : "FAILED";
      await emit({ runId: config.run_id, trackId: track.id, status: trackStatus, startedAt: startedTrack, detail: { error: safeError(error, [...secretValues, ...trackSecrets]) } });
    } finally {
      for (const name of track.required_secrets || []) delete trackEnv[name];
      controllers.delete(track.id);
    }
    trackLedger.status = trackStatus;
    if (trackStatus === "FAILED" && track.criticality === "critical") cancel("critical-track-failed");
    await emit({ runId: config.run_id, trackId: track.id, status: trackStatus, startedAt: startedTrack });
    return trackStatus;
  };

  const watchdog = setTimeout(() => cancel("run-duration-exceeded"), config.RUN_MAX_DURATION_MINUTES * 60_000);
  watchdog.unref?.();
  let results;
  try {
    results = await Promise.all(config.tracks.map(runTrack));
  } finally {
    clearTimeout(watchdog);
    if (cancelled) {
      await Promise.race([Promise.allSettled([...controllers.keys()].map(id => controllers.get(id)?.abort(cancelReason))), sleep(RUN_DEFAULTS.CANCEL_GRACE_MS)]);
    }
  }
  const failedCritical = config.tracks.some((track, index) => track.criticality === "critical" && results[index] !== "SUCCESS");
  const anyFailed = results.some(status => status !== "SUCCESS");
  const status = ledger.status === "BUDGET_EXCEEDED" ? "BUDGET_EXCEEDED" : failedCritical ? "FAILED" : anyFailed ? "PARTIAL" : "SUCCESS";
  const summary = {
    run_id: config.run_id, status, started_at: new Date(ledger.started_at_ms).toISOString(), finished_at: nowIso(),
    secrets_used: required.sort(), budget: { tool_calls: ledger.tool_calls, cost_usd: ledger.cost_usd, duration_ms: now() - ledger.started_at_ms, max_duration_minutes: config.RUN_MAX_DURATION_MINUTES, max_tool_calls: ledger.max_tool_calls, max_cost_usd: ledger.max_cost_usd },
    tracks: Object.fromEntries(config.tracks.map((track, index) => [track.id, { criticality: track.criticality, status: results[index] }])),
    cancellation_reason: cancelReason, artifact_directory: runDir
  };
  await writeJsonAtomic(path.join(runDir, "summary.json"), summary);
  await emit({ runId: config.run_id, status, detail: { summary: { ...summary, artifact_directory: "[LOCAL_RUN_ARTIFACTS]" } } });
  await notifyOwner({ run_id: config.run_id, status, summary_path: path.join(runDir, "summary.json") });
  return summary;
}

async function runProcess(step, cwd, env, signal, config, ledger, trackId, now, emit, secretValues, trackSecrets, onBudgetExceeded) {
  const started = now();
  const timeout = step.timeout_ms || 5 * 60_000;
  const child = spawn(step.command, step.args, { cwd, env, shell: false, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
  const outputFile = path.join(cwd, (step.id || "step") + ".log");
  let output = "";
  let outputBytes = 0;
  const append = chunk => {
    outputBytes += chunk.length;
    const text = chunk.toString("utf8");
    for (const secret of secretValues) if (secret) output = (output + text).split(secret).join("[REDACTED]");
    if (output.length > 256_000) output = output.slice(-256_000);
  };
  child.stdout.on("data", append); child.stderr.on("data", append);
  const kill = () => { try { child.kill("SIGTERM"); } catch {} };
  let forceTimer;
  const forceKill = () => { forceTimer = setTimeout(() => { try { child.kill("SIGKILL"); } catch {} }, RUN_DEFAULTS.CANCEL_GRACE_MS); forceTimer.unref?.(); };
  signal.addEventListener("abort", () => { kill(); forceKill(); }, { once: true });
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; kill(); }, timeout);
  const result = await new Promise(resolve => {
    child.once("error", error => resolve({ code: -1, error }));
    child.once("close", (code, sig) => resolve({ code, signal: sig }));
  });
  clearTimeout(timer); clearTimeout(forceTimer); signal.removeEventListener("abort", kill);
  const safeOutput = output.split(/\r?
/).map(line => line.slice(0, 4000)).join("
");
  await fs.writeFile(outputFile, safeOutput, { mode: 0o600 });
  const charge = chargeBudget(ledger, trackId, { toolCalls: 1, now: now() });
  if (!charge.ok) {
    signal.throwIfAborted?.();
    throw Object.assign(new Error("Run budget exceeded: " + charge.reason), { budgetExceeded: true });
  }
  if (timedOut) return { ok: false, error: Object.assign(new Error("Step timeout exceeded."), { name: "TimeoutError" }), output_bytes: outputBytes };
  if (signal.aborted) return { ok: false, error: Object.assign(new Error("Step cancelled."), { name: "AbortError" }), output_bytes: outputBytes };
  if (result.error) return { ok: false, error: result.error, output_bytes: outputBytes };
  return { ok: result.code === 0, error: result.code === 0 ? null : Object.assign(new Error("Step exited with code " + result.code), { code: "EXIT_" + result.code }), output_bytes: outputBytes };
}
