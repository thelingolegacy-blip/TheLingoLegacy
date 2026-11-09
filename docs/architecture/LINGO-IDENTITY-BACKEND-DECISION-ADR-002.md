# LINGO Identity and Backend Authority Decision — ADR-002

**Status:** OPEN — NOT APPROVED  
**Decision owner:** Repository owner / platform architecture owner (named approver not yet recorded)  
**Scope:** LINGO ID, registration, authentication, profile, authorization, transactional data and all five LLG-owned applications  
**Authority:** GitHub source of truth; non-production proposal on PR #511  
**Release posture:** PROTECTED HOLD; G02 FAIL / UNVERIFIED

## 1. Decision requested

Select one authoritative identity model and one authoritative transactional-data model for LINGO. The decision must define the identity principal, issuer/audience, project/environment map, authorization enforcement point, account lifecycle, provider-to-principal mapping, data ownership, migration boundary and rollback path.

This ADR intentionally makes **no provider selection**. No schema migration, production configuration, account creation, data write or provider cutover is authorized by this document.

## 2. Verified context

- The existing `docs/architecture/LINGO-IDENTITY-WALLET-API-CONTRACT-v1.md` proposes Firebase Authentication as the identity authority and Firebase-scoped UID as the principal.
- PR #515 proposes Supabase PostgreSQL as the primary transactional backend while retaining Firebase compatibility and specialist services. It is a draft architecture proposal, not an implementation or migration.
- Main `.firebaserc` defaults to `lingo-legacy-production`; issue #469 records unresolved project identity across `lingo-legacy`, `loyalty-lane-os` and that production default.
- Main `firebase.json` currently sets Hosting `public` to the repository root (`.`); issue #441 tracks this deployment-scope blocker.
- Main `lib/firebase_options.dart` contains placeholder API keys and app IDs. These are not usable Firebase app configuration.
- The LINGO ID signup page is explicitly a preview and says credentials are not transmitted or stored. No production registration lifecycle is established by that page.
- A Firebase ID-token verifier module exists in source, but its presence does not prove all routes use it. The legacy gateway router deliberately fails closed when identity verification is not configured.
- The connected Supabase project was reported healthy, but the architecture proposal records no LINGO application tables, migration history or Edge Functions.
- The connected Amplitude project is named `default`, project ID `902649`, and the observed 30-day event inventory was empty. It is not a verified LLG production analytics project.

## 3. Options to evaluate

| Option | Identity authority | Transactional data | Advantages to validate | Material risks / prerequisites |
|---|---|---|---|---|
| A | Firebase Authentication | Firebase services | Existing Firebase token-verifier code and proposed identity contract; fewer new provider boundaries if existing Firebase projects are authoritative | Project ownership and IDs unresolved; root Hosting scope unsafe; placeholders; actual Auth providers, rules, App Check, backup and environment separation unverified |
| B | Supabase Auth | Supabase PostgreSQL | Relational transactions, RLS and one Postgres data plane; connected project is reachable | No LINGO schema/migrations/functions; existing Firebase consumers and identities need migration/linking; RLS and recovery model must be designed and tested |
| C | Firebase Authentication | Supabase PostgreSQL | May preserve existing account continuity while using relational transactions | Requires explicit issuer/audience validation, immutable provider-subject mapping, session/revocation design, two-provider failure handling and a tested rollback; no dual-primary writes |
| D | Defer production identity; preview/mock only | No production transactional authority | Preserves protected hold while owner inventories and contract work proceed | Does not deliver unified registration or cross-app identity; must not be represented as launch-ready |

No option is preselected. A provider health status or connected connector is not evidence of project ownership, suitability, legal approval or production readiness.

## 4. Required decision inputs

The decision owner must record evidence for each item before selecting an option:

1. **Ownership and project map:** authoritative provider account owner, project IDs, app IDs, environment labels, billing owner and intended product scope for every Firebase and Supabase project.
2. **Existing identity inventory:** Auth providers, user counts in aggregate only, UID/subject formats, verified-contact state, MFA support, disabled/deleted-account behavior, session revocation and account recovery.
3. **Data inventory:** databases, tables/collections, storage buckets, functions, consumers, data classes, residency, retention, deletion, backups and restore evidence. Do not read customer rows for this decision.
4. **Trust contract:** canonical principal ID, token issuer/audience, signing-key rotation, token lifetime, session refresh/revocation, service-to-service identity and server-side authorization boundary.
5. **Authorization model:** RBAC plus resource/tenant ABAC, operator MFA, default deny, account linking/unlinking, entitlement ownership and audit requirements.
6. **Application compatibility:** web, Flutter, Unity, Cloudflare Workers, games, Studio and all LINGO product surfaces; supported SDKs and migration sequencing.
7. **Security:** RLS/database rules, App Check/device signals, CORS, rate limits, abuse controls, secret storage, key rotation, threat model and independent review.
8. **Privacy/legal:** controller/processor roles, terms, privacy notice, DPA/subprocessors, data subject rights, age/guardian handling where required, retention and cross-border transfers.
9. **Economics/operations:** free quotas, projected active users and event volume, storage/egress/compute costs, overage ceiling, support model, SLA, backups, RPO/RTO and incident ownership.
10. **Rollback:** export/backup, provider outage behavior, account-link rollback, data parity evidence, cutover abort conditions and owner authorized to execute rollback.

## 5. Required LINGO ID contract regardless of provider

- Use an immutable opaque LINGO principal ID. Email, phone, username, display name, device ID and provider subject are attributes or mapped identifiers, never the cross-product primary key.
- Keep provider subject IDs in a private mapping table with uniqueness and collision handling.
- Support pending verification, active, restricted, suspended, deletion pending and deleted lifecycle states.
- Require verified contact methods for recovery and sensitive notifications; use short-lived, single-use, rate-limited verification challenges.
- Record Terms and Privacy Notice version, purpose, locale, timestamp and consent state.
- Support sign-out, revoke-one/revoke-all sessions, recovery, contact change, link/unlink with recent re-authentication, export, deletion and legal-hold workflow.
- Enforce authorization server-side for every API action and object; token validation alone is not authorization.
- Never allow clients to assign roles, entitlements, wallet balances, Lingo Coins, permissions or account status.
- Keep product-specific balances and demo currencies separate. No cash-out, wagering, sweepstakes or cash-equivalent behavior is implied.
- Do not send direct identifiers, credentials, tokens or sensitive free text to analytics.

## 6. Decision record

**Selected option:** NOT DECIDED  
**Authoritative identity provider/project:** NOT DECIDED  
**Authoritative transactional backend/project:** NOT DECIDED  
**Canonical principal format:** PROPOSED — opaque LINGO-owned ID; exact format pending implementation review  
**Issuer / audience:** NOT DECIDED  
**Environment map:** NOT VERIFIED  
**Data migration approach:** NOT DECIDED  
**Rollback owner and procedure:** NOT RECORDED  
**Security review:** NOT RECORDED  
**Privacy/legal review:** NOT RECORDED  
**Cost ceiling and billing owner:** NOT RECORDED  
**Decision approver / date:** NOT RECORDED

## 7. Acceptance criteria to close ADR-002

ADR-002 may be marked ACCEPTED only when:
- the named owner records a signed decision and rationale;
- provider account ownership and exact project IDs are verified through authorized read-only evidence;
- identity, profile and transactional-data authority are unambiguous, with no dual-primary writes;
- issuer/audience, principal mapping, session/revocation, authorization, environments and migration/rollback are specified;
- security, privacy/legal and cost reviews are recorded;
- an isolated staging plan and test matrix are approved;
- the decision is reflected consistently in the identity contract, integration registry and application architecture;
- independent review is recorded.

Until then, keep identity registration preview-only, keep backend migrations and production writes blocked, and do not resolve #469 or #438 as complete.

## 8. Related records

- PR #511 — Wave 0 master registry and integration contracts
- PR #515 — Supabase-primary backend architecture proposal
- Issue #438 — platform integration certification
- Issue #441 — Firebase Hosting output-scope blocker
- Issue #469 — Firebase project identity reconciliation
- Issue #470 — main branch protection and required checks
- Issue #476 — public staging privacy remediation
- Issue #507 — private integration plane and security boundaries
- Issue #517 — enterprise completion control tower
