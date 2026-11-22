# The Lingo Legacy — Master Portfolio Control Pack

**Baseline date:** 2026-11-14  
**Authority:** GitHub repository `thelingolegacy-blip/TheLingoLegacy`  
**Production edge:** Cloudflare  
**Disposition:** PROTECTED HOLD — public candidate surfaces may remain reachable; no production promotion or activation is authorized by this document.

## 1. Executive control statement

The Lingo Legacy is a portfolio of connected products, services, creative properties, and shared platform capabilities. The flagship HQ is the public entry point; identity, wallet, community, AI, commerce, games, media, library, and world services are separate modules that share governance, design standards, identity boundaries, security controls, and release evidence.

The goal is one coherent ecosystem—not a collection of disconnected microsites or competing implementations.

**Source-of-truth rules**
1. GitHub is the authoritative source for code, configuration, documentation, issues, and release evidence.
2. Cloudflare is the intended authoritative edge/runtime and domain control plane.
3. Firebase is the intended identity/data integration layer where approved and verified.
4. Flutter is the mobile application target; React/Next.js is the web application target; Unity is a game-runtime target where appropriate.
5. Vercel is retired from the target production architecture and must not be silently reintroduced.
6. Existing working systems must be reconciled and extended before a replacement is created.

## 2. Portfolio hierarchy

| Portfolio group | Product / system | Purpose | Priority | Current disposition |
|---|---|---|---|---|
| Governance | `LINGOlegacy_MASTER` | Legal, governance, brand, creative, products, website, engineering, business, releases, archive | P0 | Governing layer; maintain as canonical control plane |
| Flagship | `LINGOlegacy` | Public HQ, account entry, wallet entry, community and navigation | P0 | Public candidate reachable; production readiness not established |
| Commerce & lifestyle | `LINGOlane` | Designs, promotions, apparel, laundry-cycle concepts | P0 | Product and commerce readiness requires independent verification |
| Games | `LINGOslots` | That’s My Lingo, Spades Is My Lingo, Uhno Lingo U-No, Lingo Lions Eruptions, Cashman Lingo Mania | P0/P1 | That’s My Lingo demo candidate; registered play blocked |
| Arcade | `LINGOarcade` | Tricias Escape, Doughboys Oasis, Crazy Weasols, Silly in Philly, Jersey Shore: The Undead | P1 | Product builds and licensing review required |
| Publishing | `LINGOlibrary` | KottonsCode, The Block I Grew Up On, Say It Again, Dice Shift Hotel, Legacy Legends | P1/P2 | Content/IP review and production QA required |
| Media | `LINGOmedia` | Rise of Zavione P1/P2 and related media | P1 | Creative production and rights tracking |
| World services | `LINGOworld` | LINGOai, askLINGO, LINGOboom, LINGOtravel, LINGOcampus, LINGOsupport, LINGOwifi, LINGOvoice, LINGOshield, LINGOlounge, LINGOdonations | P0/P1 | Service architecture; integrations are not assumed live |
| Community | `LegacyXclub` | Membership and community experience | P1 | Identity, moderation, privacy and operational readiness required |

## 3. Master entity register

| ID | Entity | Priority | Required shared dependencies | Readiness rule |
|---|---|---:|---|---|
| LL-HQ | The Lingo Legacy HQ | P0 | Cloudflare edge, curated assets, content registry, observability | Public availability is not production acceptance |
| LL-TML | That’s My Lingo | P0 | Demo engine, virtual ledger, safety disclosures, optional identity | Demo-only until registered-session lifecycle is verified |
| LL-Arcade | LINGOarcade | P1 | Game shell, identity boundary, content/licensing registry | Each game separately tested and rights-cleared |
| LL-Slots | LINGOslots | P1 | Game engine, virtual economy, moderation | Each game separately gated |
| LL-Apparel | Loyalty Lane Apparel | P0 | Catalog, inventory, checkout, fulfillment, returns, tax controls | No checkout activation until commercial and payment acceptance |
| LL-KOTTONS | KOTTONSCODE | P1 | Publishing CMS, asset rights, privacy review, QA | Family/minor privacy review required before publication |
| LL-Nexus | LINGO Nexus | P1 | Identity, community, messaging, moderation | Do not enable public interaction without abuse controls |
| LL-Media | LINGOmedia | P1 | Media storage, rights, publishing workflow | Release only after rights and content review |
| LL-Library | LINGOlibrary | P2 | Publishing CMS, metadata, rights ledger | Per-title acceptance |
| LL-Cinema | Virtual Cinema | P2 | Media delivery, licensing, access controls | No public catalog without rights confirmation |
| LL-AI | askLINGO / LINGOai | P0 | Provider adapters, LLG gateway, secrets, usage/cost limits, audit | Provider integrations and privacy controls must be verified |
| LL-ID | LINGO ID | P0 | Firebase Auth or approved identity provider, tenant isolation, recovery | UI preview is not connected identity |
| LL-Wallet | Universal Legacy Wallet | P0 | Identity, ledger, idempotency, reconciliation, policy gates | Preview/scaffold is not a production financial account |
| LL-Marketplace | Creator Marketplace | P2 | Creator identity, rights, moderation, payouts | Payouts remain disabled until legal/payment acceptance |
| LL-Community | Community Laundromat Hub | P2 | Identity, moderation, privacy, location safety | Public features require moderation and safety QA |
| LL-Oasis | Doughboys Oasis | P2 | Game shell, progression, content rights, game QA | Separate game acceptance |
| LL-World | LINGOworld | P1 | Service registry, shared identity, routing, observability | Each service must have an owner, health contract, and gate |
| LL-Services | Business & Services | P2 | CRM, support, billing, privacy, service-level policies | No customer-facing claims until operationally staffed |
| LL-Support | Support Center | P1 | Ticket intake, knowledge base, escalation and status | Contact and escalation paths must be tested |
| LL-Club | LegacyXclub | P1 | Identity, membership, moderation, privacy | Membership activation gated |

## 4. Shared platform architecture

### Control and delivery planes

```text
LINGOlegacy_MASTER (governance, registry, release authority)
                  |
                  v
GitHub (source, issues, PRs, CI evidence, signed releases)
                  |
        gated build / test / review
                  |
                  v
Cloudflare Edge (DNS, Workers, Pages/assets, WAF, observability)
                  |
          API / web runtime
       /       |        \
      v        v         v
 Identity    Game API   Content / Commerce
 Firebase    D1/ledger  Catalog / media
      \        |         /
       \       v        /
        Shared service contracts
                  |
       Flutter mobile / web / TV
```

### Core shared services

- **Stack Engine:** service registry, environment validation, readiness probes, feature gates, circuit breakers, graceful disable/resume, audit events.
- **LINGO ID:** authentication, account lifecycle, recovery, tenant/environment isolation.
- **Universal Legacy Wallet:** append-only virtual ledger, idempotent writes, balance derivation, reconciliation, limits and audit.
- **Game Engine:** deterministic game rules, server-authoritative settlement, session lifecycle, anti-replay and rate limiting.
- **askLINGO / LLG Tech Corps:** provider-neutral gateway, independent adapters, routing, model comparison, agent orchestration, usage budgets and privacy.
- **Content & Rights Registry:** ownership/licensing, consent, age/privacy review, attribution, release status.
- **Commerce:** catalog, inventory, checkout, fulfillment, refunds, tax and payment reconciliation; inactive until separately accepted.
- **Observability:** structured logs, redaction, health/readiness, metrics, traces only when approved, incident runbooks.

## 5. Stack Engine contract

The Stack Engine is an orchestration/control layer, not a replacement for the Cloudflare Worker or product APIs.

### Required endpoints

| Endpoint | Purpose | Dependency |
|---|---|---|
| `GET /healthz` | Liveness only: Worker process can answer | No database or identity dependency |
| `GET /readyz` | Readiness summary | Required bindings and safe schema probes |
| `GET /api/v1/platform/manifest` | Static/runtime capability manifest | Configuration validation |
| `GET /api/v1/platform/status` | Human-readable platform state | Manifest + readiness snapshot |
| `GET /api/v1/platform/gates` | Effective feature gates | Validated environment config |
| `GET /api/v1/platform/modules` | Module registry and status | Service registry |
| `POST /api/v1/admin/gates/:gate` | Authorized gate change | Admin auth, audit, CSRF/origin checks; disabled by default |

### Gate policy

Unknown, missing, malformed, or contradictory configuration means **disabled**. Gates are independent; one module being enabled does not imply another is enabled.

| Gate | Default | Required evidence before enable |
|---|---|---|
| Public HQ | Enabled for public static content only | Content/security/browser QA |
| Demo gameplay | Disabled until explicitly configured | Deterministic engine tests, virtual-only disclosure, no-value proof |
| Registered play | Disabled | Verified staging identity, durable player sessions, browser E2E, rate limits |
| Wallet mutation | Disabled | Atomic ledger, idempotency, reconciliation and security review |
| Commerce checkout | Disabled | Merchant, tax, refund, fulfillment, PCI scope and payment acceptance |
| Cashout / real-value rewards | Permanently closed in current demo scope | Separate legal/compliance program and explicit release authorization |
| AI provider calls | Disabled unless configured | Secrets, provider contract, privacy review, cost budget and audit |

### Health and graceful disable/resume

- Liveness must not depend on D1, Firebase, KV, or third-party APIs.
- Readiness reports each dependency independently and returns a non-ready state when required dependencies fail.
- Disabling a feature blocks new mutations immediately; it must not delete or invalidate durable player state.
- Re-enabling requires fresh authentication, current gate evaluation, schema compatibility, and idempotent recovery.
- All gate changes must be authenticated, audited, attributable, and reversible.
- Do not expose secrets, token values, raw environment objects, or unredacted personal data in status endpoints.

### Integration safety requirements

The Stack Engine must not use a static-assets binding as if it were an internal Worker router. Internal readiness checks should call shared service functions or explicit service bindings. Public assets must come from a curated build directory, never an unrestricted repository root. Route authorization must be explicit per endpoint, not inferred from broad URL-prefix deny lists.

## 6. That’s My Lingo — current bounded scope

**Allowed MVP:** anonymous or registered demo identity only after its own gate; virtual Demo Coins with no cash value; server-authoritative game rules; no cash wagering, redemption, cashout, paid credits, or real-value prizes.

**Existing foundation:** PR #503 contains a 5×3 engine, five paylines, WILD behavior, volatility profiles, integer Demo Coin settlement, idempotency, XP progression, welcome/daily rewards, D1 rate limiting, staging Firebase validator/template, and staging UI changes.

**Open blockers:** GitHub Actions startup failure at the reviewed head; dedicated Firebase staging project/app identity unverified; staging Worker source absent from the current Cloudflare account inventory; authenticated browser journey not accepted; registered player session lifecycle is not implemented as a durable resumable lifecycle. Issue #584 tracks that lifecycle extension.

Important distinction: existing `lingo_game_sessions` records are spin settlement/idempotency records. They are not durable player sessions with active/suspended/completed/expired lifecycle states.

## 7. Build and setup workstreams

| Workstream | Deliverables | Exit evidence | State |
|---|---|---|---|
| A. Runtime / Stack Engine | Liveness, readiness, manifest, module registry, gates, graceful disable/resume | Unit tests, dry-run, staging probes, failure injection | Design contract defined; integration pending |
| B. HQ web | Curated static build, accessible navigation, responsive layouts, truthful status copy | Browser QA, security headers, route inventory | Public candidate reachable; acceptance pending |
| C. That’s My Lingo | Demo-only flow, virtual ledger, session lifecycle, safety copy | CI, D1 tests, authenticated E2E, concurrency/replay tests | Engine proposal open; lifecycle issue open |
| D. Identity | LINGO ID scaffold, Firebase staging tenant, login/recovery boundary | Verified project/app IDs, auth tests, privacy review | UI preview exists; backend unverified |
| E. Wallet | Virtual-only ledger API, reconciliation, idempotency, audit | Migration + replay/concurrency tests, balance reconciliation | Staging foundation exists; no production wallet |
| F. AI platform | LLG gateway, provider adapters, model compare/agents, cost guard | Adapter tests, secrets validation, budget and privacy controls | Architecture workstream; integrations unverified |
| G. Apparel/commerce | Catalog, stock, checkout, fulfillment, refunds, tax | End-to-end order test, merchant and compliance review | Checkout disabled |
| H. Mobile / TV | Flutter shell, shared API contracts, TV navigation/accessibility | Device matrix and release QA | Target architecture; device QA pending |
| I. Publishing/media | CMS, asset rights, editorial review, release calendar | Rights register, content QA, accessibility | Per-title work pending |
| J. Support/community | Moderation, support escalation, abuse reporting | Tabletop exercise, SLA and escalation test | Not accepted for public activation |
| K. Enterprise controls | Ownership register, secrets, backups, incident response, cost caps | Evidence-backed operational review | Documentation consolidation underway |

## 8. Portfolio-wide quality and release gates

1. **Source:** correct repository, branch, commit, ownership, and dependency inventory.
2. **Build:** reproducible build, pinned dependencies, clean artifact, no repository-root asset leakage.
3. **Test:** unit, integration, migration, API contract, security, accessibility, browser/device tests.
4. **Identity:** tenant and environment verified; secrets managed outside source; authorization tested.
5. **Data:** schema version, backups/restore, data retention, idempotency and reconciliation tested.
6. **Runtime:** liveness/readiness, health probes, error budgets, logging redaction and rate limits.
7. **Safety:** demo/real-value boundaries, content rights, privacy, moderation, age controls where relevant.
8. **Release:** CI jobs instantiated and completed; artifacts/logs correlated to exact commit; independent review.
9. **Deployment:** explicit target, change window, rollback plan, staged verification.
10. **Acceptance:** owner signs off on actual evidence; no status inferred from a green-looking dashboard or reachable URL.

## 9. Current release authority

- GitHub Actions control-plane recovery remains a P0 blocker.
- G02 runner: **FAIL / UNVERIFIED**; do not activate.
- G03–G11: held pending evidence.
- Last-known-good: protected.
- Production promotion: unauthorized.
- Payments, cashout, real-value rewards, and registered game activation: disabled.
- The public HQ and game page being reachable does not establish backend readiness or launch acceptance.

## 10. Immediate execution sequence

1. Restore GitHub Actions job instantiation on a safe hosted-runner probe; do not activate G02.
2. Reconcile Cloudflare Worker names, deployment versions, routes, bindings, and source commit; keep production immutable.
3. Verify or create a dedicated Firebase staging project and matching Web app; never use the production project for staging.
4. Run PR #503 validation on its exact head once Actions starts: Node tests, migration tests, Wrangler dry-run, artifacts.
5. Complete Issue #584: durable player-session schema, event log, versioned transitions, atomic spin/session settlement, suspend/resume.
6. Integrate Stack Engine behind an isolated staging configuration; liveness stays independent of dependency health.
7. Run staging browser E2E, failure injection, replay/concurrency tests, accessibility and TV QA.
8. Correct public copy so “candidate”, “demo”, and “not enabled” are accurate; remove any confusing cash-value/jackpot/checkout implications.
9. Complete security, privacy, rights, operations and cost reviews.
10. Obtain independent acceptance before any release authority transition.

## 11. Change-control rule

This document is a portfolio blueprint and implementation contract. It does not itself authorize deployment, payment activation, DNS changes, production data mutation, runner activation, PR merge, or release promotion. Every such action requires a separate, explicit authorization and evidence package under the governing release process.
