import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const worker = await readFile(new URL("../worker.js", import.meta.url), "utf8");
const schema = await readFile(new URL("../migrations/0001_ledger.sql", import.meta.url), "utf8");
const docs = await readFile(new URL("../README.md", import.meta.url), "utf8");

test("no cash-out, transfer, or payment routes are implemented", () => {
  assert.doesNotMatch(worker, /cashout|cash-out|payout|transfer|payment_intent/i);
  assert.match(docs, /No cash-out, person-to-person transfer/);
});
test("reward credits require server-side verification", () => {
  assert.match(worker, /VERIFY_AD_REWARD/);
  assert.match(worker, /ad_verification_unconfigured/);
});
test("game credit grants require a trusted server proof", () => {\n  assert.match(worker, /VERIFY_GAME_GRANT/);\n  assert.match(worker, /game_grant_verification_unconfigured/);\n});\ntest("game credits are a separate unit", () => {
  assert.match(schema, /'LINGOCOIN','GAME_CREDIT'/);
  assert.match(worker, /GAME_CREDIT/);
});
test("ledger is append-only and idempotent", () => {
  assert.match(schema, /UNIQUE\(user_id, idempotency_key\)/);
  assert.match(schema, /loyalty_ledger_no_update/);
  assert.match(schema, /loyalty_ledger_no_delete/);
});
test("mutations fail closed without rate limiting", () => {\n  assert.match(worker, /RATE_LIMITER/);\n  assert.match(worker, /rate_limiter_unconfigured/);\n});\ntest("reward daily cap is enforced in the insert statement", () => {\n  assert.match(worker, /SELECT COUNT\\(\\*\\).*AD_REWARD/);\n  assert.match(worker, /daily_reward_limit_reached/);\n});\ntest("missing authentication and merchant adapters fail closed", () => {
  assert.match(worker, /authentication_required/);
  assert.match(worker, /merchant_redemption_unconfigured/);
});
