# LINGO Enterprise Operating Model

- Status: Proposed target-state addendum to CORE V2
- Date: 2026-11-17
- Authority: `LINGOlegacy_MASTER`
- Canonical source: `thelingolegacy-blip/TheLingoLegacy`
- Governing execution work order: GitHub issue #612
- Release disposition: PROTECTED HOLD

This document consolidates the Master Enterprise Architecture & Technical Specification for TheLingoLegacy / Loyalty Lane Designs into the existing CORE V2 architecture. It is a target-state design and workstream map. It does not assert that a provider is connected, a feature is complete, or a product is production-ready.

## 1. Architecture principles

1. GitHub is the canonical source, review, CI and evidence system.
2. Cloudflare remains the intended public edge; production route, DNS and Worker ownership must be verified before any change.
3. One authoritative transactional store owns each data domain. No dual-primary writes.
4. Identity authentication is separate from LINGO authorization, roles, entitlements and audit.
5. External providers are replaceable adapters behind versioned contracts.
6. Build the smallest modular system that meets measured requirements. Avoid premature microservices, Kafka, Redis, Kubernetes, multi-region and multi-cloud complexity.
7. No secrets or privileged credentials in client bundles, source, logs, artifacts or issues.
8. A design or source file is not proof of execution, integration, certification or production readiness.
9. Free-tier-first; no paid account, region, resource or recurring spend without explicit owner approval.
10. Production and last-known-good remain protected until separately authorized release.

## 2. Experience and client layer

| Surface | Responsibility | Standard |
|---|---|---|
| LINGO Master HQ | Unified navigation, operating overview and role-aware command center | Next.js / React / TypeScript |
| Commerce and public web | Flagship, Loyalty Lane Designs, artist/partner entry and campaign landing pages | Next.js / React |
| Mobile | LINGO ID, account, notifications, community and interactive companion | Flutter / Dart |
| Games | Game-specific rendering and complex interactive worlds where justified | Unity; Flutter/web for lightweight experiences |
| Shared contracts | Typed clients, design tokens, schemas and API contracts | OpenAPI, TypeScript and Dart SDKs |

The root domain remains the flagship LINGO Master Home. Loyalty Lane Designs is a portfolio module, not the root identity or a competing master brand. Existing canonical routes and product names remain governed by the ecosystem registry.

## 3. Identity, API and data layer

- Identity: provider-neutral OIDC adapter. Validate issuer, audience, token type, signature, expiry, JWKS rotation and session lifecycle. Internal identity key is verified issuer + subject; never trust user-editable profile metadata for authorization.
- Authorization: LINGO-owned roles, permissions, organization/partner membership and entitlements. Enforce server-side and at every API/data boundary.
- Core services: Go modular application and workers with versioned REST/OpenAPI contracts.
- Transactional data: PostgreSQL for domains that require relational integrity and atomic transactions. Each migrated domain has one designated owner and a migration/rollback plan.
- Events: transactional outbox written in the same transaction as domain changes; schema-versioned events; idempotent consumers; bounded retry/backoff; dead-letter quarantine; controlled replay; correlation IDs and trace propagation.
- Realtime: use Firebase or another provider only for bounded realtime/presence/chat/telemetry needs after project identity, access rules, retention and data classification are verified.
- Notifications: FCM may deliver push notifications after Firebase project and app ownership are reconciled. Push delivery is not the source of truth for rewards or order state.

## 4. Provider responsibility and selection status

| Provider / capability | Intended boundary | Current decision |
|---|---|---|
| GitHub | Source, PRs, CI/CD, evidence, governance | Canonical |
| Cloudflare | Edge, WAF, Workers/Pages, R2 and optional media delivery | Intended primary edge; production mutations gated |
| PostgreSQL | Transactional data, orders, inventory, ledger and outbox | Core data standard; one authority per domain |
| Supabase | Managed PostgreSQL candidate and optional bounded services | Evaluate existing project in isolated non-production; not approved as production authority |
| Firebase | Candidate OIDC identity adapter, FCM, realtime and Crashlytics | Project identity unresolved; no production configuration or publication |
| Shopify | Product catalog, merchandise commerce and order workflow | Commerce candidate; integration and store ownership must be verified |
| Stripe | Payment adapter and webhook lifecycle | Test mode only until separate payment approval |
| X API | Approved publishing, mentions and engagement integrations | Pending account authorization, scopes, rate-limit and webhook design |
| OpenTelemetry | Traces, metrics and structured redacted logs | Observability standard |
| Media processing | Image transforms and adaptive video delivery | Start with R2/static assets; evaluate managed HLS only against measured need |

### Existing Supabase project inventory

A connected Supabase project was observed as ACTIVE_HEALTHY in us-west-2, PostgreSQL 17.6. Security, performance and health advisor queries returned no lint notices at the time of inspection. These results are preliminary inventory only. They do not establish RLS completeness, schema quality, backup/restore, application connectivity, privacy compliance, cost fit or production approval. Do not use production data or apply migrations as part of this architecture addendum.

### Firebase identity gate

Firebase project identifiers and Hosting configuration are not yet reconciled. Preserve the existing blocker and project-identity review. Firebase may implement an OIDC-compatible identity adapter only after issuer/audience/JWKS, project ownership, account linking, session revocation and recovery behavior are independently verified. Do not assume Firebase is the canonical identity provider from the presence of Firebase configuration.

## 5. Enterprise operating centers

### 5.1 Execution Center HQ

Read-only first. Aggregate portfolio registry, service ownership, dependencies, release state, CI evidence, incidents, operational health, cost and change calendar. Mutations require RBAC, explicit approval, audit logging and rollback.

### 5.2 Social Command Center

Draft brand-aligned posts, threads, campaign briefs and community prompts. Workflow: generate → human review → approve → publish → measure. Track API scopes, rate limits, idempotency, webhook authenticity, content provenance and campaign attribution. Do not auto-publish or reward social actions until provider verification and abuse/fraud controls pass.

### 5.3 Lingo Coin and rewards

Separate these concepts:
- **Play Credits:** non-cash, non-transferable, non-redeemable game-only units.
- **Loyalty Rewards:** separately governed points or entitlements only if terms, legal/tax treatment, eligibility and redemption rules are approved.
- **Payments:** real-money transactions handled only by an approved payment provider and separate payment workflow.

All balances and reward issuance must be server-authoritative, atomic, idempotent and auditable. Use append-only double-entry ledger entries with immutable transaction IDs, balanced postings, unique idempotency keys, concurrency-safe account locking/serializable logic as appropriate, reversal entries instead of destructive edits, fraud limits and independent reconciliation. Never accept client-supplied balances or reward amounts. No cash-out, real-money wagering, transferable token or redeemable game balance is enabled by this document.

Any reward with real-world value, merchandise redemption, event access, sweepstakes or prize mechanics requires legal/tax/promotion review, published terms, eligibility controls, fraud prevention and a separate owner-approved launch gate.

### 5.4 Loyalty Lane Designs commerce

Catalog, product variants, drops, inventory reservation, order lifecycle, fulfillment, returns and artist/custom-run intake. Use atomic reservation/expiry and idempotent order creation to prevent overselling. Public product/media pages may be edge cached; account, cart, checkout, order, inventory-reservation and personalized reward responses must not be shared-cacheable. Shopify is the commerce candidate; Stripe is test-mode only. Do not activate live payments, discounts with monetary value or fulfillment automation before acceptance.

### 5.5 Philadelphia artist and events hub

Artist/partner intake, eligibility and rights review, venue readiness, lineups, schedules, ticketing-provider adapter, event promotion, attendance reporting and artist support. Treat ticket inventory, payments, refunds and access credentials as transactional data. Ticketing provider selection remains pending requirements and cost review.

### 5.6 Media and asset pipeline

Store source assets privately and publish validated derivatives. Use automated image validation, size limits, metadata stripping where appropriate, WebP/AVIF variants and responsive delivery. Use signed/private access for non-public media. Evaluate HLS/DASH, loudness normalization and audio mastering tools only when licensing, rights, performance and measured requirements are clear. Never infer rights to artist or third-party content from upload access.

## 6. Edge, cache and API security

- Cache only public, immutable, versioned assets and explicitly public pages.
- Bypass shared cache for authorization headers/cookies, user profiles, wallets, orders, carts, checkout, tickets, inventory reservations and personalized responses.
- Use private origin access, TLS verification, strict host routing, WAF/rate limits and request-size limits.
- Sign and verify webhooks; enforce timestamp/replay windows and idempotency.
- Keep service-role/database credentials server-side; clients use least-privilege public credentials and enforced row/object policies.
- Test tenant isolation, IDOR/BOLA, CSRF, XSS, SSRF, CORS/CSP, session expiry/revocation and abuse controls.
- Do not expose private source maps, environment files, internal docs, test fixtures or build metadata in public artifacts.

## 7. CI/CD, repository and delivery

The canonical repository remains `thelingolegacy-blip/TheLingoLegacy`. The similarly named private web repository is an inventory/consolidation candidate, not a second authority. Reconcile unique commits, PR ancestry, runtime bindings and ownership before consolidating or retiring anything.

Target modular areas:
- `apps/web` — web HQ and storefront
- `apps/mobile` — Flutter client
- `packages/contracts` — OpenAPI and event schemas
- `packages/ui` — shared UI tokens/components where cross-client reuse is practical
- `services/core` — Go API and workers
- `db/migrations` — versioned PostgreSQL migrations
- `supabase/` — only if Supabase is selected for a bounded environment/domain
- `firebase/` — verified Firebase rules/config/functions only
- `cloudflare/` — Workers, Pages and R2 configuration
- `infra/` — reviewed, environment-scoped infrastructure definitions

Do not reorganize the live repository blindly; first map existing paths and PR ownership. GitHub-hosted `ubuntu-latest` is the recovery target. G02 remains quarantined. CI must instantiate jobs, execute steps, retain logs, publish checksummed artifacts and correlate every result to commit/PR. Pin third-party Actions, minimize token permissions, and separate preview/staging/production identities.

## 8. Integration order and acceptance

1. Repository/provider inventory and protected baseline.
2. Hosted CI recovery and governance verification.
3. Identity contract and disposable test issuer.
4. Go API + PostgreSQL profile transaction + outbox + idempotent consumer.
5. Shared OpenAPI/TypeScript/Dart contracts and Next.js/Flutter integration.
6. Read-only Master Control Plane and portfolio registry.
7. Loyalty Lane catalog/order/inventory sandbox.
8. Non-cash game economy and rewards tests, with no redemption or wagering.
9. Social campaign drafts and test integrations.
10. Artist/event intake and ticketing-provider evaluation.
11. Media/asset processing and observability.
12. Security, load, backup/restore, disaster-recovery and migration rehearsals.
13. Product-by-product certification and separately authorized release.

Every capability moves through NOT STARTED → DESIGNED → BUILT → TESTED → CONNECTED → CERTIFIED → PRODUCTION. Each transition requires inspectable evidence, owner and reviewer acceptance. A source file, provider status, static check or HTTP response alone is insufficient.

## 9. Protected release boundaries

This addendum does not authorize:
- Production deployment, DNS/route or live Worker changes.
- G02 runner activation or duplicate runner registration.
- Production Firebase/Supabase identity or data changes.
- Production database migrations or wallet/ledger mutations.
- Live payment processing, cash-out, real-value rewards or sweepstakes.
- Automated public posting or partner activation.
- Paid infrastructure provisioning or recurring spend.
- Merging draft PRs, force-pushing protected branches or replacing last-known-good.

Production remains PROTECTED HOLD. G02 remains FAIL / UNVERIFIED. Work may continue in isolated branches, local tests and non-production previews with evidence and cost controls.


## 10. CI/CD and reference implementation security review

The six proposed workflows are a useful target, not production-ready code. Implement in isolated PRs only after hosted Actions recovery.

### Workflow topology
- `.github/workflows/ci-quality-gate.yml`: PR-only lint, typecheck, unit/integration tests, Flutter analyze/tests, migration validation, secret/dependency scanning.
- `deploy-edge-web.yml`: isolated preview deploys for trusted PRs; production only from protected main after required checks and GitHub Environment approval. Never deploy production Workers from pull_request.
- `deploy-supabase.yml`: disposable/staging migration tests first; production migrations require protected environment approval, reviewed SQL, backup/restore evidence, project allowlist and post-migration smoke tests. Do not automatically run `supabase db push` against production after a main push.
- `deploy-firebase.yml`: emulator/rules tests and verified staging project; production project allowlist and approval.
- `build-flutter-release.yml`: unsigned PR artifacts separately from signed releases. iOS requires macOS/Xcode; Android signing secrets are protected and never exposed to fork PRs. Beta distribution is gated.
- `media-asset-sync.yml`: quarantine and scan untrusted files, validate content/size/duration, sandbox processing, create deterministic derivatives, publish to staging bucket first.

Use least-privilege per-job permissions, normally `contents: read`; pin Actions to verified full commit SHAs; add timeouts and concurrency groups; protect production with GitHub Environments and required reviewers; use OIDC short-lived credentials where supported. Fork PRs receive no deployment secrets. Do not run untrusted code in privileged `pull_request_target` contexts.

### Cloudflare / Next.js
The sample output `apps/web/.vercel/output/static` is adapter-specific, not a universal Next.js build path. Decide static export versus SSR. For static export, explicitly configure and verify `output: "export"`; for SSR, use a pinned supported Cloudflare Next.js/OpenNext adapter and its documented output. Pages deployment does not certify Worker routes/bindings. Separate preview and production Pages projects, Workers, Queues, KV and R2 namespaces. Validate Wrangler config, account/project IDs, compatibility date and bindings. Waiting Room and Queues availability/cost depend on account plan. Turnstile requires server-side Siteverify, secret protection, hostname/action checks and expiry/replay handling; a client widget alone is not protection.

### Supabase migrations and Firebase identity
Pin Supabase CLI to a tested version, not `latest`. A `db push --dry-run` is not a substitute for applying migrations to disposable/staging DBs, reviewing SQL, testing RLS, checking drift, backup/restore rehearsal and explicit production approval. Separate migration and function deployment credentials; deploy named functions and verify JWT settings/secrets.

Firebase ID tokens are not automatically Supabase Auth JWTs, and Firebase `uid` is not automatically `auth.uid()`. Choose and test a supported third-party JWT trust integration for the Firebase issuer (issuer/audience/JWKS/rotation/subject mapping), or use a server-side token-exchange/BFF. Never mint privileged JWTs in client code or synchronize passwords. Keep LINGO roles/authorization server-owned. If direct Supabase JWT trust cannot be securely configured, keep the Go API as authorization boundary. FCM is a delivery hint, not authoritative order/reward state. Verify Firebase project ID before deployment.

### Ledger schema correction
The supplied `lingo_ledger(amount signed)` is a signed event log, not a double-entry ledger: it has no account model, balanced postings or transaction-level balance invariant. Use:
- `ledger_accounts` with owner/type/unit/status;
- immutable `ledger_transactions` with scoped unique idempotency key and source event;
- `ledger_postings` with signed integer amounts and account/unit;
- deferred constraint trigger or trusted posting procedure ensuring postings sum to zero per transaction and unit;
- unique provider-event/business-claim IDs, integer smallest units, reversal postings, audit actor/correlation ID and reconciliation.

Post atomically; lock accounts in deterministic order or use serializable isolation with safe retry; prevent negative spendable balances in the same transaction. Revoke client direct writes; expose narrow server-side functions only. Every `SECURITY DEFINER` function needs a fixed safe `search_path`, schema-qualified objects, authorization checks and revoked PUBLIC execute. Idempotency alone does not prevent overdraft or concurrent races.

### Inventory reservation correction
The sample `reserve_drop_inventory` is incomplete. Validate positive bounded quantity and TTL; handle missing/inactive SKU; add reservation status (held/committed/released/expired), idempotency key, cart/order reference and timestamps. Make stock reservation and row insertion atomic with nonnegative constraints. Commit, cancel, release and expire exactly once. Reaper should use `FOR UPDATE SKIP LOCKED`, transition held expired reservations and restore stock in the same transaction. A 60-second cron is not a correctness guarantee: checkout must reject expired locks too. Add stress tests for simultaneous reservations, duplicate requests, expiry, payment replay/failure, cancellation and worker crash. The sample lacks quantity validation, missing-SKU handling, commit/release lifecycle, reaper and safe `search_path` configuration.

### Outbox, DLQ and webhook reliability
Write an outbox row in the same transaction as ledger/order/reservation changes. Dispatch stable event IDs; consumers persist inbox/deduplication keys; bounded exponential retry with jitter; DLQ alert, operator replay and audit. For Stripe, verify signatures against raw body, persist unique provider event ID before async processing, handle out-of-order/replayed events and reconcile; never trust browser redirects to mark paid. For X, use approved scopes and provider-verifiable evidence; never reward screenshots/client claims or untrusted webhook bodies. Human approval and demo-only rewards remain default until API policy and abuse controls are proven.

### Media and acceptance tests
Treat uploads as hostile: content-based MIME validation, size/duration/frame limits, sandboxed up-to-date FFmpeg/image libraries, protocol restrictions, path/SSRF protection, source/output hashes and tool-version provenance. Preserve masters and rights/consent records; -14 LUFS is a delivery profile, not universal mastering law. Test: fork-secret isolation; required checks/branch protection; clean install and upgrade migrations; RLS tenant denial; JWT invalid issuer/audience/expiry/revocation/key rotation; balanced ledger/no overdraft/idempotency/reversal; inventory concurrency invariants; webhook invalid signature/replay/out-of-order/DLQ; no cross-user cache leakage; browser/device/accessibility/crash tests; backup restore and recovery rehearsal.

## 11. CI/CD delivery order and current status

1. Restore GitHub-hosted Actions job creation; G02 remains quarantined.
2. Inventory actual repo workflows, lockfiles, Next.js adapter/output, Flutter toolchain, secret names only, Cloudflare bindings and environment IDs.
3. Add PR-only quality gate with pinned Actions and least privilege.
4. Add isolated preview deployment; no production deployment from PR.
5. Add staging migration/RLS pipeline; no automatic production `db push`.
6. Add Firebase emulator/rules tests after project identity reconciliation.
7. Add Flutter unsigned CI artifacts, then gated signing/release.
8. Add media quarantine/processing and staging R2 sync.
9. Add protected production jobs only after acceptance, owner approval, restore proof and security review.

Status: target design documented; these workflow files and database objects have not been implemented by this review. CI startup remains blocked. Production remains PROTECTED HOLD; G02 remains FAIL / UNVERIFIED.
