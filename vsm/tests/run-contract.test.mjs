import test from "node:test";
import assert from "node:assert/strict";
import {
  createRunConfig, preflightSecrets, scopedTrackEnvironment, classifyFailure,
  retryDecision, transientRetryDelayMs, createBudgetLedger, chargeBudget, structuredRunEvent
} from "../orchestration/run-contract.mjs";

function config(overrides = {}) {
  return createRunConfig({
    run_id: "test-run-001", run_type: "local-validation", target: "local",
    tracks: [
      { id: "source", criticality: "critical", required_secrets: [] },
      { id: "preview", criticality: "important", required_secrets: ["CLOUDFLARE_API_TOKEN"] },
      { id: "studio", criticality: "best-effort", required_secrets: [] }
    ], ...overrides
  });
}

test("run configuration applies bounded defaults and production dry-run", () => {
  const local = config();
  assert.equal(local.RUN_MAX_DURATION_MINUTES, 45);
  assert.equal(local.RUN_MAX_TOOL_CALLS, 1200);
  assert.equal(local.RUN_MAX_COST_USD, 15);
  assert.equal(local.RETRY_MAX_ATTEMPTS, 3);
  assert.equal(createRunConfig({ run_id: "prod-run-001", run_type: "production-change", target: "production", tracks: [{ id: "deploy", criticality: "critical" }] }).DRY_RUN, true);
  assert.throws(() => createRunConfig({ run_id: "bad-run-001", target: "production", DRY_RUN: false, tracks: [{ id: "deploy", criticality: "critical" }] }), /production-change/);
  assert.throws(() => createRunConfig({ run_id: "bad-run-002", RUN_MAX_DURATION_MINUTES: 91, tracks: [{ id: "a", criticality: "critical" }] }), /1–90/);
  assert.throws(() => createRunConfig({ run_id: "bad-run-003", tracks: [{ id: "a", criticality: "unknown" }] }), /criticality/);
});

test("secret preflight reports missing names only and track environments are least-privilege", () => {
  const check = preflightSecrets(["FIREBASE_SERVICE_ACCOUNT", "CLOUDFLARE_API_TOKEN"], { CLOUDFLARE_API_TOKEN: "not-for-output" });
  assert.deepEqual(check, { ok: false, missing: ["FIREBASE_SERVICE_ACCOUNT"], invalid: [] });
  const env = { FIREBASE_SERVICE_ACCOUNT: "firebase-secret", CLOUDFLARE_API_TOKEN: "cloudflare-secret", OTHER_TOKEN: "unrelated" };
  const scoped = scopedTrackEnvironment({ required_secrets: ["CLOUDFLARE_API_TOKEN"] }, env, { PATH: "/bin" });
  assert.deepEqual(scoped, { PATH: "/bin", CLOUDFLARE_API_TOKEN: "cloudflare-secret" });
  const firebaseScoped = scopedTrackEnvironment({ required_secrets: ["FIREBASE_SERVICE_ACCOUNT"] }, { FIREBASE_TOKEN: "firebase-token-123456" });
  assert.deepEqual(firebaseScoped, { FIREBASE_TOKEN: "firebase-token-123456" });
  assert.equal(JSON.stringify(check).includes("not-for-output"), false);
  const firebase = JSON.stringify({ type: "service_account", project_id: "lingo-stage", client_email: "ci@lingo-stage.iam.gserviceaccount.com", private_key: "-----BEGIN PRIVATE KEY-----\
redacted\
-----END PRIVATE KEY-----" });
  assert.deepEqual(preflightSecrets(["FIREBASE_SERVICE_ACCOUNT"], { FIREBASE_TOKEN: "firebase-token-123456" }), { ok: true, missing: [], invalid: [] });
  assert.deepEqual(preflightSecrets(["FIREBASE_SERVICE_ACCOUNT"], { FIREBASE_SERVICE_ACCOUNT: firebase }), { ok: true, missing: [], invalid: [] });
  assert.deepEqual(preflightSecrets(["FIREBASE_SERVICE_ACCOUNT"], { FIREBASE_SERVICE_ACCOUNT: "malformed" }), { ok: false, missing: [], invalid: ["FIREBASE_SERVICE_ACCOUNT"] });
});

test("retry policy is bounded and distinguishes transient from permanent failures", () => {
  assert.equal(classifyFailure({ status: 503 }), "transient");
  assert.equal(classifyFailure({ status: 401 }), "permanent");
  assert.deepEqual(retryDecision({ emptyLog: true, attempt: 1 }), { retry: true, reason: "empty-log", next_attempt: 2 });
  assert.equal(retryDecision({ emptyLog: true, attempt: 3 }).retry, false);
  assert.equal(retryDecision({ error: { status: 503 }, attempt: 1, startedAt: 1000, now: 2000 }).retry, true);
  assert.equal(retryDecision({ error: { status: 503 }, attempt: 4, startedAt: 1000, now: 2000 }).retry, false);
  assert.equal(retryDecision({ error: { status: 401 }, attempt: 1, startedAt: 1000 }).retry, false);
  assert.equal(retryDecision({ error: { status: 503 }, attempt: 2, startedAt: 1000, now: 242000 }).retry, false);
  assert.equal(transientRetryDelayMs(1, () => 0), 500);
  assert.equal(transientRetryDelayMs(2, () => 1), 2000);
});

test("run and per-track budgets enforce hard ceilings and warning threshold", () => {
  const ledger = createBudgetLedger(config(), 1000);
  const first = chargeBudget(ledger, "source", { toolCalls: 192, now: 2000 });
  assert.equal(first.ok, true);
  assert.equal(first.warning, true);
  const exceeded = chargeBudget(ledger, "source", { toolCalls: 49, now: 3000 });
  assert.equal(exceeded.ok, false);
  assert.equal(exceeded.reason, "track_tool_calls");
  assert.equal(ledger.status, "BUDGET_EXCEEDED");
  const costLedger = createBudgetLedger(config(), 1000);
  assert.equal(chargeBudget(costLedger, "source", { costUsd: 3.01, now: 2000 }).reason, "track_cost");
  const timeLedger = createBudgetLedger(config({ RUN_MAX_DURATION_MINUTES: 1 }), 1000);
  assert.equal(chargeBudget(timeLedger, "source", { now: 61000 }).reason, "duration");
});

test("structured events redact secret-like fields and include duration and attempt", () => {
  const event = structuredRunEvent({
    runId: "test-run-001", trackId: "source", step: "compile", status: "FAILED",
    attempt: 2, startedAt: 1000, endedAt: 2500,
    detail: { message: "failed with never-print-this", api_token: "never-print-this", secret_name: "CLOUDFLARE_API_TOKEN" },
    secretValues: ["never-print-this"]
  });
  assert.equal(event.duration_ms, 1500);
  assert.equal(event.attempt, 2);
  assert.equal(event.detail.api_token, "[REDACTED]");
  assert.equal(event.detail.secret_name, "[REDACTED]");
  assert.equal(JSON.stringify(event).includes("never-print-this"), false);
  assert.equal(event.detail.message, "failed with [REDACTED]");
});
