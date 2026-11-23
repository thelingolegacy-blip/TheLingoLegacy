# LINGO game-engine SAAAE privileged provisioning design

**Status:** design-only proposal; not an executable provisioning interface.
**Environment:** staging only.
**Parent implementation:** PR #658, based on PR #655.
**Release disposition:** PROTECTED HOLD. No migration, D1 write, Worker deployment, route change, or production operation is authorized by this document.

## 1. Security boundary

The game Worker must never create a principal, tenant membership, or grant as a side effect of Firebase sign-in, account bootstrap, wallet access, approval issuance, or gameplay. A Firebase UID proves token subject identity; it does not establish LINGO tenant membership, product access, administrator status, or approval authority.

The privileged provisioning plane must be separate from player-facing routes and from the ordinary approval-issuance endpoint. No client-supplied role, tenant header, profile field, email claim, or possession of a Firebase token may authorize provisioning.

## 2. Required separation of duties

The future workflow must require distinct authenticated human operators for:
1. **Requester:** submits a change request identifying the exact Firebase UID, tenant, product, resource, operation, effect, validity window, and business reason.
2. **Reviewer/approver:** independently verifies the request and the subject's eligibility; cannot be the requester or the target principal.
3. **Executor:** performs the approved, narrowly scoped database transaction using a dedicated short-lived administrative session. The executor must not be able to approve its own request.

For initial staging bootstrap, require two-person approval before the first principal, membership, or grant is inserted. Do not seed a default administrator, universal tenant, wildcard grant, or shared operator identity.

## 3. Change request contract

Each request must have a unique immutable request ID and include:
- environment identifier fixed to the verified staging environment;
- target Firebase UID and independently verified Firebase project/issuer;
- tenant ID, product ID, resource ID, operation, and allow/deny effect;
- requested validity start and expiry (finite expiry is preferred; no implicit indefinite privilege);
- reason, ticket/issue reference, requester identity, reviewer identity, and timestamps;
- a canonical SHA-256 digest over the complete normalized request;
- explicit acknowledgement that the change grants the listed scope only.

Reject wildcard or partial scopes, unknown products/resources/operations, inactive or unverified Firebase subjects, cross-environment references, self-approval, expired requests, duplicate request IDs with different digests, and any request lacking required evidence.

## 4. Execution invariants

The eventual executor must:
- authenticate the executor through a separately controlled administrative identity, not a player token;
- verify that the approved request digest exactly matches the submitted change;
- re-check the staging database binding and Firebase project identity immediately before execution;
- use parameterized SQL and a single atomic D1 batch for principal/membership/grant mutations plus their audit event(s);
- be idempotent by request ID and change digest;
- enforce unique principal and membership constraints and reject conflicting active scope records;
- never broaden an existing grant to satisfy a new request;
- fail closed if any precondition or audit insert fails;
- return only a redacted receipt (request ID, change ID, outcome, correlation ID, timestamp), never credentials or secret values.

The executor must not accept arbitrary SQL, arbitrary table names, arbitrary D1 database identifiers, or user-provided SQL fragments. It must expose only a fixed set of reviewed operations.

## 5. Lifecycle operations

The reviewed operation set should be limited to:
- register a principal as active after identity verification;
- suspend or revoke a principal and advance `token_valid_after_epoch` to invalidate existing Firebase sessions;
- create or change a tenant membership with explicit active/suspended/revoked state;
- issue an exact allow or deny grant with bounded validity;
- revoke or expire a grant without deleting its history;
- suspend or revoke a membership without deleting its history.

A deny grant must take precedence over any matching allow grant. Revocation must take effect on the next authorization decision. No hard-delete operation is permitted for principals, memberships, grants, approvals, or audit records.

## 6. Audit requirements and schema gap

Every accepted, rejected, executed, replayed, expired, or revoked request must produce a correlated append-only audit record containing the operator identity, reviewer identity, target scope, request ID/digest, decision, reason code, and timestamp. Audit persistence must be in the same transaction as the state change; if the audit write fails, the state change must roll back.

The current `lingo_saaae_audit_events` decision constraint supports runtime decisions and approval issuance/consumption, but does not yet define dedicated provisioning lifecycle decision values. Before implementing this workflow, add a separately reviewed additive migration for explicit values such as `principal_provisioned`, `principal_suspended`, `principal_revoked`, `membership_provisioned`, `membership_suspended`, `membership_revoked`, `grant_issued`, `grant_revoked`, and `provisioning_denied`. Do not overload ordinary `allow` or `deny` runtime events to represent administrative state changes.

The existing audit schema also lacks dedicated requester/reviewer/operator and request-ID columns. The follow-on schema must add these fields (or a normalized immutable provisioning-request table linked by request ID) before implementation. Do not silently omit this provenance.

## 7. Credential and operator controls

- Use a dedicated, least-privilege staging administrative identity and short-lived credentials.
- Store secret values only in the approved secret manager; repository files and evidence records may contain names, fingerprints, rotation dates, and ownership metadata only.
- Require MFA and an attributable human identity for request and approval.
- Do not put administrative credentials in client applications, Worker environment variables accessible to player routes, issue comments, logs, or CI artifacts.
- Restrict executor invocation to an approved operator environment and explicit staging D1 target.
- Record credential identity/fingerprint metadata, never the credential itself.
- Rotate and revoke the administrative identity through the provider's supported controls; verify revocation before resuming provisioning.

## 8. Required tests before implementation approval

- requester cannot approve or execute own request;
- reviewer cannot approve a request targeting their own identity;
- missing, inactive, revoked, or wrong-project Firebase subject is rejected;
- wrong environment, database binding, tenant, product, resource, operation, effect, or digest is rejected;
- allow/deny conflicts preserve deny precedence;
- expiry and future-validity boundaries are enforced using server time;
- duplicate request replay is idempotent; same ID with different digest is rejected;
- principal suspension/revocation invalidates previously issued Firebase tokens;
- membership and grant revocation deny the next protected request;
- state mutation and audit insertion roll back atomically on any injected failure;
- audit and provisioning history cannot be updated or deleted;
- concurrent conflicting provisioning requests cannot create ambiguous active authority;
- no endpoint or workflow can self-register or self-elevate a player.

Tests must run against the actual SQLite/D1-compatible migration and a Cloudflare D1 staging instance before the design can advance to implementation.

## 9. Acceptance gates

This design is not complete implementation. The next implementation PR must remain separate from PR #658 or be explicitly chained after it, must include the schema delta, operator workflow, tests, runbook, and independent security review, and must remain draft until evidence is attached.

Required evidence:
1. verified staging Firebase project and subject identity;
2. verified staging D1 database ID/binding;
3. two-person request and approval records;
4. successful and denied provisioning test receipts;
5. atomic rollback and idempotent replay test results;
6. append-only audit verification;
7. credential and operator access review;
8. CI run IDs, completed test steps, logs, and artifacts correlated to the exact commit.

Until every gate passes, provisioning remains disabled and all protected runtime operations remain default-deny.
