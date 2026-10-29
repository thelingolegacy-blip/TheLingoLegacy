# LINGO Legacy Platform Recovery Inventory — 2026-10-29

**Purpose:** source-backed reconstruction and recovery record for the website, edge runtime, route ownership, app surfaces, assets, and release controls.  
**Authority:** `thelingolegacy-blip/TheLingoLegacy` and read-only Cloudflare/Vercel/GitHub control-plane inspections.  
**Mutation boundary:** this report and its preview scaffolding are branch-only. No production DNS, Worker route, traffic allocation, secret, payment setting, or deployment was changed.

## Executive finding

The platform is not one interchangeable website deployment. It is a static-first Cloudflare site with a dedicated exact-root homepage Worker, a separate wildcard/runtime Worker, a static recovery subdomain, branch-scoped Vercel previews, and several independent AppDeploy studios. These are currently documented and verified to different levels. Consolidation must happen at the source/contract level first; collapsing live routes before parity and acceptance evidence would risk losing the homepage or runtime APIs.

## 1. Canonical website and edge infrastructure

| Surface | Observed state | Evidence and consequence |
|---|---|---|
| Canonical domain | Cloudflare zone active | `thelingolegacy.com`; zone ID `91c3f6315fb3ca132b22744721103f88` |
| Exact apex root | Worker `lingo-flagship-root` | Exact route `thelingolegacy.com/`; active version `658acd1a-997b-45cd-b8fc-e59c59b26b45` at 100% |
| Apex wildcard | Worker `thelingolegacyv-5` | `thelingolegacy.com/*`; latest observed active version `2d161fa5-598f-4998-ada8-7ac4c72c3461` at 100% |
| www wildcard | Worker `thelingolegacyv-5` | `www.thelingolegacy.com/*`; route inventory confirms the assignment; live browser crawl could not fetch www in this pass |
| Recovery host | `lingo-static-backup-proxy` | `launch.thelingolegacy.com/*` points to the static Pages recovery target |
| Casino studio | AppDeploy | `casino.thelingolegacy.com` CNAME targets `proxy-v2.appdeploy.ai` |
| Studio preview | Vercel branch preview | `studio-preview.thelingolegacy.com` targets a Vercel DNS endpoint and is not the apex production host |
| Route count | 20 Worker routes | Includes the exact root, wildcard runtime routes, branded subdomains, and the launch backup route |

The root page served by `lingo-flagship-root` has been captured as `cloudflare/flagship-root/live-snapshot-2026-10-29.html`. The snapshot is evidence, not an instruction to redeploy the existing code. Its source was previously API-managed and absent from the repository. The reviewed repository candidate at `index.html` is different; equivalence is still pending.

The live root catalog's search, category filters, and mobile menu have inline handlers. Catalog tiles intentionally open a launch-intent panel instead of navigating to a production destination whose route/auth/data state is not yet verified. The new candidate homepage uses concrete route links, but these require preview and link acceptance before replacing the live exact-root response.

## 2. Static site and publication boundary

- The canonical repository is static HTML and a Cloudflare Worker, not a Next.js app at the repository root. The root `wrangler.jsonc` declares `thelingolegacyv-5`, `worker.js`, the root asset directory, and apex/www wildcard routes.
- `.assetsignore` excludes repository control-plane files, configuration, docs, scripts, source files, secrets patterns, and the `cloudflare/` directory from static asset publication.
- The release contract and landing-page verifier require canonical metadata, primary routes, sitemap/robots, security headers, health/runtime endpoints, and fail-closed gates.
- The isolated `wrangler.flagship-preview.toml` uses a distinct Worker name, `workers_dev = true`, no custom-domain routes, the canonical Worker source, and the existing static-asset exclusion boundary. It is a preview configuration only and has not been deployed.

## 3. CI, governance, and release authority

- The latest inspected GitHub Actions runs include repeated `startup_failure` conclusions and zero job records. The latest G02 Control Watch run is `40842790456`.
- The G02 sentinel workflow still requires labels `self-hosted`, `linux`, `x64`, `lingo-g02` and asserts a real assigned runner ID/name plus retrievable evidence. No new runner execution evidence was produced during this audit.
- Runtime source declares `G02_RUNNER = FAIL / UNVERIFIED`; downstream certification, release candidate, deployment, live validation, synchronization, activation, post-activation, and acceptance remain blocked.
- The repository's auto-repair workflow has production deployment disabled behind a hard hold. Do not enable it or substitute a hosted runner to make the gate appear green.
- GitHub branch-protection details could not be read through the current integration permission scope; administrator evidence is still required.

## 4. Vercel reconciliation

The Pro Vercel project `the-lingo-legacy` reports `live=false`; its domain-list endpoint returned zero records, while a deployment-detail response lists apex/www aliases. Those responses are inconsistent. The separate Hobby project has verified `launch.thelingolegacy.com` and `studio-preview.thelingolegacy.com` branch-scoped domains. Treat Vercel's apex/www association as unverified and do not reassign domains or promote a deployment until the owning team and live alias records are reconciled.

## 5. AppDeploy, game surfaces, and commerce

- LINGO Legacy Universe and That’s My Lingo Studio report deployment status `ready`; their latest QA snapshots showed zero frontend and network errors. That is not the same as end-to-end gameplay acceptance or production certification.
- The Universe gateway now includes a playable local demo: 5×3 slot grid, 20 paylines, virtual-credit stake/payout math, round history, and a separate five-letter word challenge. The demo balance is browser-local and is not the authoritative wallet.
- Existing game and creator studios remain separate AppDeploy applications. Their current ready status does not establish a shared identity, shared data, asset provenance, or server-side game economy.
- The canonical Worker returns checkout-unavailable responses when Stripe secrets or price IDs are absent. No real-money checkout or shared wallet was verified as operational. Sweepstakes entry remains disabled pending legal/compliance review.
- Firebase configuration placeholders were found in the app configuration during prior inspection. Firebase Auth/Firestore/Storage must not be represented as production-connected until real project values, rules, App Check, backups, and runtime evidence are verified.
- The asset registry still marks slot art and apparel photography as pending final verification; world-registry entries are staged and disabled. Art licensing, product photography, audio, and animation pipelines require per-asset acceptance evidence.

## 6. Live probes and unknowns

The public browser crawl confirmed the homepage title, hero, catalog, and contact destination. The browser tool did not retrieve `/healthz` or runtime API endpoints in this pass, so their current live HTTP responses remain **NOT VERIFIED HERE**, not assumed failed. Security-header source exists in both Worker implementations, but live header capture and browser keyboard/reduced-motion/forced-colors acceptance remain pending.

## 7. Recovery sequence

1. Preserve the current exact-root and wildcard Worker allocations.
2. Keep the captured root response as evidence and use the reviewed `index.html` plus the isolated `workers.dev` config for candidate validation.
3. Validate contract JSON, verifier/test syntax, static route/sitemap integrity, and the preview Wrangler configuration.
4. Obtain a successful isolated preview build and real browser checks for root, key routes, mobile navigation, keyboard focus, reduced motion, contrast, and security headers.
5. Reconcile Vercel domain/alias metadata without changing DNS.
6. Restore G02 dispatch and capture runner assignment, sentinel output, steps, logs, artifact, and checksums.
7. Only after independent acceptance and explicit authorization may production route ownership or traffic be changed.

**Current decision:** source reconstruction and preview scaffolding are in review. Production remains protected / HOLD. No promotion is authorized by this inventory.
