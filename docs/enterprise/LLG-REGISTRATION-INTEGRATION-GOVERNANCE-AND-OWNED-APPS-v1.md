# LLG Registration, Integration Governance & Owned-App Program v1

**Status:** PROPOSAL — non-production; implementation and legal approval required.  
**Parent work:** Wave 0 master registry PR #511; enterprise completion control tower issue #517.  
**Authority:** GitHub repository `thelingolegacy-blip/TheLingoLegacy`. This document extends existing identity and integration contracts; it does not replace them.  
**Release posture:** PROTECTED HOLD. G02 remains FAIL / UNVERIFIED. No production release is authorized.

## 1. Purpose and boundaries

Establish one governed operating system for:
- LINGO ID registration and account lifecycle across authorized LINGO products.
- A canonical registry of third-party plugins, APIs, providers, contracts and approvals.
- Security, privacy, legal, cost, reliability and operational controls for each integration.
- A staged program for five LLG-owned applications that may implement independently developed equivalents of useful third-party capabilities.

This specification is not proof that registration, authentication, integrations or the five apps are operational. No credentials, provider passwords, payment secrets or personal data belong in this repository.

## 2. Decisions required before implementation

The repository currently contains competing backend direction:
- Existing identity API contract proposes Firebase Authentication.
- PR #515 proposes Supabase as primary transactional backend, retaining Firebase compatibility/specialist roles.
- Main `.firebaserc` defaults to `lingo-legacy-production`; Firebase project identity and Hosting output scope remain unresolved under issues #469 and #441.

**Decision gate:** an owner-approved architecture decision record (ADR) must select the identity authority, profile store, authorization enforcement point, token audience/issuer, session/revocation strategy and environment map. Do not implement a second identity system or silently choose Firebase/Supabase before this ADR is accepted. A provider's healthy status does not establish that it is the intended LLG production project.

## 3. LINGO ID account contract

### 3.1 Principal and identifiers
- Assign an immutable opaque principal ID at the trusted identity service.
- Email, phone, username, display name, device identifiers and social handles are attributes, never primary keys.
- Normalize and verify contact methods before using them for recovery or sensitive notifications.
- Support explicit account linking/unlinking with recent re-authentication and collision handling.
- Keep provider-specific subject IDs mapped privately to the canonical LINGO principal.
- Do not expose internal provider identifiers in public URLs or analytics.

### 3.2 Registration and lifecycle
Required lifecycle states: `pending_verification`, `active`, `restricted`, `suspended`, `deletion_pending`, `deleted`. Transitions must be server-authorized, timestamped and auditable.

Minimum flows:
1. Sign up with approved verified contact method and strong password or approved passkey/OAuth option.
2. Verify contact method using single-use, short-lived, rate-limited challenge.
3. Accept current Terms and Privacy Notice versions with timestamp, locale, notice version and consent purpose.
4. Create a minimal profile; collect optional profile data only when needed.
5. Sign in, sign out all sessions, rotate/revoke sessions, recover account and change contact methods.
6. Provide account export, deletion request and retention/legal-hold workflow.
7. Provide age/guardian gates where product, jurisdiction or law requires them; do not collect unnecessary birthdate data.
8. Provide accessibility, localization and abuse-reporting paths.

### 3.3 Authorization
- Identity token validation is not authorization.
- Enforce authorization server-side on every API request and every object access.
- Use roles plus product/tenant entitlements and resource-level checks (RBAC + ABAC).
- Default deny; least privilege; deny cross-user reads/writes; operator MFA and time-bounded elevated access.
- Separate public customer surfaces from operator/admin APIs.
- No client may grant roles, entitlements, wallet balances, coins, rewards, permissions or account status.
- Support immediate credential/session revocation and account risk controls.

### 3.4 Data minimization and protection
- Classify data: public, internal, confidential, restricted.
- Store only necessary attributes; separate profile data, authentication factors, consent receipts, audit records and product data.
- Encrypt in transit and at rest using provider-managed or approved key controls.
- Never log passwords, access/refresh tokens, verification codes, payment credentials or raw sensitive payloads.
- Define retention and deletion by data class, legal basis and provider capabilities.
- Provide data-subject request routing and evidence of completion.
- Avoid using personal identifiers as analytics event properties.

### 3.5 API contract (proposed)
Versioned API base: `/api/v1`. Route names are proposed, not deployed:
- `POST /identity/registrations`
- `POST /identity/registrations/verify`
- `POST /identity/sessions`
- `DELETE /identity/sessions/current`
- `DELETE /identity/sessions` (revoke all sessions)
- `POST /identity/recovery`
- `POST /identity/recovery/complete`
- `GET /me`
- `PATCH /me` (strict allowlist)
- `GET /me/consents`
- `POST /me/consents`
- `POST /me/data-export-requests`
- `POST /me/deletion-requests`

All write operations require server-side validation, abuse/rate controls, idempotency where appropriate, audit correlation IDs and explicit authorization. Return generic authentication/recovery responses that do not disclose account existence.

## 4. Plugin and provider registry

The canonical machine-readable catalog is `config/registry/llg-plugin-integration-registry.v1.json` (companion file in this proposal). Each record must include:

| Field group | Required content |
|---|---|
| Identity | Stable ID, provider, product/service name, official documentation and terms links |
| Purpose | Business capability, use case, product consumers, accountable owner |
| Data | Data classes, fields, user categories, direction, residency, retention, deletion |
| Auth | OAuth/API-key/service-account mechanism, exact scopes, credential owner, rotation and revocation; never credential values |
| Security | Threat model, trust boundary, encryption, least privilege, audit, incident contact |
| Legal | Terms, license, IP/branding restrictions, DPA/subprocessor review, jurisdiction |
| Economics | Plan, free quota, metering, overage, budget ceiling, billing owner, cancellation |
| Reliability | SLA/status page, rate limits, retries, idempotency, timeout, circuit breaker, fallback |
| Lifecycle | discovered, evaluating, approved, staging, production, degraded, suspended, retired |
| Evidence | Test run, reviewer, approval date, contract/version, data-flow diagram and change history |

No plugin may be connected or enabled solely because it appears in the marketplace. Require a purpose, owner, data-flow assessment, scope review, terms review, budget ceiling, staging test and explicit approval. OAuth authorization must be completed by the account owner through the provider's consent flow. Never ask users to paste third-party passwords into LLG.

### 4.1 Integration approval stages
`discovered → evaluating → approved_for_staging → staging_verified → approved_for_production → production → suspended/retired`.

Each transition requires recorded evidence. Production approval is separate from technical staging success. Revocation/retirement must remove tokens, webhooks, scheduled jobs, data copies and references, with a documented retention disposition.

### 4.2 Amplitude-specific guardrails
A connected Amplitude Starter workspace currently exposes one project, ID `902649`, named `default`; the observed event inventory is empty. This is discovery evidence only, not approval to instrument production.
- Require an owner-approved project-to-product mapping and data-processing/privacy review.
- Define event taxonomy and consent/opt-out behavior before instrumentation.
- Do not send email, phone, names, exact location, auth tokens, payment details or free-text secrets as event properties.
- Use pseudonymous stable IDs only when lawful, consented and documented; define identity merge/unmerge behavior.
- Set event retention, access roles, quota/plan ceiling, export policy and deletion propagation.
- Instrument staging first and verify events with synthetic accounts.

## 5. Five LLG-owned application charters

These are proposed products, not currently certified operational services.

### A. LLG Analytics
Purpose: privacy-safe product, operational and executive measurement.
MVP: governed event ingestion, taxonomy registry, consent filters, funnel/retention/feature adoption, quality checks and exportable reports.
Controls: no PII by default; separate revenue from virtual/nonredeemable currencies; source-linked metric definitions; retention and access controls.
Acceptance: synthetic staging events validated end-to-end; event schema tests; deletion/opt-out behavior verified; reconciliation against source systems; cost ceiling.

### B. LLG Command
Purpose: internal work, issue, release, ownership and evidence control.
MVP: project registry, task/issue links, dependency graph, role ownership, approvals, audit history, runbooks and release gates.
Controls: GitHub remains code/source authority; avoid competing issue truth; least-privilege integrations; immutable approval/evidence records.
Acceptance: trace a change from issue → branch/PR → CI evidence → approval → release record without fabricating status.

### C. LLG AI Studio
Purpose: unified multi-provider AI workspace and orchestration.
MVP: provider adapters, model catalog, individual chat, compare, agent workflows, developer APIs, usage and policy controls.
Controls: server-side secrets only; per-provider opt-in scopes; user data isolation; prompt-injection defense; content/safety policy; cost caps; provider fallback; model/version provenance.
Acceptance: isolated provider contract tests; secrets absent from clients/logs; usage limits; tenant isolation; failure handling; traceable outputs.

### D. LLG Automations
Purpose: approved event-driven, scheduled and human-approved workflows.
MVP: workflow definitions, triggers, queue, retries, idempotency, approval gates, dead-letter handling and execution history.
Controls: explicit scopes; allowlisted actions; dry-run; rate limits; stop switch; human confirmation for destructive, financial, external-publication or production actions.
Acceptance: deterministic test workflows, duplicate/replay protection, audit log, rollback/compensation plan and operator kill switch.

### E. LLG App Exchange
Purpose: catalog, review and distribute LLG-owned apps and approved third-party integrations.
MVP: app/plugin catalog, publisher identity, capability manifests, permission prompts, versioning, review evidence, install/uninstall and revocation.
Controls: signed packages/manifests, sandboxing, scoped permissions, vulnerability review, license/terms checks, publisher verification and emergency disable.
Acceptance: install/revoke lifecycle demonstrated in isolated staging; permission diff visible; malicious/overprivileged manifest rejected; audit trail complete.

## 6. Reusable capability implementation policy

LLG may independently implement capabilities observed in third-party tools using public documentation, standards and APIs. Do not copy proprietary source, confidential implementation details, protected branding, copyrighted assets or restricted interface designs. Maintain clean-room implementation notes, original UX, provenance and legal review. A feature parity checklist is not permission to bypass a provider's terms or technical controls.

## 7. Shared platform contracts

All five apps must consume common contracts for:
- LINGO ID and authorization.
- Product/tenant registry and entitlements.
- Consent and privacy preferences.
- Audit/event envelope and correlation IDs.
- Plugin capability manifest and permission scopes.
- Configuration and secret references (never secret values in source).
- Observability, incident severity and service health.
- API versioning, deprecation and compatibility.
- Cost attribution, quotas and budget stop conditions.

No app may fork the canonical user store, create its own global role system, or directly write another product's data.

## 8. Verification and release gates

Required test families:
- Unit/schema/contract and migration tests.
- Authentication: wrong issuer/audience, expired/revoked token, replay, brute force, recovery enumeration and MFA.
- Authorization: cross-user/object access, privilege escalation, tenant isolation and operator boundary.
- Privacy: consent, opt-out, export, deletion, log scrubbing, retention and analytics minimization.
- Integration: OAuth scope, webhook signature/replay, rate limits, timeout, retries, circuit breaker and revocation.
- Reliability: dependency unavailable, queue redrive, idempotency and recovery.
- Accessibility and responsive web/mobile acceptance.
- Security scanning, dependency/license checks and secret scanning.
- Cost/quota tests and emergency stop.

Release requires effective protected branch/ruleset, successful required CI jobs with instantiated steps and artifacts, independent review, staging smoke tests, privacy/security/legal approvals where applicable, rollback/restore rehearsal, operator runbook and explicit release authorization. A queued or startup-failed workflow is not a pass. No promotion based solely on deployment status or a preview URL.

## 9. Workstream register and definition of done

| Priority | Workstream | Owner | Current status | Definition of done |
|---|---|---|---|---|
| P0 | Main protection and release gates | Repo owner / platform | Blocked; fresh state must be verified | Ruleset and required checks read back; actual jobs execute and artifacts correlate |
| P0 | G02 runner recovery | Infrastructure owner | FAIL / UNVERIFIED | runner_id > 0, correct labels, executed steps, logs, artifacts, hosted smoke and correlation |
| P0 | Firebase/Supabase architecture ADR | Platform owner | Blocked | project identity, authority and environment map signed off |
| P0 | Firebase Hosting output scope | Web/platform | Blocked | build artifact-only Hosting config and staging validation |
| P0 | Public-source privacy remediation | Product/privacy owner | Blocked under #476 | source, bundle, assets and QA review pass |
| P1 | LINGO ID contract and implementation | Identity owner | UI preview only / runtime unverified | backend lifecycle and all auth/privacy/isolation tests pass |
| P1 | Plugin registry and approval workflow | Integration owner | Spec proposal | canonical registry validated; owners/scopes/cost/terms/evidence populated |
| P1 | Amplitude governance | Analytics/privacy owner | Connected; empty event baseline | project mapping approved; staging ingestion and privacy/deletion checks pass |
| P2 | Five owned apps | Named product owners TBD | Proposed | each app meets its charter and independent acceptance |
| P2 | Legal contracts and DPAs | Legal/privacy owner TBD | Not evidenced | current provider terms, DPA/subprocessor, IP/license and user-facing legal copy approved |

## 10. Execution rules

- Use non-production branches and synthetic data for implementation.
- Prefer free/local/portable validation; no incremental paid plan, credit top-up or ad spend without explicit budget approval.
- Do not alter production DNS, Worker routes, database data/rules, payments, account permissions, branch protections, secrets or runners as part of this proposal.
- Keep PRs reviewable and narrowly scoped; no bulk merge of draft proposals.
- Preserve raw test outputs and SHA-256 hashes for release evidence.
- Close issues only after acceptance criteria and evidence are independently verified.
- Maintain exceptions with owner, risk, expiry and mitigation.
- Production remains on its last-known-good state until the separate release authorization is recorded.
