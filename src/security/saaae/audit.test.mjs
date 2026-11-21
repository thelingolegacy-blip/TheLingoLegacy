import test from "node:test";
import assert from "node:assert/strict";
import { appendAuditEvent, createAuditEnvelope, verifyAuditChain, verifyAuditCheckpoint, AUDIT_GENESIS_HASH } from "./audit.mjs";

const base = {
  eventId: "event-001",
  schemaVersion: "saaae.audit.v1",
  occurredAt: "2026-11-21T18:00:00.000Z",
  actorPrincipalId: "human-01",
  actorPrincipalType: "human",
  eventType: "authorization.decision",
  action: "wallet.read",
  resourceId: "wallet-01",
  tenantId: "tenant-a",
  productDomain: "LINGOlegacy",
  environment: "staging",
  requestId: "request-001",
  authorizationDecision: "ALLOW",
  policyVersion: "policy-v1",
  outcome: "allowed"
};

test("audit envelope is hash linked to the genesis value", async () => {
  const first = await createAuditEnvelope(base);
  assert.equal(first.previousHash, AUDIT_GENESIS_HASH);
  assert.equal((await verifyAuditChain([first])).ok, true);
});
test("audit chain verifies multiple linked events", async () => {
  const first = await createAuditEnvelope(base);
  const second = await createAuditEnvelope({ ...base, eventId: "event-002" }, first.hash);
  const result = await verifyAuditChain([first, second]);
  assert.equal(result.ok, true);
  assert.equal(result.verified, 2);
});
test("modified event content is detected", async () => {
  const first = await createAuditEnvelope(base);
  const tampered = { ...first, outcome: "modified" };
  assert.equal((await verifyAuditChain([tampered])).reason, "AUDIT_EVENT_TAMPERED");
});
test("broken previous-hash link is detected", async () => {
  const first = await createAuditEnvelope(base);
  const second = await createAuditEnvelope({ ...base, eventId: "event-002" }, first.hash);
  second.previousHash = "f".repeat(64);
  assert.equal((await verifyAuditChain([first, second])).reason, "AUDIT_CHAIN_LINK_INVALID");
});
test("sequence gaps are detected", async () => {
  const first = await createAuditEnvelope(base);
  assert.equal((await verifyAuditChain([{ ...first, sequence: 2 }])).reason, "AUDIT_SEQUENCE_GAP");
});
test("malformed audit event is rejected", async () => {
  await assert.rejects(() => createAuditEnvelope({ ...base, requestId: "" }), /AUDIT_EVENT_SCHEMA_INVALID/);
});
test("missing audit writer fails closed", async () => {
  await assert.rejects(() => appendAuditEvent({ event: base }), /AUDIT_WRITER_UNAVAILABLE/);
});
test("unconfirmed durable append fails closed", async () => {
  await assert.rejects(() => appendAuditEvent({
    event: base,
    writer: { appendAtomically: async () => ({ committed: false }) }
  }), /AUDIT_APPEND_NOT_DURABLY_CONFIRMED/);
});
test("confirmed append returns server-assigned sequence", async () => {
  const stored = await appendAuditEvent({
    event: base,
    writer: { appendAtomically: async () => ({ committed: true, sequence: 7 }) }
  });
  assert.equal(stored.sequence, 7);
});

test("signed checkpoint anchors the verified chain head", async () => {
  const first = await createAuditEnvelope(base);
  const chainResult = await verifyAuditChain([{ ...first, sequence: 1 }]);
  const checkpoint = { sequence: 1, headHash: first.hash, keyId: "audit-key-01", signature: "signature" };
  const result = await verifyAuditCheckpoint({
    checkpoint, expectedKeyId: "audit-key-01", chainResult,
    signatureVerifier: async ({ expectedKeyId }) => expectedKeyId === "audit-key-01"
  });
  assert.equal(result.ok, true);
});
test("checkpoint signature failure is detected", async () => {
  const first = await createAuditEnvelope(base);
  const chainResult = await verifyAuditChain([{ ...first, sequence: 1 }]);
  const checkpoint = { sequence: 1, headHash: first.hash, keyId: "audit-key-01", signature: "bad" };
  const result = await verifyAuditCheckpoint({
    checkpoint, expectedKeyId: "audit-key-01", chainResult,
    signatureVerifier: async () => false
  });
  assert.equal(result.reason, "AUDIT_CHECKPOINT_SIGNATURE_INVALID");
});
test("checkpoint cannot be substituted for another chain head", async () => {
  const first = await createAuditEnvelope(base);
  const chainResult = await verifyAuditChain([{ ...first, sequence: 1 }]);
  const checkpoint = { sequence: 1, headHash: "f".repeat(64), keyId: "audit-key-01", signature: "signature" };
  const result = await verifyAuditCheckpoint({
    checkpoint, expectedKeyId: "audit-key-01", chainResult,
    signatureVerifier: async () => true
  });
  assert.equal(result.reason, "AUDIT_CHECKPOINT_INVALID");
});
