import { digestCanonicalJson } from "./canonical.mjs";
import { AUDIT_GENESIS_HASH } from "./audit.mjs";

/**
 * Firestore Admin SDK adapter factory for SAAAE.
 *
 * Pass a server-only firebase-admin Firestore instance and FieldValue export.
 * This module does not initialize Firebase, select a project, deploy rules, or
 * grant IAM. The caller must provide a verified non-production project and
 * least-privilege service identity before constructing these adapters.
 *
 * Required IAM boundary:
 * - auditEvents: create/read only for the writer; no update/delete permission;
 * - auditHeads: read/write only for the dedicated audit writer;
 * - approvals: read/update only for the approval consumer; approval issuance
 *   belongs to a separately authorized workflow;
 * - idempotency: read/create/update only for the operation service.
 * Firestore Admin SDK bypasses Firestore Security Rules; IAM and service
 * account separation are mandatory. Use an independent signed checkpoint
 * export for protection against privileged project administrators.
 */

const SAFE_SEGMENT = /^[A-Za-z0-9_-]{1,80}$/;

function assertDb(db, FieldValue, namespace) {
  if (!db || typeof db.doc !== "function" || typeof db.runTransaction !== "function"
    || !FieldValue || typeof FieldValue.serverTimestamp !== "function"
    || typeof namespace !== "string" || !SAFE_SEGMENT.test(namespace)) {
    throw new TypeError("SAAAE_FIRESTORE_ADAPTER_CONFIGURATION_INVALID");
  }
}

function safeId(value, code) {
  if (typeof value !== "string" || !SAFE_SEGMENT.test(value)) throw new TypeError(code);
  return value;
}

function bindingMatches(record, expected) {
  return Object.entries(expected).every(([key, value]) => record[key] === value);
}

export function createFirestoreSaaaeAdapters({ db, FieldValue, namespace = "saaae_v1" } = {}) {
  assertDb(db, FieldValue, namespace);

  const auditHeadRef = db.doc(`security/${namespace}/auditHeads/global`);
  const auditEvents = db.collection(`security/${namespace}/auditEvents`);
  const approvals = db.collection(`security/${namespace}/approvals`);
  const idempotency = db.collection(`security/${namespace}/idempotency`);

  const auditWriter = Object.freeze({
    async appendAtomically(envelope, expectedPreviousHash) {
      if (!envelope || envelope.previousHash !== expectedPreviousHash
        || !/^[a-f0-9]{64}$/.test(envelope.hash || "")
        || !/^[a-f0-9]{64}$/.test(expectedPreviousHash || "")) {
        throw new TypeError("SAAAE_AUDIT_ENVELOPE_INVALID");
      }
      return db.runTransaction(async tx => {
        const headSnap = await tx.get(auditHeadRef);
        const head = headSnap.exists ? headSnap.data() : { sequence: 0, headHash: AUDIT_GENESIS_HASH };
        const currentHash = head.headHash || AUDIT_GENESIS_HASH;
        const currentSequence = head.sequence || 0;
        if (currentHash !== expectedPreviousHash) return { committed: false, sequence: currentSequence, hash: currentHash };
        if (!Number.isSafeInteger(currentSequence) || currentSequence < 0) {
          throw new Error("SAAAE_AUDIT_HEAD_INVALID");
        }
        const sequence = currentSequence + 1;
        const eventRef = auditEvents.doc(String(sequence).padStart(16, "0"));
        tx.create(eventRef, {
          ...envelope,
          sequence,
          persistedAt: FieldValue.serverTimestamp()
        });
        tx.set(auditHeadRef, {
          sequence,
          headHash: envelope.hash,
          updatedAt: FieldValue.serverTimestamp()
        });
        return { committed: true, sequence, hash: envelope.hash };
      });
    }
  });

  const approvalStore = Object.freeze({
    async consumeAtomically({ approvalId, expectedStatus, nonce, consumedAt, expectedBinding }) {
      safeId(approvalId, "SAAAE_APPROVAL_ID_INVALID");
      if (expectedStatus !== "approved" || typeof nonce !== "string" || !nonce
        || !expectedBinding || typeof expectedBinding !== "object") return false;
      const ref = approvals.doc(approvalId);
      return db.runTransaction(async tx => {
        const snap = await tx.get(ref);
        if (!snap.exists) return false;
        const record = snap.data();
        if (record.status !== expectedStatus || record.nonce !== nonce
          || !bindingMatches(record, expectedBinding)) return false;
        tx.update(ref, {
          status: "consumed",
          consumedAt: FieldValue.serverTimestamp(),
          consumedAtRequested: consumedAt
        });
        return true;
      });
    }
  });

  const idempotencyStore = Object.freeze({
    async claimAtomically({ scope, idempotencyKey, payloadDigest, requestedAt }) {
      if (!scope || !["principalId", "tenantId", "operation", "resourceId"].every(k => typeof scope[k] === "string" && scope[k])
        || typeof idempotencyKey !== "string" || !/^[A-Za-z0-9_-]{16,128}$/.test(idempotencyKey)
        || !/^[a-f0-9]{64}$/.test(payloadDigest || "")) {
        throw new TypeError("SAAAE_IDEMPOTENCY_CLAIM_INVALID");
      }
      const claimId = await digestCanonicalJson({ namespace, scope, idempotencyKey });
      const ref = idempotency.doc(claimId);
      return db.runTransaction(async tx => {
        const snap = await tx.get(ref);
        if (snap.exists) {
          const prior = snap.data();
          if (prior.payloadDigest !== payloadDigest) return { status: "conflict" };
          if (prior.status === "completed" && Object.hasOwn(prior, "outcome")) {
            return { status: "replay", outcome: prior.outcome };
          }
          return { status: "in_progress" };
        }
        tx.create(ref, {
          claimId,
          namespace,
          scope,
          idempotencyKey,
          payloadDigest,
          status: "in_progress",
          requestedAt,
          createdAt: FieldValue.serverTimestamp()
        });
        return { status: "claimed", claimId };
      });
    },

    async completeAtomically({ claimId, payloadDigest, outcome, completedAt }) {
      safeId(claimId, "SAAAE_IDEMPOTENCY_CLAIM_ID_INVALID");
      if (!/^[a-f0-9]{64}$/.test(payloadDigest || "")) return false;
      const ref = idempotency.doc(claimId);
      return db.runTransaction(async tx => {
        const snap = await tx.get(ref);
        if (!snap.exists) return false;
        const prior = snap.data();
        if (prior.status !== "in_progress" || prior.payloadDigest !== payloadDigest) return false;
        tx.update(ref, {
          status: "completed",
          outcome,
          completedAt,
          persistedAt: FieldValue.serverTimestamp()
        });
        return true;
      });
    }
  });

  return Object.freeze({ auditWriter, approvalStore, idempotencyStore });
}
