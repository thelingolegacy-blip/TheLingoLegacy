# LINGO Stack Matrix & Integration Contracts
Version 1.0.0 · 2026-11-15 · Authority: LINGOlegacy_MASTER
Status: target architecture with evidence-labelled current state; no unverified provider is treated as connected.

## 1. Global stack decisions

| Concern | Standard | Boundary / rule |
|---|---|---|
| Source of truth | GitHub | Every production-capable app and Worker source must map to a repository, commit and build artifact. |
| Public edge | Cloudflare Workers/Pages | Route ownership is explicit; edge changes are preview-first and reversible. |
| Web UI | Static HTML/CSS/JS, React or Next.js | Choose the smallest stable runtime per realm; avoid unnecessary framework rewrites. |
| Mobile | Flutter | Pin SDK/toolchains and lockfiles; Android release signing is environment-backed, never debug signing. |
| Game clients | Unity | Authoritative game rules and economy remain server-side; web demos are not multiplayer certification. |
| App data | Firebase Auth/Firestore/Storage/Functions where appropriate | Separate Firebase projects/environments and publication outputs; never deploy repository root as public hosting output. |
| Core service | Go API + PostgreSQL for the current LINGO CORE V2 slice | PR #596 is a scaffold and remains BUILT/UNVERIFIED; harden OIDC, TLS, DB roles, outbox lifecycle and integration tests first. |
| Commerce | Shopify catalog/commerce boundary; Stripe only in test mode until accepted | Verify merchant ownership, webhook signatures, taxes, refund rules and reconciliation before live payments. |
| Assets | GitHub source + Cloudflare static assets; R2/Stream only after approval | Track hash, license, creator, usage scope, privacy class, alt text and retention. |
| CI/CD | GitHub Actions | CI startup recovery is P0; no test result exists without instantiated jobs, completed steps, logs and artifacts. |
| Operations | Registry + dispatch configuration + service runbooks | The checked-in trigger catalog is design/configuration only until actual event sources, queues and alert destinations are provisioned. |

## 2. Realm-by-realm stack matrix

| Realm | Web/client | Backend/data target | Integrations | Current evidence / gate |
|---|---|---|---|---|
| LINGOlegacy | Cloudflare exact-root Worker + static assets | Registry-backed discovery; no public account writes until identity is certified | GitHub, Cloudflare | Live exact-root route exists, but homepage is live-uncertified; apex/www parity and PR #548 QA required. |
| LINGOlane | Static/React storefront and service pages | Shopify for product/order authority; Firebase only for separate community/service data if needed | Shopify, Stripe test mode, Cloudflare | Source surfaces exist; payment activation and commerce reconciliation remain gated. |
| LINGOslots | Web demo now; Unity/mobile clients later | Server-authoritative session/economy service; non-redeemable virtual credits only | Firebase or dedicated game API after decision; Cloudflare edge | That’s My Lingo demo is public; no cash betting, wagering or cash-out. Other titles require separate QA. |
| LINGOarcade | Web discovery/prototypes; Unity for full game clients | Game session/save APIs, isolated player data and telemetry | Firebase/Functions or dedicated service after decision | Catalog and prototypes exist; per-game release and asset-rights QA required. |
| LINGOlibrary | Static/Next.js reading and learning surfaces | Content metadata, protected media storage and age-appropriate access | Firebase Storage/Firestore only after project boundary is verified | Kotton's Code is publicly inspectable; family/minor privacy and content review required. |
| LINGOmedia | Static/React media catalog and production pages | Media metadata, rights ledger and protected source assets | Cloudflare R2/Stream or approved media provider | Source pages exist; distribution, rights and media pipeline remain unverified. |
| LINGOworld | Modular web apps for AI, travel, campus, support and services | Per-capability API and data boundary; no one shared unrestricted database | Provider adapters, Cloudflare, Firebase where appropriate | Directory exists; each capability must be separately certified. |
| LegacyXclub | Web membership surface | Identity-linked membership, eligibility, moderation and consent | Identity provider after approval | Planned; no account/membership activation. |
| LINGOstudio | React/Next or static Studio surfaces | Project registry, role permissions, asset lineage and approvals | GitHub, AppDeploy preview export, Cloudflare | Preview apps exist; independent functional/accessibility QA required. |
| LINGOcore | Go service API and shared SDKs | PostgreSQL-backed profile/outbox slice under PR #596 | OIDC, PostgreSQL, event broker only after hardening | Draft implementation exists; not connected/production. |
| LINGOidentity | Auth UI and SDK contracts | One authoritative OIDC issuer; profile/consent/role service | Firebase Auth or other issuer only after explicit provider decision | Provider, token type, issuer/audience and client flow require reconciliation; never mix ID/access token semantics. |
| LINGOwallet | Web/mobile wallet UI only after service acceptance | Relational double-entry ledger, immutable journal, reconciliation and idempotency | Payment providers only after legal/finance/security approval | Planned-disabled; no transfers, redemption or cash value. |
| LINGOshield | Operations/security views | Telemetry, incident records, recovery dispatch and audit evidence | Cloudflare analytics/logs, GitHub events, approved alert sink | Dispatch definitions checked in; actual triggers and notification channels not provisioned. |
| LINGOcampus | Responsive web first; Flutter shell if learning workflow requires mobile | Curriculum, progress, assessment and safeguarding data | Content system and identity after review | Planned; no student account collection until privacy/safeguarding design approved. |

## 3. Integration contracts

### Identity contract
- Select one authoritative issuer per environment and document issuer URL, audience/client IDs, token types, signing algorithms, JWKS rotation, clock skew and logout/session policy.
- Separate ID token (authentication assertion) from access token (API authorization); never treat them as interchangeable.
- Use server-side role/tenant checks; UI visibility is not authorization.
- Keep provider credentials out of clients and repository.
- Add positive/negative tests for issuer, audience, signature, expiry, token type, missing subject, role scope and key rotation.

### API contract
- OpenAPI is the contract source; version endpoints under /v1.
- Standard envelope includes request_id, correlation_id, error_code and safe message.
- Enforce schema validation, payload limits, rate limits, authentication, authorization, idempotency and audit.
- Add consumer-driven contract tests before cross-realm integrations.
- No direct cross-realm database access.

### Event contract
- Event envelope includes event_id, event_type, schema_version, occurred_at, producer, aggregate_id, correlation_id, idempotency_key and data classification.
- Consumers are idempotent and bounded; retries use backoff; poison messages go to a dead-letter path.
- Replay requires authorization and immutable audit evidence.
- Do not put credentials, raw payment data or unnecessary PII in events.

### Asset contract
- Every asset has source path/hash, creator/owner, license, allowed use, attribution, privacy class, dimensions/renditions, alt text and review status.
- Family/minor content receives restricted classification and approval before public distribution.
- Do not use placeholder or licensed assets in public production without documented rights.

### Commerce and virtual-credit contract
- Product/order/payment truth remains with the commerce provider and reconciled backend.
- Verify webhook signatures, timestamps, replay windows and idempotency.
- Separate payment status from UI success states; reconcile provider events before fulfillment.
- Virtual play credits are non-redeemable, non-transferable and have no cash value by default.
- Sweepstakes, redemption, wallet transfers and real-money wagering remain disabled until legal, finance, security and platform approvals are documented.

### Mobile contract
- Flutter clients consume the same versioned APIs as web clients.
- Pin Flutter/Dart/Node and Android toolchains; commit lockfiles; use reproducible build artifacts.
- Debug signing is prohibited for release; signing material is injected through protected secrets.
- Verify Firebase App Check, Auth, deep links, offline state, push consent and crash telemetry separately.
- Do not ship placeholder Firebase options or a broad Firebase Hosting public root.

## 4. Required environment variables and secret inventory

This is a names-only inventory. Values must be created in the approved secret manager and never committed.

- Web/edge: canonical public origin, analytics opt-in settings, asset origin and environment label.
- Identity: issuer URL, audience/client ID, JWKS location or provider metadata, client secret only where server-side flow requires it.
- Database: host, port, database name, runtime username/password, TLS CA and migration credentials in separate scopes.
- Firebase: project ID, app ID, web config values where public, service credentials only server-side, App Check configuration.
- Commerce: provider account IDs, test/live mode, webhook signing secrets and restricted API keys.
- Observability: trace exporter endpoint, metrics endpoint, alert destination and redaction policy.
- Mobile: application IDs, signing configuration and environment-specific API origins.

Before provisioning, record account owner, region, monthly budget, quotas, retention, backup, RPO/RTO, access policy and deletion plan.

## 5. Deployment and release pipeline

1. Pull request: format, lint, typecheck, unit tests, schema validation, secret scanning, dependency scanning and static site checks.
2. Build: reproducible build from exact commit; create checksummed artifact and provenance record.
3. Preview: isolated Worker/Pages or app preview using synthetic data; no production secrets.
4. Integration: API contract, auth, database, event, commerce test-mode and cross-realm tests.
5. Staging: browser QA, mobile QA, accessibility, privacy, content-rights and operational rehearsal.
6. Production: separate approved promotion, traffic/route check, rollback target, telemetry and owner acceptance.

A workflow startup_failure with zero jobs is an infrastructure blocker; it is not evidence that code tests passed or failed.

## 6. Cost and safety guardrails
- Free-tier-first; do not upgrade plans or provision paid services without explicit budget approval.
- Prefer static hosting and existing platform capacity before adding new services.
- Set usage caps and alerts before enabling AI, media processing, notifications or game telemetry.
- No paid ads, top-ups, new billing plans, production resource creation or destructive cleanup as part of a code-only task.
- Default to preview and synthetic data; production remains protected until every release gate is met.

## 7. Acceptance for each realm
A realm is complete only when its owner, scope, source, stack, data map, auth contract, route/API contract, integrations, secrets inventory, tests, security/privacy/rights review, accessibility, observability, runbook, backup/restore, rollback and release acceptance are evidenced for the exact version.
