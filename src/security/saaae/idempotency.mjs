import { digestCanonicalJson } from "./canonical.mjs";

const SAFE_KEY = /^[A-Za-z0-9_-]{16,128}$/;

function required(value) {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Reserve one exact operation in a durable store.
 *
 * claimAtomically must enforce a unique key over principal + tenant + operation
 * + resource, compare the payload digest, and return one of:
 * {status:"claimed", claimId}, {status:"replay", outcome},
 * {status:"in_progress"}, or {status:"conflict"}.
 * A local cache is not a compliant adapter.
 */
export async function claimIdempotentOperation({
  store, principalId, tenantId, operation, resourceId, idempotencyKey, payload,
  now = new Date(), cryptoImpl = globalThis.crypto
} = {}) {
  if (!store || typeof store.claimAtomically !== "function") {
    return { ok: false, reason: "IDEMPOTENCY_STORE_UNAVAILABLE" };
  }
  if (![principalId, tenantId, operation, resourceId].every(required)
    || typeof idempotencyKey !== "string" || !SAFE_KEY.test(idempotencyKey)) {
    return { ok: false, reason: "IDEMPOTENCY_SCOPE_INVALID" };
  }
  let payloadDigest;
  try { payloadDigest = await digestCanonicalJson(payload, cryptoImpl); }
  catch { return { ok: false, reason: "IDEMPOTENCY_PAYLOAD_INVALID" }; }

  let result;
  try {
    result = await store.claimAtomically({
      scope: { principalId, tenantId, operation, resourceId },
      idempotencyKey,
      payloadDigest,
      requestedAt: (now instanceof Date ? now : new Date(now)).toISOString()
    });
  } catch {
    return { ok: false, reason: "IDEMPOTENCY_STORE_UNAVAILABLE" };
  }

  if (result?.status === "claimed" && required(result.claimId)) {
    return { ok: true, status: "claimed", claimId: result.claimId, payloadDigest };
  }
  if (result?.status === "replay" && Object.hasOwn(result, "outcome")) {
    return { ok: true, status: "replay", outcome: result.outcome, payloadDigest };
  }
  if (result?.status === "in_progress") return { ok: false, status: "in_progress", reason: "IDEMPOTENT_OPERATION_IN_PROGRESS" };
  if (result?.status === "conflict") return { ok: false, reason: "IDEMPOTENCY_PAYLOAD_CONFLICT" };
  return { ok: false, reason: "IDEMPOTENCY_STORE_RESPONSE_INVALID" };
}

export async function completeIdempotentOperation({ store, claimId, payloadDigest, outcome, completedAt = new Date() } = {}) {
  if (!store || typeof store.completeAtomically !== "function"
    || !required(claimId) || !/^[a-f0-9]{64}$/.test(payloadDigest || "")) {
    return { ok: false, reason: "IDEMPOTENCY_COMPLETION_CONTEXT_INVALID" };
  }
  try {
    const committed = await store.completeAtomically({
      claimId,
      payloadDigest,
      outcome,
      completedAt: (completedAt instanceof Date ? completedAt : new Date(completedAt)).toISOString()
    });
    return committed === true
      ? { ok: true }
      : { ok: false, reason: "IDEMPOTENCY_COMPLETION_NOT_COMMITTED" };
  } catch {
    return { ok: false, reason: "IDEMPOTENCY_STORE_UNAVAILABLE" };
  }
}
