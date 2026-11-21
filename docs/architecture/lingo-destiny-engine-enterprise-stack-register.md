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



## 12. Live provider and platform inventory — read-only snapshot 2026-11-21

This section records provider reads performed during the ignition review. It does not grant deployment or mutation authority.

### GitHub
- Canonical repository `thelingolegacy-blip/TheLingoLegacy` is public, active, default branch `main`; connected identity has admin/push permissions.
- PR #638 is open, draft, mergeable, documentation-only; it has not been merged.
- PR #614 is open/draft and non-mergeable; its description explicitly keeps Firebase staging identity unconfigured and publication quarantined. Current-head Android wrapper JAR checksum differs from the official Gradle 9.5.0 wrapper checksum; do not execute it.
- PR #632 is open/draft and mergeable, but overlaps five source paths with #614. It has no verified native device build in its current acceptance evidence.
- PR #602 is open/draft and stacked on PR #548; it explicitly has no current-head GitHub Actions run and no hosted validator execution.
- PR #548 remains open/draft/non-mergeable; its Cloudflare exact-root Worker version 3 is preview-only and browser QA is outstanding.
- PR #511 remains open/draft; it is the master registry candidate, not a live authoritative merged registry.
- PR #515 remains open/draft/non-mergeable; its Supabase-primary backend decision conflicts with the undecided identity/backend ADR in #511. Do not treat it as accepted.
- Hosted GitHub Actions remains a blocker: latest observed startup failure occurs before job allocation; no jobs/steps/logs/artifacts means no CI pass or G02 proof.
- A zero-third-party-action hosted canary trigger commit exists on the dedicated recovery branch, but the immediate status read returned no commit checks. This is not evidence of a successful run.

### Cloudflare
- Account and zone: one connected account; `thelingolegacy.com` zone is active on the Free Website plan.
- Live inventory: 10 Worker scripts, 27 Worker routes, and 34 DNS records.
- Production wildcard apex and www routes point to `thelingolegacyv-5`; an exact bare-apex root route points to `lingo-flagship-root`. The two Workers have distinct behavior; source-of-truth drift and route normalization are documented as decision-required. Do not change these routes during this workstream.
- `lingo-studio-control-center-staging` exists as an unrouted staging Worker with no regular bindings shown in the inventory. Historical evidence (2026-11-04) records read-only `/healthz` and `/api/v1/platform/status` checks, but this session could not retrieve those workers.dev endpoints through the web inspection surface. Treat that historical evidence as dated, not as a fresh runtime check.
- `lingo-ecosystem-atlas` is routed at `atlas.thelingolegacy.com/*`; `lingo-static-backup-proxy` is routed at `launch.thelingolegacy.com/*`.
- DNS includes `admin.thelingolegacy.com` pointing to `admin-thelingolegacy.firebaseapp.com`, and `app.thelingolegacy.com` pointing to `my-flutter-app.pages.dev`. DNS targets alone do not prove the Firebase project, Pages deployment, Flutter app, or route is healthy.
- Cloudflare account metadata reports `enforce_twofactor=false`. This is a P1 account-security gap: enable/enforce MFA through the owner-approved account security process, confirm at least two recovery methods/admin continuity, then re-read account settings. No account setting was changed.
- Zone `security_level` is `medium`; this is not a complete WAF, bot, rate-limit, Access, or application security audit.
- No route, DNS, Worker, secret, or account setting was modified.

### Supabase
- Connected organization `thelingolegacy`; one project `zoksxavxmgnkrthselek`, status `ACTIVE_HEALTHY`, region `us-west-2`, PostgreSQL 17.6.1.121.
- Live schema inventory returned no application tables in `public`; no migration records and no Edge Functions were returned.
- Security, performance, and health advisor queries each returned zero lints.
- Interpretation: healthy provider/database shell, not yet an implemented LINGO application backend. Empty app schema means no verified LINGO identity, wallet, ledger, tenant, product, or workforce domain services. Zero lints does not prove application security when the application schema and functions are absent.
- Do not create production schema or select this project as the transactional authority until the #511/#515 ADR and owner-approved data-domain map are accepted.

### Render
- One workspace, `My Workspace`.
- One non-suspended static site, `lingo-legacy-platform-ops-preview`, linked to the canonical GitHub repository and recovery branch.
- Auto-deploy is off; service is a starter static site publishing `render-staging`; no Render backend service, worker, database, or production API was returned in this workspace inventory.
- Its IP allowlist is `0.0.0.0/0` (“everywhere”): it is publicly reachable at the network layer. Keep it synthetic/demo-only; do not place operational secrets, sensitive evidence, customer records, or privileged controls there. Add authentication/Access protection before any sensitive operational use.
- Do not provision paid Render services as a substitute for the existing Cloudflare/Firebase/Supabase architecture without a cost and ownership decision.

### Flutter and Firebase
- Current main source contains placeholder Firebase options and no approved production/staging project identity. The existing PR #614 documents a quarantined Hosting builder, per-platform placeholder validation, Flutter 3.50.0 pin, Android scaffold and release signing disabled.
- PR #614 documents an earlier successful Cloudflare Pages preview for an older commit only; it does not qualify the current head. The current branch's Gradle wrapper JAR mismatch is a hard execution stop. Replace from official Gradle distribution and verify wrapper JAR checksum before any Android build.
- PR #632 supplies a focused offline-preview and unsigned-release safety candidate. Reconcile with #614; do not merge both or activate Firebase by populating guessed configuration.
- The DNS records for Firebase/Pages do not substitute for Firebase Console project ownership, authorized app registrations, service configuration, rules, App Check, Hosting allowlist review, or device testing.
- No Firebase provider connector is available in this session. Firebase project status, Hosting deployments, Auth providers, rules, App Check, Crashlytics, FCM, and billing were not independently inspected. Mark each UNKNOWN until checked in the authorized Firebase Console/CLI.

### Google AI Studio and LINGOstudio
- The repository already contains `docs/google-ai-studio-lingo-workstream.md`, `studio/google-ai-studio-build-prompt.md`, and a read-only Studio Control Center concept. Google AI Studio is designated for prototype/build-mode work and Gemini experimentation, not as a production deployment authority or G02 repair mechanism.
- No Google AI Studio connector/account state is available in this session. Project ownership, Build mode import, Gemini key configuration, model availability, quotas, and generated app deployment are UNKNOWN.
- LINGOstudio should become the unified creator/developer/operations workspace, not a privileged bypass. Its module map must cover: portfolio/product registry; visual/site/game studio; AI prompt/model workbench; source and PR explorer; build/test evidence; provider inventory; environment and release gates; design system/assets; content/lore/media pipeline; approvals/audit trail; incident/recovery console; and documentation/runbooks.
- LINGOstudio operating modes: Observe, Analyze, Design, Build (isolated branch only), Test, Propose, Verify. No autonomous merge, deploy, secret rotation, billing, wallet/reward, access grant, or production activation.
- Integrations use provider adapters and scoped tokens on server-side only. The UI must distinguish LIVE VERIFIED, HISTORICAL EVIDENCE, SOURCE-DECLARED, DEMO, BLOCKED, and UNKNOWN; every metric/status shows source and observed-at timestamp.
- Required Studio platform services: SSO/MFA; RBAC + resource/tenant ABAC; audit log; secret reference vault (never reveal values); environment registry; signed build artifacts/SBOM/provenance; evidence store; cost/usage controls; backup/restore drills; incident/runbook center; accessibility and mobile/tablet responsive UI.
- Never place Gemini keys or other provider credentials in client bundles, prompts, Git, Flutter assets, public Pages output, logs, or screenshots.

## 13. Prioritized gaps to close before a live experience

| Priority | Gap | Acceptance evidence |
|---|---|---|
| P0 | GitHub Actions startup failure / G02 | Hosted jobs instantiated; all required steps, runner identity, logs and artifacts correlated to commit/run |
| P0 | Firebase project and publication boundary | Owner-approved staging project ID, app registrations, App Check/rules, non-empty explicit asset allowlist, no credentials in output, verified test deployment |
| P0 | Production route/root/www parity | Approved route map, apex/www/query-path tests, exact Worker attribution, preview QA and rollback evidence |
| P0 | Flutter Android integrity | Trusted wrapper JAR checksum, clean Flutter 3.50.0 analyze/tests, Android build, no debug signing, unsigned/release signing gate verified |
| P0 | Supabase backend decision | Signed ADR selecting identity issuer and one transactional authority; app schema migrations, RLS policies, negative cross-tenant tests, backup/restore evidence |
| P1 | Cloudflare account MFA | Account-level two-factor enforcement enabled and recovery/admin continuity verified |
| P1 | Render preview exposure | Authentication or Cloudflare Access; synthetic-only data; no sensitive evidence; preview network boundary documented |
| P1 | Google AI Studio readiness | Authorized project/import, server-only Gemini secret, quota/cost controls, isolated output branch, generated-code review |
| P1 | LINGOstudio completion | Unified module registry and read-only integration health; evidence viewer; proposal/approval ledger; audit trail; responsive/accessibility QA |
| P1 | Observability and recovery | SLOs, structured logs, alert routing, privacy retention, RPO/RTO, restore rehearsal and incident ownership |
| P1 | Enterprise compliance | Data classification, retention, deletion, residency, consent, vendor inventory, DPIA/security review where applicable, accessibility and legal reviews by jurisdiction |

## 14. LINGOstudio target module contract

The Studio is the operating cockpit for building and understanding the ecosystem, with a clear separation between control plane and product runtimes.

- **Studio Home:** portfolio health, today's build queue, blocker count, release calendar, and live/preview distinction.
- **World & Product Registry:** canonical IDs, owners, repos, routes, runtime, data class, dependency graph, launch state.
- **Visual Studio:** web/mobile/page layouts, brand tokens, component library, preview links, accessibility checks.
- **Game Studio:** Unity/web project registry, game design documents, assets, deterministic test fixtures, server-authoritative rules and game QA.
- **AI Studio:** Google AI Studio/Gemini prototype handoff, prompt library, model adapter catalog, eval datasets, redaction and cost budgets.
- **Code Studio:** GitHub branch/PR/diff, code owners, CI results, dependency/SBOM and security evidence.
- **Backend Studio:** API contracts, identity, Supabase/Firebase project inventory, schema/migration review, RLS/rules test evidence.
- **Cloud Studio:** Cloudflare Worker/route/DNS inventory, Render preview services, environment/binding metadata; no secret values.
- **Media & Library Studio:** books, characters, scripts, audio/video, rights, provenance and publishing approvals.
- **Operations Studio:** workforce, property, hospitality, transportation/infrastructure asset domains with strict tenant/jurisdiction roles.
- **Release & Trust Center:** gate state, evidence provenance, approvals, incident response, audit trail, rollback and recovery.
- **Finance/Commerce readiness:** provider configuration status only; real payment, payroll, wallet, sweepstakes and rewards actions remain disabled until separate approval.

All Studio actions are read-only by default. Any later write action must be a narrowly scoped, separately authorized workflow with confirmation, audit event, idempotency, rollback plan, and post-action verification.

## 15. 150-minute ignition sprint revised for observed reality

1. **0–20 min — Security and provenance:** preserve current main/LKG; record exact GitHub and provider snapshots; account MFA decision; no production changes.
2. **20–45 min — Stack and ownership:** reconcile #511 registry, #602 realms, #515 backend ADR; name domain owners and data classifications.
3. **45–75 min — P0 app safety:** reconcile #614/#632; stop unsafe wrapper execution; verify Firebase staging project ownership and publication allowlist; test no-secret output.
4. **75–100 min — Cloudflare and Render:** reconcile apex/root/www ownership; protect Render preview; establish staging route matrix and read-only probes.
5. **100–125 min — LINGOstudio:** consolidate module registry and provider readiness into the existing Studio Control Center; keep all controls read-only.
6. **125–150 min — Evidence and closeout:** run available safe local/preview tests, attach exact evidence, update #517, retain all blockers that lack provider/host/runtime proof.

**Completion statement:** This register is a current architecture and provider-readiness snapshot. It does not mean the ecosystem is fully built, all providers are connected, or a live release is approved. The next release candidate must earn each gate with correlated evidence.


### Additional runtime and transport controls observed

- Cloudflare zone transport settings: minimum TLS version `1.3`; `always_use_https=on`; `automatic_https_rewrites=on`; zone security level `medium`.
- Account-level two-factor enforcement remains `false`, so strong edge transport does not resolve administrator account hardening.
- The Studio staging Worker has a current deployment record with 100% of that Worker deployment assigned to version `8d05879b-db31-43d3-ae10-7f2abc91246a`. This percentage is isolated to the staging Worker; it is not production traffic.
- Studio staging Worker settings show observability enabled with query-string redaction, persistent invocation logs, and **zero regular bindings**. It has no custom zone route. This supports the read-only staging-control-plane classification, but does not prove that every UI function or provider adapter is live.
- Render's only service has one current `live` deployment for commit `c6ab81c34a0521ed72937b6a7fcf618a47b62038`, publishing the static `render-staging` directory. Its build command is an echo/no-compilation command; this is not a backend build or production API deployment.
- The current public apex page identifies itself as a candidate experience and says destination activation depends on verified routes. Public reachability of the homepage must not be confused with a production-ready account, wallet, commerce, game, or creator experience.


## 13. World-engine and game-development architecture

The LINGO World Engine is a reusable platform capability for creating, simulating, operating and safely evolving original game worlds. It is a technical foundation shared by LINGOarcade, LINGOslots and future world experiences; it is not a replacement for each product's ownership, brand or release lifecycle.

### Runtime architecture

```text
WORLD BUILDER / CONTENT AUTHORING
  ├─ versioned world schemas and rulesets
  ├─ scene graphs, zones, maps and points of interest
  ├─ procedural generation with deterministic seeds
  ├─ asset catalog, rights, provenance and localization
  └─ accessibility and content-safety checks
              |
              v
WORLD SIMULATION / GAME SERVICES
  ├─ deterministic simulation and replay
  ├─ server-authoritative sessions and game rules
  ├─ player progression and entitlements
  ├─ matchmaking, persistence and event contracts
  └─ anti-cheat, moderation and abuse controls
              |
              v
RUNTIME ADAPTERS
  ├─ Unity: 3D worlds, physics and richer native clients
  ├─ Web: lightweight 2D, previews and browser experiences
  └─ Flutter: mobile shell, account and companion surfaces
              |
              v
LIVE OPERATIONS
  ├─ events, seasons and feature flags
  ├─ telemetry, SLOs and crash diagnostics
  ├─ support, moderation and incident workflows
  └─ rollback and versioned content promotion
```

### World-definition contract

Every world or scene package should have:
- immutable `world_id`, semantic `world_version`, content hash and owning product;
- deterministic generation seed and generator/ruleset version where procedural generation is used;
- map/scene bounds, zones, points of interest, spawn rules and entity/component schema;
- asset IDs with source hash, creator/rights, allowed use, privacy class and localization;
- gameplay rules, progression, difficulty, accessibility, moderation and age/content classification;
- API/event compatibility range, save-data schema version, migration and rollback notes.

### Simulation and multiplayer invariants

- Clients render and submit intents; trusted server-side services validate state transitions and rewards.
- Use fixed-step or otherwise explicitly deterministic simulation where replay or competitive fairness requires it.
- Persist authoritative session transitions with idempotency and correlation IDs; define retry, reconnect, timeout and duplicate-event behavior.
- Multiplayer state, inventory, achievements and leaderboards require server-side ownership checks, anti-cheat signals and moderation controls.
- Use event sourcing or immutable journals for high-value progression/economy events where auditability is required; do not make local browser storage authoritative.
- Separate player/game data from workforce, property, hospitality and infrastructure operational records.

### Geospatial and infrastructure boundaries

Real-world GIS, roads, lighting, water and utility telemetry may inform fictionalized world design only through approved, minimized and rights-cleared datasets. Never expose precise infrastructure asset coordinates, operational telemetry, employee information, customer records or safety-sensitive control details to public game clients. Infrastructure digital-twin or operational systems remain separate products with jurisdiction-scoped roles, audit trails and incident controls.

### Content and release pipeline

`WORLD SCHEMA → CONTENT AUTHORING → RIGHTS/SAFETY REVIEW → DETERMINISTIC FIXTURES → CLIENT BUILD → CONTRACT/PLAYTEST QA → PREVIEW → ACCEPTANCE → AUTHORIZED RELEASE`

Promote world content independently from runtime code where compatibility allows. Pin asset manifests and world versions to each build. Maintain rollback to the prior known-good world package. Never promote unreviewed procedural content or external assets directly into production.

### Economy and safety

All demo/game currencies remain fictional, non-transferable and non-redeemable unless a separate approved business/legal design explicitly changes the policy. No cash wagering, cash-out, prize redemption, or client-authoritative balance mutation is part of the World Engine baseline.


## 14. Cloudflare live-route provenance — read-only snapshot 2026-11-21

The public root and the remaining site paths are served by different Worker route matches. This must be treated as an explicit release dependency.

| Host/path | Route owner | Active traffic evidence | Preview evidence | Release interpretation |
|---|---|---|---|---|
| `thelingolegacy.com/` exact root | `lingo-flagship-root` | Deployment version 1 at 100%; deployed 2026-10-25 | Version 3 references PR #548 and is marked preview-capable | The current live homepage is not the same as main's `index.html`; the exact-root Worker intercepts it. |
| `thelingolegacy.com/*` subpaths | `thelingolegacyv-5` | Version 137 (ID `2d161fa5-598f-4998-ada8-7ac4c72c3461`) at 100%; deployed 2026-10-25 | Latest uploaded version 378 is preview-capable, not active traffic | Current subpages can lag current main source even when newer preview versions exist. |
| `www.thelingolegacy.com/*` | `thelingolegacyv-5` | Same active main Worker deployment | Same preview-only versions | Verify apex/www parity before accepting flagship release. |
| `atlas.thelingolegacy.com/*` | `lingo-ecosystem-atlas` | Separate Worker deployment at 100% | Version inventory exists | Treat atlas as a separate runtime, not a route alias for the flagship. |

The read-only zone route response contained 27 routes. The exact-root route is more specific than the apex wildcard and intentionally resolves to a separate Worker. The latest version 378 on the main Worker is annotated as a preview upload; it does not change active traffic. The exact-root version 3 is annotated as PR #548 preview and also does not change active traffic.

### Source/runtime parity findings

- Current GitHub main `index.html` is a noindex redirect to `/studio-hub/`; the apex root Worker serves the public homepage instead. Therefore main's root HTML cannot be assumed to be the live apex homepage.
- Live `/worlds/`, `/thats-my-lingo/`, and `/kottons-code/` responses are served by the existing site Worker route and must be validated against the exact uploaded Worker version and asset manifest.
- The live That’s My Lingo response contains older monetization-style copy while current main has safer Demo Coin language. The live Kotton’s Code response retains a privacy issue tracked by #476.
- A successful source PR or preview upload is not proof of active route content. Acceptance requires exact GitHub commit → uploaded Worker version → deployment ID → route → public response correlation.

No Worker upload, deployment, route, DNS, traffic percentage, or production configuration was changed during this snapshot.


## 15. Canonical portfolio taxonomy — required reconciliation for PR #602

The 14 records in PR #602 are useful as an inventory of product and platform nodes, but they must not all be presented as 14 equivalent public-facing brands. Preserve the records and dependencies while classifying them against the approved portfolio canon.

### Public-facing portfolio groups

1. `LINGOlegacy` — flagship identity, account experience, community and discovery.
2. `LINGOlane` — Loyalty Lane designs/promotions, apparel and Laundry-Cycle.
3. `LINGOslots` — That’s My Lingo, Spades Is My Lingo, Uhno Lingo U-No, Lingo Lions Eruptions and Cashman Lingo Mania.
4. `LINGOarcade` — Tricias Escape, Doughboys Oasis, Crazy Weasols, Silly in Philly and Jersey Shore: The Undead.
5. `LINGOlibrary` — KottonsCode, The Block I Grew Up On, Say It Again, Dice Shift Hotel and Legacy Legends.
6. `LINGOmedia` — Rise of Zavione P1/P2 and associated media/publishing.
7. `LINGOworld` — LINGOai, askLINGO, LINGOboom, LINGOtravel, LINGOcampus, LINGOsupport, LINGOwifi, LINGOvoice, LINGOshield, LINGOlounge and LINGOdonations; it also owns the separately permissioned workforce, property, hospitality and infrastructure service domains.
8. `LegacyXclub` — membership and community experiences.

`LINGOlegacy_MASTER` is the governance and enterprise-control root, not another public product. It owns the portfolio canon, legal/brand records, engineering, releases and archives.

### Shared platform capabilities (not new public portfolios)

- LINGOstudio: internal creator, engineering, asset, operations and release workspace.
- LINGOcore: shared API, event, service-registry and SDK foundation.
- LINGOidentity / LINGO ID: shared identity and authorization capability.
- LINGOwallet / Universal Legacy Wallet: shared ledger capability, disabled until legal/finance/security acceptance.
- LINGOshield: a LINGOworld product/service with shared security, monitoring and incident-response capabilities; do not duplicate it as a separate public realm.

### PR #602 classification changes required

- Reclassify `LINGOcampus` as a LINGOworld subproduct, not a separate top-level portfolio.
- Reclassify `LINGOstudio`, `LINGOcore`, `LINGOidentity` and `LINGOwallet` as shared platform capabilities, not peer public realms.
- Keep `LINGOshield` in the LINGOworld product family while its security/incident functions remain shared services.
- Retain the 14 inventory records if they are needed for dependencies and implementation tracking, but add an explicit `node_type` such as `public_portfolio`, `subproduct`, or `shared_platform_service`.
- Ensure product display names and subproduct membership match this canon. Never silently rename historical records or create duplicate public identities to satisfy an implementation registry.

This preserves the useful detail in PR #602 while preventing internal service boundaries from becoming accidental new brands or conflicting product hierarchies.


## 16. Public route and legal-surface QA — read-only 2026-11-21

The live site contains multiple generations of public surfaces. A route returning HTTP content is not sufficient for acceptance; verify product identity, content safety, privacy, navigation, accessibility and current source provenance.

| Public path | Browser observation | Release disposition |
|---|---|---|
| `/` | Apex exact-root Worker serves a candidate homepage; root source on main is a redirect to `/studio-hub/` | Keep candidate label; reconcile root Worker and main source before promotion |
| `/studio/` | Publicly reachable operations control center exposes protected-hold, G02, billing/configuration and access-verification status | Keep read-only; review whether authentication or a public-safe status projection is required |
| `/trust-compliance/` | Reachable trust/safety blueprint with no-cash-value language | Candidate policy reference; verify legal owner and current controls |
| `/privacy/` | Reachable but contains outdated founder-drop and payment wording | Privacy copy refresh required before public release acceptance |
| `/terms/` | Not accessible in the public browser check | Terms publication/route verification required |
| `/contact/` | Reachable but serves an older generic v7 portal rather than a focused contact page | Do not use as canonical contact route; use approved mailto until replaced |
| `/loyalty-lane-apparel/` | Reachable but serves the same older generic v7 surface | Not an accepted apparel storefront; keep commerce disabled |
| `/lane/` | Reachable source-only Studio surface; explicitly says production promotion remains gated | May be linked as a source-only preview with clear status |
| `/media/` | Reachable source-only Studio surface; explicitly says production promotion remains gated | May be linked as a source-only preview with clear status |
| `/studio-sites/` | Reachable generic universe portal; includes identifiable character/family references | Privacy review required under #476; do not link publicly until cleared |
| `/kottons-code/` | Reachable but exposes identifiable family/minor details | Release-blocking privacy issue #476; keep directory link disabled |
| `/thats-my-lingo/` | Reachable older public experience with dollar-style jackpot presentation and founder/payment marketing copy | Keep disabled until PR #639 is accepted, preview-tested and deployed through an authorized release |
| `/loyalty-lane-cycles/`, `/library/`, `/studio-sites/lingoslots/`, `/studio-sites/lingoarcade/`, `/studio/lingo-ai/`, Doughboys vertical-slice path | Not accessible in the public browser check | Do not expose as active links; require route and browser verification |

### Public experience policy

- A directory card may link only to a route whose current content, route owner and privacy posture have been verified.
- Use explicit `PREVIEW`, `SOURCE ONLY`, `PLANNED`, or `BLOCKED` labels; never infer production readiness from route existence.
- Disable any product surface with unresolved privacy, legal, payment, identity, content-rights or routing concerns.
- Avoid star symbols in canonical product names and remove obsolete generic v7 shells from canonical navigation.
- Replace the old contact page with the approved contact email until a dedicated route is reviewed.
- Keep the privacy policy visible but mark its refresh as required; do not claim terms acceptance while the Terms route is unverified.
- Do not publish personal/family details from development portals or story references without explicit privacy approval.

The route-aware canonical directory proposal in PR #640 applies these rules: eight public portfolio cards, separately permissioned LINGOworld service domains, shared platform engines, and disabled links for unverified or privacy-sensitive destinations.
