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

Requester and reviewer must resolve to distinct immutable Access subjects AND distinct pseudonymous person references issued by an independently verified workforce identity process. Different accounts, email aliases, sessions, MFA events, or browser profiles for the same person do not constitute independence. Each human registry entry now requires a unique `person_ref`, `independence_attestation_id`, and `attestation_issuer`. The registry parser checks that these fields are present and that person references are unique; it does not cryptographically validate the external attestation itself. Therefore the roster must remain empty/unready until a separate trusted identity-verification process has verified the second person and the evidence reference has been reviewed. The executor service identity must never be accepted as a requester or reviewer.

Before enabling the endpoint, the operator roster must contain at least two separately controlled human identities. The current Cloudflare inspection did not establish that such a second human identity exists. Do not infer one from the account-member policy, an email-domain policy, or the account's MFA requirement.

## 3. Cloudflare Access application requirements

A dedicated self-hosted Access application shell now exists with no attached policies. Keep it inaccessible; do not add any allow policy until the staging executor target, rollback plan, and two-human roster are independently reviewed.

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
- Do not add Access allow policies or create DNS until the Worker target, rollback plan, and human identity roster are reviewed.
- Keep the executor unavailable until all gates in section 7 pass.

## 7. Required verification gates

- [ ] Independently verify two separately controlled human persons through the designated workforce identity authority; record distinct pseudonymous person references and auditable attestation IDs (different Access subjects alone are insufficient).
- [ ] Confirm each Access subject maps to the corresponding independently verified person reference; review the attestation evidence out of band.
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
- Dedicated Access application shell exists: `LINGO SAAAE Staging Privileged Executor` (`32ebd30f-3edf-4b42-9e59-23372bcadd59`), self-hosted on `saaae-staging.thelingolegacy.com`, restricted to the configured Cloudflare identity provider, 1-hour session, binding cookie enabled, HttpOnly and SameSite=Strict cookies. A follow-up GET confirmed zero attached policies. No allow policy exists.
- Existing Access applications include public `bypass` policies for public website/fallback use; these are not reusable for the executor.
- Existing reusable policies include single-operator email, account-member, email-domain, service-token, and public-bypass rules. None establishes an independent requester/reviewer pair.
- Organization MFA is required and currently allows biometrics, security key, TOTP, PIV, and SSH FIDO2 key methods. MFA does not establish actor separation.

## 9. Explicit non-actions

The Access application shell is the only live Cloudflare resource created in this workstream. No Access policy, DNS record, Worker, D1 database, service token, secret, principal, membership, grant, or production change was created. The shell has no attached policies and is not an operational executor.

## 10. Implementation checkpoint — 2026-11-23

A standalone verifier has been added at `src/auth/cloudflare-access-jwt.mjs`. It validates RS256 signatures against the Access issuer JWKS and checks issuer, audience, expiry, optional not-before/not-issued-in-future claims, and a non-empty subject. It returns the verified subject for lookup in a separately maintained operator registry. It does not assign roles, accept email as the identity key, or authorize provisioning.

Unit tests are in `scripts/tests/cloudflare-access-jwt.test.mjs`. The five focused tests passed in a local Node 22.16.0 execution during this work session. This local result is not a GitHub Actions result and does not establish Cloudflare production/staging connectivity.

A read-only validation workflow was added at `.github/workflows/saaae-provisioning-staging-validation.yml`. GitHub created push and pull-request runs, but both ended with `startup_failure` and zero jobs. No CI test steps ran and no CI artifacts were produced. Investigate the Actions startup failure before treating the branch as CI-verified.

The verifier is not yet wired into a privileged Worker endpoint. The operator registry, request/review API, executor workload identity, allow-listed D1 mutation implementation, atomic provisioning transaction, Access application, policy, DNS, D1 migration application, and end-to-end staging evidence remain outstanding. Keep the executor unavailable and the production hold active.


### Access shell provisioning record

On 2026-11-23, the dedicated self-hosted Access application shell was created and immediately read back. App ID: `32ebd30f-3edf-4b42-9e59-23372bcadd59`. It is bound to the selected Cloudflare IdP and has no attached policies. The hostname has no DNS record. The shell is intentionally not usable until a reviewed executor exists and independently controlled requester/reviewer identities are confirmed. No broad, bypass, or account-member policy was attached.

### Staging D1 target inspection

A read-only Cloudflare D1 inspection confirmed that Wrangler's configured database `lingo-game-engine-staging-20261107` (`793ab138-7818-47c9-ad01-b319ad34a8c5`) exists in the selected account and matches the staging configuration. Its current schema contains the game foundation tables but none of the six SAAAE runtime tables and none of the provisioning evidence tables. No migration was applied. The database's Cloudflare API `version` field reports `production`, which is a D1 service version label and must not be confused with the application environment; the explicit database name and Wrangler binding identify the intended staging target. Because PR #658 remains unmerged/draft and CI startup has not succeeded, migration application remains held pending review and successful migration tests.

### Cloudflare operator roster inspection

A read-only account-members query returned exactly one accepted Cloudflare account member. The configured Cloudflare identity provider is restricted to account members, so the currently verified roster cannot supply two independent human operators. The single returned member also has the Cloudflare account-level `two_factor_authentication_enabled` flag set to false; this is distinct from the Cloudflare Access organization setting that requires MFA for Access applications. Do not infer a second operator or waive the Access MFA requirement. A separately controlled second person must be added and verified before any allow policy is attached.


## 12. Access-to-registry authentication binding

The Cloudflare Access JWT verifier is now wired to the server-owned operator registry through `src/auth/saaae-operator-auth.mjs`.

- Only the `Cf-Access-Jwt-Assertion` header is accepted as the Access assertion.
- The JWT signature, issuer, audience, expiry, not-before, and immutable subject are verified before registry lookup.
- The verified subject must match an active registry entry; token email and caller-supplied role headers are ignored.
- Authentication remains unavailable until the registry contains two distinct active human operators and a separate workload executor.
- The helper is not yet attached to a deployed Worker route. No Access allow policy or executor was enabled.

## 11. Fail-closed operator registry foundation

A standalone registry parser and actor-separation module now exists at `src/auth/saaae-operator-registry.mjs`, with focused tests at `scripts/tests/saaae-operator-registry.test.mjs`.

- Registry identity keys are cryptographically verified immutable subjects only; email addresses and display names are rejected as identity fields.
- Duplicate subjects, unsupported roles, human-as-executor assignments, and workload-as-human assignments fail closed.
- Readiness requires at least two distinct active human identities (requester and reviewer) plus a separate active workload executor identity.
- Provisioning actor resolution requires three distinct subjects and role/type matches.
- The registry contains no real operator subjects. It remains unready until independently controlled identities and the separate executor workload subject are supplied through reviewed server-side configuration.
- The module is a policy foundation, not an enabled endpoint. It does not attach Access policies, create DNS, issue credentials, or enable execution.

## 13. Follow-up read-only verification — 2026-11-24

A fresh Cloudflare API inspection confirmed the dedicated Access application remains an isolated, default-deny shell:

- Application ID: `32ebd30f-3edf-4b42-9e59-23372bcadd59`
- Hostname: `saaae-staging.thelingolegacy.com`
- Session duration: `1h`
- Configured identity provider: Cloudflare
- Attached application policies: `0`
- DNS records for the staging hostname: `0`
- Matching SAAAE/game-engine Worker scripts: `0`

No Cloudflare resource was modified by this inspection.

### Identity independence limitation

Distinct Access JWT subjects prove distinct authenticated accounts, not distinct natural persons. The registry now requires a unique pseudonymous `person_ref` plus an `independence_attestation_id` and issuer reference for each human. The parser enforces presence and uniqueness, but does not verify the attestation issuer's signature or source record. A designated independent identity-verification process must validate the evidence before the server-owned roster is populated. Do not treat fabricated or self-asserted person references as proof.

### Latest GitHub Actions status

The expanded workflow is now configured to run all six Node test suites (Access JWT, operator registry, operator authentication, SAAAE D1 authorization/approval, and atomic settlement) plus both SQLite migration suites and syntax checks. Latest PR #659 push and pull-request attempts (runs `45296566443` and `45296571848`) ended in `startup_failure` with zero jobs. No tests ran and no pass result is claimed. This remains an Actions runner/startup blocker, not a code-test result.

The Cloudflare IdP configuration was also re-read on 2026-11-24:

- The selected IdP is Cloudflare with `restrict_to_account_members: true`.
- SCIM is disabled; no SCIM user lifecycle/deprovisioning feed is available to establish workforce identity records.
- The application has binding cookies enabled, HttpOnly cookies enabled, SameSite=`Strict`, and eager redirect cookies enabled.
- The application audience is configured on the Access app and must be supplied to the verifier as a secret-free configuration value.
- A second independently controlled human must first be added as a genuine Cloudflare account member and then separately verified by the designated identity-verification process. Merely supplying an email address or creating another account for the same person does not satisfy the control.
