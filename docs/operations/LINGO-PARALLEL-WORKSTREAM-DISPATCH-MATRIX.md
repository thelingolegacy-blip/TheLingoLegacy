# LINGO Parallel Workstream Dispatch Matrix
Version 1.0.0 · 2026-11-15 · Portfolio authority: LINGOlegacy_MASTER

## Operating model
Execute independent streams concurrently in isolated branches, but keep shared files under one integration owner. The matrix assigns work by dependency and acceptance evidence; it does not imply that unassigned teams or automated agents have already been started.

| Stream | Priority | Scope | Existing control record | Parallel output | Blocking dependency | Acceptance |
|---|---|---|---|---|---|---|
| A — Flagship web and landing | P0 | Root homepage, 14-realm directory, apex/www route parity, SEO, accessibility and mobile/TV navigation | PR #548, PR #602, issue #480 | Verified web source, route map, browser QA evidence, rollback plan | GitHub Actions startup; independent browser QA | Exact commit, all routes pass, apex/www parity, accessibility/performance evidence, release approval |
| B — CI and recovery | P0 | Actions startup, runner policy, job creation, artifact/log retention, branch governance | Issue #575, issue #459, issue #480 | Working hosted smoke, policy findings, CI evidence, protected release checks | GitHub Actions service/policy and authorized admin access | Jobs instantiated/completed; steps, logs and artifacts correlated to commit; G02 remains untouched |
| C — Core API and identity | P1 | LINGO CORE V2, profile API, OIDC contract, PostgreSQL role/TLS, outbox lifecycle | PR #596, issue #601, issue #480 | Hardened API contract, JWKS-backed tests, DB integration evidence, service runbook | Identity issuer/token-type decision; CI recovery | Authn/authz tests, TLS verification, least privilege, DB integration, retry/DLQ semantics, telemetry |
| D — Firebase and mobile | P1 | Firebase project identity, Hosting publication boundary, Auth/App Check, Flutter web/Android builds | Issue #575, issue #537, issue #438 | Dedicated public build output, reconciled project/app IDs, reproducible Flutter artifacts | Firebase project/target reconciliation; secure signing material; CI | Hosting file allowlist, Firebase emulator/integration tests, App Check/Auth tests, pinned toolchains, non-debug release signing |
| E — Games and game engines | P1 | LINGOslots, LINGOarcade, game session contracts, Unity builds, save/progression and virtual economy | Issue #543, issue #480, product game specs | Game registry, server-authoritative session/economy APIs, Unity vertical slices | Identity/session boundary, game rules and asset rights | Deterministic gameplay tests, anti-cheat/security review, no cash wagering/redemption, device QA |
| F — Library, media and content | P1 | Kotton's Code, books, learning worlds, Rise of Zavione, media pipeline and publishing rights | Issue #480, product privacy/release records | Rights-cleared catalog, content manifests, privacy-reviewed public pages | Family/minor privacy, creator rights and approved assets | Privacy review, guardian disclosures where applicable, rights evidence, accessibility and publishing QA |
| G — Lane and commerce | P1 | Loyalty Lane Apparel, Loyalty Lane Cycle, Shopify catalog/orders and Stripe test mode | Issue #480 and commerce/provider records | Verified catalog routes, test checkout, order/refund/webhook reconciliation | Merchant ownership, tax/refund policies, secure provider configuration | Test-mode end-to-end flow, webhook signatures/replay, reconciliation, no live payments until acceptance |
| H — Operations, triggers and LINGOshield | P1 | Registry, event dispatcher, incident command, monitoring, backup/restore and cost guardrails | PR #602, issue #575, issue #480 | Versioned trigger catalog, alert destinations, service runbooks, recovery drills | Event source and notification sink decisions; IAM/access approvals | Trigger delivery tests, idempotency, redaction, escalation, restore rehearsal and owner acceptance |
| I — Security and release control | P0/P1 | PR #574 security remediation, threat models, branch protection, release certificates and production gates | PR #574, issue #480, issue #575 | Security evidence, branch governance, signed release manifest | CI startup and authorized admin review | Required checks pass, independent review, evidence bundle, owner-approved release |

## Dependency graph
1. Stream B (CI startup) is a shared prerequisite for automated acceptance across all streams.
2. Stream A can continue source and preview work while B is blocked, but cannot certify or promote the public website.
3. Stream C defines the identity/API contract consumed by D, E, G and H; token/provider decisions must be consistent.
4. Stream D owns Firebase publication and Flutter reproducibility; do not deploy Firebase from repository root.
5. Streams E, F and G can build isolated product UI and synthetic/test-mode flows while identity and backend are under review.
6. Stream H can finalize config, schemas and runbooks while actual event subscriptions/alerts remain unprovisioned.
7. Stream I is a release gate for every production promotion; no stream can self-approve its production release.

## Shared-file ownership
- Product/realm registry: one integrator; all stream changes submitted as PRs.
- Root Worker and route table: Stream A plus Cloudflare edge owner; no parallel production edits.
- GitHub workflow files and branch rules: Stream B/Stream I only.
- Identity schemas and API contracts: Stream C only; consumer changes go through versioned PRs.
- Firebase project files and Flutter signing: Stream D only.
- Game registry and economy rules: Stream E only.
- Asset manifests and rights metadata: Stream F with asset owner review.
- Commerce/provider config: Stream G; secrets are managed separately.
- Trigger catalog and runbooks: Stream H; production alert integrations require approval.

## Parallel execution protocol
1. Every stream starts from the current accepted base SHA and creates its own feature branch.
2. Each task declares file ownership, dependency IDs, measurable acceptance and rollback.
3. Synthetic data and preview environments are the default.
4. Shared contracts are merged in dependency order; consumers may build against versioned mocks while contracts are pending.
5. No stream changes production DNS, Worker traffic, Firebase publication, payment mode, wallet state, identity provider, runner registration or destructive infrastructure without separate approval.
6. Integrator reconciles branch drift and duplicate work before opening or updating a PR.
7. A stream is marked complete only with commit-correlated tests, artifacts, security/privacy/accessibility review, operational runbook and owner acceptance.

## Current execution snapshot
- A: root homepage is governed by draft PR #548; 14-realm directory and integration contract are in draft PR #602.
- B: blocked by workflow startup_failure; latest observed run has no jobs/artifacts.
- C: PR #596 is BUILT/UNVERIFIED and has security/operability findings outstanding.
- D: Firebase project/publication and Flutter build blockers remain open in #575/#537.
- E: game prototypes and product specs exist; backend/session/security certification remains open.
- F: public Kotton's Code page exists; family privacy and asset rights review remains open.
- G: commerce pages exist; test-mode and merchant/provider acceptance remain open.
- H: trigger definitions and validators are checked in by PR #602; actual event subscriptions, alert destinations and automated remediation are not provisioned.
- I: PR #574 and branch/release governance remain evidence-gated.

All streams remain within PROTECTED HOLD until the exact release gates pass.
