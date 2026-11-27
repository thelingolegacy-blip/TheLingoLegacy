import test from "node:test";
import assert from "node:assert/strict";
import { createFirestoreSaaaeAdapters } from "./firestore-adapters.mjs";
import { AUDIT_GENESIS_HASH } from "./audit.mjs";

function fakeFirestore(seed = {}) {
  const records = new Map(Object.entries(seed));
  const ref = path => ({
    path,
    async get() { const value = records.get(path); return { exists: value !== undefined, data: () => value }; }
  });
  const db = {
    doc: path => ref(path),
    collection: path => ({ doc: id => ref(`${path}/${id}`) }),
    async runTransaction(callback) {
      const writes = [];
      const tx = {
        async get(documentRef) {
          const value = records.get(documentRef.path);
          return { exists: value !== undefined, data: () => value };
        },
        create(documentRef, value) {
          if (records.has(documentRef.path)) throw new Error("ALREADY_EXISTS");
          writes.push(() => records.set(documentRef.path, value));
        },
        set(documentRef, value) { writes.push(() => records.set(documentRef.path, value)); },
        update(documentRef, value) {
          writes.push(() => {
            if (!records.has(documentRef.path)) throw new Error("NOT_FOUND");
            records.set(documentRef.path, { ...records.get(documentRef.path), ...value });
          });
        }
      };
      const result = await callback(tx);
      for (const write of writes) write();
      return result;
    }
  };
  return { db, records };
}

const FieldValue = { serverTimestamp: () => "SERVER_TIMESTAMP" };
const scope = { principalId: "user-1", tenantId: "tenant-1", operation: "oasis.purchase", resourceId: "item-1" };

test("Firestore audit adapter atomically advances one hash-chain head", async () => {
  const { db, records } = fakeFirestore();
  const { auditWriter } = createFirestoreSaaaeAdapters({ db, FieldValue });
  const envelope = { eventId: "event-1", previousHash: AUDIT_GENESIS_HASH, hash: "a".repeat(64) };
  const committed = await auditWriter.appendAtomically(envelope, AUDIT_GENESIS_HASH);
  assert.deepEqual(committed, { committed: true, sequence: 1, hash: envelope.hash });
  assert.equal(records.get("security/saaae_v1/auditHeads/global").sequence, 1);
  const conflict = await auditWriter.appendAtomically({ ...envelope, hash: "b".repeat(64) }, AUDIT_GENESIS_HASH);
  assert.equal(conflict.committed, false);
});

test("Firestore approval adapter consumes an exact approved binding once", async () => {
  const approval = {
    status: "approved", nonce: "nonce-1", requesterPrincipalId: "user-1",
    operation: "oasis.purchase", resourceId: "item-1", tenantId: "tenant-1",
    productDomain: "lingoarcade", environment: "staging", payloadDigest: "c".repeat(64),
    policyVersion: "v1"
  };
  const { db, records } = fakeFirestore({ "security/saaae_v1/approvals/approval-1": approval });
  const { approvalStore } = createFirestoreSaaaeAdapters({ db, FieldValue });
  const args = {
    approvalId: "approval-1", expectedStatus: "approved", nonce: "nonce-1",
    consumedAt: "2026-11-21T00:00:00.000Z",
    expectedBinding: {
      requestId: "request-1",
      requesterPrincipalId: "user-1",
      approverPrincipalId: "human-2",
      approverPrincipalType: "human",
      operation: "oasis.purchase", resourceId: "item-1",
      tenantId: "tenant-1", productDomain: "lingoarcade", environment: "staging",
      payloadDigest: "c".repeat(64), policyVersion: "v1",
      issuedAt: "2026-11-21T00:00:00.000Z",
      expiresAt: "2026-11-22T00:00:00.000Z",
      keyId: "pinned-human-key-2",
      signature: "signed-envelope"
    }
  };
  assert.equal(await approvalStore.consumeAtomically({
    ...args,
    expectedBinding: { ...args.expectedBinding, approverPrincipalId: "attacker" }
  }), false);
  assert.equal(await approvalStore.consumeAtomically({
    ...args,
    expectedBinding: { ...args.expectedBinding, expiresAt: "2099-01-01T00:00:00.000Z" }
  }), false);
  assert.equal(records.get("security/saaae_v1/approvals/approval-1").status, "approved");
  assert.equal(await approvalStore.consumeAtomically(args), true);
  assert.equal(await approvalStore.consumeAtomically(args), false);
  assert.equal(records.get("security/saaae_v1/approvals/approval-1").status, "consumed");
});

test("Firestore idempotency adapter rejects changed payload and replays completed outcome", async () => {
  const { db } = fakeFirestore();
  const { idempotencyStore } = createFirestoreSaaaeAdapters({ db, FieldValue });
  const claim = {
    scope, idempotencyKey: "0123456789abcdef", payloadDigest: "d".repeat(64),
    requestedAt: "2026-11-21T00:00:00.000Z"
  };
  const first = await idempotencyStore.claimAtomically(claim);
  assert.equal(first.status, "claimed");
  assert.equal((await idempotencyStore.claimAtomically(claim)).status, "in_progress");
  assert.equal((await idempotencyStore.claimAtomically({ ...claim, payloadDigest: "e".repeat(64) })).status, "conflict");
  assert.equal(await idempotencyStore.completeAtomically({
    claimId: first.claimId, payloadDigest: claim.payloadDigest, outcome: { ok: true, balance: 80 },
    completedAt: "2026-11-21T00:01:00.000Z"
  }), true);
  const replay = await idempotencyStore.claimAtomically(claim);
  assert.equal(replay.status, "replay");
  assert.deepEqual(replay.outcome, { ok: true, balance: 80 });
});
