# LINGOlegacy Ecosystem Master Blueprint
Version 1.0.0 · 2026-11-15 · Authority: LINGOlegacy_MASTER
Repository: thelingolegacy-blip/TheLingoLegacy
Disposition: architecture baseline; production remains protected.

## Mission
Build one coherent, owner-controlled ecosystem connecting the flagship website, realm sites, games, creative tools, identity, community, commerce, support, and internal operations. GitHub is the source of truth. Cloudflare is the intended public edge. Firebase is the preferred application data/auth platform where appropriate. Flutter is the mobile target; React/Next and static web surfaces are supported; Unity is the game-engine target.

This is an architecture and implementation contract, not proof that every service is deployed. A capability may be marked planned, scaffolded, preview, verified, or production only when the evidence required by the registry and release gates exists.

Fail-safe defaults: no production promotion, DNS mutation, destructive infrastructure action, live payment activation, identity migration, wallet transfer, real-money wagering, G02 runner activation, or replacement of last-known-good without scoped authorization and independently inspectable evidence. Work can proceed in isolated branches, previews, emulators, and test environments.

## Canonical control plane
- LINGOlegacy_MASTER: governance, policy, architecture, ownership, brand, security, release authority, portfolio registry and archive.
- GitHub: canonical source, issue/PR history, CI evidence, release manifests, decision records and rollback references.
- Cloudflare: DNS/edge/Workers/static delivery, routing, cache/security headers and edge recovery. Only verified route ownership may be promoted.
- Firebase: project-scoped Auth/Firestore/Storage/Functions where the specific product warrants it. No shared unrestricted database across realms.
- Flutter: mobile clients consuming versioned authenticated APIs.
- React/Next/static: web surfaces selected per product.
- Unity: game client/runtime; game backend APIs and economy rules remain server-authoritative.
- App creation tools: preview accelerators, not canonical source of truth. Export source and register ownership before a product is considered controlled.

## Portfolio realm map
| Realm | Scope |
|---|---|
| LINGOlegacy | Flagship identity, public portal, account entry and community discovery |
| LINGOlane | Designs/promotions, apparel and Loyalty Lane Cycle |
| LINGOslots | That's My Lingo, Spades Is My Lingo, Uhno Lingo U-No, Lingo Lions Eruptions, Cashman Lingo Mania |
| LINGOarcade | Tricias Escape, Doughboys Oasis, Crazy Weasols, Silly in Philly, Jersey Shore: The Undead |
| LINGOlibrary | Kotton's Code, The Block I Grew Up On, Say It Again, Dice Shift Hotel, Legacy Legends |
| LINGOmedia | Rise of Zavione P1/P2 and creator media |
| LINGOworld | LINGOai, askLINGO, LINGOboom, LINGOtravel, LINGOcampus, LINGOsupport, LINGOwifi, LINGOvoice, LINGOshield, LINGOlounge, LINGOdonations |
| LegacyXclub | Membership/community concept |
| LINGOstudio | Creation, production, design and engineering workbench |
| LINGOcore | API gateway, event contracts, shared SDKs and configuration |
| LINGOidentity | Authentication, profile, consent, roles and sessions |
| LINGOwallet | Future loyalty and virtual-credit ledger |
| LINGOshield | Security, monitoring, recovery and compliance |
| LINGOcampus | Learning and creator enablement |

Existing catalog entries and routes are not proof of readiness. The registry is authoritative for capability status and canonical route ownership.

## Flagship web experience
The flagship website is the front door and portfolio index. It must be responsive, keyboard accessible, screen-reader navigable, fast, and usable on mobile and smart-TV navigation.

Primary navigation: Home; Explore Realms; Games; Stories & Library; Media; Shop / Loyalty Lane; Studio; About / Legacy; Support.

Landing-page sections:
1. Brand hero: The Lingo Legacy, concise promise, Explore the Realms and Discover the Story actions.
2. Realm directory: searchable/filterable cards sourced from the product registry.
3. Featured experiences: only verified destinations, with accurate status labels.
4. Story and mission: approved, rights-cleared copy.
5. Creator and studio pathway: explain capabilities without implying unavailable services are live.
6. Community and Loyalty Lane: distinguish community resources from commerce.
7. Trust and safety: privacy, terms, accessibility, support, family safeguards and play-credit disclosures.
8. Footer: canonical contact, legal, social and status links.

Route policy: every visible card points to a verified route or clearly labelled preview/coming-soon page. Never use a dead hash target as the only action. Preserve deep links only after route inventory and redirect tests. The current exact-root Cloudflare Worker work is governed by PR #548; keep it draft until browser, CI, security and release gates pass. Do not overwrite it with a competing homepage.

Brand: Industrial Noir / Crimson Shadow. Core palette near-black, crimson, white, restrained gold, and royal-purple accents where appropriate. No star symbol in product names. Use LINGO plus established lowercase realm naming. Do not compare the brand to Duolingo. Logos, typography, motion, imagery and copy must be original or properly licensed.

## Shared platform engines
| Engine | Minimum contract |
|---|---|
| Product registry | stable product_id, owner realm, route, platform, status, dependencies and release gate |
| Identity | OIDC issuer, audience, token type, roles, consent, tenant boundary and session lifecycle |
| API gateway | versioned OpenAPI, auth middleware, rate limits, request IDs and error schema |
| Event dispatcher | schema-versioned events, idempotency, retries, dead-letter and authorized replay |
| Asset engine | rights metadata, source hash, rendition, alt text and privacy classification |
| Search/discovery | registry-backed search, filters and canonical route resolver |
| Commerce | catalog, cart/order state, refunds, tax records, reconciliation and webhook verification |
| Loyalty ledger | immutable double-entry entries, idempotency, balance projection and audit |
| Game session | server-authoritative state, anti-cheat, deterministic rules and telemetry |
| Content/publishing | editorial workflow, approvals, rights, versioning and takedown |
| Notification | preference/consent, template, delivery result, retry and opt-out |
| Observability | structured logs, traces, metrics, health/readiness and SLOs |
| Recovery | backup, restore, rollback, route failover and incident command |

Shared contracts are versioned; realm-specific data remains isolated. Browser/mobile clients never contain privileged credentials. Cross-realm calls use documented APIs or signed, schema-versioned events. Each service declares owner, data classification, retention, region, backup, RPO, RTO and deletion behavior. Authenticated APIs validate issuer, audience, signature, expiry, token type, roles/scopes and key rotation. Runtime DB identities are least privilege; migration identities are separate; production database connections require certificate-verified TLS. Game outcomes, wallet balances, entitlements and payment state are server-authoritative. Secrets belong in managed secret stores and never in source, logs or issue comments. Minimize family/minor information and exclude it from public assets and telemetry unless justified and consented.

## Delivery environments
- local: deterministic developer workflow, tests, emulators and mocks.
- preview: PR-specific web/API validation with synthetic data and no production secrets.
- integration: cross-service contract validation in isolated test projects.
- staging: release-candidate rehearsal with masked/synthetic data.
- production: only approved, evidence-backed promotion.

Do not create staging/production resources until account, region, budget, data classification, secrets, backup, access and rollback are approved.

## Release evidence
A release candidate requires source commit SHA and immutable build provenance; CI jobs actually instantiated and completed; test logs/results and retained artifacts correlated to commit; lint/type/unit/integration/security/accessibility results; route and browser QA on mobile/desktop; API contract and authorization tests; privacy/legal/content/asset-rights review; health/readiness, telemetry, backup and rollback evidence; explicit owner acceptance. A queued or startup-failed workflow, empty runner identity, missing logs/artifacts, or preview upload alone is not passing evidence.

## Build waves
Wave 0 — Recovery and inventory (P0): preserve last-known-good; inventory repositories, routes, apps, projects, secrets, providers and owners; restore GitHub Actions job startup without activating protected G02; restore branch/release governance; verify PR #574 only with real CI evidence; maintain issue #575 as cross-stack blocker register and #480 as governing record.

Wave 1 — Flagship web foundation (P0): reconcile PR #548; establish registry-backed navigation; validate routes; repair landing/home SEO, accessibility, performance, legal and contact pages; verify Cloudflare Worker preview in browser before promotion.

Wave 2 — Shared platform contracts (P1): identity, API gateway, event envelope/dispatcher, configuration/secrets, asset rights, telemetry, service catalog and SDKs.

Wave 3 — Realm adapters (P1): connect one representative route and one non-production flow per realm; isolate realm data and permissions; build realm-specific tests.

Wave 4 — Commerce, loyalty and mobile (P2): test-only commerce, virtual-credit ledger design, Flutter shell, notifications only after consent/security reviews.

Wave 5 — Scale and operations (P2): SLOs, restore rehearsals, incident simulations, cost guardrails, capacity testing, localization and smart-TV QA.

## Definition of done
Each realm needs a named owner; registry entry; approved scope; source repository; build/deploy instructions; environment/secrets contract; design/accessibility review; route/API contracts; automated tests; security/privacy review; observability; backup/restore and rollback; runbook; support pathway; release evidence; owner acceptance. Portfolio completion is measured by verified registry status and evidence, not by the number of application records or previews.
