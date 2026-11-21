# LINGO Destiny Engine — Enterprise Stack Register

**Document class:** Architecture / governance register  
**Working title:** Destiny Engine (architecture workstream; not a new public product brand)  
**Canonical source:** `thelingolegacy-blip/TheLingoLegacy`, branch `main`  
**Baseline commit:** `bf7990f0916fa0d0f16bc34b468ccac066bf6b68`  
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
