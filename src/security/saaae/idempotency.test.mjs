import test from "node:test";
import assert from "node:assert/strict";
import { claimIdempotentOperation, completeIdempotentOperation } from "./idempotency.mjs";

const base = {
  principalId: "agent-01", tenantId: "tenant-a", operation: "wallet.transfer",
  resourceId: "wallet-01", idempotencyKey: "request-key-00000001",
  payload: { amount: 10, currency: "DOUGH" }
};
test("new operation receives a durable claim", async () => {
  const result = await claimIdempotentOperation({
    ...base, store: { claimAtomically: async () => ({ status: "claimed", claimId: "claim-1" }) }
  });
  assert.equal(result.ok, true);
  assert.equal(result.status, "claimed");
});
test("exact replay returns stored outcome without a new claim", async () => {
  const result = await claimIdempotentOperation({
    ...base, store: { claimAtomically: async () => ({ status: "replay", outcome: { balance: 90 } }) }
  });
  assert.deepEqual(result.outcome, { balance: 90 });
});
test("changed payload is reported as conflict by durable adapter", async () => {
  const result = await claimIdempotentOperation({
    ...base, payload: { amount: 900 }, store: { claimAtomically: async () => ({ status: "conflict" }) }
  });
  assert.equal(result.reason, "IDEMPOTENCY_PAYLOAD_CONFLICT");
});
test("in-progress operation is not executed a second time", async () => {
  const result = await claimIdempotentOperation({
    ...base, store: { claimAtomically: async () => ({ status: "in_progress" }) }
  });
  assert.equal(result.status, "in_progress");
});
test("missing durable store fails closed", async () => {
  const result = await claimIdempotentOperation({ ...base });
  assert.equal(result.reason, "IDEMPOTENCY_STORE_UNAVAILABLE");
});
test("invalid idempotency key is rejected", async () => {
  const result = await claimIdempotentOperation({
    ...base, idempotencyKey: "short", store: { claimAtomically: async () => ({ status: "claimed", claimId: "x" }) }
  });
  assert.equal(result.reason, "IDEMPOTENCY_SCOPE_INVALID");
});
test("durable completion requires committed confirmation", async () => {
  const result = await completeIdempotentOperation({
    store: { completeAtomically: async () => true }, claimId: "claim-1",
    payloadDigest: "a".repeat(64), outcome: { ok: true }
  });
  assert.equal(result.ok, true);
});
test("unconfirmed completion fails closed", async () => {
  const result = await completeIdempotentOperation({
    store: { completeAtomically: async () => false }, claimId: "claim-1",
    payloadDigest: "a".repeat(64), outcome: { ok: true }
  });
  assert.equal(result.reason, "IDEMPOTENCY_COMPLETION_NOT_COMMITTED");
});
