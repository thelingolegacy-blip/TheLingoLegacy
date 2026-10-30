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
| Firebase / Flutter | Console identity confirmed by user: `Flutter AI Playground` / `flutter-ai-playground-e9ad0` (project number `6714975920`). Repository `.firebaserc` and `verify-flutter-firebase.mjs` instead target `lingo-legacy-production`; project identity conflict. Credentials, Auth, Firestore/Realtime Database, Storage rules, and live runtime remain unverified. | PROJECT CONFLICT — DO NOT DEPLOY OR SWITCH ALIASES |
| Mobile distribution | No verified signed Android/iOS store artifacts or store approvals; LG webOS/Tizen builds/device tests not verified | NOT CERTIFIED |
| Render | User-confirmed workspace `My Workspace` (`tea-dbiev1gae00c738hk28g`); PostgreSQL and Key Value inventories returned no instances; service inventory API returned null even with explicit workspace ID. No `render.yaml`, Dockerfile, or Compose file found at repository root. | WORKSPACE CONFIRMED; SERVICE INVENTORY UNRESOLVED; NO PROVISIONING |
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
- User explicitly confirmed `My Workspace` (`tea-dbiev1gae00c738hk28g`); every inventory call now supplies this workspace ID.
- PostgreSQL inventory: no instances found. Key Value inventory: no instances found. Services inventory: API returned `null`, so the service list is unresolved rather than proven empty.
- No root `render.yaml`, Dockerfile, or Compose specification was found in the inspected main-branch paths.
- No service, database, or key-value instance was created. Do not provision a duplicate application host until a distinct Render workload and cost profile are specified.

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


## Newly verified configuration conflicts (2026-10-30)

### Firebase project identity conflict
- User-confirmed Firebase Console project: `Flutter AI Playground`, project ID `flutter-ai-playground-e9ad0`, project number `6714975920`.
- Repository `.firebaserc` currently sets the default alias to `lingo-legacy-production`.
- `scripts/verify-flutter-firebase.mjs` explicitly requires `lingo-legacy-production` and reads `lib/firebase_options.dart`.
- These are conflicting project identities. The intended target has not been approved by a repository-level environment mapping or verified by live Firebase credentials. Do not rewrite the alias, deploy rules, initialize data, or ship Flutter builds until an explicit environment mapping and live project verification exist.

### Cloudflare deployment-target split
- Root `wrangler.jsonc`: Worker `thelingolegacyv-5`, entry point `worker.js`, canonical apex and www routes.
- `cloudflare/wrangler.toml`: Worker `lingo-legacy-studio-build`, entry point `cloudflare/studio-worker.js`; adjacent README says this is an isolated non-production build and canonical routes remain unchanged.
- Keep these deployment targets isolated. A staging workflow must not inherit production routes, production secrets, or production bindings. The Cloudflare Studio artifact is not production acceptance.

### Safe activation / blocker policy
- Safe to disable only demonstrably unused demo UI, onboarding overlays, debug controls, placeholder prompts, and non-production preview auto-starts when their source flags are confirmed and the action is reversible.
- Do not disable security controls, branch protection, runner labels, approval gates, rate limits, audit logging, payment safety, or production/LKG protections to make a pipeline green.
- Do not create a second runner or change runner labels. G02 requires the existing canonical host and real Jobs API evidence.
- A CI workflow that has no executable runner must remain blocked; do not replace self-hosted execution with a hosted runner and call it G02 acceptance.
- No secrets, DNS, routes, Worker production allocations, billing, Firebase rules, payment state, wallet state, AI activation, or real-money wagering were mutated during this audit.


## Cloudflare account-side execution evidence (read-only, 2026-10-30)

- Authenticated account ID: `16cb6f247cd1b28fca864760c7269606`.
- Worker Scripts API returned `thelingolegacyv-5`, `lingo-flagship-root`, `thelingolegacy-web-recovery-preview`, and `lingo-static-backup-proxy` among the inspected scripts.
- The configured staging name `lingo-legacy-studio-build` is **not present** in the account Worker Scripts inventory. Direct GETs for its versions, deployments, settings, and secrets returned Cloudflare 404 / code 10007. The nested Wrangler config is therefore only a source artifact, not a deployed Worker.
- `thelingolegacyv-5`: production allocation independently resolves to version 137 (100%). Newer uploaded versions exist through version 177, but version 177 is not the production allocation. The latest version's bindings remain `ASSETS`, `CANONICAL_DOMAIN`, and `PUBLIC_SITE_URL`; no Firebase binding was observed. Secrets list returned empty.
- `lingo-flagship-root`: production allocation remains version 1 (100%). Version 2 is uploaded as a preview and is not promoted. It has no bindings; secrets list returned empty.
- `thelingolegacy-web-recovery-preview`: version 20 is deployed to the preview Worker; observability is enabled with persisted invocation logs and query-string redaction. It has the `ASSETS` binding only; secrets list returned empty.
- Root production Worker route inventory includes the apex, www, and numerous product subdomains. Do not infer that each subdomain is independently certified from route presence.
- Read-only public probes for `/healthz` and `/api/v1/runtime` could not be fetched by the available web retrieval path; this is **not** evidence of endpoint failure or success. A direct authenticated or browser-level live probe is still required.
- No Cloudflare resource was created, updated, deleted, promoted, or rerouted during this inspection.
