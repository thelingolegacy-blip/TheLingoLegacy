# LINGO Enterprise Parallel Workstreams & Production Readiness

**Assessment date:** 2026-11-04  
**Scope:** Staging architecture, release readiness, and four parallel enterprise workstreams.  
**Authority:** Staging preparation and non-production work only. Production DNS, Worker routes, secrets, billing, payment activation, legal filings, and release promotion remain separately authorized actions.

## Executive decision

The four-division enterprise setup fits the LINGO production plan and should be integrated into the existing LINGO Enterprise Control Center rather than launched as a separate control plane.

**Current release decision: NO-GO for canonical production cutover.** Existing staging applications are provider-deployed, but production DNS correctness, source-to-runtime correlation, end-to-end application acceptance, G02 execution evidence, durable cross-device persistence, security controls, and legal/compliance gates are not all proven.

A limited, separately accepted public release can be considered per product once its own gates pass. Do not make the entire ecosystem wait for unrelated corporate or studio workstreams, and do not let a passing staging preview imply production acceptance.

## Existing staging surfaces

The connected AppDeploy account currently lists 18 deployed app records. Priority surfaces include:

- LINGO Enterprise Control Center: `lingo-enterprise-control-center-qos4ix`
- LINGO Studio Hub: `lingo-legacy-studio-hub-nhda3b`
- LINGOlegacy Universe Gateway: `lingolegacy-universe-gateway-h6kqu4`
- That’s My Lingo: `that-s-my-lingo-casino-studio-2xntye`
- Crazy Weasels: `crazy-weasels-0j3ujc`
- Jersey Shore: The Undead: `jersey-shore-the-undead-l4h5ea`
- askLINGO staging surface: `lingo-ai-sonic-boom-2030-7plgl2`

Latest provider snapshots returned deployment status `ready` and zero reported frontend, network, and backend errors for these seven apps. Static source validation explicitly returned valid for Studio Hub, That’s My Lingo, and Crazy Weasels. Validation is null/unavailable for Control Center, Universe Gateway, Jersey Shore, and askLINGO. These snapshots are not end-to-end acceptance and do not prove production routing, authenticated workflows, gameplay completion, durable cloud saves, payments, or load capacity.

The Control Center is explicitly a staging control surface. Its source says it is not a production control plane, that its overview is local dashboard state rather than a live system-of-record export, and that it cannot authorize production changes. Preserve those boundaries.

## Parallel workstreams

### 1. Infrastructure & CI/CD

**Goal:** A reproducible, observable and recoverable delivery path.

- Keep Cloudflare as the intended canonical production edge.
- Verify DNS records, Worker routes, TLS, origin health, and rollback targets before any cutover.
- Restore G02 only with real runner assignment, host/service evidence, executed steps, retrievable logs, artifacts, hashes, and independent verification.
- Investigate GitHub Actions startup failures separately from G02. Do not attribute GitHub-hosted runner startup failures to an unproven self-hosted runner.
- Add build provenance, immutable artifact references, deployment manifests, health checks, backup/restore tests, and alerting.
- Keep credentials in secret stores; never commit credentials or tokens.

**Current blockers/evidence:**
- Cloudflare apex A record currently resolves in configuration to `192.0.2.0`, a documentation-only placeholder, and multiple AAAA records use `100::`, also not a valid production origin address. The `www` CNAME points to the apex. This is a canonical-domain release blocker until an approved origin/edge design is implemented and verified.
- Worker routes include `thelingolegacy.com/*` → `thelingolegacyv-5`, a separate exact-root route `thelingolegacy.com/` → `lingo-flagship-root`, and `atlas.thelingolegacy.com/*` → `lingo-ecosystem-atlas`. Route precedence and actual runtime behavior must be tested against a valid origin before release.
- The `casino` CNAME currently targets the AppDeploy proxy. `studio-preview` points to a Vercel DNS target; this is not approved as the canonical production architecture.
- GitHub main reports `protected: false` in the branch API. Establish and verify branch protection/rulesets before production promotion.
- PR #451 (Studio Hub staging/recovery) and PR #425 (G02 recovery) remain draft. Recent Actions startup failures must be diagnosed from run/job-level evidence; no PASS may be inferred from queued, startup-failed, or status-only records.
- G02 host execution and independent acceptance remain unverified.

### 2. Platform & Application

**Goal:** Shared identity, APIs, AI, creative production, and actual usable applications.

- Make the Enterprise Control Center the read-only enterprise overview and release evidence index; it must not become an alternate production authorization plane.
- Keep Universe Gateway as the user-facing directory/entry point.
- Keep Studio Hub as the creative workspace and asset/publishing intake.
- Establish shared identity/session boundaries, API contracts, event schemas, observability, and a real system of record before claiming cross-app integration.
- LINGOVOX / LingoStudio FLX should be a distinct audio-production workstream: DAW engine, device/browser compatibility, audio export, media rights, waveform/transport QA, and lyric synchronization.
- LINGOboom Studio should use provider adapters for askLINGO, Claude, Gemini, and ChatGPT. Each adapter needs explicit user/provider authorization, scoped secrets, rate/cost controls, model provenance, safety policy, and failure handling. Do not assume one provider credential authorizes another.
- For games, validate complete mobile controls, restart/quit flows, scoring, accessibility, network failure behavior, and cloud persistence. LocalStorage-only progress is not cross-device persistence.
- Keep That’s My Lingo in free demo mode with virtual credits only. No real-money wagering, cash-out, prize entry, or sweepstakes activation without a separate legal/compliance review and explicit release approval.

**Known source cleanup:**
- Studio Hub still contains Game143 branding where the current product canon calls for LINGOarcade, as well as a Shopify development-store URL on a Vercel-branded myshopify domain. It must not be presented as a verified live commerce destination.
- Studio Hub has canonical product labels elsewhere in its source, so the correction should be a focused source-of-truth cleanup rather than a new rebrand.
- Control Center currently has a manually curated product/gate snapshot and should be reconciled with the current 18-app provider inventory before it is used as an executive release dashboard.

### 3. Corporate & Land Acquisition

**Goal:** A prepared, traceable opportunity pipeline, separate from software release authority.

- Create an opportunity register for Philadelphia-area properties, venue concepts, and land-bank opportunities.
- Track parcel/source provenance, ownership and title checks, zoning/use, environmental and building diligence, access/utilities, estimated acquisition and rehabilitation costs, operating model, community benefit, and decision owner.
- Prepare grant-readiness workspaces for PA RACP, PIDC, and LSA with eligibility, match requirements, deadlines, required attachments, and review status.
- Keep application submission, representations/certifications, signatures, property offers, and financial commitments behind explicit owner approval.
- Do not publish private property, financial, identity, or application information in this public repository.

### 4. Personal & Workspace Operations

**Goal:** One executive operating view without exposing private personal records.

- Provide private workspaces for budgeting, opportunity/job tracking, repository inventory, decisions, and action owners.
- Use least-privilege connectors and explicit scope for personal financial data.
- Keep personal financial records and credentials out of this public repository and out of public dashboards.
- Connect operational milestones to the enterprise control view using summarized status and evidence references, not private source records.

## Canonical integration model

- **LINGO Enterprise Control Center:** executive overview, workstream status, risks, decision log, release evidence index; read-only with respect to production.
- **LINGOlegacy Universe Gateway:** public discovery and navigation across approved product surfaces.
- **LINGO Studio Hub:** authenticated creative workspace, asset registry, design, game/media production and publishing intake.
- **Shared platform services:** identity/session, API gateway, durable data, eventing, observability, media delivery, AI provider adapters, and audit records.
- **Product surfaces:** LINGOslots, LINGOarcade, LINGOlibrary, LINGOmedia, LINGOworld and LINGOlane products with independent product-level release gates.

Do not represent the control center, gateway, or studio as connected to a shared identity or system of record until token exchange, authorization, persistence, and audit behavior are implemented and tested.

## Production release gates

The release sequence remains:

`SOURCE → ACTUAL EXECUTION → RETRIEVABLE EVIDENCE → INDEPENDENT VERIFICATION → ACCEPTANCE → AUTHORIZATION → PROMOTION`

| Gate | Acceptance evidence | Current disposition |
|---|---|---|
| Source integrity | Pinned commit, reviewed diff, reproducible build | Partial; open draft PRs |
| CI execution | Actual job assignment, executed steps, logs, artifacts | Blocked; startup failures and G02 unverified |
| DNS and routing | Correct authoritative records, TLS, Worker route tests, valid origin | Blocked; placeholder apex/AAAA records |
| Application QA | Functional desktop/mobile journeys and API tests | Partial; provider QA snapshots only |
| Identity/security | AuthZ tests, least privilege, secret scan, threat review | Not accepted |
| Data durability | Cloud save, restore test, privacy/retention checks | Not accepted across product surfaces |
| Performance/recovery | Load test, SLOs, backup/restore and rollback exercise | Not accepted |
| Legal/compliance | Terms, privacy, IP rights, commerce/sweepstakes review | Product-dependent; not accepted globally |
| Independent acceptance | Evidence reviewed by a party other than the implementer | Blocked |
| Release authorization | Explicit owner decision for named version and domains | Not granted |

## Recommended release waves

1. **Foundation:** repair and verify DNS/origin/Worker routing, establish branch protections, restore reliable CI evidence, and publish a rollback plan.
2. **Public discovery cohort:** Universe Gateway and Studio Hub, only after route, accessibility, mobile, auth, security, and source-to-runtime checks pass. Keep sensitive studio tools authenticated.
3. **Playable cohort:** release one or two games only after mobile gameplay, scoring, save/recovery, abuse controls, privacy, and legal checks pass. Keep virtual/demo economies isolated.
4. **Platform services:** AI/audio/media, identity, loyalty, commerce, and creator services only after provider permissions, secrets, billing/cost controls, durable storage, and user-consent flows are verified.
5. **Corporate operations:** property/grant pipeline and private workspace operations proceed in parallel, but do not gate unrelated public product releases.

## Resource and provider constraints

- AppDeploy currently reports a credit balance below 100 credits. A previous deployment preflight was blocked by the provider's minimum credit requirement and reset window. Do not retry deployments, purchase credits, or change billing without owner approval.
- Existing deployed previews can be inspected, but no new deployment or live production mutation is implied by this document.
- Do not add paid infrastructure, activate payment/payout flows, accept legal terms, file applications, change canonical DNS, alter production Worker routes/secrets, or promote a release without the specific required approval.

## Next evidence to collect

1. Verify a valid canonical apex/www origin and all intended subdomain targets; produce a proposed DNS/Worker route diff only.
2. Establish protected main/rulesets and diagnose the Actions startup failures independently of G02.
3. Capture current CI run/job IDs, runner IDs, step records, log URLs, artifact IDs, and integrity hashes.
4. Run authenticated and unauthenticated desktop/mobile end-to-end journeys for Gateway, Studio Hub, and each proposed first-wave product.
5. Prove shared identity, server-side authorization, durable cloud saves, backups, and restore before describing them as operational.
6. Reconcile the Control Center's product inventory and evidence freshness against provider and repository sources.
7. Produce a product-specific go/no-go record for each public release candidate.

**No production DNS, Worker routes, secrets, payments, legal filings, billing, or promotion were changed as part of this assessment.**
