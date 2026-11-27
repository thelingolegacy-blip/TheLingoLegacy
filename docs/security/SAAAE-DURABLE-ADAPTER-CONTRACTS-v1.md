# SAAAE Durable Adapter Contracts v1

**Status:** Review candidate; adapter requirements only  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Production disposition:** PROTECTED HOLD. No backend project, database, IAM policy, secret, or production resource is selected or changed by this document.

## 1. Purpose

This document defines the minimum durable adapter behavior required before the pure SAAAE primitives can guard a real protected operation. The interfaces in `src/security/saaae/` deliberately depend on injected adapters. A process-local map, browser state, client-side rule, or unverified JWT claim is not a compliant durable adapter.

## 2. Existing Firebase evidence inspected

The current Doughboys Oasis Firebase Functions source establishes these facts:

- Callable functions require `request.auth.uid` for wallet initialization and purchases.
- Firestore client rules deny direct writes to player, wallet, inventory, and ledger documents.
- Firebase Admin SDK transactions perform wallet initialization and purchases on the server.
- Purchase idempotency uses a ledger document under the authenticated player's UID and checks item ID plus reason code before replaying.
- The current purchase handler does not compare a canonical full-payload digest, create an independent approval record, or emit a correlated SAAAE audit intent/outcome.
- Firestore Security Rules do not constrain privileged Firebase Admin SDK writes. Server-side authorization, service-account IAM, transaction boundaries, and audit controls must therefore be enforced independently.

This is a source review, not a live Firebase project inspection or runtime certification. The Firebase project ID, database configuration, IAM roles, deployed function versions, and current production data were not independently verified here.

## 3. ApprovalStore contract

The implementation in `approval.mjs` requires:

```ts
interface ApprovalStore {
  consumeAtomically(input: {
    approvalId: string;
    expectedStatus: "approved";
    nonce: string;
    consumedAt: string; // server-generated UTC
    expectedBinding: {
      requesterPrincipalId: string;
      operation: string;
      resourceId: string;
      tenantId: string;
      productDomain: string;
      environment: string;
      payloadDigest: string;
      policyVersion: string;
    };
  }): Promise<boolean>;
}
```

Adapter requirements:

1. Read the approval record inside a serializable/transactional boundary.
2. Compare every binding field and the current status to the expected values.
3. Verify that the nonce has not already been consumed.
4. Atomically transition `approved` to `consumed` and create the unique nonce-consumption marker.
5. Reject expired, revoked, rejected, modified, missing, or already-consumed records.
6. Ensure concurrent attempts cannot both consume the same approval.
7. Return `true` only after durable commit confirmation. Unknown commit state is failure and must not permit execution.
8. Never let a client or agent write the authoritative approver identity or approval status.
9. Verify the signature using a pinned trusted key configuration; the record's `keyId` is not itself a trust anchor.

The review branch now includes `firestore-adapters.mjs`, which transactionally compares and consumes the approval record. It stores the consumed state on the approval record; a separate nonce-marker collection and trusted issuance/signature-verification workflow remain follow-up requirements. It must use server-side Firebase Admin credentials with separately reviewed least-privilege access. Firestore rules alone do not protect Admin SDK calls.

## 4. AuditWriter contract

The implementation in `audit.mjs` requires:

```ts
interface AuditWriter {
  appendAtomically(
    envelope: AuditEnvelope,
    expectedPreviousHash: string
  ): Promise<{
    committed: boolean;
    sequence?: number;
    hash?: string;
  }>;
}
```

Adapter requirements:

1. Maintain one authoritative chain head per defined audit partition (at minimum tenant and product/domain).
2. Compare `expectedPreviousHash` with the authoritative head and append only when equal.
3. Atomically persist the event, sequence, new head, and integrity metadata.
4. Assign monotonic sequence numbers; reject gaps, duplicate event IDs, stale heads, and conflicting writes.
5. Expose append only to the dedicated writer identity. Ordinary application principals and domain administrators must not update/delete prior events.
6. Provide read-only independent verification access, with sensitive fields redacted according to policy.
7. Produce signed checkpoints using a key held outside the event store. The verifier must pin the expected key ID independently and verify the checkpoint signature and chain-head match.
8. Define retention, backup, restore, legal hold, access review, and alerting for chain breaks or sequence gaps.
9. An unavailable or uncertain audit append blocks a protected side effect.

The review-branch Firestore adapter uses one global chain head as a first integration primitive; tenant/product partitioning, a separate nonce-marker collection, and independent signed-checkpoint export are not yet implemented. A hash chain without a separately protected signed checkpoint is not sufficient against an attacker who can rewrite the entire chain. Firestore Admin SDK access is privileged and bypasses Firestore Security Rules; a Firestore-only design must therefore document IAM separation, privileged operator controls, independent checkpoints, and backup/restore protections. An immutable retention store may be appropriate, but must be selected only after project, cost, retention, and compliance review.

## 5. IdempotencyStore contract

The implementation in `idempotency.mjs` requires:

```ts
interface IdempotencyStore {
  claimAtomically(input: {
    scope: {
      principalId: string;
      tenantId: string;
      operation: string;
      resourceId: string;
    };
    idempotencyKey: string;
    payloadDigest: string;
    requestedAt: string;
  }): Promise<
    | { status: "claimed"; claimId: string }
    | { status: "replay"; outcome: unknown }
    | { status: "in_progress" }
    | { status: "conflict" }
  >;

  completeAtomically(input: {
    claimId: string;
    payloadDigest: string;
    outcome: unknown;
    completedAt: string;
  }): Promise<boolean>;
}
```

Adapter requirements:

- Enforce a durable uniqueness constraint across principal, tenant, operation, resource, and idempotency key.
- Exact replay returns the stored outcome and never repeats the side effect.
- Same key with a different payload digest is a conflict.
- Concurrent requests cannot both receive a new claim.
- A crash after claim must leave a recoverable in-progress record with bounded lease/reconciliation semantics; expiry must not silently authorize a second side effect.
- For database-local mutations, claim, side effect, ledger, and completion should share one database transaction where possible.
- For external effects, use a transactional outbox and downstream idempotency key; never assume a local transaction makes an external API call atomic.

## 6. Protected execution transaction boundary

A compliant backend adapter must provide this behavior:

1. Authenticate the user/service/agent identity.
2. Resolve tenant, product/domain, role, resource ownership, and delegated scope from trusted server-side records.
3. Evaluate current policy and fail closed on missing membership, policy, or dependency.
4. Determine approval requirements using server-side risk policy.
5. Verify the exact payload binding and independently signed human approval; atomically consume the approval.
6. Revalidate authorization immediately before mutation.
7. Claim the idempotency key durably.
8. Commit the audit intent before any protected side effect.
9. Execute the operation through the trusted server-side adapter.
10. Verify the resulting state.
11. Commit the audit outcome and idempotency outcome.
12. Reconcile any intent without a confirmed outcome; do not blindly retry uncertain external effects.

If an audit outcome write fails after the side effect, the operation must be marked as requiring reconciliation and must not be reported as fully complete. The audit intent remains durable evidence of the attempted operation.

## 7. Doughboys Oasis integration disposition

Existing code should be extended rather than replaced:

- Preserve callable authentication and Firestore client write-denial rules.
- Preserve server-side Firestore transactions and wallet ledger invariants.
- Add server-resolved product/tenant/resource authorization; do not accept role or tenant claims from client payloads.
- Upgrade purchase idempotency to bind the complete canonical purchase request and scope.
- Write audit intent, purchase outcome, and denial events with a shared request/execution correlation.
- Require human approval only for operations designated by risk policy (e.g. economy configuration, manual reward grants, administrative adjustments); ordinary player purchases should not be forced through unnecessary manual approval.
- Keep the current demo currency's non-cash, non-redeemable behavior unchanged.
- Do not deploy or change the Firebase project as part of this review branch.

## 8. Verification status

The review branch contains a dependency-injected Firestore Admin SDK adapter implementation at `src/security/saaae/firestore-adapters.mjs` and three fake-Firestore tests. The implementation and tests are authored but NOT RUN or runtime-verified. No approved non-production Firebase project is identified; no live Firebase project, IAM configuration, deployed function, audit store, approval store, or idempotency store has been inspected or certified. The adapter currently uses a single global audit chain head and does not implement independent signed-checkpoint export or a separate nonce-marker collection. This document must not be cited as evidence that durable enforcement is operational.
