# LINGO Destiny Engine — Enterprise Stack Register

**Document class:** Architecture / governance register  
**Working title:** Destiny Engine (architecture workstream; not a new public product brand)  
**Canonical source:** `thelingolegacy-blip/TheLingoLegacy`, branch `main`  
**Baseline commit:** `980353bcdf9450c00a5ec9f49902d7e4418e7dfc`  
**Date:** 2026-11-21  
**Release posture:** PROTECTED HOLD; all production mutations remain separately gated.

## 1. Purpose and governing decisions

Establish one coherent, evidence-led technology foundation for the LINGO ecosystem while preserving independently deployable products, data boundaries, and release authority.

1. GitHub is the source of truth for source, architecture, change history, reviews, and release evidence.
2. Cloudflare is the intended authoritative public edge and hosting plane. The active production Worker and routes are not changed by this register.
3. Products share contracts and platform capabilities, not unrestricted databases, secrets, or administrator privileges.
4. Select one authoritative transactional system for each bounded business domain before migrations or dual-write integrations. No dual-primary writes.
5. Firebase remains a supported specialist/mobile integration candidate, but current app configuration includes placeholders and no staging project is approved. Do not activate it by inference.
6. SQL/PostgreSQL is the preferred transactional model for ledger, commerce, workforce, property, booking, and other relational workflows, subject to a documented provider/project ownership decision. No database provider is provisioned or selected by this document.
7. Cloudflare edge storage (KV, D1, Durable Objects, Queues, R2) is selected by workload and consistency needs; it is not automatically the system of record for financial ledgers.
8. Payments, wallet transfers, cash-equivalent rewards, sweepstakes, prize redemption, and real-money wagering remain disabled pending technical, legal, accounting, and owner acceptance.
9. All infrastructure and tooling must remain free-tier-first and avoid unnecessary spend. Any paid capacity requires separate approval.
10. A source merge, passing local test, provider connection, preview, or successful build is not by itself production acceptance.

## 2. Portfolio and domain boundaries

| Portfolio / domain | Canonical responsibility | Shared contracts |
|---|---|---|
| `LINGOlegacy_MASTER` | Governance, architecture, legal/brand records, portfolio, engineering, releases, archives | Registry, ownership, policy, release authority |
| `LINGOlegacy` | Flagship identity, account experience, community, platform shell | Lingo ID, session, profile, notification |
| `LINGOworld` | AI, travel, campus, support, connectivity, infrastructure and workforce services | API gateway, identity, audit, GIS, event contracts |
| `LINGOslots` | That’s My Lingo, Spades Is My Lingo, Uhno Lingo U-No, Lingo Lions Eruptions, Cashman Lingo Mania | Game session, ruleset, safe virtual economy |
| `LINGOarcade` | Tricias Escape, Doughboys Oasis, Crazy Weasols, Silly in Philly, Jersey Shore: The Undead | Game runtime, progression, assets, moderation |
| `LINGOlibrary` | KottonsCode, The Block I Grew Up On, Say It Again, Dice Shift Hotel, Legacy Legends | Content catalog, rights, learning progress |
| `LINGOlane` | Loyalty Lane designs/promotions, apparel, Laundry-Cycle | Catalog, inventory, order, fulfillment |
| `LINGOmedia` | Rise of Zavione P1/P2 and media/publishing | Rights, asset provenance, editorial workflow |
| `LegacyXclub` | Club/community experiences | Membership, events, moderation |

### LINGOworld service domains

These are separate bounded domains, not one unrestricted super-admin application:

- AI services: LINGOai, askLINGO, LINGOboom.
- Mobility and learning: LINGOtravel, LINGOcampus.
- Operations and assistance: LINGOsupport, LINGOlounge, LINGOdonations.
- Connectivity and communications: LINGOwifi, LINGOvoice, LINGOshield.
- Workforce administration: organizers, promoters, managers, HR, payroll, scheduling, time, roles and approvals.
- Residential and property operations: homes, residential properties, maintenance, occupancy, work orders and asset records.
- Hospitality: hotels, lodging inventory, reservations, housekeeping and property operations.
- Transportation infrastructure: roads, transport assets, street/road lighting, water distribution, water-flow monitoring, wastewater, drainage and sewer-flow monitoring.

Infrastructure domains require jurisdiction-specific compliance, GIS/location controls, asset registries, operational safety procedures, privacy controls, and role-scoped access. Workforce/payroll and financial data must be segregated from public profiles, games, and community systems.

## 3. Target reference stack

| Layer | Preferred standard | Boundary / selection rule | Current evidence |
|---|---|---|---|
| Source and governance | GitHub | Canonical repos, reviewed PRs, CODEOWNERS, protected release authority | Connected; Actions startup remains blocked |
| Edge, DNS, WAF, web delivery | Cloudflare Workers / Pages | Public ingress, routing, edge policy, staged deployments | Production Worker active; staging parity still needs acceptance |
| Web clients | React / Next.js / TypeScript | Shared design system; product-specific shells | Multiple source implementations; build matrix incomplete |
| Mobile clients | Flutter | Shared design tokens and API contracts; native signing isolated | Preview work exists; Firebase config and Android verification remain gated |
| Game clients | Unity where 3D/native capability warrants it; web engines for lightweight experiences | Server-authoritative rules, client presentation, content rights | Mixed source/scaffolds; per-game builds not certified |
| Identity | OIDC/OAuth2-compatible issuer contract; Lingo ID as product identity | Stable issuer + subject, MFA for privileged roles, scoped sessions | No cross-product production identity acceptance |
| Transactional data | PostgreSQL-compatible relational store | One authoritative writer per domain; migrations and restore tests | Provider/project selection remains unaccepted |
| Specialist app data | Firebase Auth/Firestore/Storage where justified | Explicit staging project, security rules, App Check, data ownership | Main Firebase aliases/config are intentionally unconfigured |
| Edge state and async work | Cloudflare KV / Durable Objects / Queues / D1 by use case | Cache/session/coordination/event delivery; define consistency explicitly | Bindings and environment contracts require inventory |
| Media and assets | Cloudflare R2 or approved object store + versioned manifest | Private originals, public allowlist, rights/provenance, transformations | Main source asset boundary repaired; live staging probes pending |
| Commerce | Shopify catalog + Stripe test-mode payment workflows | Provider webhooks verified server-side; no client-trusted entitlement | No production payment activation |
| Infrastructure as code | OpenTofu | Environment-separated, reviewed plans; drift detection | Planned; provisioning not authorized |
| CI/CD | GitHub Actions | Pinned actions, least privilege, immutable artifacts, independent G02 gate | Repository-wide startup failure persists |
| Observability | Structured logs, metrics, traces, SLOs, alerting | No sensitive payloads; project ownership and retention approved | Production observability not certified |
| Security / supply chain | Secret scanning, SAST, dependency/SBOM, IaC, container and artifact provenance | Fail-closed on P0/P1 findings; signed evidence | Source security improvements merged; full pipeline evidence outstanding |

This is a target reference architecture, not a declaration that every listed product or service is provisioned, connected, licensed, or production-ready.

## 4. Canonical integration contracts

### Identity and authorization
- Use immutable `issuer + subject` as the external identity key; never use email as the primary join key.
- Separate authentication from authorization. Enforce RBAC plus resource/tenant-scoped ABAC on the server.
- Require MFA and explicit privileged scopes for administrators, finance, payroll, property operations, publishing, and release controls.
- Record actor, tenant, resource, action, timestamp, decision, and correlation ID in audit events.
- Deny by default; test anonymous, cross-user, cross-tenant, expired-session, and insufficient-scope cases.

### APIs and events
- Version public and internal APIs; publish OpenAPI or equivalent machine-readable contracts.
- Validate request schemas, payload sizes, content types, rate limits, replay protection, and idempotency keys.
- Use an outbox/inbox pattern for reliable domain events; consumers must be idempotent.
- Do not pass secrets, raw personal data, payment credentials, or sensitive operational details in event envelopes.
- Separate public, partner, staff, operator, and service-to-service API scopes.

### Money, wallet, and virtual economy
- Any value-bearing ledger must be server-authoritative, append-only, balanced, idempotent, reconciled, and auditable.
- Maintain separate ledgers and permissions for cash, payable balances, non-cash play credits, promotional credits, and loyalty points.
- No client-supplied balance, direct balance overwrite, or game-client authority over awards.
- The That’s My Lingo preview remains demo-only. The approved Option 2 total-spin stake allocation contract is preserved; unresolved paytable, wild, multiplier, scatter, RTP and volatility rules require product approval before authoritative engine implementation.

### Data governance
- Classify data (public, internal, confidential, restricted); define purpose, minimization, retention, deletion, residency, backup and restore.
- Enforce tenant and domain isolation in storage rules and server queries.
- Separate HR/payroll, financial, health/safety, children/family, identity and precise-location records from general community and game data.
- GIS and infrastructure telemetry must use role- and jurisdiction-scoped access and retention.

## 5. Environment and release topology

Use explicit, isolated environments:

- **local:** developer sandbox and deterministic fixtures.
- **preview:** ephemeral or isolated preview resources; no production secrets or customer data.
- **staging:** production-like configuration with synthetic data and approved test credentials.
- **production:** separately authorized resources, least-privilege credentials, monitoring, backup and rollback.

Promotion contract:

`SOURCE → REVIEW → STATIC VALIDATION → BUILD → TEST → SECURITY → PREVIEW → QA → ACCEPTANCE → AUTHORIZED PROMOTION → LIVE PROBES`

Every artifact must be correlated to repository, branch, commit SHA, workflow/run, toolchain, dependency lockfiles, artifact digest, environment, and deployment ID. Rollback must reference a known-good artifact and be rehearsed before risky promotion.

## 6. Current baseline and known gaps (2026-11-21)

| Workstream | Current status | Required next proof |
|---|---|---|
| GitHub source authority | PASS — ACCESS VERIFIED | Verify protection/rulesets and ownership |
| Main public asset boundary | Source repair merged in PR #635 | Execute focused tests and negative-path probes in isolated staging |
| GitHub Actions | BLOCKED — startup_failure before job creation | Real jobs, steps, logs and artifacts; inspect account-level admission/quota |
| G02 | FAIL / UNVERIFIED | Exact runner ID/name/labels, completed sentinel, logs and artifact |
| That’s My Lingo Option 2 demo | Merged; exact-source local tests 25/25 | Browser/device QA; ruleset/paytable approvals; authoritative backend remains separate |
| Firebase Hosting | Main config is empty; no default alias | Approved staging project and quarantined generated-public-output validation |
| Flutter / Android | Preview safeguards and source scaffold exist across candidate work | Trusted Flutter analysis/tests/build; verify wrapper JAR before execution; no debug signing |
| Cross-product identity/wallet | BLOCKED | Select issuer and transactional authority; prove isolation and ledger tests |
| AppDeploy Hello snapshot | Preserved outside public assets | Resolve endpoint authorization in issue #468 and test negative paths |
| Cloudflare production | Active Worker protected at 100% traffic | Isolated staging deployment and route-to-runtime proof; no production mutation |
| Vercel retirement | Git auto-deploy kill switch merged; Hobby paused | Owner-side domain/GitHub App/billing reconciliation |
| Portfolio integration | 14-realm framework exists in draft PR #602 | Reconcile registry, product repos, overlaps, ownership and route/runtime mapping |

### Recent completed source-level changes
- PR #635: two-layer restricted public-asset boundary merged to main; hosted Actions did not instantiate jobs, so no hosted test pass is claimed.
- PR #633: exact Hello AppDeploy snapshot preserved under `ops/appdeploy-snapshots/`; archive-only, not a runtime authorization approval.
- PR #630: Option 2 demo engine merged; local suite 25/25; browser/device QA remains pending.
- PR #629: Vercel Git auto-deploy disabled; full account retirement is not complete.
- PR #621: THE PRESTIGIOUS HOUSE OF DUSSE canon reconciled while House of Avalon remains a separate historical archive.

## 7. 150-minute ignition execution order

1. **0–20 min — Reconcile:** inventory active repositories, branches, PRs, product registries, provider identities, existing snapshots and duplicate implementations. Preserve last-known-good.
2. **20–45 min — Stack register:** reconcile existing 14-realm architecture proposal, publish one canonical stack matrix and assign domain boundaries without duplicating PR #602 or PR #511.
3. **45–75 min — P0 security:** verify PR #635 source boundary, current release manifest, staging negative paths, Firebase publication quarantine, AppDeploy endpoint authorization and public privacy exposure.
4. **75–105 min — Build foundation:** reconcile CI startup failure, toolchain pins, lockfiles, local test commands, reproducible build artifacts and independent G02 gate.
5. **105–130 min — Experience readiness:** choose one safe flagship preview path; verify web/mobile navigation, accessibility, responsive layouts, game demo boundary and API health.
6. **130–150 min — Closeout:** attach evidence, update issue #517, close only genuinely completed items, publish blockers and the next execution queue.

## 8. Completion-state rules

Use only:
- `NOT STARTED`
- `IN PROGRESS`
- `BLOCKED`
- `PASS — EVIDENCE LINKED`
- `ACCEPTED`

A task may be closed only when its acceptance criteria are met and its evidence is linked. A draft PR, design, source edit, local test, preview, or provider read does not prove live operation.

## 9. Explicit non-authorizations

This register does not authorize production deployment, DNS/Worker route changes, runner registration/activation, secrets rotation, provider account changes, database migrations, paid resources, release signing, live payments, wallet transfers, public publication, sweepstakes/prize activation, or destructive cleanup. Preserve the current production version and all last-known-good artifacts.

## 10. Immediate next actions

- Reconcile the active stack proposals in PR #511 and PR #602 before adding another registry or architecture implementation.
- Keep the new PR draft until owners review the domain boundaries and existing artifacts.
- Use the current main baseline `bf7990f0916fa0d0f16bc34b468ccac066bf6b68` for this documentation proposal; rebase only after checking for intervening main changes.
- Update issue #517 with exact evidence and blockers; keep G02 and production fail-closed.


## 11. Outstanding proposal overlap and decision register

The following are active proposals, not accepted runtime implementations. Compare and integrate them deliberately; do not merge competing branches as independent complete solutions.

| Existing work | Existing value | Overlap / conflict | Recommended disposition |
|---|---|---|---|
| PR #511 — master registry | Machine-readable master product registry, dependency graph, Cloudflare route inventory, plugin registry, validation, ADR-002 | Its identity/backend ADR explicitly says provider selection is NOT APPROVED; overlaps at governance/registry level with PR #602 | Treat #511 as the master inventory/dependency and integration registry candidate. Validate current product names, route facts and file paths before acceptance. |
| PR #602 — 14-realm ecosystem | 14-realm registry, realm-by-realm stack matrix, dispatch contracts, schemas, validators and worlds directory | `worlds/index.html` overlaps directly with PR #548; its stack matrix overlaps conceptually (not necessarily by path) with #511 and this high-level register | Treat #602 as the detailed realm catalog and dispatch candidate. Reconcile its world-directory UI with #548 before combining. Do not create another realm registry. |
| PR #515 — Supabase-primary backend | Detailed Supabase/PostgreSQL target architecture with Firebase compatibility and migration stages | Conflicts in decision status with #511 ADR-002, which explicitly leaves identity and transactional authority undecided | Keep Supabase as a candidate architecture, not a ratified provider decision. Complete project ownership/data inventory and a named owner decision before schema/migrations. |
| PR #548 — flagship navigation | Homepage, README, route catalog, exact-root Worker source and preview version 3 | Shares `worlds/index.html` with #602 and `scripts/cloudflare-pages-preview-build.sh` with #614; public preview browser QA and Actions remain incomplete | Prefer #548 as the flagship shell/navigation base after source reconciliation; integrate #602's 14-realm directory rather than overwriting either branch. Keep Worker version 3 preview-only until QA and promotion approval. |
| PR #614 — Firebase/mobile recovery | Quarantined Firebase publication builder, Flutter pins, Android scaffold, lockfiles, preview script and readiness tests | Shares five paths with #632: `android/app/build.gradle`, `lib/firebase_options.dart`, `lib/main.dart`, `pubspec.yaml`, `scripts/cloudflare-pages-preview-build.sh`. Current branch also records a wrapper-JAR checksum mismatch; do not execute that JAR. | Treat #614 as the broader Firebase publication-boundary and mobile recovery candidate, but rebase/reconcile it against current main and #632 file-by-file. Do not merge either wholesale. Replace/verify wrapper JAR from official trusted source first. |
| PR #632 — mobile offline preview | Placeholder-safe Firebase startup, offline preview, debug-signing removal and mobile integrity workflow | Direct file overlap with #614; branch description says Android root Gradle scaffold/wrapper absent, while #614 branch includes them | Treat #632 as a focused current-main mobile safety candidate. Compare actual source semantics against #614; preserve the safest compatible changes in one integrated PR. |
| PR #513 — demo-only public surfaces | Payment-free/demo wording and controls for public game/drop surfaces | Overlaps with the merged Option 2 demo work in #630 and flagship/homepage navigation work in #548 | Re-audit current main before carrying any changes; do not reintroduce superseded demo logic or stale checkout copy. |
| PR #514 — LLG Dispatch | Dispatch center, worker lifecycle, evidence ledger and activation waves | Conceptual overlap with #602 dispatch routes and #511 execution router | Reconcile schemas, naming, event ownership and approvals. Keep one dispatch envelope/state machine; no fleet activation. |

### Stack decision conflict — backend and identity

Two draft proposals describe different decision states:

- PR #511 ADR-002: `NOT DECIDED`; compares Firebase Auth + Firebase data, Supabase Auth + PostgreSQL, Firebase Auth + Supabase PostgreSQL, and preview/mock-only.
- PR #515: states Supabase PostgreSQL is the primary transactional backend target while retaining Firebase Auth compatibility/specialist services.
- PR #602: describes a Go API + PostgreSQL core slice while still listing Firebase app data where appropriate.

These can be reconciled only by recording a single owner-approved decision with exact provider account/project IDs, identity issuer/audience, domain ownership, migration/rollback, cost, privacy and security evidence. Until then, the implementation rule is: no dual-primary writes, no production schema migration, and no provider-specific production activation. The architecture preference for PostgreSQL transactions does not by itself select Supabase as the provider.

### Recommended integration sequence

1. Refresh current main and all PR head/base SHAs; inventory exact overlapping paths and branch ancestry.
2. Resolve the backend/identity ADR first; do not merge #515 as an approved decision while #511 ADR-002 remains open.
3. Reconcile #511 master registry with #602 realm registry; assign which file is authoritative for product IDs, dependencies, routes, integrations and realm metadata.
4. Integrate #548 flagship shell with #602's 14-realm directory in a single reviewed branch; preserve #548 exact-root preview as preview-only.
5. Resolve #614/#632 shared mobile files in one rebased branch; reject execution of the mismatched Gradle wrapper JAR until verified.
6. Re-audit #513 against merged #630 and current public surfaces; close or supersede only with exact path/source evidence.
7. Reconcile #514 dispatch lifecycle with #602's dispatch envelope and #511 execution router; retain one canonical event/state contract.
8. Only after source reconciliation, execute available local/preview tests and attach evidence. GitHub Actions startup failure remains a separate infrastructure blocker and cannot be replaced by source assertions.

