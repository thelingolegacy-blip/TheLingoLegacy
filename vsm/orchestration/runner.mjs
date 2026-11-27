import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";
import {
  createRunConfig, preflightSecrets, scopedTrackEnvironment, retryDecision,
  transientRetryDelayMs, createBudgetLedger, chargeBudget, structuredRunEvent,
  RUN_DEFAULTS, SECRET_NAMES
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

function validateTrack(track, config) {
  if (!Array.isArray(track.steps)) throw new Error("Every track must declare a steps array.");
  for (const step of track.steps) {
    if (!step || !EXECUTABLES.has(step.command) || !Array.isArray(step.args) || step.args.some(arg => typeof arg !== "string")) {
      throw new Error("Track steps must use node/npm with a string args array and no shell.");
    }
    if (step.require_nonempty_log !== undefined && typeof step.require_nonempty_log !== "boolean") throw new Error("Step require_nonempty_log must be boolean.");
    if (step.mutating !== undefined && typeof step.mutating !== "boolean") throw new Error("Step mutating must be boolean.");
    if (step.idempotent !== undefined && typeof step.idempotent !== "boolean") throw new Error("Step idempotent must be boolean.");
    if (step.idempotency_key !== undefined && (typeof step.idempotency_key !== "string" || step.idempotency_key.length < 8 || step.idempotency_key.length > 128)) throw new Error("Step idempotency_key must be 8–128 characters.");
    if (step.min_log_bytes !== undefined && (!Number.isInteger(step.min_log_bytes) || step.min_log_bytes < 1 || step.min_log_bytes > 65_536)) throw new Error("Step min_log_bytes must be between 1 and 65536.");
    if (step.timeout_ms !== undefined && (!Number.isInteger(step.timeout_ms) || step.timeout_ms < 1000 || step.timeout_ms > 30 * 60_000)) {
      throw new Error("Step timeout_ms must be between 1 second and 30 minutes.");
    }
    if (step.soft_timeout_ms !== undefined && (!Number.isInteger(step.soft_timeout_ms) || step.soft_timeout_ms < 1000 || step.soft_timeout_ms >= (step.timeout_ms || 5 * 60_000))) throw new Error("Step soft_timeout_ms must be less than the hard timeout.");
    if (step.cost_usd !== undefined && (!Number.isFinite(step.cost_usd) || step.cost_usd < 0)) throw new Error("Step cost_usd must be a non-negative estimate.");
    if (step.mutating === true && !config.ALLOW_DESTRUCTIVE) throw new Error("Mutating steps require ALLOW_DESTRUCTIVE=true.");
    if (step.mutating === true && step.idempotent !== true && (typeof step.idempotency_key !== "string" || step.idempotency_key.length < 8 || step.idempotency_key.length > 128)) throw new Error("Mutating steps require idempotent=true or an 8–128 character idempotency_key.");
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


async function preflightResources(rootDir, config) {
  let cpuCount = os.availableParallelism?.() || os.cpus()?.length || 0;
  for (const cpuLimitPath of ["/sys/fs/cgroup/cpu.max"]) {
    try {
      const [quotaRaw, periodRaw] = (await fs.readFile(cpuLimitPath, "utf8")).trim().split(/\s+/);
      const quota = Number(quotaRaw);
      const period = Number(periodRaw);
      if (quotaRaw !== "max" && Number.isFinite(quota) && quota > 0 && Number.isFinite(period) && period > 0) cpuCount = Math.min(cpuCount, Math.floor(quota / period));
    } catch {}
  }
  try {
    const [quotaRaw, periodRaw] = await Promise.all([fs.readFile("/sys/fs/cgroup/cpu/cpu.cfs_quota_us", "utf8"), fs.readFile("/sys/fs/cgroup/cpu/cpu.cfs_period_us", "utf8")]);
    const quota = Number(quotaRaw.trim());
    const period = Number(periodRaw.trim());
    if (quota > 0 && period > 0) cpuCount = Math.min(cpuCount, Math.floor(quota / period));
  } catch {}
  let freeMemoryBytes = os.freemem();
  for (const [limitPath, currentPath] of [["/sys/fs/cgroup/memory.max", "/sys/fs/cgroup/memory.current"], ["/sys/fs/cgroup/memory/memory.limit_in_bytes", "/sys/fs/cgroup/memory/memory.usage_in_bytes"]]) {
    try {
      const [limitRaw, currentRaw] = await Promise.all([fs.readFile(limitPath, "utf8"), fs.readFile(currentPath, "utf8")]);
      const limit = Number(limitRaw.trim());
      const current = Number(currentRaw.trim());
      if (Number.isFinite(limit) && limit > 0 && Number.isFinite(current) && current >= 0 && limit < Number.MAX_SAFE_INTEGER) {
        freeMemoryBytes = Math.min(freeMemoryBytes, Math.max(0, limit - current));
        break;
      }
    } catch {}
  }
  const freeMemoryMb = Math.floor(freeMemoryBytes / 1_048_576);
  const disk = await fs.statfs(rootDir);
  const freeDiskMb = Math.floor((disk.bavail * disk.bsize) / 1_048_576);
  const failures = [];
  if (cpuCount < config.PREFLIGHT_MIN_CPUS) failures.push("cpu");
  if (freeMemoryMb < config.PREFLIGHT_MIN_FREE_MEMORY_MB) failures.push("memory");
  if (freeDiskMb < config.PREFLIGHT_MIN_FREE_DISK_MB) failures.push("disk");
  return { ok: failures.length === 0, failures, cpu_count: cpuCount, free_memory_mb: freeMemoryMb, free_disk_mb: freeDiskMb };
}

async function preflightNetwork(required, environment, fetchImpl, { now = () => Date.now(), random = Math.random, budgetLedger = null, budgetTrackId = null, signal = null } = {}) {
  const services = [];
  if (required.some(name => ["FIREBASE_SERVICE_ACCOUNT", "FIREBASE_TOKEN"].includes(name))) services.push({ name: "firebase", url: "https://firebase.googleapis.com/" });
  if (required.includes("CLOUDFLARE_API_TOKEN")) services.push({ name: "cloudflare", url: "https://api.cloudflare.com/client/v4/user/tokens/verify", token: environment.CLOUDFLARE_API_TOKEN });
  if (required.some(name => ["CI_DEPLOY_KEY", "GITHUB_TOKEN"].includes(name))) services.push({ name: "github", url: "https://api.github.com/rate_limit", token: environment.GITHUB_TOKEN });
  const results = [];
  let calls = 0;
  let warning = false;
  for (const service of services) {
    const startedAt = now();
    let attempt = 0;
    let lastStatus = null;
    let ok = false;
    let failureClass = null;
    while (true) {
      if (signal?.aborted) return { ok: false, results, calls, warning, budget_exceeded: false, cancelled: true };
      attempt++;
      if (budgetLedger && budgetTrackId) {
        const charge = chargeBudget(budgetLedger, budgetTrackId, { toolCalls: 1, now: now() });
        if (!charge.ok) return { ok: false, results, calls, warning, budget_exceeded: true, budget_reason: charge.reason };
        warning = warning || charge.warning;
      }
      calls++;
      try {
        const response = await fetchImpl(service.url, {
          method: "GET",
          redirect: "error",
          signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(8000)]) : AbortSignal.timeout(8000),
          headers: { "User-Agent": "LINGO-VSM-Preflight/1.0", ...(service.token ? { Authorization: "Bearer " + service.token } : {}) }
        });
        lastStatus = response.status;
        const transient = [408, 425, 429].includes(response.status) || response.status >= 500;
        if (transient) failureClass = "transient";
        else if (service.name === "cloudflare") {
          const body = await response.json().catch(() => ({}));
          ok = response.ok && body.success === true;
          failureClass = ok ? null : "permanent";
        } else if (service.name === "github" && service.token) {
          ok = response.ok;
          failureClass = ok ? null : "permanent";
        } else {
          // Firebase probe checks service reachability only; OAuth exchange is a separate integration.
          ok = response.status < 500;
          failureClass = ok ? null : "transient";
        }
        if (ok || failureClass !== "transient") break;
      } catch {
        if (signal?.aborted) return { ok: false, results, calls, warning, budget_exceeded: false, cancelled: true };
        failureClass = "transient";
        lastStatus = null;
      }
      const retriesUsed = attempt - 1;
      const delay = transientRetryDelayMs(retriesUsed + 1, random);
      if (retriesUsed >= RUN_DEFAULTS.TRANSIENT_MAX_RETRIES || now() - startedAt + delay > RUN_DEFAULTS.TRANSIENT_RETRY_WINDOW_MS) break;
      await sleep(delay);
    }
    results.push({ service: service.name, ok, status: lastStatus, attempts: attempt, failure_class: failureClass });
  }
  return { ok: results.every(item => item.ok), results, calls, warning, budget_exceeded: false, cancelled: false };
}

export function createRunController(input, options = {}) {
  const abort = new AbortController();
  let paused = false;
  const validTrackIds = new Set(Array.isArray(input?.tracks) ? input.tracks.map(track => track?.id).filter(id => typeof id === "string") : []);
  const pendingPausedTracks = new Set();
  const pendingCancelledTracks = new Set();
  const control = {
    cancel: reason => abort.abort(reason || "human-cancelled"),
    pause: () => { paused = true; },
    resume: () => { paused = false; },
    pauseTrack: trackId => { if (!validTrackIds.has(trackId)) return false; pendingPausedTracks.add(trackId); return true; },
    resumeTrack: trackId => { if (!validTrackIds.has(trackId)) return false; pendingPausedTracks.delete(trackId); return true; },
    cancelTrack: trackId => { if (!validTrackIds.has(trackId)) return false; pendingCancelledTracks.add(trackId); return true; },
    pendingPausedTracks,
    pendingCancelledTracks,
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
  notifyOwner = null,
  now = () => Date.now(),
  random = Math.random,
  fetchImpl = globalThis.fetch
} = {}) {
  const config = createRunConfig(input);
  if (config.target === "production") return { run_id: config.run_id, status: "PRODUCTION_TARGET_BLOCKED", tracks: {} };
  for (const track of config.tracks) validateTrack(track, config);

  const required = [...new Set([...config.SECRETS_REQUIRED, ...config.tracks.flatMap(track => track.required_secrets)])];
  const secretCheck = preflightSecrets(required, environment);
  const runRoot = path.resolve(artifactsDir);
  await pruneArtifacts(runRoot);
  const runDir = path.join(runRoot, config.run_id);
  try { await fs.mkdir(runDir, { recursive: false, mode: 0o700 }); }
  catch (error) { if (error.code === "EEXIST") return { run_id: config.run_id, status: "RUN_ID_CONFLICT", tracks: {} }; throw error; }

  const aliasGroups = [["FIREBASE_SERVICE_ACCOUNT", "FIREBASE_TOKEN"], ["CI_DEPLOY_KEY", "GITHUB_TOKEN"]];
  const secretKeys = [...new Set(SECRET_NAMES.flatMap(name => aliasGroups.find(group => group.includes(name)) || [name]))];
  const secretEntries = secretKeys.flatMap(name => {
    const value = environment[name];
    if (typeof value !== "string" || value.length === 0) return [];
    const fragments = [value, ...value.split(/\r?\n/).filter(Boolean)];
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed.private_key === "string") fragments.push(parsed.private_key, ...parsed.private_key.split(/\r?\n/).filter(Boolean));
    } catch {}
    return [...new Set(fragments)].map(fragment => ({ name, value: fragment }));
  });
  const secretValues = [...new Set(secretEntries.map(entry => entry.value))];
  const serializedConfig = JSON.stringify(config);
  const exposedSecretNames = [...new Set(secretEntries.filter(entry => serializedConfig.includes(entry.value)).map(entry => entry.name))];
  if (exposedSecretNames.length) {
    const securityFailure = { run_id: config.run_id, status: "SECURITY_ABORT", exposed_secret_names: exposedSecretNames, secrets_used: [], tracks: {}, owner_notification: "NOT_CONFIGURED", finished_at: iso() };
    if (typeof notifyOwner === "function") { try { await notifyOwner({ run_id: config.run_id, status: "SECURITY_ABORT", exposed_secret_names: exposedSecretNames }); securityFailure.owner_notification = "SENT"; } catch { securityFailure.owner_notification = "FAILED"; } }
    await atomicJson(path.join(runDir, "summary.json"), securityFailure);
    await atomicJson(path.join(runDir, "status.json"), { run_id: config.run_id, status: "SECURITY_ABORT", updated_at: iso() });
    return securityFailure;
  }
  if (!secretCheck.ok) {
    const summary = { run_id: config.run_id, status: "PREFLIGHT_FAILED", missing_secrets: secretCheck.missing, invalid_secrets: secretCheck.invalid, secrets_used: [], tracks: {}, artifact_directory: runDir, owner_notification: "NOT_CONFIGURED", finished_at: iso() };
    if (typeof notifyOwner === "function") { try { await notifyOwner({ run_id: config.run_id, status: summary.status, missing_secrets: summary.missing_secrets, invalid_secrets: summary.invalid_secrets }); summary.owner_notification = "SENT"; } catch { summary.owner_notification = "FAILED"; } }
    await atomicJson(path.join(runDir, "summary.json"), summary);
    await atomicJson(path.join(runDir, "status.json"), { run_id: config.run_id, status: "PREFLIGHT_FAILED", updated_at: iso() });
    return summary;
  }
  const ledger = createBudgetLedger(config, now());
  const resourceCheck = await preflightResources(runDir, config);
  const networkCheck = config.PREFLIGHT_NETWORK && resourceCheck.ok && !externalSignal?.aborted
    ? await preflightNetwork(required, environment, fetchImpl, { now, random, budgetLedger: ledger, budgetTrackId: config.tracks[0].id, signal: externalSignal })
    : { ok: resourceCheck.ok && !externalSignal?.aborted, results: [], calls: 0, warning: false, budget_exceeded: false, cancelled: Boolean(externalSignal?.aborted), skipped: true };
  if (now() >= ledger.deadline_ms) ledger.status = "BUDGET_EXCEEDED";
  if (!resourceCheck.ok || !networkCheck.ok || ledger.status === "BUDGET_EXCEEDED" || networkCheck.cancelled) {
    const preflightStatus = ledger.status === "BUDGET_EXCEEDED" ? "BUDGET_EXCEEDED" : networkCheck.cancelled ? "CANCELLED" : "PREFLIGHT_FAILED";
    const failed = { run_id: config.run_id, status: preflightStatus, missing_secrets: [], invalid_secrets: [], resource_check: resourceCheck, network_check: networkCheck, artifact_directory: runDir, secrets_used: required.sort(), budget: { tool_calls: ledger.tool_calls, cost_usd: ledger.cost_usd }, tracks: {}, owner_notification: "NOT_CONFIGURED" };
    if (typeof notifyOwner === "function") { try { await notifyOwner({ run_id: config.run_id, status: failed.status, resource_check: resourceCheck, network_check: networkCheck, budget: failed.budget }); failed.owner_notification = "SENT"; } catch { failed.owner_notification = "FAILED"; } }
    await atomicJson(path.join(runDir, "summary.json"), failed);
    await atomicJson(path.join(runDir, "status.json"), { run_id: config.run_id, status: failed.status, updated_at: iso() });
    return failed;
  }
  const controllers = new Map();
  let ownerNotified = false;
  let ownerNotificationStatus = "NOT_CONFIGURED";
  const childPids = new Set();
  const pidFile = path.join(runDir, "child-processes.json");
  const crashFile = path.join(runDir, "crash-report.json");
  await atomicJson(pidFile, []);
  let pidWriteQueue = Promise.resolve();
  const persistChildPids = () => {
    const snapshot = [...childPids];
    pidWriteQueue = pidWriteQueue.then(() => atomicJson(pidFile, snapshot));
    return pidWriteQueue;
  };
  const results = {};
  let cancelled = false;
  let cancelReason = null;
  let pauseRequested = Boolean(control?.paused);
  const pausedTracks = control?.pendingPausedTracks || new Set();
  const cancelledTracks = control?.pendingCancelledTracks || new Set();
  const eventFile = path.join(runDir, "events.jsonl");
  const statusFile = path.join(runDir, "status.json");

  let statusWriteQueue = Promise.resolve();
  const updateStatus = status => {
    const snapshot = {
      run_id: config.run_id, status, updated_at: iso(),
      budget: { tool_calls: ledger.tool_calls, cost_usd: ledger.cost_usd, max_tool_calls: ledger.max_tool_calls, max_cost_usd: ledger.max_cost_usd, deadline_ms: ledger.deadline_ms },
      tracks: Object.fromEntries(Object.entries(ledger.tracks).map(([id, item]) => [id, { status: item.status, tool_calls: item.tool_calls, cost_usd: item.cost_usd }]))
    };
    statusWriteQueue = statusWriteQueue.then(() => atomicJson(statusFile, snapshot));
    return statusWriteQueue;
  };
  let eventWriteQueue = Promise.resolve();
  const emit = event => {
    const safe = structuredRunEvent({ ...event, secretValues });
    eventWriteQueue = eventWriteQueue.then(async () => {
      await fs.appendFile(eventFile, JSON.stringify(safe) + "\n", { mode: 0o600 });
      await updateStatus(ledger.status);
    });
    return eventWriteQueue;
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
    control.pauseTrack = trackId => { const item = ledger.tracks[trackId]; if (!item || !["PENDING", "RUNNING"].includes(item.status)) return false; pausedTracks.add(trackId); return true; };
    control.resumeTrack = trackId => { const item = ledger.tracks[trackId]; if (!item || !["PENDING", "RUNNING"].includes(item.status)) return false; pausedTracks.delete(trackId); return true; };
    control.cancelTrack = trackId => { const item = ledger.tracks[trackId]; if (!item || !["PENDING", "RUNNING"].includes(item.status)) return false; cancelledTracks.add(trackId); const trackController = controllers.get(trackId); if (trackController) trackController.abort("human-track-cancelled"); return true; };
  }

  const runProcess = async (step, track, trackDir, trackEnv, signal, onSoftTimeout = null) => {
    const charge = chargeBudget(ledger, track.id, { toolCalls: 1, costUsd: step.cost_usd || 0, now: now() });
    if (!charge.ok) {
      ledger.status = "BUDGET_EXCEEDED";
      cancelAll("budget-exceeded:" + charge.reason);
      return { ok: false, error: Object.assign(new Error("Budget exceeded: " + charge.reason), { code: "BUDGET_EXCEEDED" }), output_bytes: 0 };
    }
    if (charge.warning) await emit({ runId: config.run_id, trackId: track.id, step: step.id || null, status: "BUDGET_WARNING", detail: { tool_calls: ledger.tool_calls, ceiling: ledger.max_tool_calls, threshold: "80%" } });
    const child = spawn(step.command, step.args, { cwd: rootDir, env: trackEnv, shell: false, detached: process.platform !== "win32", stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
    if (child.pid) {
      childPids.add(child.pid);
      try { await persistChildPids(); }
      catch (error) {
        try { if (process.platform !== "win32") process.kill(-child.pid, "SIGKILL"); else child.kill("SIGKILL"); } catch { try { child.kill("SIGKILL"); } catch {} }
        throw error;
      }
    }
    let output = "";
    let outputBytes = 0;
    let secretScanTail = "";
    let secretExposureDetected = false;
    const maxSecretLength = Math.min(256_000, Math.max(0, ...secretValues.map(value => value.length)));
    const append = chunk => {
      outputBytes += chunk.length;
      const value = chunk.toString("utf8");
      const scan = secretScanTail + value;
      if (!secretExposureDetected && secretValues.some(secret => secret && scan.includes(secret))) {
        secretExposureDetected = true;
        terminate();
        forceTimer = setTimeout(forceKill, RUN_DEFAULTS.CANCEL_GRACE_MS);
        forceTimer.unref?.();
      }
      secretScanTail = maxSecretLength > 1 ? scan.slice(-(maxSecretLength - 1)) : "";
      output = (output + value).slice(-256_000);
    };
    child.stdout.on("data", append);
    child.stderr.on("data", append);
    const terminate = () => { try { if (child.pid && process.platform !== "win32") process.kill(-child.pid, "SIGTERM"); else child.kill("SIGTERM"); } catch { try { child.kill("SIGTERM"); } catch {} } };
    const forceKill = () => { try { if (child.pid && process.platform !== "win32") process.kill(-child.pid, "SIGKILL"); else child.kill("SIGKILL"); } catch { try { child.kill("SIGKILL"); } catch {} } };
    let forceTimer;
    const abortHandler = () => {
      terminate();
      if (!forceTimer) { forceTimer = setTimeout(forceKill, RUN_DEFAULTS.CANCEL_GRACE_MS); forceTimer.unref?.(); }
    };
    signal.addEventListener("abort", abortHandler, { once: true });
    let timedOut = false;
    const hardTimeoutMs = step.timeout_ms || 5 * 60_000;
    const softTimeoutMs = step.soft_timeout_ms ?? Math.max(1, Math.floor(hardTimeoutMs * 0.8));
    let softWarningPromise = Promise.resolve();
    const softTimeout = setTimeout(() => { if (typeof onSoftTimeout === "function") softWarningPromise = Promise.resolve().then(() => onSoftTimeout(softTimeoutMs, hardTimeoutMs)); }, softTimeoutMs);
    const timeout = setTimeout(() => { timedOut = true; abortHandler(); }, hardTimeoutMs);
    const softTimeout = step.soft_timeout_ms ? setTimeout(() => emit({ runId: config.run_id, trackId: track.id, step: step.id || null, status: "STEP_SOFT_TIMEOUT", detail: { soft_timeout_ms: step.soft_timeout_ms } }), step.soft_timeout_ms) : null;
    const result = await new Promise(resolve => {
      child.once("error", error => resolve({ code: -1, error }));
      child.once("close", (code, childSignal) => resolve({ code, signal: childSignal }));
    });
    clearTimeout(softTimeout);
    if (child.pid) { childPids.delete(child.pid); await persistChildPids(); }
    clearTimeout(timeout);
    clearTimeout(softTimeout);
    clearTimeout(forceTimer);
    signal.removeEventListener("abort", abortHandler);
    let softWarningError = null;
    try { await softWarningPromise; } catch (error) { softWarningError = error; }
    let redactedOutput = output;
    for (const secret of secretValues) if (secret) redactedOutput = redactedOutput.split(secret).join("[REDACTED]");
    const safeOutput = redactedOutput.split(/\r?\n/).map(line => line.slice(0, 4000)).join("\n");
    await fs.writeFile(path.join(trackDir, (step.id || "step") + ".log"), safeOutput, { mode: 0o600 });
    const secretExposure = secretExposureDetected || secretValues.some(secret => secret && output.includes(secret));
    if (secretExposure) return { ok: false, securityAbort: true, error: new Error("Security anomaly: credential material appeared in process output."), output_bytes: outputBytes };
    if (softWarningError) return { ok: false, error: softWarningError, output_bytes: outputBytes };
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
    if (cancelledTracks.has(track.id)) abort.abort("human-track-cancelled");
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
          while ((pauseRequested || pausedTracks.has(track.id)) && !cancelled && !abort.signal.aborted) await sleep(100);
          await emit({ runId: config.run_id, trackId: track.id, step: stepName, status: "STARTED", attempt, startedAt: now() });
          const remainingRetryWindow = Math.max(1000, RUN_DEFAULTS.TRANSIENT_RETRY_WINDOW_MS - (now() - stepStarted));
          const attemptStep = transientRetries > 0 ? { ...step, timeout_ms: Math.min(step.timeout_ms || 5 * 60_000, remainingRetryWindow) } : step;
          const result = await runProcess(attemptStep, track, trackDir, trackEnv, abort.signal);
          if (result.securityAbort) {
            ledger.status = "SECURITY_ABORT";
            cancelAll("security-secret-exposure");
            await emit({ runId: config.run_id, trackId: track.id, step: stepName, status: "SECURITY_ABORT", attempt, startedAt: stepStarted, detail: { secret_names: track.required_secrets } });
            if (typeof notifyOwner === "function" && !ownerNotified) {
              try { await notifyOwner({ run_id: config.run_id, status: "SECURITY_ABORT", track_id: track.id, secret_names: track.required_secrets }); ownerNotificationStatus = "SENT"; }
              catch { ownerNotificationStatus = "FAILED"; }
              ownerNotified = true;
            }
            throw result.error;
          }
          const minimumLogBytes = step.min_log_bytes ?? 8;
          if (result.ok && step.require_nonempty_log !== false && result.output_bytes < minimumLogBytes) {
            emptyAttempts++;
            const decision = retryDecision({ attempt: emptyAttempts, emptyLog: true, maxAttempts: config.RETRY_MAX_ATTEMPTS });
            if (decision.retry) {
              await emit({ runId: config.run_id, trackId: track.id, step: stepName, status: "RETRYING", attempt, startedAt: stepStarted, detail: { reason: "empty-log", next_attempt: attempt + 1, output_bytes: result.output_bytes } });
              attempt++;
              continue;
            }
            await emit({ runId: config.run_id, trackId: track.id, step: stepName, status: "FAILED", attempt, startedAt: stepStarted, detail: { reason: "empty-log", output_bytes: result.output_bytes } });
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
            await emit({ runId: config.run_id, trackId: track.id, step: stepName, status: "RETRYING", attempt, startedAt: stepStarted, detail: { reason: decision.reason, next_attempt: attempt + 1, delay_ms: delay } });
            transientRetries++;
            attempt++;
            await sleep(delay);
            continue;
          }
          await emit({ runId: config.run_id, trackId: track.id, step: stepName, status: "FAILED", attempt, startedAt: stepStarted, detail: { error: redactText(result.error?.message || "Step failed", secretValues), failure_class: decision.reason } });
          throw result.error;
        }
      }
    } catch (error) {
      outcome = ledger.status === "SECURITY_ABORT" ? "FAILED" : abort.signal.aborted ? "CANCELLED" : "FAILED";
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
    if (outcome === "CANCELLED" && track.criticality === "critical" && !cancelled) cancelAll("critical-track-cancelled");
    return outcome;
  };

  if (networkCheck.warning) await emit({ runId: config.run_id, trackId: config.tracks[0].id, status: "BUDGET_WARNING", detail: { tool_calls: ledger.tool_calls, ceiling: ledger.max_tool_calls, threshold: "80%", source: "preflight" } });
  await updateStatus("RUNNING");
  const crashWatchdog = spawn(process.execPath, [path.join(import.meta.dirname, "watchdog.mjs"), String(process.pid), pidFile, crashFile], { detached: true, stdio: "ignore", env: { PATH: environment.PATH || "" } });
  crashWatchdog.unref();
  const watchdog = setTimeout(() => { ledger.status = "BUDGET_EXCEEDED"; cancelAll("budget-exceeded:duration"); }, Math.max(0, ledger.deadline_ms - now()));
  watchdog.unref?.();
  let orchestratorError = null;
  const trackPromises = config.tracks.map(runTrack);
  try {
    await Promise.all(trackPromises);
  } catch (error) {
    orchestratorError = redactText(error?.message || "Unexpected orchestrator failure.", secretValues);
    if (!["SECURITY_ABORT", "BUDGET_EXCEEDED"].includes(ledger.status)) ledger.status = "ORCHESTRATOR_FAILED";
    cancelAll("orchestrator-error");
    await Promise.allSettled(trackPromises);
  } finally {
    clearTimeout(watchdog);
    if (childPids.size) {
      for (const pid of childPids) { try { if (process.platform !== "win32") process.kill(-pid, "SIGTERM"); else process.kill(pid, "SIGTERM"); } catch {} }
      await sleep(RUN_DEFAULTS.CANCEL_GRACE_MS);
      for (const pid of childPids) { try { if (process.platform !== "win32") process.kill(-pid, "SIGKILL"); else process.kill(pid, "SIGKILL"); } catch {} }
      childPids.clear();
      try { await persistChildPids(); } catch {}
    }
    try { crashWatchdog.kill("SIGTERM"); } catch {}
  }
  for (const track of config.tracks) if (!results[track.id]) results[track.id] = ledger.tracks[track.id].status === "RUNNING" ? "FAILED" : "CANCELLED";

  const failedCritical = config.tracks.some(track => track.criticality === "critical" && results[track.id] === "FAILED");
  const anyCancelled = Object.values(results).some(value => value === "CANCELLED");
  const anyDegraded = config.tracks.some(track => track.criticality !== "critical" && ["FAILED", "CANCELLED"].includes(results[track.id]));
  const finalStatus = ledger.status === "SECURITY_ABORT" ? "SECURITY_ABORT" : ledger.status === "BUDGET_EXCEEDED" ? "BUDGET_EXCEEDED" : ledger.status === "ORCHESTRATOR_FAILED" ? "FAILED" :
    cancelReason === "human-cancelled" ? "CANCELLED" :
    failedCritical ? "FAILED" : anyDegraded || (anyCancelled && !cancelled) ? "PARTIAL" :
    cancelled ? "CANCELLED" : "SUCCESS";
  const summary = {
    run_id: config.run_id, status: finalStatus,
    started_at: new Date(ledger.started_at_ms).toISOString(), finished_at: iso(),
    secrets_used: required.sort(),
    budget: { tool_calls: ledger.tool_calls, cost_usd: ledger.cost_usd, duration_ms: now() - ledger.started_at_ms, max_duration_minutes: config.RUN_MAX_DURATION_MINUTES, max_tool_calls: ledger.max_tool_calls, max_cost_usd: ledger.max_cost_usd },
    resource_check: resourceCheck, network_check: networkCheck,
    tracks: Object.fromEntries(config.tracks.map(track => [track.id, { criticality: track.criticality, status: results[track.id] || "CANCELLED" }])),
    cancellation_reason: cancelReason, orchestrator_error: orchestratorError, artifact_directory: runDir,
    artifact_retention_days: RUN_DEFAULTS.ARTIFACT_RETENTION_DAYS,
    artifact_upload: "NOT_CONFIGURED", owner_notification: ownerNotificationStatus
  };
  await atomicJson(path.join(runDir, "summary.json"), summary);
  try { await updateStatus(finalStatus); }
  catch { await atomicJson(statusFile, { run_id: config.run_id, status: finalStatus, updated_at: iso(), recovery: "direct-write-after-status-queue-failure" }); }
  if (typeof notifyOwner === "function" && !ownerNotified) {
    try { await notifyOwner({ run_id: config.run_id, status: finalStatus, summary_path: path.join(runDir, "summary.json") }); summary.owner_notification = "SENT"; }
    catch (error) { summary.owner_notification = "FAILED"; summary.notification_error = redactText(error.message, secretValues); }
    await atomicJson(path.join(runDir, "summary.json"), summary);
  }
  await atomicJson(path.join(runDir, "completed.json"), { run_id: config.run_id, status: finalStatus, completed_at: iso() });
  return summary;
}
