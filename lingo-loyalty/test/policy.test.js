import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const worker = await readFile(new URL("../worker.js", import.meta.url), "utf8");
const schema = await readFile(new URL("../migrations/0001_ledger.sql", import.meta.url), "utf8");
const guards = await readFile(new URL("../migrations/0002_ledger_guards.sql", import.meta.url), "utf8");
const rateLimits = await readFile(new URL("../migrations/0003_rate_limits.sql", import.meta.url), "utf8");
const docs = await readFile(new URL("../README.md", import.meta.url), "utf8");
const wrangler = await readFile(new URL("../wrangler.toml", import.meta.url), "utf8");

test("no cash-out, transfer, or payment routes are implemented", () => {
  assert.doesNotMatch(worker, /cashout|cash-out|payout|transfer|payment_intent/i);
  assert.match(docs, /No cash-out, person-to-person transfer/);
});
test("Firebase identity validation verifies RS256 and standard claims", () => {
  assert.match(worker, /authenticateFirebase/);
  assert.match(worker, /RSASSA-PKCS1-v1_5/);
  assert.match(worker, /securetoken\.googleapis\.com/);
  assert.match(worker, /claims\.exp <= now/);
  assert.match(worker, /claims\.aud !== projectId/);
});
test("reward and game callbacks require timestamped HMAC signatures", () => {
  assert.match(worker, /verifySignedPayload/);
  assert.match(worker, /AD_REWARD_HMAC_SECRET/);
  assert.match(worker, /GAME_EVENT_HMAC_SECRET/);
  assert.match(worker, /X-LINGO-Timestamp/);
  assert.match(worker, /X-LINGO-Signature/);
});
test("merchant coupon authorizations require a dedicated HMAC secret", () => {
  assert.match(worker, /MERCHANT_AUTH_HMAC_SECRET/);
  assert.match(worker, /coupon_redemptions/);
});
test("game credits are a separate unit", () => {
  assert.match(schema, /'LINGOCOIN','GAME_CREDIT'/);
  assert.match(worker, /GAME_CREDIT/);
});
test("ledger is append-only and idempotent", () => {
  assert.match(schema, /UNIQUE\(user_id, idempotency_key\)/);
  assert.match(schema, /loyalty_ledger_no_update/);
  assert.match(schema, /loyalty_ledger_no_delete/);
  assert.match(worker, /findDuplicate/);
});
test("ledger enforces unit/event consistency and positive grant signs", () => {
  assert.match(guards, /loyalty_ledger_unit_event_guard/);
  assert.match(guards, /loyalty_ledger_event_sign_guard/);
});
test("ledger prevents negative balances at insert time", () => {
  assert.match(guards, /loyalty_ledger_nonnegative_balance/);
  assert.match(guards, /ledger balance cannot become negative/);
});
test("per-user route rate limits use atomic D1 upserts", () => {
  assert.match(rateLimits, /PRIMARY KEY \(user_id, route, window_start\)/);
  assert.match(worker, /ON CONFLICT\(user_id,route,window_start\) DO UPDATE/);
  assert.match(worker, /request_count < \?/);
});
test("reward daily cap is enforced in the insert statement", () => {
  assert.match(worker, /SELECT COUNT\(\*\).*AD_REWARD/);
  assert.match(worker, /daily_reward_limit_reached/);
});
test("suspended wallets are checked before reward, spend and redemption mutations", () => {
  assert.match(worker, /activeWallet\.status !== "active"/);
});
test("rate-limit cleanup is scheduled and staging has no routes", () => {
  assert.match(worker, /async scheduled\(/);
  assert.match(wrangler, /workers_dev = false/);
  assert.doesNotMatch(wrangler, /^route\s*=/m);
});
test("browser preflight precedes authenticated wallet access", () => {
  assert.ok(worker.indexOf('request.method === "OPTIONS"') < worker.indexOf('authenticateFirebase(request, env)'));
});
test("no function-shaped environment adapters remain", () => {
  assert.doesNotMatch(worker, /typeof env\.(AUTHENTICATE|VERIFY_AD_REWARD|VERIFY_GAME_GRANT|VERIFY_GAME_EVENT|RATE_LIMITER|AUTHORIZE_MERCHANT_REDEMPTION)/);
});
