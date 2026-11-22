# SAAAE Hardening and Integration Plan — v1

**Status:** Non-production implementation plan; not a deployment authorization  
**PR:** #643 — draft review branch  
**Disposition:** PROTECTED HOLD. No production project, secret, IAM policy, runner, workflow dispatch, deployment, or release promotion is authorized by this document.

## 1. Purpose and boundary

This plan closes the implementation gaps identified during source review of the SAAAE foundation. It is deliberately explicit about transaction boundaries, failure handling, and evidence. It does not claim that the controls are implemented or verified.

The implementation must remain server-side. Browser, Flutter, Worker, and agent clients may submit requests but may not choose trusted identity attributes, tenant membership, role, approval status, policy version, audit sequence, or resulting financial/game state.

## 2. Audit partitioning and integrity

### Partition identity

Define a canonical partition key from server-resolved `tenantId` and `productDomain`. Environment is an additional isolation dimension where non-production and production records share an infrastructure service. Do not accept these values as authoritative from a client request.

Each partition has:
- a monotonically increasing sequence;
- a single transactional head record containing sequence and hash;
- immutable event records keyed by partition and sequence;
- unique event IDs to reject duplicate append attempts;
- a server-generated UTC timestamp and request/execution correlation IDs.

The append transaction reads the partition head, compares the expected previous hash, creates the next event, and advances the head atomically. A stale head returns conflict and must be retried only by rebuilding the envelope from trusted state. Never silently overwrite or skip a sequence.

### Independent checkpoints

A checkpoint must include partition identity, sequence, head hash, checkpoint time, schema/version, and signing key ID. Sign it using a key held outside the Firestore project and outside the application runtime's ordinary database credentials. Pin the accepted public key independently in the verifier. A key ID supplied by the checkpoint is metadata, not a trust anchor.

Export checkpoints to an independently administered retention destination. Verification must detect altered events, missing sequence numbers, reordered events, truncated history, wrong partition, wrong key, invalid signature, and mismatch between the checkpoint and reconstructed head. Test restore from backup against the most recent independently retained checkpoint.

A hash chain and head stored in the same privileged database are not independently tamper-proof. Do not describe them as immutable against project administrators.

## 3. Approval issuance, verification, and revocation

Use separate operations and permissions for request, approve, revoke, consume, and verify. The requester cannot approve their own high-impact operation. An agent or service identity cannot satisfy a human-approval requirement.

The approval issuer must:
1. authenticate the human approver with a trusted identity provider;
2. resolve approver eligibility from server-side membership and role records;
3. evaluate separation-of-duties and risk policy;
4. bind approval to requester, tenant, product domain, environment, operation, resource, canonical payload digest, policy version, expiry, nonce, and approval record ID;
5. sign the canonical binding with a managed signing key whose private material is never exposed to clients or committed to the repository;
6. persist the signed record and append an approval-issued audit event.

The consumer must independently pin the issuer's public key, verify the signature and all binding fields, check expiry and revocation state, and atomically consume both approval ID and nonce marker. Concurrent consumption must yield at most one success. Revocation must be checked immediately before execution, not only at approval time.

Key lifecycle requirements: documented owner, key purpose, key ID, activation/retirement dates, rotation overlap, emergency revocation, public-key distribution, compromise response, and audit evidence. Do not invent a key provider or custody configuration before the non-production environment and security owner are approved.

## 4. Idempotency leases and reconciliation

A claim record must include the full scope (principal, tenant, product domain, operation, resource), idempotency key digest, canonical payload digest, state, creation time, lease owner, lease expiry, attempt count, correlation ID, and eventual outcome reference.

Allowed states: `claimed`, `executing`, `completed`, `failed_terminal`, and `reconciliation_required`. State transitions must be conditional and transactional.

Lease expiry alone must never authorize a second side effect. A reconciler must first establish whether the protected effect committed:
- If the effect and claim share one database transaction, inspect the authoritative transaction result and complete the claim.
- If an external effect is involved, query the downstream system using its idempotency/reference key or use an outbox/inbox protocol.
- If the effect cannot be determined, mark `reconciliation_required`, alert an authorized operator, and block automatic replay.
- Only a proven no-effect outcome may be safely released or retried under a new, audited attempt.

Exact same-key/same-digest replay returns the previously committed outcome. Same key with a different digest is a conflict. Concurrent requests cannot both acquire a fresh claim.

## 5. Protected operation lifecycle

Required sequence:

1. Authenticate principal and validate token/session server-side.
2. Resolve current tenant membership, product scope, role, resource ownership, and delegation from trusted server records.
3. Evaluate default-deny RBAC/ABAC policy.
4. Compute the canonical digest from the server-normalized operation payload.
5. Evaluate risk policy and required human approval.
6. Verify approval signature, expiry, revocation, separation-of-duties, and exact binding; consume approval and nonce atomically if required.
7. Revalidate authorization immediately before mutation.
8. Acquire the durable idempotency claim.
9. Append and confirm audit intent before any protected side effect.
10. Execute through the trusted server-side operation adapter.
11. Verify the authoritative postcondition.
12. Append audit outcome and complete idempotency with the same correlation.
13. If outcome persistence is uncertain, mark reconciliation required and do not report success.

Denials, malformed requests, policy dependency failures, approval failures, replay conflicts, and execution errors must produce appropriately redacted audit events where the audit service is available. If a required audit dependency is unavailable, fail closed before the protected side effect.

## 6. Doughboys Oasis purchase integration plan

Preserve the current callable authentication, server-side transaction, wallet balance validation, inventory grant, ledger entry, and non-cash DOUGH semantics.

Before the purchase transaction:
- derive principal from `request.auth.uid`;
- resolve the player's tenant/product scope from trusted server-side membership;
- load the authoritative catalog item and price;
- construct a server-normalized operation payload including item ID, catalog version, price, currency, quantity, and operation type;
- compute a canonical digest; never trust a client-supplied price or digest;
- use the shared SAAAE policy and durable idempotency scope;
- classify ordinary player purchases as low-risk unless policy says otherwise; reserve human approval for administrative economy changes, manual grants, reversals, and other high-impact actions.

Within one Firestore transaction where possible, preserve atomic wallet debit, inventory grant, ledger record, and idempotency completion. Include the SAAAE correlation and payload digest in the ledger/audit references. Audit intent must be durable before the purchase mutation; if intent and purchase cannot share a transaction, use a durable intent/outbox design and reconcile uncertain outcomes.

Do not wire the callable to the current global audit-head prototype as if it were production-ready. Complete partitioned audit and idempotency contracts first, then add adapter-level and emulator concurrency tests.

## 7. GitHub Actions startup-failure investigation

The four observed PR-associated runs have `startup_failure` status and empty job lists. This means there are no job steps or runner logs available from those run records. It does not identify the cause.

Non-invasive investigation sequence:
1. Inspect repository Actions settings and permitted runner groups using an authorized GitHub administrator; do not alter settings during diagnosis.
2. Check GitHub Status incident history for the exact run timestamps.
3. Inspect repository/org billing, Actions minutes, concurrency, policy restrictions, and runner-group access.
4. Inspect workflow YAML syntax and referenced action availability at the exact PR head.
5. Compare a known-good hosted-runner workflow from the same repository and time window.
6. Record exact run IDs, head SHA, timestamps, event, runner labels, and startup error from GitHub support/admin diagnostics.
7. Only after the cause is understood and the user explicitly authorizes a retry, use a minimal non-production read-only smoke run. Do not start or register G02 self-hosted runners as a diagnostic shortcut.

## 8. Verification gates

| Gate | Required evidence | Current status |
|---|---|---|
| Pure unit tests | All SAAAE tests executed on supported Node; output and commit SHA retained | NOT VERIFIED |
| Static checks | Syntax, lint/type checks as applicable, dependency audit | NOT VERIFIED |
| Firestore adapter tests | Fake-store tests, transaction conflict/retry tests | NOT VERIFIED |
| Emulator integration | Auth, rules, Admin SDK boundary, concurrency, replay, failure injection | BLOCKED — environment not approved |
| Approval crypto | Pinned-key signature, expiry, revocation, rotation, self-approval tests | NOT IMPLEMENTED |
| Audit partitioning | Parallel tenant/domain chains, sequence integrity, checkpoint verification | NOT IMPLEMENTED |
| Idempotency recovery | Crash-window, lease expiry, uncertain external outcome, reconciliation tests | NOT IMPLEMENTED |
| Oasis integration | End-to-end callable authorization, wallet invariants, audit correlation, replay tests | NOT IMPLEMENTED |
| IAM | Effective permissions and negative access tests for each service identity | BLOCKED — project not approved |
| Independent review | Security review of code, threat model, operational controls | NOT STARTED |
| Production readiness | All gates passed, independent sign-off, explicit release authorization | PROHIBITED UNDER HOLD |

## 9. Required non-production handoff inputs

Before connecting any real Firebase environment, obtain:
- explicit approved non-production Firebase project ID and confirmation it contains no production data;
- named environment owner and security approver;
- approved region, Firestore database mode, retention, backup, and restore requirements;
- approved service identity model and least-privilege IAM review;
- approved signing-key custody and independent checkpoint destination;
- emulator/local test strategy and budget constraints.

Never request or commit service-account private keys, signing private keys, access tokens, or other secrets in chat or repository files.

## 10. Stop conditions

Stop and fail closed on unknown identity, tenant, membership, policy, approval, key trust, revocation status, audit commit, idempotency state, or postcondition. Stop on ambiguous commit outcomes. Do not use production as a test environment. Do not bypass a failed gate by weakening policy, substituting a client-side check, or treating authored tests as passing.

**Current conclusion:** This plan makes the remaining work executable and auditable, but it is not implementation evidence. PR #643 remains draft and unmerged; SAAAE remains unverified and not production-ready; PROTECTED HOLD remains in force.
