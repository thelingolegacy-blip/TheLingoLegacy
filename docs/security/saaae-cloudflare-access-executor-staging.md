# SAAAE staging privileged executor — Cloudflare Access boundary

**Status:** design-only branch chained from PR #658; no runtime, DNS, Access, D1, Worker, or production changes.
**Base commit:** `878842feebbeffdce4a8fda57e51aa929f4bf045`
**Proposed staging hostname:** `saaae-staging.thelingolegacy.com`
**Cloudflare Access team domain:** `morning-pine-9393.cloudflareaccess.com`

## 1. Purpose and boundary

This design specifies a separate staging-only privileged provisioning executor. It is not part of the public LINGO website, game Worker, or public fallback Worker. It must not share a public Access application, public bypass policy, or broad Worker preview policy.

Cloudflare Access authenticates human operators at the edge. The executor independently validates the Access JWT and enforces application-level authorization. Access authentication is not, by itself, proof of two-person approval.

## 2. Identity separation — mandatory precondition

The executor recognizes three distinct actor classes:

- **Requester:** an authenticated human who submits a narrowly scoped provisioning request.
- **Reviewer:** a different authenticated human who approves or rejects that exact request.
- **Executor:** a non-human workload identity used only by the staging executor runtime to apply the approved, allow-listed change.

Requester and reviewer must resolve to distinct immutable identity subjects, not merely different display names, email aliases, sessions, MFA events, or browser profiles. The executor service identity must never be accepted as a requester or reviewer.

Before enabling the endpoint, the operator roster must contain at least two separately controlled human identities. The current Cloudflare inspection did not establish that such a second human identity exists. Do not infer one from the account-member policy, an email-domain policy, or the account's MFA requirement.

## 3. Cloudflare Access application requirements

Create a dedicated self-hosted Access application only after the staging executor has a reviewed deployment target and the two-human roster is confirmed.

- Application hostname: `saaae-staging.thelingolegacy.com`
- Team issuer: `https://morning-pine-9393.cloudflareaccess.com`
- Identity provider: Cloudflare
- Organization MFA: required (existing organization setting)
- Session duration: shortest practical operator session; target `1h`
- Policy posture: default deny; explicit allow for the named operator identities only
- No `bypass`, `everyone`, email-domain-wide, broad account-member, public Worker, or general preview policy
- Separate endpoint paths for request and review, with application-level role checks
- Access JWT validation: verify signature using the issuer's published key set; validate issuer, audience, expiry, not-before, and subject; reject missing or malformed tokens; do not trust forwarded identity headers without cryptographic JWT validation

The Access application audience must be treated as a deployment-specific value and stored as configuration metadata, not copied from another Access app.

## 4. Request and approval protocol

1. Requester submits a typed, allow-listed provisioning intent. The API assigns request ID, canonicalizes the payload, computes the digest server-side, and persists the request as `pending`.
2. Reviewer authenticates independently and retrieves the exact pending request. Reviewer identity must differ from requester identity.
3. Reviewer approves or rejects the exact request ID and digest. The approval record binds reviewer subject, request digest, decision, timestamp, expiry, and policy version.
4. Executor re-authenticates its workload identity, re-reads the request and approval from the authoritative staging database, recomputes the canonical digest, verifies freshness and all state transitions, then applies only the permitted operation.
5. The authorization change and immutable audit event commit atomically. Any failure rolls back the entire operation.
6. The executor returns a non-secret receipt containing request ID, digest, result, and audit-event ID.

No arbitrary SQL, caller-supplied digest, caller-supplied actor identity, self-approval, self-grant, wildcard grant, or direct client-to-database access is permitted.

## 5. Database invariants

- Requests are inserted only in `pending`.
- State transitions are explicit and terminal states cannot be reopened.
- Every audit event digest equals its parent request digest.
- Expired or cancelled approved requests retain reviewer evidence.
- Requester, reviewer, and executor identities are recorded separately.
- Reviewer must differ from requester; executor must differ from both human actors.
- Approval binds to one request ID, one digest, one policy version, one expiry, and one allowed operation.
- Unique constraints prevent duplicate approval and replay.
- Authorization mutation and audit append are in one database transaction/batch.
- The executor accepts only a closed, versioned operation schema; it does not expose SQL execution.

## 6. Staging isolation and secret handling

- Use a dedicated staging D1 database and staging-only Worker service binding.
- Keep production D1, Firebase, Workers, routes, and credentials unreachable from this executor.
- Store secrets only in the runtime secret manager; GitHub stores metadata and references only, never secret values.
- Use a separate workload identity for the executor. Do not reuse a human Access token as a service credential.
- Do not create DNS or Access resources until the Worker target, rollback plan, and human identity roster are reviewed.
- Keep the executor unavailable until all gates in section 7 pass.

## 7. Required verification gates

- [ ] Confirm two distinct, separately controlled Cloudflare human identities and their exact immutable subjects.
- [ ] Review dedicated Access app and explicit allow policy; verify no bypass or broad policy attachment.
- [ ] Verify JWT signature, issuer, audience, expiry, not-before, and subject checks with positive and negative fixtures.
- [ ] Verify requester/reviewer separation and executor workload identity separation.
- [ ] Verify pending-only insertion, digest equality, reviewer evidence retention, terminal-state behavior, and replay rejection.
- [ ] Verify two concurrent approvals cannot both succeed.
- [ ] Verify authorization mutation plus audit append is atomic under injected failures.
- [ ] Verify allow-listed operations only; prove arbitrary SQL and self-grant attempts are rejected.
- [ ] Run Python suite, Node tests, migration repeatability tests, D1 staging tests, Wrangler dry-run, and staging integration tests.
- [ ] Verify rollback procedure and prove it cannot touch production resources.
- [ ] Review resulting evidence and obtain explicit release approval before enabling the staging hostname.

## 8. Current verified Cloudflare findings

Read-only inspection on 2026-11-23 confirmed:

- Zone `thelingolegacy.com` is active.
- No DNS record exists for `saaae-staging.thelingolegacy.com`.
- No dedicated SAAAE executor Access application exists.
- Existing Access applications include public `bypass` policies for public website/fallback use; these are not reusable for the executor.
- Existing reusable policies include single-operator email, account-member, email-domain, service-token, and public-bypass rules. None establishes an independent requester/reviewer pair.
- Organization MFA is required and currently allows biometrics, security key, TOTP, PIV, and SSH FIDO2 key methods. MFA does not establish actor separation.

## 9. Explicit non-actions

This design commit does not create an Access application or policy, DNS record, Worker, D1 database, service token, secret, principal, membership, grant, or production change. It does not make PR #658 mergeable and does not declare the provisioning path operational.

## 10. Implementation checkpoint — 2026-11-23

A standalone verifier has been added at `src/auth/cloudflare-access-jwt.mjs`. It validates RS256 signatures against the Access issuer JWKS and checks issuer, audience, expiry, optional not-before/not-issued-in-future claims, and a non-empty subject. It returns the verified subject for lookup in a separately maintained operator registry. It does not assign roles, accept email as the identity key, or authorize provisioning.

Unit tests are in `scripts/tests/cloudflare-access-jwt.test.mjs`. The five focused tests passed in a local Node 22.16.0 execution during this work session. This local result is not a GitHub Actions result and does not establish Cloudflare production/staging connectivity.

A read-only validation workflow was added at `.github/workflows/saaae-provisioning-staging-validation.yml`. GitHub created push and pull-request runs, but both ended with `startup_failure` and zero jobs. No CI test steps ran and no CI artifacts were produced. Investigate the Actions startup failure before treating the branch as CI-verified.

The verifier is not yet wired into a privileged Worker endpoint. The operator registry, request/review API, executor workload identity, allow-listed D1 mutation implementation, atomic provisioning transaction, Access application, policy, DNS, D1 migration application, and end-to-end staging evidence remain outstanding. Keep the executor unavailable and the production hold active.
