import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const worker = await readFile(new URL("../worker.js", import.meta.url), "utf8");
const schema = await readFile(new URL("../migrations/0001_ledger.sql", import.meta.url), "utf8");
const guards = await readFile(new URL("../migrations/0002_ledger_guards.sql", import.meta.url), "utf8");
const docs = await readFile(new URL("../README.md", import.meta.url), "utf8");

test("no cash-out, transfer, or payment routes are implemented", () => {
  assert.doesNotMatch(worker, /cashout|cash-out|payout|transfer|payment_intent/i);
  assert.match(docs, /No cash-out, person-to-person transfer/);
});
test("reward credits require server-side verification", () => {
  assert.match(worker, /VERIFY_AD_REWARD/);
  assert.match(worker, /ad_verification_unconfigured/);
});
test("game credit grants require a trusted server proof", () => {
  assert.match(worker, /VERIFY_GAME_GRANT/);
  assert.match(worker, /game_grant_verification_unconfigured/);
});
test("game credits are a separate unit", () => {
  assert.match(schema, /'LINGOCOIN','GAME_CREDIT'/);
  assert.match(worker, /GAME_CREDIT/);
});
test("ledger is append-only and idempotent", () => {
  assert.match(schema, /UNIQUE\(user_id, idempotency_key\)/);
  assert.match(schema, /loyalty_ledger_no_update/);
  assert.match(schema, /loyalty_ledger_no_delete/);
});
test("ledger enforces unit/event consistency and positive grant signs", () => {
  assert.match(guards, /loyalty_ledger_unit_event_guard/);
  assert.match(guards, /loyalty_ledger_event_sign_guard/);
});
test("ledger prevents negative balances at insert time", () => {
  assert.match(guards, /loyalty_ledger_nonnegative_balance/);
  assert.match(guards, /ledger balance cannot become negative/);
});
test("mutations fail closed without rate limiting", () => {
  assert.match(worker, /RATE_LIMITER/);
  assert.match(worker, /rate_limiter_unconfigured/);
});
test("reward daily cap is enforced in the insert statement", () => {
  assert.match(worker, /SELECT COUNT\(\*\).*AD_REWARD/);
  assert.match(worker, /daily_reward_limit_reached/);
});
test("missing authentication and merchant adapters fail closed", () => {
  assert.match(worker, /authentication_required/);
  assert.match(worker, /merchant_redemption_unconfigured/);
});
test("CORS preflight is handled once before session authentication", () => {
  assert.equal((worker.match(/request\.method === "OPTIONS"/g) || []).length, 1);
  assert.ok(worker.indexOf('request.method === "OPTIONS"') < worker.indexOf('const userId = await authenticate(request, env)'));
});
