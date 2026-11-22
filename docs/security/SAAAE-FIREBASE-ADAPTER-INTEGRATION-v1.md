# SAAAE Firebase Adapter Integration Boundary — v1

## Implemented in the review branch

`src/security/saaae/firestore-adapters.mjs` provides server-only Firestore Admin SDK adapter implementations for the existing SAAAE contracts:

- **Audit:** transactionally compares the audit chain head, creates a sequence-addressed event, and advances the head in one Firestore transaction. A stale expected head returns a conflict without writing.
- **Approvals:** transactionally verifies the approval is still approved, its nonce is unchanged, and every exact-action binding field matches before consuming it.
- **Idempotency:** hashes the scoped operation key into a Firestore document ID; atomically creates an in-progress claim, rejects changed-payload reuse, returns exact completed outcomes, and completes only the matching in-progress claim.

The adapter factory accepts an already initialized Firestore Admin SDK instance and `FieldValue`. It deliberately does not initialize Firebase, select a project, read client credentials, create service accounts, deploy rules, or mutate any remote Firebase resource.

A deterministic fake-Firestore test suite was added at `src/security/saaae/firestore-adapters.test.mjs`. It contains three authored adapter tests. These tests are NOT RUN until an isolated repository checkout and supported Node runtime are available.

## Security requirements before any real Firebase use

1. Select and independently verify a dedicated non-production Firebase project. The repository currently has no approved non-production project ID or alias; the only identified project name is `lingo-legacy-production`, which is explicitly out of scope.
2. Initialize the Admin SDK only inside a trusted server runtime. Never expose this adapter or Admin SDK credentials to browsers, Flutter clients, or Cloudflare public routes.
3. Use distinct least-privilege service identities for audit writing, approval consumption, and operation idempotency where practical.
4. Configure IAM so the audit writer can create/read audit events but cannot update/delete them; isolate audit-head mutation to the writer. Approval and idempotency collections must have narrowly scoped access. Firestore Security Rules do not constrain Admin SDK access.
5. Export signed audit checkpoints to an independently controlled destination. Hash chaining inside one project does not protect against a sufficiently privileged project administrator rewriting both events and chain heads.
6. Define retention, backup, restore, legal hold, alerting, and access-review controls before storing real security events.
7. Add a trusted approval-issuance workflow with pinned key custody and signature verification. This adapter only consumes an existing approval record; it does not issue or cryptographically validate approvals.
8. Add end-to-end security tests against the selected emulator/project and verify concurrent transactions, transaction retries, restore, IAM denials, and audit checkpoint verification.

## Existing Doughboys Oasis operation

The existing callable functions remain unchanged in this phase. They authenticate users and transact wallet/inventory/ledger updates, but their purchase idempotency compares item ID and reason code rather than a canonical full-operation digest. They are not yet wrapped by the shared SAAAE authorization, approval-policy, audit-intent/outcome, or durable idempotency boundary.

Do not claim the Oasis purchase path or any other product operation is SAAAE-certified until that integration is implemented and its acceptance tests pass. The adapter implementation is a concrete storage layer, not proof of deployment or enforcement.

## Status

| Item | Status |
|---|---|
| Firestore adapter implementation | AUTHORED — NOT RUNTIME-VERIFIED |
| Adapter unit tests | AUTHORED — NOT RUN |
| Non-production Firebase project | BLOCKED — NOT IDENTIFIED |
| Firebase IAM/service identities | BLOCKED — NOT CONFIGURED/INSPECTED |
| Approval signing/key custody | BLOCKED — NOT IMPLEMENTED |
| Signed independent audit checkpoints | BLOCKED — NOT IMPLEMENTED |
| Oasis protected-operation integration | NOT IMPLEMENTED |
| Emulator/integration/concurrency/restore tests | NOT RUN |
| Production Firebase changes | PROHIBITED |
