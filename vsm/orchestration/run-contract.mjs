import { randomUUID } from "node:crypto";

export const RUN_DEFAULTS = Object.freeze({
  RUN_MAX_DURATION_MINUTES: 45,
  RUN_MAX_TOOL_CALLS: 1200,
  RUN_MAX_COST_USD: 15,
  RETRY_MAX_ATTEMPTS: 3,
  TRANSIENT_MAX_RETRIES: 3,
  TRANSIENT_RETRY_WINDOW_MS: 240_000,
  CANCEL_GRACE_MS: 30_000,
  ARTIFACT_RETENTION_DAYS: 30
});

export const SECRET_NAMES = Object.freeze([
  "FIREBASE_SERVICE_ACCOUNT", "FIREBASE_TOKEN", "CLOUDFLARE_API_TOKEN",
  "CI_DEPLOY_KEY", "GITHUB_TOKEN"
]);
const CRITICALITIES = new Set(["critical", "important", "best-effort"]);
const TRANSIENT_CODES = new Set(["ECONNRESET", "ECONNREFUSED", "ETIMEDOUT", "EAI_AGAIN", "ENETUNREACH", "UND_ERR_CONNECT_TIMEOUT"]);

export function createRunConfig(input = {}) {
  const target = input.target || "local";
  const config = {
    run_id: input.run_id || `vsm-${new Date().toISOString().replace(/[^0-9]/g, "").slice(0,14)}-${randomUUID().slice(0,8)}`,
    run_type: input.run_type || "local-validation",
    target,
    RUN_MAX_DURATION_MINUTES: input.RUN_MAX_DURATION_MINUTES ?? RUN_DEFAULTS.RUN_MAX_DURATION_MINUTES,
    RUN_MAX_TOOL_CALLS: input.RUN_MAX_TOOL_CALLS ?? RUN_DEFAULTS.RUN_MAX_TOOL_CALLS,
    RUN_MAX_COST_USD: input.RUN_MAX_COST_USD ?? RUN_DEFAULTS.RUN_MAX_COST_USD,
    RETRY_MAX_ATTEMPTS: input.RETRY_MAX_ATTEMPTS ?? RUN_DEFAULTS.RETRY_MAX_ATTEMPTS,
    TRACK_CRITICALITY: input.TRACK_CRITICALITY || {},
    SECRETS_REQUIRED: [...new Set(input.SECRETS_REQUIRED || [])],
    ALLOW_DESTRUCTIVE: input.ALLOW_DESTRUCTIVE === true,
    DRY_RUN: input.DRY_RUN === undefined ? target === "production" : input.DRY_RUN === true,
    PREFLIGHT_NETWORK: input.PREFLIGHT_NETWORK === undefined ? target === "staging" : input.PREFLIGHT_NETWORK === true,
    PREFLIGHT_MIN_FREE_MEMORY_MB: input.PREFLIGHT_MIN_FREE_MEMORY_MB ?? 256,\n    PREFLIGHT_MIN_FREE_DISK_MB: input.PREFLIGHT_MIN_FREE_DISK_MB ?? 512,
    tracks: input.tracks || []
  };
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{2,79}$/.test(config.run_id)) throw new Error("Invalid run_id.");
  if (!["local-validation", "staging-validation", "production-change"].includes(config.run_type)) throw new Error("Invalid run_type.");
  if (!["local", "staging", "production"].includes(target)) throw new Error("Invalid target.");
  if (!Number.isInteger(config.RUN_MAX_DURATION_MINUTES) || config.RUN_MAX_DURATION_MINUTES < 1 || config.RUN_MAX_DURATION_MINUTES > 90) throw new Error("RUN_MAX_DURATION_MINUTES must be 1–90.");
  if (!Number.isInteger(config.RUN_MAX_TOOL_CALLS) || config.RUN_MAX_TOOL_CALLS < 1) throw new Error("RUN_MAX_TOOL_CALLS must be a positive integer.");
  if (!Number.isFinite(config.RUN_MAX_COST_USD) || config.RUN_MAX_COST_USD <= 0) throw new Error("RUN_MAX_COST_USD must be greater than zero.");
  if (!Number.isInteger(config.RETRY_MAX_ATTEMPTS) || config.RETRY_MAX_ATTEMPTS < 1 || config.RETRY_MAX_ATTEMPTS > 3) throw new Error("RETRY_MAX_ATTEMPTS must be 1–3 total attempts.");
  if (!Number.isInteger(config.PREFLIGHT_MIN_FREE_MEMORY_MB) || config.PREFLIGHT_MIN_FREE_MEMORY_MB < 64) throw new Error("PREFLIGHT_MIN_FREE_MEMORY_MB must be at least 64.");
  if (!Number.isInteger(config.PREFLIGHT_MIN_FREE_DISK_MB) || config.PREFLIGHT_MIN_FREE_DISK_MB < 64) throw new Error("PREFLIGHT_MIN_FREE_DISK_MB must be at least 64.");
  if (config.target === "production" && !config.DRY_RUN && config.run_type !== "production-change") throw new Error("Non-dry-run production work requires run_type=production-change.");
  if (config.ALLOW_DESTRUCTIVE && config.target !== "local") throw new Error("Destructive operations are disabled for remote targets in this VSM phase.");
  if (config.SECRETS_REQUIRED.some(name => !SECRET_NAMES.includes(name))) throw new Error("SECRETS_REQUIRED contains an unrecognized secret name.");
  if (!Array.isArray(config.tracks) || config.tracks.length < 1 || config.tracks.length > 5) throw new Error("A run must define between one and five tracks.");
  const ids = new Set();
  for (const track of config.tracks) {
    if (!track || !/^[a-z][a-z0-9-]{1,39}$/.test(track.id || "") || ids.has(track.id)) throw new Error("Track IDs must be unique lowercase identifiers.");
    ids.add(track.id);
    const criticality = track.criticality || config.TRACK_CRITICALITY[track.id];
    if (!CRITICALITIES.has(criticality)) throw new Error(`Track ${track.id} requires criticality: critical, important, or best-effort.`);
    track.criticality = criticality;
    track.required_secrets = [...new Set(track.required_secrets || [])];
    if (track.required_secrets.some(name => !SECRET_NAMES.includes(name))) throw new Error(`Track ${track.id} declares an unknown required secret name.`);
    if (track.tool_call_budget !== undefined && (!Number.isInteger(track.tool_call_budget) || track.tool_call_budget < 1)) throw new Error(`Track ${track.id} has an invalid tool_call_budget.`);
    if (track.cost_budget_usd !== undefined && (!Number.isFinite(track.cost_budget_usd) || track.cost_budget_usd < 0)) throw new Error(`Track ${track.id} has an invalid cost_budget_usd.`);
  }
  return Object.freeze(config);
}

function validSecretValue(name, value) {
  if (typeof value !== "string" || value.trim().length === 0) return false;
  if (name === "CI_DEPLOY_KEY") return /-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(value) || /OPENSSH PRIVATE KEY/.test(value);
  if (/[\r\n]/.test(value)) return false;
  if (name === "FIREBASE_SERVICE_ACCOUNT") {
    try {
      const parsed = JSON.parse(value);
      return parsed.type === "service_account" && typeof parsed.project_id === "string" &&
        typeof parsed.client_email === "string" && typeof parsed.private_key === "string";
    } catch { return false; }
  }
  return value.trim().length >= 16;
}
export function preflightSecrets(requiredNames, environment = process.env) {
  const missing = [];
  const invalid = [];
  for (const name of [...new Set(requiredNames)]) {
    if (!SECRET_NAMES.includes(name)) { invalid.push(name); continue; }
    const alternatives = name === "FIREBASE_SERVICE_ACCOUNT" || name === "FIREBASE_TOKEN"
      ? ["FIREBASE_SERVICE_ACCOUNT", "FIREBASE_TOKEN"]
      : name === "CI_DEPLOY_KEY" || name === "GITHUB_TOKEN"
        ? ["CI_DEPLOY_KEY", "GITHUB_TOKEN"] : [name];
    const supplied = alternatives.filter(candidate => typeof environment[candidate] === "string" && environment[candidate].trim().length > 0);
    if (!supplied.length) { missing.push(name); continue; }
    if (!supplied.some(candidate => validSecretValue(candidate, environment[candidate]))) invalid.push(name);
  }
  return { ok: missing.length === 0 && invalid.length === 0, missing: missing.sort(), invalid: invalid.sort() };
}

export function scopedTrackEnvironment(track, environment = process.env, base = {}) {
  const allowed = new Set(track.required_secrets || []);
  const scoped = Object.fromEntries(Object.entries(base).filter(([name]) => !SECRET_NAMES.includes(name) && !/secret|token|password|credential|authorization|api[_-]?key|private[_-]?key/i.test(name)));
  const aliases = [
    ["FIREBASE_SERVICE_ACCOUNT", "FIREBASE_TOKEN"],
    ["CI_DEPLOY_KEY", "GITHUB_TOKEN"]
  ];
  for (const name of allowed) {
    const group = aliases.find(items => items.includes(name)) || [name];
    const selected = group.find(candidate => validSecretValue(candidate, environment[candidate]));
    if (selected) scoped[selected] = environment[selected];
  }
  return scoped;
}

export function classifyFailure(error) {
  const status = Number(error?.status || error?.statusCode || 0);
  const code = String(error?.code || "");
  if ([401, 403].includes(status) || /auth|permission|unauthorized|forbidden/i.test(String(error?.message || ""))) return "permanent";
  if ([408, 425, 429].includes(status) || status >= 500 || TRANSIENT_CODES.has(code) || error?.name === "TimeoutError" || error?.name === "AbortError") return "transient";
  return "permanent";
}

export function transientRetryDelayMs(attempt, random = Math.random) {
  if (!Number.isInteger(attempt) || attempt < 1) throw new Error("attempt must be a positive integer.");
  const ceiling = Math.min(30_000, 1_000 * (2 ** (attempt - 1)));
  return Math.floor(ceiling * (0.5 + Math.max(0, Math.min(1, random())) * 0.5));
}

export function retryDecision({ error, attempt, startedAt, now = Date.now(), emptyLog = false, maxAttempts = RUN_DEFAULTS.RETRY_MAX_ATTEMPTS }) {
  if (!Number.isInteger(attempt) || attempt < 1) throw new Error("attempt must be a positive integer.");
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > RUN_DEFAULTS.RETRY_MAX_ATTEMPTS) throw new Error("maxAttempts cannot exceed the hard three-attempt limit.");
  if (emptyLog) return { retry: attempt < maxAttempts, reason: "empty-log", next_attempt: attempt + 1 };
  if (classifyFailure(error) !== "transient") return { retry: false, reason: "permanent-failure" };
  const retriesUsed = attempt - 1;
  const elapsed = now - startedAt;
  return { retry: retriesUsed < RUN_DEFAULTS.TRANSIENT_MAX_RETRIES && elapsed < RUN_DEFAULTS.TRANSIENT_RETRY_WINDOW_MS, reason: "transient-infrastructure", next_attempt: attempt + 1 };
}

export function createBudgetLedger(config, now = Date.now()) {
  const tracks = Object.fromEntries(config.tracks.map(track => [track.id, {
    criticality: track.criticality,
    tool_calls: 0,
    cost_usd: 0,
    tool_call_budget: track.tool_call_budget ?? Math.floor(config.RUN_MAX_TOOL_CALLS / config.tracks.length),
    cost_budget_usd: track.cost_budget_usd ?? config.RUN_MAX_COST_USD / config.tracks.length,
    status: "PENDING"
  }]));
  return {
    run_id: config.run_id, started_at_ms: now, deadline_ms: now + config.RUN_MAX_DURATION_MINUTES * 60_000,
    max_tool_calls: config.RUN_MAX_TOOL_CALLS, max_cost_usd: config.RUN_MAX_COST_USD,
    tool_calls: 0, cost_usd: 0, tracks, status: "RUNNING"
  };
}

export function chargeBudget(ledger, trackId, { toolCalls = 0, costUsd = 0, now = Date.now() } = {}) {
  const track = ledger.tracks[trackId];
  if (!track) throw new Error("Unknown track.");
  if (!Number.isInteger(toolCalls) || toolCalls < 0 || !Number.isFinite(costUsd) || costUsd < 0) throw new Error("Budget charges must be non-negative finite values.");
  const reason = now >= ledger.deadline_ms ? "duration" :
    ledger.tool_calls + toolCalls > ledger.max_tool_calls ? "tool_calls" :
    ledger.cost_usd + costUsd > ledger.max_cost_usd ? "cost" :
    track.tool_calls + toolCalls > track.tool_call_budget ? "track_tool_calls" :
    track.cost_usd + costUsd > track.cost_budget_usd ? "track_cost" : null;
  if (reason) {
    ledger.status = "BUDGET_EXCEEDED";
    return { ok: false, reason, warning: false };
  }
  track.tool_calls += toolCalls;
  ledger.tool_calls += toolCalls;
  track.cost_usd += costUsd;
  ledger.cost_usd += costUsd;
  return { ok: true, reason: null, warning: ledger.tool_calls >= ledger.max_tool_calls * 0.8 };
}
export function structuredRunEvent({ runId, trackId = null, step = null, status, attempt = 1, startedAt, endedAt = Date.now(), detail = {}, secretValues = [] }) {
  const redact = (value, key = "") => {
    if (/secret|token|password|credential|authorization/i.test(key)) return "[REDACTED]";
    if (typeof value === "string") return secretValues.filter(item => typeof item === "string" && item.length > 0).reduce((text, secret) => text.split(secret).join("[REDACTED]"), value);
    if (Array.isArray(value)) return value.map(item => redact(item));
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([name, item]) => [name, redact(item, name)]));
    return value;
  };
  const safeDetail = redact(detail);
  return { timestamp: new Date(endedAt).toISOString(), run_id: runId, track_id: trackId, step, status, attempt, duration_ms: startedAt === undefined ? null : Math.max(0, endedAt - startedAt), detail: safeDetail };
}
