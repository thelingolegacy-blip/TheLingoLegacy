# LINGO Legacy Platform Infrastructure Audit

**Audit date:** 2026-10-16  
**Scope:** Public flagship, canonical Worker and Wrangler configuration, platform/API contract, assistant integration boundaries, UI runtime, media pipeline, CI/CD and release governance.  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Disposition:** Audit and proposal only. No production deployment, DNS mutation, secret rotation, merge, activation, or release promotion is authorized by this document.

## Executive finding

The public flagship currently presents a coherent multi-world concept: Kotton's Code, Dice Shift Hotel, The Rise of Zavione, Lightborne, That's My Lingo and LINGOassist, with shared platform surfaces including LINGOmedia, LINGOarcade, LINGOlane, LINGOlibrary, askLINGO, LINGOworld, LINGOclub and LINGOai. The next upgrade should consolidate this experience behind one verified architecture and one design system rather than layering more disconnected pages and runtime scripts.

The live homepage was readable through a public web fetch on 2026-10-16. The connected repository source was also inspected. This is not a complete browser/device accessibility or penetration test.

## Evidence-backed observations

1. **Release governance is correctly fail-closed, but it is still blocked.** The canonical README and Worker report G02 as FAIL / UNVERIFIED, G03–G11 blocked, production mutation frozen and LKG protected. Existing issue #209 documents repeated GitHub Actions jobs with runner ID 0, no runner name, no steps and unavailable logs. Do not treat source-level checks as executed CI.
2. **The Worker has a broad API fallback.** `worker.js` explicitly serves `/api/create-checkout-session`, `/api/beacon-text-alerts` and a small set of runtime/status routes, then returns 404 for every other `/api/*` path. A live askLINGO/assistant API cannot be assumed from the presence of its page or integration documentation.
3. **Assistant implementation and assistant intent need reconciliation.** `docs/ASKLINGO-AI-INTEGRATION.md` describes an askLINGO integration, while the canonical Worker does not currently route an assistant endpoint. Source presence or a UI launcher is not proof that a model provider is configured or reachable.
4. **Asset scope requires a security review.** `wrangler.jsonc` sets the static asset directory to `.`. Confirm the exact Cloudflare asset upload behavior and deny/exclude rules before any deployment; do not assume repository docs, manifests or configuration files are private when the repository root is the asset directory.
5. **Rate limiting is isolate-local.** The Worker uses an in-memory `Map` for beacon rate buckets. That is not a durable, globally consistent rate limiter across Worker isolates. Use Cloudflare rate limiting or a properly designed durable store, with abuse-resistant client identity and retention.
6. **Security headers need a deliberate policy.** The Worker sets several baseline headers but no Content-Security-Policy in the inspected source. Design CSP from actual script/style/connect/image/media sources and test in report-only mode before enforcement. Review whether `X-Frame-Options: SAMEORIGIN` matches embedding requirements.
7. **HTML injection needs resilience tests.** `renderDynamicHtml` injects runtime asset URLs and a global runtime object into HTML. Test responses with missing/malformed head tags, duplicate inclusion, content encoding, caching and existing CSP; verify injected assets return the intended content types and status.
8. **Architecture documentation has drift risk.** The README says Cloudflare Workers/Pages and GitHub Actions are canonical and Vercel is retired. Search results show older Studio documentation with Vercel deployment references and competing visual/runtime descriptions. Mark legacy docs as archived or update them only after confirming which deployment contract is authoritative.
9. **Public homepage scope is promising but needs systematic QA.** It identifies worlds and platform categories, but every navigation item, CTA, icon, logo, media item and destination needs a route inventory, link check, responsive review, keyboard test and accessibility audit.
10. **Commerce and game value must remain separated.** Keep demo gameplay/rewards distinct from real-money wagering, cash-out, prize eligibility and payment processing. Checkout success UI must be backed by provider-side session verification, not query-string state alone.

## Target architecture

- **Experience layer:** One responsive flagship shell, route registry, design tokens, accessible components, error/loading/empty states and route ownership.
- **World/platform layer:** Canonical manifest for worlds, products, navigation, icons/logos, media, owners, status and launch eligibility. Avoid duplicated hard-coded catalogs.
- **Assistant layer:** `askLINGO` as user-facing interaction; `LINGOai` as provider/model orchestration; `LINGOassist` as internal planning/build/QA/evidence/governance workflow; `LINGOassister` as implementation/reconciliation coordinator; `LINGOassisthem` as independent review/challenge role. These are proposed role boundaries, not claims that autonomous services already exist.
- **API/runtime layer:** Versioned API contracts, schema validation, authentication/authorization, explicit provider adapters, quotas, timeouts, retries, audit logs and safe fallback behavior.
- **Data layer:** Firebase Auth/Firestore/Cloud Functions where justified; Cloudflare D1/KV/R2 only for clearly assigned workloads. Define data ownership, migration, backup/restore and retention per service.
- **Media pipeline:** Source masters separated from web exports; registry with asset ID, kind, owner, version, SHA-256, rights/license, alt text/transcript, variants and approval state. Generate responsive image/video/audio variants and publish through a controlled pipeline.
- **Edge/security layer:** Cloudflare Worker, least-privilege bindings, CSP, secure headers, explicit asset exclusions, request validation, rate limiting, abuse controls and observable error handling.
- **Delivery layer:** GitHub Actions gates with reproducible build, lint, unit/integration tests, dependency and secret scans, accessibility checks, link/route checks, artifact checksums, deployment preview and post-deploy probes. Production promotion remains blocked until real runner evidence is available.
- **Observability layer:** Correlated request/run/commit identifiers, sanitized logs, uptime and route probes, error rates, provider health and incident evidence with no secrets or personal data in artifacts.

## Agent workflow and boundaries

1. **LINGOassist — planner/control plane:** Convert findings into scoped tickets and acceptance predicates; preserve production freeze and LKG.
2. **LINGOassister — implementation coordinator:** Reconcile repository structure, route registry, design system, assistant contracts and media metadata in isolated branches.
3. **LINGOassisthem — independent challenger/QA:** Look for missing evidence, security/privacy issues, accessibility failures, regressions and unjustified completion claims.
4. **askLINGO — product interface:** Expose user-facing help only after its real provider/API status, privacy behavior and failure states are verified.
5. **LINGOai — model orchestration:** Route approved tasks to configured providers through a versioned adapter, with secrets server-side, explicit budgets, timeouts, safety policy and auditable outcomes.

No role may override release gates, expose secrets, authorize real-value gameplay, merge its own unreviewed production change, or claim success without evidence.

## Prioritized work packages

### P0 — Establish trustworthy execution and asset boundaries
- Resolve G02 at the GitHub Actions service/account/runner boundary using existing incident evidence.
- Inspect repository Actions settings, runner inventory, policy, and Support case status.
- Confirm the exact deployed Worker version, routes, bindings and public reachability with independent probes.
- Verify whether root-based static asset configuration exposes unintended files; define explicit asset include/exclude policy.
- Capture a baseline of canonical and WWW status, redirects, TLS, runtime, manifest, gates, modules and key asset URLs.

**Acceptance:** real runner ID/name, executed steps, retrievable logs/artifacts, correlated commit/run/job evidence, independently verified; asset exposure reviewed; public probes agree with source/runtime. Until then no promotion.

### P1 — Consolidate the platform and design system
- Generate a single world/platform route manifest and reconcile all homepage navigation destinations.
- Establish canonical design tokens for Industrial Noir, metallic neutrals, gold and royal purple; define approved accent use by world.
- Standardize typography, spacing, focus/hover/pressed/disabled states, responsive cards, dialogs, navigation, forms, status indicators and empty/error states.
- Create approved SVG/icon and logo registry with light/dark, app icon, favicon, social preview and minimum-size variants.
- Remove duplicated CSS/runtime injections only after route-by-route visual regression tests.

### P2 — Make assistant capabilities real and safe
- Inventory assistant UI, API routes, model providers, secrets, prompts, tools and current availability.
- Define separate contracts for askLINGO, LINGOai and internal LINGOassist workflows.
- Add authentication, authorization, request/response schemas, rate limits, redaction, timeouts, cost ceilings, fallback responses and audit events.
- Ensure the UI accurately displays configured/unconfigured/degraded states; never label a provider LIVE from source presence alone.

### P3 — Standardize worlds, engines and platform modules
- Publish a versioned module registry for LINGO Core Runtime, LINGOslots, LINGOarcade, LINGO World Engine and LINGO Experience Engine.
- Define engine interfaces for identity, entitlements, progression, rewards, content, events, media and telemetry.
- Keep each world isolated by route, theme, content schema and feature flags while sharing approved platform services.
- Treat the universal wallet, XP, loyalty and rewards as server-authoritative systems with idempotency, ledger/reconciliation and audit controls.

### P4 — Production-grade media pipeline
- Create asset intake, rights review, metadata validation, transcoding/optimization, preview, approval, publication and rollback stages.
- Validate image dimensions, responsive variants, SVG safety, video codecs/posters/captions, audio loudness/transcripts and font licenses.
- Store checksums and immutable version identifiers; keep originals separate from delivery artifacts.
- Gate publication on owner approval, rights status, accessibility metadata and successful delivery checks.

### P5 — CI/CD, release evidence and operations
- Restore working runner dispatch before trusting workflow results.
- Run independent quality gates; preserve real logs and sanitized artifacts; correlate run, attempt, commit, job and deployed version.
- Add preview deployment, smoke/E2E, accessibility, dependency/security, performance and rollback verification.
- Keep promotion and activation manual/authorized until acceptance predicates pass.

## Required release evidence

For every change: SOURCE → EVIDENCE → VERIFICATION → ACCEPTANCE → AUTHORIZATION → PROMOTION.

Minimum evidence includes source commit, changed-file summary, executed test logs, artifact checksum, security/accessibility results, route/runtime probes, deployment identity (if authorized), and an independent reviewer outcome. A source file, successful API request to create a workflow, or passing local check is not proof that production changed successfully.

## Current decision

**Audit result: PARTIAL — architecture and source risks identified; full certification not possible.** The homepage was fetched, and the canonical Worker/configuration/README plus incident records were inspected. No complete device matrix, browser automation, production Cloudflare binding inventory, provider/account settings, or successful G02 runtime evidence was available in this audit.

**Production status:** HOLD. **G02:** FAIL / UNVERIFIED. **Production mutation freeze:** ACTIVE. **LKG:** PROTECTED. No merge, deployment, DNS change, secret rotation, wallet/game activation or release promotion is authorized by this report.
