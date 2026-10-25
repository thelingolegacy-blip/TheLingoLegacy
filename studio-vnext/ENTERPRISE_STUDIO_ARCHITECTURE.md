# LINGO Legacy Enterprise Studio — Target Architecture and Operating Standard

**Status:** Architecture specification committed to the recovery branch; not a claim that every subsystem is implemented or production-certified.  
**Governance:** Fail closed. No production promotion without independently verifiable evidence for every required gate.  
**Public entry point:** www.thelingolegacy.com

## 1. Product canon and public information architecture

Use established names consistently: The Lingo Legacy, LINGOlegacy, LINGOlane, LINGOslots, AskLINGO, Loyalty Lane Apparel, That’s My Lingo, and KOTTONSCODE. Do not introduce Duolingo references. Do not place a decorative star after “Lingo.” Industrial Noir is the shared visual foundation; each product may have its own palette, typography, motion and illustration system.

Public pages: Home; Studio/Build with LINGO; Loyalty Lane Apparel; That’s My Lingo; KOTTONSCODE; AskLINGO; LINGO items/products; Journal/Blog; About/Legacy; Contact/Support; Trust/Privacy/Terms/Accessibility; Release Notes/Public Roadmap; and service status.

Every landing page needs an explicit owner, purpose, canonical slug, SEO title and description, primary CTA, content schema, required assets, analytics events, accessibility checklist, functional test plan and release gate. A route existing is not proof that its promised feature works.

The authenticated Studio Portal is separate from the public site. It contains project dashboards, task boards, asset registry, builds, test reports, release gates, environments, incident runbooks and approvals. Admin routes must not be indexed or expose credentials.

## 2. Shared platform architecture

- **Repository/build:** pnpm workspaces, Turborepo, TypeScript strict mode, pinned Node LTS, committed lockfile and deterministic builds.
- **Web:** Next.js App Router, React, typed route/API contracts, accessible design system, responsive layouts, server-rendered public content and explicit error states.
- **Mobile:** Flutter packages with Melos where a shared mobile application is justified. Business rules remain server-authoritative.
- **Games:** Keep That’s My Lingo isolated behind versioned game APIs. GDevelop, Unity and Flutter are product-specific choices, not interchangeable runtimes. Build the KOTTONSCODE interactive world as its own experience.
- **API:** versioned contracts, schema validation, authentication and authorization, rate limits, idempotency for financial operations, audit logs and explicit failure responses.
- **Identity:** Firebase Authentication may be used once valid project configuration is supplied. Verify identity server-side; never trust client claims for privileged actions.
- **Data:** Firestore for suitable document/realtime workflows; managed PostgreSQL for relational constraints, reporting and ledger integrity where appropriate; Cloudflare R2 or equivalent for versioned media. Define one authoritative owner for every data domain.
- **Commerce:** Shopify remains the source of truth for apparel products, inventory, orders and fulfillment. Verify webhook signatures, idempotency and reconciliation.
- **Payments:** Stripe only for approved subscriptions/services with server-side webhook verification. Never store card data.
- **Hosting/edge:** Cloudflare for DNS, edge security, static/media delivery and selected Workers; Pages for the static recovery surface; Vercel or another chosen host for the Next.js application. Assign one canonical origin per hostname.
- **Observability:** structured logs, traces, metrics, uptime probes, error tracking, release markers and alerts. Redact tokens, personal data, signed URLs and payment details.
- **Content/search:** typed content models and a controlled publishing workflow; introduce a CMS only with an authoritative content source and access model.
- **Analytics:** privacy-aware events with documented purpose, consent and retention. Children’s data requires specific privacy and legal review.

Suggested monorepo boundaries:
- apps/web — public Next.js site
- apps/studio-portal — authenticated operations console
- apps/mobile — Flutter app if in scope
- apps/game-thats-my-lingo — game client
- apps/world-kottons-code — interactive story/world
- packages/design-system, brand-canon, api-contracts, auth-policy, observability, test-fixtures
- services/identity-adapter, game-session, wallet-ledger, commerce-webhooks, content-index, media-pipeline
- infra/cloudflare, infra/firebase, infra/hosting, infra/observability
- ops/runbooks, ops/incident-journal, ops/release-evidence

This is a target layout, not a claim these directories or services already exist. Extract services only where a trust boundary, scaling need or independent release warrants it.

## 3. Product-specific requirements

### Loyalty Lane Apparel
Collections, product detail, sizing, inventory, cart, checkout, shipping/returns, loyalty, affiliate/creator program and Shopify integration. Test catalog sync, webhook signatures, idempotency, order/inventory reconciliation, refunds and end-to-end purchase flows in sandbox before real transactions.

### That’s My Lingo
Game lobby, rules/help, settings, achievements, leaderboards, account status and persistent sessions. Production play must use server-authoritative rules and outcomes, not client-side balance edits. Separate non-cash XP, virtual demo currency, purchased value and any redeemable value. Real-money or redeemable-value features remain blocked pending jurisdictional, licensing, age, payment, responsible-play and legal review. Never label a local simulation as a live connected game.

### KOTTONSCODE
Character/world bible, canon registry, episodes, ebooks, audiobooks, YouTube/video series, accessible interactive stories, activity pages, guardian information, rights/clearance, captions/transcripts and moderation. Avoid uncontrolled direct messaging or open user-generated chat for children; design privacy and guardian controls from the start.

### AskLINGO
Approved knowledge sources, source citations, search/assistant interface, feedback, safety boundaries, privacy filters and consent controls. Protect against prompt injection, sensitive-data leakage and unsupported claims. Establish cost, latency and quality limits with evaluation tests.

### Blog/editorial
Categories, tags, author profiles, search, draft/review/publish states, canonical URLs, metadata, structured data, RSS/sitemap and review dates. Content must be accurate, rights-cleared, accessible and correctly mapped to its landing page.

## 4. Data and asset governance

Core data domains:
- Identity: user ID, verified claims, roles and consent.
- Content: content ID, canonical slug, locale, version, author/reviewer, publication time, accessibility and SEO metadata.
- Assets: immutable asset ID, creator/license, checksum, dimensions/duration, format, alt text/transcript/captions, moderation/security status and derivative versions.
- Commerce: Shopify authoritative; local copies are projections with reconciliation.
- Game sessions: session ID, game/build version, ruleset, event history and audited outcome.
- Wallet: append-only double-entry ledger with immutable transaction IDs, integer minor-unit amounts, currency, idempotency key, actor, timestamp, reversal linkage and reconciliation status. Never silently edit ledger history.
- Rewards: XP separated from currency; define expiry, transfer, refund and fraud rules.
- Evidence: gate ID, check ID, commit, environment, run ID, timestamp, checksum, verifier and decision. Never put secrets in evidence artifacts.

Creative pipeline: approved brief → concept/art direction → editable source retention → export → automated dimensions/codec/alpha/naming/checksum/size validation → alt text/captions/transcripts/reduced-motion alternatives → malware and rights checks → responsive visual regression → owner acceptance → versioned release. Maintain logos, backgrounds, product photography, characters, sprites, animations, sounds, music, voice-over, ebooks, audiobook masters, thumbnails and social cutdowns in a versioned asset manifest. Do not hotlink unknown assets. Audio must be user-controlled; no sound autoplay. Respect reduced-motion preferences.

## 5. Build and release pipeline

SOURCE → STATIC CHECKS → UNIT TESTS → CONTRACT TESTS → INTEGRATION TESTS → BUILD → SBOM/DEPENDENCY REVIEW → SECURITY SCANS → PREVIEW DEPLOY → E2E/ACCESSIBILITY → PERFORMANCE → HUMAN ACCEPTANCE → RELEASE AUTHORIZATION → CANARY → LIVE VALIDATION → ACCEPTANCE.

Required practices:
- PR checks run lint, typecheck, unit/contract tests, accessibility checks and build.
- Use isolated preview environments and synthetic data; no production secrets in previews.
- Pin CI actions to immutable SHAs where practicable; review lockfile diffs.
- Generate software bill of materials, dependency/license reports and build provenance.
- Use least-privilege CI permissions, secret masking, OIDC where supported and protected production environments.
- Require real job assignment, instantiated steps, logs and artifacts; a workflow that fails before its first step has not tested application code.
- Use canary/staged rollout where supported. Monitor health, error rate, latency and business invariants.
- Document last-known-good artifact, database compatibility, migration recovery and edge/DNS behavior.
- A green build or HTTP 200 alone is not production acceptance.

## 6. Quality gates

- G00 Source authority: repository, branch, commit and asset provenance verified.
- G01 Repository integrity: branch protection, code owners, review requirements and required checks verified.
- G02 Runner dispatch: eligible runner assigned; runner ID/name present; steps instantiated; sentinel executed; logs and artifacts retrievable.
- G03 CI execution: lint, type, unit, contract and build checks pass on the exact commit.
- G04 Security: secrets, dependencies, SBOM, headers, permissions and asset-upload controls reviewed.
- G05 Product contracts: routes show correct content and every claimed control has a functional test; no placeholder redirects masquerading as complete features.
- G06 Data/auth: valid environment config, role tests, server-side authorization, backup/restore, migration safety and reconciliation.
- G07 Accessibility/performance: keyboard-only, focus, semantics, contrast, zoom/reflow, forced colors, reduced motion, mobile and performance checks pass.
- G08 Live validation: HTTPS, DNS/hostname, canonical redirects, assets, robots/sitemap, APIs, errors and critical flows verified.
- G09 Acceptance: product owner and independent verifier accept evidence.
- G10 Promotion: authorized change, rollback plan and release window recorded.
- G11 Post-release: synthetic probes, telemetry, incident response and rollback readiness confirmed.

Unknown or failed required gates block promotion. Evidence must be tied to a commit and environment, timestamped and independently inspectable.

## 7. Agents, bots, tasks and containment

Candidate agents: issue triage, documentation lint, route/content audits, asset metadata, test generation, dependency reports, log summarization, incident timeline drafting, build orchestration and recovery recommendations.

Every agent needs a named owner, narrow purpose, minimal time-bounded permissions, allowlisted tools/paths, read-only default, explicit mutation approval, isolated workspace, synthetic fixtures, timeout/budget/concurrency limits, idempotency/retry policy, immutable action log, secret/PII redaction, kill switch and rollback procedure. Agents may not self-approve releases, alter their own permissions, exfiltrate secrets, run unreviewed code against production data or bypass failed gates. Separate planner, executor and verifier roles for high-risk changes.

## 8. Failure and recovery playbooks

### CI runner startup
1. Stop blind retries; empty job lists are not application test failures.
2. Capture run/check metadata, runner inventory, runner-group/policy settings and sanitized host process/service/polling telemetry.
3. Confirm online state, active polling, repository eligibility and label match.
4. Run one manual sentinel only after eligibility is proven.
5. Require runner ID/name, assigned job, instantiated steps, real logs and retrievable artifacts.
6. If still failing, preserve evidence and escalate with timestamps/run IDs. Do not promote.

### Build/deployment
1. Preserve last-known-good production.
2. Capture commit, toolchain, lockfile, logs, artifact hashes and environment.
3. Reproduce in a clean isolated environment.
4. Fix source and add regression coverage.
5. Validate preview routes, assets, accessibility and critical transactions.
6. Promote only after gates pass; otherwise revert preview changes and record the incident.

### Firebase/configuration
1. Keep release blocked; never fabricate keys or project IDs.
2. Obtain configuration from the authorized project owner/secret manager.
3. Separate public client configuration from server-only secrets and scope environment targets.
4. Run config verification, auth integration tests, rules tests and least-privilege review.
5. Verify project, authorized domains, rules and recovery path.

### Data/ledger discrepancy
1. Freeze affected writes or feature only; preserve unrelated services.
2. Snapshot data/audit logs and record scope.
3. Reconcile immutable ledger entries with external records.
4. Apply reviewed compensating transactions, never destructive history edits.
5. Verify invariants with second-person approval and document recovery.

### Security incident
Contain affected integration, revoke/rotate compromised credentials, preserve evidence, assess exposure and notification duties with the accountable owner, patch and scan, redeploy through gates, then complete a root-cause review.

### DNS/domain failure
Do not experiment on apex records. Capture authoritative DNS, TLS, route headers, deployment IDs and origin health. Confirm one origin per hostname; validate a staging hostname first; preserve rollback records; change production routing only after independent acceptance and authorization.

## 9. Operating cadence

Every change: ticket, scope, owner, risk, acceptance criteria, branch, tests and rollback note. During recovery: review blockers, evidence freshness, runner health, deployment health and incidents; avoid speculative production mutations. Every release: provenance, SBOM, tests, accessibility/security reports, approval, rollback target and live smoke record. Monthly: restore drill, access review, dependency/license review, cost/quota review, backup retention and agent-permission audit. Every incident: journal, timeline, impact, evidence, recovery owner and prevention action.

## 10. Phased delivery

- Phase 0 — Protect/inventory: preserve production/LKG; inventory repo, DNS, hosts, routes, assets, secrets references, data owners, quotas and blockers; establish route/content registry.
- Phase 1 — Studio foundation: repair G02; validate CI from clean checkout; replace placeholder configuration with authorized Firebase values; establish protected environments, artifacts, observability and backups.
- Phase 2 — Flagship site: replace placeholder/redirect-only content with correct page-specific experiences; complete route, control, keyboard, screen-reader, contrast, reduced-motion, forced-colors and responsive tests.
- Phase 3 — Apparel: Shopify sandbox, catalog sync, checkout test mode, webhooks, reconciliation, returns/shipping policy and end-to-end purchase tests.
- Phase 4 — That’s My Lingo: server-authoritative sessions, rules, outcomes, wallet/XP ledger, persistence, fraud controls, telemetry and responsible-play safeguards; legal clearance before any real-money/redeemable-value activation.
- Phase 5 — KOTTONSCODE: character bible, media catalog, rights, accessible interactions, guardian controls, moderation and privacy review.
- Phase 6 — AskLINGO/shared services: approved indexed sources, citations, safety evaluation, privacy boundaries, feedback triage and cost/latency limits.
- Phase 7 — Enterprise operations: disaster-recovery drills, independent security review, SLOs/alerts, incident automation, cost controls, access recertification and evidence retention; then consider staged production promotion.

## 11. Alternatives and decision rules

Hosting: Cloudflare Pages/Workers for static/edge workloads; Vercel for Next.js workflows; one selected host per hostname.  
Database: Firestore for suitable document/realtime workflows; PostgreSQL for relational and ledger constraints; hybrid only with explicit ownership/reconciliation.  
Game engine: retain a working engine unless performance, export targets, team skills or cost justify migration.  
CI: GitHub Actions when runner eligibility is verified; a managed runner/provider may be a contingency but must satisfy the same evidence gates. Provider switching does not prove root cause fixed.  
CMS: repository content for small reviewed content sets; managed CMS for larger editorial teams with access control and portable export.  
Identity: Firebase Auth only after configuration/rules are validated; do not create competing identity authorities without a migration plan.

## 12. Current recovery boundary

The recovery branch and Cloudflare staging work are a foundation only. The latest recorded staging crawl passed 118/118 discovered routes, but aliases may point to nearby pages and do not implement the underlying capabilities. Apex/www remain on the existing production experience. G02, valid Firebase configuration, full accessibility/security acceptance, governance/admin evidence and independent production certification remain blockers. Do not claim the target architecture is implemented until code, tests, deployments and evidence prove it.
