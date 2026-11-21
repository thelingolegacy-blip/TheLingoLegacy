import { digestCanonicalJson } from "./canonical.mjs";

export const AUDIT_GENESIS_HASH = "0".repeat(64);

const REQUIRED_EVENT_FIELDS = [
  "eventId", "schemaVersion", "occurredAt", "actorPrincipalId", "actorPrincipalType",
  "eventType", "action", "resourceId", "tenantId", "productDomain", "environment",
  "requestId", "authorizationDecision", "policyVersion", "outcome"
];

function isNonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export async function createAuditEnvelope(event, previousHash = AUDIT_GENESIS_HASH, cryptoImpl = globalThis.crypto) {
  if (!event || typeof event !== "object" || Array.isArray(event)
    || REQUIRED_EVENT_FIELDS.some(field => !isNonEmpty(event[field]))) {
    throw new TypeError("AUDIT_EVENT_SCHEMA_INVALID");
  }
  if (!Number.isFinite(Date.parse(event.occurredAt)) || !/(Z|[+-]\\d{2}:\\d{2})$/.test(event.occurredAt)) {
    throw new TypeError("AUDIT_TIMESTAMP_INVALID");
  }
  if (!/^[a-f0-9]{64}$/.test(previousHash)) throw new TypeError("AUDIT_PREVIOUS_HASH_INVALID");
  const immutableEvent = structuredClone(event);
  const hash = await digestCanonicalJson({ previousHash, event: immutableEvent }, cryptoImpl);
  return Object.freeze({ ...immutableEvent, previousHash, hash });
}

/**
 * Durable adapter contract: appendAtomically(envelope, expectedPreviousHash)
 * must compare the current chain head with expectedPreviousHash and atomically
 * append the event, integrity metadata, and monotonic sequence. If the head
 * changed, it must return committed:false without writing so the caller can
 * reload the head and rebuild the envelope. No update/delete API is exposed.
 */
export async function appendAuditEvent({ writer, event, previousHash = AUDIT_GENESIS_HASH, cryptoImpl = globalThis.crypto } = {}) {
  if (!writer || typeof writer.appendAtomically !== "function") {
    throw new Error("AUDIT_WRITER_UNAVAILABLE");
  }
  const envelope = await createAuditEnvelope(event, previousHash, cryptoImpl);
  const result = await writer.appendAtomically(envelope, previousHash);
  if (!result || result.committed !== true || !Number.isSafeInteger(result.sequence) || result.sequence < 1
    || (result.hash !== undefined && result.hash !== envelope.hash)) {
    throw new Error("AUDIT_APPEND_NOT_DURABLY_CONFIRMED");
  }
  return { ...envelope, sequence: result.sequence };
}

export async function verifyAuditChain(events, cryptoImpl = globalThis.crypto) {
  if (!Array.isArray(events)) return { ok: false, reason: "AUDIT_CHAIN_NOT_ARRAY", verified: 0 };
  let previousHash = AUDIT_GENESIS_HASH;
  for (let index = 0; index < events.length; index += 1) {
    const stored = events[index];
    if (!stored || stored.previousHash !== previousHash || !/^[a-f0-9]{64}$/.test(stored.hash || "")) {
      return { ok: false, reason: "AUDIT_CHAIN_LINK_INVALID", verified: index };
    }
    const { previousHash: link, hash, sequence, ...event } = stored;
    let expectedHash;
    try { expectedHash = await digestCanonicalJson({ previousHash: link, event }, cryptoImpl); }
    catch { return { ok: false, reason: "AUDIT_EVENT_INVALID", verified: index }; }
    if (expectedHash !== hash) return { ok: false, reason: "AUDIT_EVENT_TAMPERED", verified: index };
    if (sequence !== undefined && sequence !== index + 1) {
      return { ok: false, reason: "AUDIT_SEQUENCE_GAP", verified: index };
    }
    previousHash = hash;
  }
  return { ok: true, reason: "AUDIT_CHAIN_VALID", verified: events.length, headHash: previousHash };
}

export { REQUIRED_EVENT_FIELDS as AUDIT_REQUIRED_EVENT_FIELDS };
