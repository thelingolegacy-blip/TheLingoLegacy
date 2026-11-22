# askLINGO v2.0 — Persistence and Adapter Contracts

## Status

Logical architecture contract only. No database engine, schema migration, production binding, or durable store is selected or applied by this document.

## Required server-side adapters

### IdentityVerifier
- Verify the credential from a trusted issuer.
- Validate signature, issuer, audience, expiry, not-before, and required claims.
- Return a server-created principal with immutable subject and session metadata.
- Expose revocation/session assurance state.
- Fail closed when identity verification or revocation checks are unavailable.

### GrantStore
- Read grants by verified subject and exact tenant/product/resource/operation/environment scope.
- Enforce grant status, validity window, and revocation.
- Never accept grants supplied by a browser, mobile client, model, or agent.
- Provide a current-state check at execution time for privileged actions.

### ApprovalStore
Required operations:
- create pending approval from a canonical action digest;
- retrieve an approval record for review;
- record a decision with approver identity and rationale;
- revoke an approval;
- atomically consume a single-use approval for one exact action digest and scope;
- reject expired, revoked, mismatched, self-approved, or already consumed approvals.

A read followed by a separate update is not sufficient for consumption. The adapter must provide a transactional compare-and-consume operation or an equivalent atomic primitive.

### AuditStore
- Append structured, privacy-minimized events.
- Provide durable acknowledgement before consequential execution proceeds.
- Prevent ordinary application principals from updating or deleting accepted audit events.
- Support correlation lookup and integrity verification.
- Retain evidence references and hashes rather than unnecessary conversation bodies.
- Fail closed when required audit persistence is unavailable.

### IdempotencyStore
- Reserve a key scoped to tenant/product/operation and canonical action digest.
- Distinguish in-progress, completed, failed, and outcome-unknown states.
- Reject reuse of the same key with a different action digest.
- Support safe retry only when the downstream operation is known to be idempotent.

### ExecutionAdapter
- Execute one bounded, already-authorized action.
- Receive a scoped service identity and exact action envelope.
- Never interpret model text as authority.
- Return a downstream operation reference and authoritative status.
- Enforce target validation and idempotency at the connector boundary.

### EvidenceVerifier
- Independently inspect authoritative downstream state.
- Verify the result against the intended action and source revision.
- Return a verifiable evidence reference, timestamp, and disposition.
- Never accept an agent's self-reported success as sufficient proof.

## Logical persistence entities

| Entity | Required content | Excluded content |
|---|---|---|
| Identity reference | Issuer, subject ID, status, timestamps | Passwords, raw tokens, private keys |
| Policy grant | Subject, exact scope, capability, validity, status, grantor | Ambient/global wildcard access |
| Approval | Requester, approver, action digest, exact scope, risk, decision, expiry, consume/revoke state | Unnecessary prompt body or credentials |
| Audit event | Actor, action, scope, policy version, decision, correlation, outcome, evidence reference, integrity metadata | Secrets and full conversation text by default |
| Idempotency record | Scoped key, action digest, state, downstream reference, expiry | Raw credentials |
| Conversation record (optional) | Only after privacy approval: owner, purpose, consent, retention, timestamps | Unapproved transcript/audio persistence |

## Transaction boundaries

For a consequential operation, the server must:
1. Verify principal and session.
2. Resolve exact target and action.
3. Read current policy and grant state.
4. Compute the canonical action digest.
5. Verify the approval record, when required.
6. Atomically consume the approval and reserve the idempotency key.
7. Append a durable intent audit event.
8. Execute through the scoped adapter.
9. Capture downstream evidence.
10. Independently verify the result.
11. Append outcome and verification audit events.
12. Report success only when the authoritative result and evidence are verified.

If execution may have occurred but outcome evidence is unavailable, record UNKNOWN / NOT VERIFIED and do not blindly retry.

## Provider-neutral storage decision

Do not bind this contract to Firebase, D1, MySQL, Cloud SQL, or another provider until staging requirements, transaction semantics, data residency, operational ownership, backup/recovery, and cost have been reviewed. Existing account resources are not evidence of an authorized binding.

## Acceptance tests

Test atomic approval consumption under concurrent requests, replay prevention, idempotency conflicts, audit outage, append integrity, revoked grant races, target drift, unknown downstream outcomes, and data deletion/retention propagation.
