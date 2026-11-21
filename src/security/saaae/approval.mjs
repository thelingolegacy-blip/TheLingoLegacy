import { canonicalizeJson, digestCanonicalJson } from "./canonical.mjs";

const REQUIRED_FIELDS = [
  "approvalId", "requestId", "requesterPrincipalId", "approverPrincipalId",
  "approverPrincipalType", "operation", "resourceId", "tenantId", "productDomain",
  "environment", "payloadDigest", "policyVersion", "issuedAt", "expiresAt",
  "status", "nonce", "keyId", "signature"
];

function nonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function parseTime(value) {
  if (!nonEmpty(value)) return NaN;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : NaN;
}

export function canonicalApprovalPayload(approval) {
  if (!approval || typeof approval !== "object" || Array.isArray(approval)) {
    throw new TypeError("APPROVAL_SCHEMA_INVALID");
  }
  const { signature, ...unsigned } = approval;
  if (!nonEmpty(signature)) throw new TypeError("APPROVAL_SIGNATURE_MISSING");
  return canonicalizeJson(unsigned);
}

export async function bindApprovalPayload(payload, cryptoImpl = globalThis.crypto) {
  return digestCanonicalJson(payload, cryptoImpl);
}

/**
 * Verify and atomically consume a human approval for one exact action.
 *
 * The store adapter MUST implement consumeAtomically as a durable, transactional
 * compare-and-set on approval status and nonce. A process-local map is not valid.
 * The signatureVerifier MUST verify canonicalApprovalPayload(approval) against
 * an independently pinned approver key. The record keyId is only a lookup hint;
 * the adapter must compare it to trusted server-side key configuration.
 */
export async function verifyAndConsumeApproval({
  approval,
  expected,
  requester,
  now = new Date(),
  signatureVerifier,
  revalidateApprover,
  approvalStore,
  cryptoImpl = globalThis.crypto
} = {}) {
  const reject = reason => ({ ok: false, reason });
  if (!approval || typeof approval !== "object" || Array.isArray(approval)
    || Object.keys(approval).sort().join("|") !== [...REQUIRED_FIELDS].sort().join("|")) {
    return reject("APPROVAL_SCHEMA_INVALID");
  }
  if (!expected || typeof expected !== "object" || !requester || !nonEmpty(requester.id)
    || !["human", "service", "agent"].includes(requester.type)) return reject("EXECUTION_CONTEXT_INVALID");
  if (!nonEmpty(approval.approvalId) || !nonEmpty(approval.requestId)
    || !nonEmpty(approval.requesterPrincipalId) || !nonEmpty(approval.approverPrincipalId)
    || approval.approverPrincipalType !== "human"
    || !nonEmpty(approval.operation) || !nonEmpty(approval.resourceId)
    || !nonEmpty(approval.tenantId) || !nonEmpty(approval.productDomain)
    || !nonEmpty(approval.environment) || !/^[a-f0-9]{64}$/.test(approval.payloadDigest)
    || !nonEmpty(approval.policyVersion) || !nonEmpty(approval.nonce)
    || !nonEmpty(approval.keyId) || !nonEmpty(approval.signature)) {
    return reject("APPROVAL_FIELDS_INVALID");
  }
  if (approval.status !== "approved") return reject("APPROVAL_NOT_APPROVED");
  if (approval.requesterPrincipalId !== requester.id) return reject("APPROVAL_REQUESTER_MISMATCH");
  if (!nonEmpty(expected.requestId) || approval.requestId !== expected.requestId) return reject("APPROVAL_REQUEST_ID_MISMATCH");
  if (approval.approverPrincipalId === approval.requesterPrincipalId
    && expected.requireSeparationOfDuties === true) return reject("SELF_APPROVAL_FORBIDDEN");
  if (expected.requireHumanApprover !== false && approval.approverPrincipalType !== "human") {
    return reject("HUMAN_APPROVER_REQUIRED");
  }

  const exactFields = ["operation", "resourceId", "tenantId", "productDomain", "environment", "policyVersion"];
  for (const field of exactFields) {
    if (!nonEmpty(expected[field]) || approval[field] !== expected[field]) {
      return reject("APPROVAL_BINDING_MISMATCH:" + field);
    }
  }

  let payloadDigest;
  try {
    payloadDigest = await bindApprovalPayload(expected.payload, cryptoImpl);
  } catch {
    return reject("PAYLOAD_CANONICALIZATION_FAILED");
  }
  if (payloadDigest !== approval.payloadDigest) return reject("APPROVAL_PAYLOAD_MISMATCH");

  const nowMs = now instanceof Date ? now.getTime() : parseTime(now);
  const issuedMs = parseTime(approval.issuedAt);
  const expiresMs = parseTime(approval.expiresAt);
  if (![nowMs, issuedMs, expiresMs].every(Number.isFinite)
    || issuedMs > nowMs + 60_000 || expiresMs <= nowMs
    || expiresMs <= issuedMs || expiresMs - issuedMs > 24 * 60 * 60 * 1000) {
    return reject("APPROVAL_TIME_INVALID_OR_EXPIRED");
  }

  if (typeof signatureVerifier !== "function"
    || typeof revalidateApprover !== "function"
    || !approvalStore || typeof approvalStore.consumeAtomically !== "function") {
    return reject("APPROVAL_VERIFICATION_DEPENDENCY_UNAVAILABLE");
  }

  let signatureValid = false;
  try { signatureValid = await signatureVerifier(approval); } catch { return reject("APPROVAL_SIGNATURE_CHECK_FAILED"); }
  if (signatureValid !== true) return reject("APPROVAL_SIGNATURE_INVALID");

  let approverStillAuthorized = false;
  try {
    approverStillAuthorized = await revalidateApprover({
      approverPrincipalId: approval.approverPrincipalId,
      operation: approval.operation,
      resourceId: approval.resourceId,
      tenantId: approval.tenantId,
      productDomain: approval.productDomain,
      policyVersion: approval.policyVersion
    });
  } catch { return reject("APPROVER_AUTHORITY_UNAVAILABLE"); }
  if (approverStillAuthorized !== true) return reject("APPROVER_NO_LONGER_AUTHORIZED");

  let consumed;
  try {
    consumed = await approvalStore.consumeAtomically({
      approvalId: approval.approvalId,
      expectedStatus: "approved",
      nonce: approval.nonce,
      consumedAt: new Date(nowMs).toISOString(),
      expectedBinding: {
        requesterPrincipalId: approval.requesterPrincipalId,
        operation: approval.operation,
        resourceId: approval.resourceId,
        tenantId: approval.tenantId,
        productDomain: approval.productDomain,
        environment: approval.environment,
        payloadDigest: approval.payloadDigest,
        policyVersion: approval.policyVersion
      }
    });
  } catch { return reject("APPROVAL_CONSUMPTION_UNAVAILABLE"); }
  if (consumed !== true) return reject("APPROVAL_ALREADY_CONSUMED_OR_CHANGED");

  return { ok: true, approvalId: approval.approvalId, approverPrincipalId: approval.approverPrincipalId };
}

export { REQUIRED_FIELDS as APPROVAL_REQUIRED_FIELDS };
