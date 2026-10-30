# LINGOlegacy Ecosystem Registry

**Audit date:** 2026-10-30  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Registry branch:** `audit/registry-verification-2026-10-30`  
**Release authority:** HOLD — fail-closed  
**Purpose:** Evidence-backed inventory of product surfaces, connected providers, deployments, runtime dependencies, and acceptance state.

## Status vocabulary

- **INSTALLED** — provider/app/package is present in the inspected account or source manifest.
- **CONNECTED** — an authenticated integration or provider API responds.
- **CONFIGURED** — required project IDs, bindings, routes, secrets, and environment settings are present and validated.
- **DEPLOYED** — provider reports an app/worker deployment.
- **EXECUTED** — a real workflow/job/process ran and returned retrievable logs.
- **ACCEPTED** — required independent verification and release authority are satisfied.
- **UNVERIFIED / BLOCKED** — evidence is absent, incomplete, or contradictory. Never infer success.

## Executive state

| Area | Verified state | Registry determination |
|---|---|---|
| GitHub repository | Repository accessible; GitHub App installation ID 140995100; repository selection = all | CONNECTED |
| PR #414–#417 | Open draft PRs; no merge in this audit | SOURCE REVIEW ONLY |
| PR #417 sentinel branch | Canonical labels retained; no `runner.id`; runner ID source documented as Jobs API | SOURCE CORRECTION PRESENT ON PR BRANCH |
| Main sentinel workflow | Current main copy still contains `${{ runner.id }}` and expects a numeric runner ID from that context | SOURCE DRIFT — FIX NOT MERGED |
| GitHub Actions G02 | Recent startup failures; inspected run job and artifact APIs returned zero jobs/artifacts | BLOCKED / NOT EXECUTED |
| AppDeploy | 15 applications report deployed/ready | DEPLOYED; integration acceptance varies |
| LINGO Studio Hub | Latest deployment ready; latest QA reported zero frontend/network errors | STAGING DEPLOYED |
| LINGO Media Health | Staging runtime and subscription repairs deployed; latest QA previously reported zero frontend/backend errors | STAGING REPAIR REPORTED |
| Master Project Plan | Staging status contract now fail-closed; activation endpoint returns a hold response | STAGING GOVERNANCE REPAIR DEPLOYED |
| Shopify | Loyalty Lane store connected; Advanced plan; USD; 15 products returned, all 15 active | CONNECTED; CATALOG PRESENT |
| Shopify inventory | Product list includes products with zero inventory; catalog active does not mean sellable stock | INVENTORY REVIEW REQUIRED |
| Cloudflare | Authenticated account; production Workers/routes/DNS inspected read-only | CONNECTED; PRODUCTION PROTECTED |
| Cloudflare production Workers | `thelingolegacyv-5` production 100% v137 (v175 uploaded); `lingo-flagship-root` production 100% v1 (v2 uploaded) | NO PROMOTION |
| Cloudflare bindings | Production Worker bindings inspected: ASSETS, CANONICAL_DOMAIN, PUBLIC_SITE_URL only | Firebase/Stripe/D1/KV/R2/Workers AI/realtime not confirmed |
| DNS | Apex record reported 192.0.2.0 and proxied; exact apex and wildcard routes target different Workers | REVIEW REQUIRED; NO MUTATION |
| Firebase / Flutter | Flutter manifest declares firebase_core, database, auth, storage, analytics; Firebase hosting config exists; project credentials/runtime not verified; pubspec.lock absent in prior source audit | SOURCE DECLARATIONS ONLY; RUNTIME UNVERIFIED |
| Mobile distribution | No verified signed Android/iOS store artifacts or store approvals; LG webOS/Tizen builds/device tests not verified | NOT CERTIFIED |
| Render | One workspace returned: My Workspace; no workspace selected for service operations | CONNECTED; USER WORKSPACE CONFIRMATION REQUIRED |
| AI / payments / wallet | AI and payment activation disabled; wallet/identity acceptance not certified | DISABLED / NOT CERTIFIED |
| Production release | G02 and integrations not accepted | HOLD |

## Provider and deployment inventory

### GitHub
- Repository: `thelingolegacy-blip/TheLingoLegacy`
- GitHub App installation: `140995100`, account `thelingolegacy-blip`, repository selection `all`.
- PR #417 branch: `recovery/g02-sentinel-correlation-telemetry-2026-10-30`.
- PR #417 head SHA observed: `b7d273a5c69c93f5b8d8b4db6b6bec9ee6ba3de1`.
- PR #417 removes `runner.id`, retains labels `self-hosted, linux, x64, lingo-g02`, and requires independent Jobs API runner ID retrieval.
- **Main-branch discrepancy:** the currently fetched main sentinel still contains `RUNNER_ID: ${{ runner.id }}` and checks it. PR #417 is not merged, so the correction is not in main.
- G02 runner inventory/host status cannot be independently inspected through the currently connected GitHub action set. Do not register a duplicate runner or relax labels as a workaround.

### AppDeploy — 15 deployed apps
All listed applications returned deployment status `deployed` in the connected AppDeploy account:
1. `lingo-legacy-studio-hub-nhda3b` — Studio Hub
2. `lingo-legacy-master-project-plan-rkh6r6` — Master Project Plan
3. `hello-the-lingo-legacy-ois1rj` — LINGO Media Health / runtime repair surface
4. `that-s-my-lingo-casino-studio-2xntye` — That's My Lingo
5. `lingo-legacy-universe-rpekc0` — LINGO Universe
6. `the-lingo-legacy-y67ewl` — Studio Control
7. `obsidian-closet-design-studio-zk6va7` — Obsidian Design Studio
8. `jersey-shore-the-undead-l4h5ea` — Jersey Shore: The Undead
9. `the-lingo-legacy-hq-vhjt6i` — LINGO HQ
10. `kotton-s-code-cartoon-studio-509py3` — Kotton's Code
11. `loyalty-lane-community-hub-zb39n2` — Loyalty Lane Community
12. `lingo-legacy-verification-bridge-wwagn2` — Verification Bridge
13. `lingo-ai-sonic-boom-2030-7plgl2` — LINGO AI Sonic Boom
14. `crazy-weasels-0j3ujc` — Crazy Weasels
15. `lingo-traveltm-uyd57n` — LINGO Travel

Deployment-ready is not equivalent to integration acceptance, security review, production routing, or mobile-store acceptance.

### Shopify — Loyalty Lane
- Store: Loyalty Lane
- Store domain: `vercel-store-f0dc9593.myshopify.com`
- Plan: Advanced; currency USD; country US; timezone EDT.
- Live catalog query returned exactly 15 products, all with status ACTIVE.
- Some products have `totalInventory = 0`; verify inventory and supplier fulfillment before promoting products or advertising availability.
- No price, inventory, checkout, or payment configuration changes were made during this audit.

### Cloudflare
- Account authenticated.
- Production Workers, versions, bindings, DNS, and routes inspected read-only.
- No Worker deployment/promotion, DNS change, route change, or secret mutation performed.
- Existing production/LKG allocations remain protected.
- Observed production bindings do not establish Firebase, Stripe, database, object storage, AI, or realtime service connectivity.

### Render
- One workspace discovered: `My Workspace` (`tea-dbiev1gae00c738hk28g`).
- Service creation/listing requires the user to select/confirm the intended workspace first. No service was created or modified.

## Canonical LINGO product registry

Names below are product taxonomy and ownership references, not deployment claims.

- `LINGOlegacy` — flagship identity, account, wallet architecture, community.
- `LINGOlane` — designs/promotions, apparel, laundry-cycle.
- `LINGOslots` — That's My Lingo; Spades Is My Lingo; Uhno Lingo U-No; Lingo Lions Eruptions; Cashman Lingo Mania.
- `LINGOarcade` — Tricias Escape; Doughboys Oasis; Crazy Weasols; Silly in Philly: The Streets; Jersey Shore: The Undead.
- `LINGOlibrary` — KottonsCode; The Block I Grew Up On; Say It Again; Dice Shift Hotel; Legacy Legends.
- `LINGOmedia` — Rise of Zavione P1: The Foundation; P2: The Metropolis.
- `LINGOworld` — LINGOai; askLINGO; LINGOboom; LINGOtravel; LINGOcampus; LINGOsupport; LINGOwifi; LINGOvoice; LINGOshield; LINGOlounge; LINGOdonations.
- `LegacyXclub` — membership/community surface.

## Source-of-truth drift to reconcile

The current README uses older product labels/domains (`LINGOarena`, `LINGOreads`, old subdomain assumptions) that conflict with the current product canon (`LINGOarcade`, `LINGOlibrary`, Studio Hub gateway). Update the README and product manifest only after the owner-approved canonical domain/surface map is reconciled. Do not infer or create DNS routes from product names.

## Installation and completion rules

1. Do not install packages or provider apps by guessing. Install only dependencies declared by an accepted package manifest or a confirmed platform requirement.
2. For Flutter, run `flutter pub get`, unit tests, web build, Android build, and iOS build on a real supported runner; capture `pubspec.lock`, build logs, artifacts, signing and provenance. Current G02 runner blockage prevents this evidence path.
3. Firebase is not complete until project identity, app registrations, auth providers, database/storage rules, environment config, and live read/write probes are verified.
4. Shopify checkout is not certified until payment configuration, taxes/shipping, stock/fulfillment, webhooks, test orders, and reconciliation are independently verified. Do not enable payments as a registry shortcut.
5. Cloudflare is not complete until worker bindings, Git integration, DNS/routes, observability, rollback and live probes agree.
6. A provider connection does not mean every provider feature is installed or configured.
7. Do not merge PRs, promote Workers, mutate DNS/routes/secrets/billing, activate AI, or activate real-money wagering/payments/wallet until acceptance predicates pass.

## Required next evidence

- A real G02 host or authorized runner inventory view; exact runner ID, name and four labels.
- Fresh G02 workflow dispatch, instantiated job, positive Jobs API runner ID, logs, steps, sentinel artifact, artifact integrity and independent acceptance.
- CI build/test outputs for the canonical main/recovery source after approved reconciliation.
- Firebase project and security-rule evidence.
- Cloudflare Git integration and binding evidence.
- Shopify stock, fulfillment and checkout acceptance.
- Signed platform-specific builds and store/device acceptance.

**Registry conclusion:** The connected provider inventory and 15 AppDeploy deployments are discoverable; the ecosystem is not fully installed/configured/accepted end-to-end. Production release remains **HOLD**.
