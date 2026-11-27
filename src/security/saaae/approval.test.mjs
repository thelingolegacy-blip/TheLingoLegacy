import test from "node:test";
import assert from "node:assert/strict";
import { bindApprovalPayload, verifyAndConsumeApproval } from "./approval.mjs";

const now = new Date("2026-11-21T18:00:00.000Z");
const payload = { amount: 50, currency: "DOUGH", destination: "wallet-2" };
const expectedBase = {
  requestId: "request-001",
  operation: "wallet.transfer",
  resourceId: "wallet-1",
  tenantId: "tenant-a",
  productDomain: "LINGOlegacy",
  environment: "staging",
  policyVersion: "policy-v1",
  payload,
  requireHumanApprover: true,
  requireSeparationOfDuties: true
};
async function fixture(overrides = {}) {
  const approval = {
    approvalId: "approval-001",
    requestId: "request-001",
    requesterPrincipalId: "agent-01",
    approverPrincipalId: "human-02",
    approverPrincipalType: "human",
    operation: expectedBase.operation,
    resourceId: expectedBase.resourceId,
    tenantId: expectedBase.tenantId,
    productDomain: expectedBase.productDomain,
    environment: expectedBase.environment,
    payloadDigest: await bindApprovalPayload(payload),
    policyVersion: expectedBase.policyVersion,
    issuedAt: "2026-11-21T17:00:00.000Z",
    expiresAt: "2026-11-21T19:00:00.000Z",
    status: "approved",
    nonce: "nonce-001",
    keyId: "pinned-human-key-02",
    signature: "signed-envelope",
    ...overrides
  };
  let consumed = false;
  const approvalStore = {
    async consumeAtomically(input) {
      if (consumed || input.expectedStatus !== "approved") return false;
      consumed = true;
      return true;
    }
  };
  const args = {
    approval,
    expected: expectedBase,
    requester: { id: "agent-01", type: "agent" },
    now,
    signatureVerifier: async () => true,
    revalidateApprover: async () => true,
    approvalStore
  };
  return { args, approval, approvalStore };
}

test("valid human approval is verified and atomically consumed", async () => {
  const { args } = await fixture();
  const result = await verifyAndConsumeApproval(args);
  assert.equal(result.ok, true);
  assert.equal(result.approverPrincipalId, "human-02");
});
test("changed payload is rejected", async () => {
  const { args } = await fixture();
  args.expected = { ...args.expected, payload: { ...payload, amount: 500 } };
  assert.equal((await verifyAndConsumeApproval(args)).reason, "APPROVAL_PAYLOAD_MISMATCH");
});
test("approval must match the exact request identifier", async () => {
  const { args } = await fixture();
  args.expected = { ...args.expected, requestId: "request-002" };
  assert.equal((await verifyAndConsumeApproval(args)).reason, "APPROVAL_REQUEST_ID_MISMATCH");
});
test("changed operation is rejected", async () => {
  const { args } = await fixture();
  args.expected = { ...args.expected, operation: "wallet.withdraw" };
  assert.equal((await verifyAndConsumeApproval(args)).reason, "APPROVAL_BINDING_MISMATCH:operation");
});
test("changed tenant is rejected", async () => {
  const { args } = await fixture();
  args.expected = { ...args.expected, tenantId: "tenant-b" };
  assert.equal((await verifyAndConsumeApproval(args)).reason, "APPROVAL_BINDING_MISMATCH:tenantId");
});
test("expired approval is rejected", async () => {
  const { args } = await fixture({ expiresAt: "2026-11-21T17:59:59.000Z" });
  assert.equal((await verifyAndConsumeApproval(args)).reason, "APPROVAL_TIME_INVALID_OR_EXPIRED");
});
test("requester identity mismatch is rejected", async () => {
  const { args } = await fixture();
  args.requester = { id: "different-agent", type: "agent" };
  assert.equal((await verifyAndConsumeApproval(args)).reason, "APPROVAL_REQUESTER_MISMATCH");
});
test("non-human approver is rejected", async () => {
  const { args } = await fixture({ approverPrincipalType: "agent" });
  assert.equal((await verifyAndConsumeApproval(args)).reason, "APPROVAL_FIELDS_INVALID");
});
test("self approval is rejected when separation flag is omitted", async () => {
  const { args } = await fixture({ requesterPrincipalId: "human-02" });
  args.requester = { id: "human-02", type: "human" };
  const { requireSeparationOfDuties: _ignored, ...expected } = args.expected;
  args.expected = expected;
  assert.equal((await verifyAndConsumeApproval(args)).reason, "SELF_APPROVAL_FORBIDDEN");
});

test("self approval is rejected when separation flag is false", async () => {
  const { args } = await fixture({ requesterPrincipalId: "human-02" });
  args.requester = { id: "human-02", type: "human" };
  args.expected = { ...args.expected, requireSeparationOfDuties: false };
  assert.equal((await verifyAndConsumeApproval(args)).reason, "SELF_APPROVAL_FORBIDDEN");
});

test("self approval is rejected when separation flag is true", async () => {
  const { args } = await fixture({ requesterPrincipalId: "human-02" });
  args.requester = { id: "human-02", type: "human" };
  args.expected = { ...args.expected, requireSeparationOfDuties: true };
  assert.equal((await verifyAndConsumeApproval(args)).reason, "SELF_APPROVAL_FORBIDDEN");
});

test("self approval is rejected when separation flag is malformed", async () => {
  const { args } = await fixture({ requesterPrincipalId: "human-02" });
  args.requester = { id: "human-02", type: "human" };
  args.expected = { ...args.expected, requireSeparationOfDuties: "yes" };
  assert.equal((await verifyAndConsumeApproval(args)).reason, "SELF_APPROVAL_FORBIDDEN");
});
test("invalid signature is rejected", async () => {
  const { args } = await fixture();
  args.signatureVerifier = async () => false;
  assert.equal((await verifyAndConsumeApproval(args)).reason, "APPROVAL_SIGNATURE_INVALID");
});
test("approver authority is revalidated at execution time", async () => {
  const { args } = await fixture();
  args.revalidateApprover = async () => false;
  assert.equal((await verifyAndConsumeApproval(args)).reason, "APPROVER_NO_LONGER_AUTHORIZED");
});
test("replayed or changed approval cannot be consumed twice", async () => {
  const { args } = await fixture();
  assert.equal((await verifyAndConsumeApproval(args)).ok, true);
  assert.equal((await verifyAndConsumeApproval(args)).reason, "APPROVAL_ALREADY_CONSUMED_OR_CHANGED");
});
test("missing durable store fails closed", async () => {
  const { args } = await fixture();
  args.approvalStore = null;
  assert.equal((await verifyAndConsumeApproval(args)).reason, "APPROVAL_VERIFICATION_DEPENDENCY_UNAVAILABLE");
});
test("unapproved record is rejected", async () => {
  const { args } = await fixture({ status: "pending" });
  assert.equal((await verifyAndConsumeApproval(args)).reason, "APPROVAL_NOT_APPROVED");
});

test("signature verifier receives canonical unsigned payload and pinned-key metadata", async () => {
  const { args } = await fixture();
  let verificationInput;
  args.signatureVerifier = async input => {
    verificationInput = input;
    return input.keyId === "pinned-human-key-02";
  };
  const result = await verifyAndConsumeApproval(args);
  assert.equal(result.ok, true);
  assert.equal(typeof verificationInput.payload, "string");
  assert.equal(verificationInput.payload.includes('"requestId":"request-001"'), true);
  assert.equal(verificationInput.payload.includes('"signature"'), false);
});
