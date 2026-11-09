# LINGO repository, runtime and edge reconciliation — 2026-11-09

**Status:** evidence-backed inventory; not a merge/deployment authorization.  
**Authority:** `thelingolegacy-blip/TheLingoLegacy` on `main` remains the canonical implementation source for the LINGO production platform. GitHub account ownership is not the same as named human ownership or code-owner assignment.

## Executive reconciliation

The connected GitHub account exposes **38 repositories**, all owned by the same GitHub user account `thelingolegacy-blip`. There are **32 public and 6 private** repositories in the current listing. All 38 report the same GitHub account owner; this does not identify an accountable human maintainer for each product.

The source inventory contains competing claims:
- `TheLingoLegacy` README names itself as the authoritative source and its `wrangler.jsonc` identifies the production Worker `thelingolegacyv-5` with entrypoint `worker.js`.
- `LINGO_LEGACY_HQ` README calls itself the canonical aggregator and architecture source of truth.
- `TheLingoLegacy-Web` is a separate private Next.js/React/TypeScript + OpenNext Cloudflare implementation with its own Worker name and entrypoint.

**Resolution for this registry:** `TheLingoLegacy` is the canonical production implementation repository; `LINGO_LEGACY_HQ` is a governance/documentation/reference aggregator only; `TheLingoLegacy-Web` is a parallel implementation candidate and is not a production source unless separately reconciled and accepted. This is a registry decision based on the user's existing canonical-repository instruction and the inspected production Worker config, not proof that every child repo has already been consolidated.

## Repository inventory

Sizes below are GitHub's reported repository size in KB, not a billable storage amount. Purpose labels are evidence-based from names, README and inspected manifests; rows marked `UNCLASSIFIED` need content-owner review.

| Repository | Visibility / default branch | Size KB | Observed purpose / implementation | Disposition |
|---|---:|---:|---|---|
| `TheLingoLegacy` | public / main | 6102 | Canonical production Worker source; `worker.js`, `wrangler.jsonc`; Worker `thelingolegacyv-5` | CANONICAL IMPLEMENTATION |
| `TheLingoLegacy-Web` | private / main | 5857 | Next.js 15 / React 19 / TypeScript, OpenNext Cloudflare; `.open-next/worker.js`; Firebase SDK dependency | PARALLEL CANDIDATE — reconcile, no production authority |
| `LINGO_LEGACY_HQ` | public / main | 558 | Master folder structure, templates, docs, assets; README claims canonical aggregator | GOVERNANCE / REFERENCE — authority wording needs correction |
| `THATS-MY-LINGO` | public / main | 196 | Static browser virtual-currency casino; browser-local saves; no backend/payments per README; Node test scripts | PRODUCT IMPLEMENTATION CANDIDATE |
| `Spades-is-my_Lingo` | public / main | 124 | Vite + React + Express + Firebase + Google GenAI | PRODUCT IMPLEMENTATION CANDIDATE — auth/runtime review |
| `lingo_assets` | public / main | 100 | Shared asset library; README still recommends Vercel static hosting | ASSET REFERENCE — hosting claim conflicts with Cloudflare direction |
| `thelingolegacy-hub` | public / `main-/-root⁠` | 95 | Minimal archive/folder-tree README; nonstandard default branch string | REFERENCE — branch metadata needs validation |
| `nextjs-boilerplate` | private / main | 69 | Generic create-next-app starter | TEMPLATE — not product runtime |
| `nextjs` | private / main | 69 | Generic create-next-app starter | TEMPLATE — not product runtime |
| `LingoLegacy-MasterBlueprint` | public / main | 62 | README title only in inspected file | UNCLASSIFIED / BLUEPRINT CANDIDATE |
| `Theriseofzavione` | public / main | 59 | Artist/media site; README describes Vercel hosting/analytics | MEDIA CANDIDATE — hosting claim conflicts with Cloudflare direction |
| `Loyaltylaneapparel` | public / main | 36 | Loyalty Lane dynamic commerce application specification and UI system | PRODUCT CANDIDATE — runtime/package manifest not confirmed |
| `kottens-code-engine` | public / main | 34 | Narrative game universe README | GAME CANDIDATE — engine/runtime manifest not confirmed |
| `thelingolegacy-blip-REPO-` | public / main | 28 | README title only | UNCLASSIFIED / PLACEHOLDER CANDIDATE |
| `Kotton-code-engine` | public / main | 25 | Kotton's Code Studio OS; Next.js/React/TypeScript, Flutter shell, Firebase and Cloudflare integration boundaries | PRODUCT IMPLEMENTATION CANDIDATE |
| `ZavioneLingo` | public / main | 2 | Artist/music repository for albums, singles, press kit, artwork | CONTENT / MEDIA |
| `-the-lingo-legacy-master` | public / main | 5 | Legacy master portfolio archive; README includes dated launch assertions | LEGACY REFERENCE — verify claims before reuse |
| `-the-lingo-legacy-hub` | public / main | 4 | Copilot-generated initial scaffold | ARCHIVE / SCAFFOLD |
| `Lingolegends` | public / main | 1 | README title only | UNCLASSIFIED |
| `lingo_admin_console` | public / main | 1 | README title only | UNCLASSIFIED |
| `Devontray` | public / main | 0 | README title only | EMPTY / PLACEHOLDER CANDIDATE |
| `Github` | public / main | 0 | README title only | EMPTY / PLACEHOLDER CANDIDATE |
| `Tricia-escape-` | public / main | 0 | README title only | EMPTY / PLACEHOLDER CANDIDATE |
| `LingoLegacy-` | public / main | 0 | README title only | EMPTY / PLACEHOLDER CANDIDATE |
| `thats_my_lingo_app` | public / main | 0 | README title only | EMPTY / PLACEHOLDER CANDIDATE |
| `lingo_backend` | public / main | 0 | README title only | EMPTY / PLACEHOLDER CANDIDATE |
| `lingo_website` | public / main | 0 | README title only | EMPTY / PLACEHOLDER CANDIDATE |
| `lingo_documentation` | public / main | 0 | README title only | EMPTY / PLACEHOLDER CANDIDATE |
| `Tv-os` | public / main | 0 | README title only | EMPTY / PLACEHOLDER CANDIDATE |
| `Backend` | public / main | 0 | GitHub reports repository empty; README fetch returned 404 | EMPTY |
| `Games` | public / main | 0 | README title only | EMPTY / PLACEHOLDER CANDIDATE |
| `Spades_is_my-lingo` | public / main | 0 | README title only | EMPTY / PLACEHOLDER CANDIDATE |
| `codemagic-docs` | public / master | 25754 | Repository name suggests CI docs, but inspected README path was unavailable | UNCLASSIFIED — inspect ownership/content |
| `chatbot` | private / main | 428 | Upstream-style Next.js AI SDK chatbot template; Neon, Vercel Blob, Auth.js documented | TEMPLATE / EXPERIMENT — no production authority |
| `angular` | private / main | 197 | Angular CLI 13 starter; README documents Vercel deployment | TEMPLATE — not product runtime |
| `django` | private / main | 5 | Django starter; README documents Vercel deployment | TEMPLATE — not product runtime |
| `thelingolegacy-hub-` | public / main | 0 | GitHub reports repository empty; README fetch returned 404 | EMPTY |
| `lingo-legacy-` | public / main | 0 | README title only | EMPTY / PLACEHOLDER CANDIDATE |

**Correction:** the listing above contains 38 repositories. The 38 all share GitHub account owner `thelingolegacy-blip`; named product owners, code owners, approvers and operational contacts remain UNASSIGNED / UNVERIFIED until explicitly mapped.

## Canonical production runtime and edge

### Confirmed live Cloudflare inventory (read-only API, 2026-11-09)

- Zone: `thelingolegacy.com`; active, not paused.
- Account plan: Free Website.
- Worker route count: **21**.
- DNS record count: **34**.
- Cloudflare Access application count: **14**.
- Worker script count: **7**.
- No Cloudflare mutations were made during this inventory.

### Exact Worker route → script mapping

| Route pattern | Worker script |
|---|---|
| `launch.thelingolegacy.com/*` | `lingo-static-backup-proxy` |
| `thelingolegacy.com/*` | `thelingolegacyv-5` |
| `theriseofzavione.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `thats-my-lingo.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `sparkling-rain.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `therealzavione.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `lingo.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `cyber.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `solar.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `drip.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `site.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `luxe.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `web.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `hub.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `www.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `v4.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `v3.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `ai.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `thelingolegacy.com/` | `lingo-flagship-root` |
| `blog.thelingolegacy.com/*` | `thelingolegacyv-5` |
| `atlas.thelingolegacy.com/*` | `lingo-ecosystem-atlas` |

### Worker scripts and deployment records

| Worker | Current script inventory | Latest deployment evidence observed |
|---|---|---|
| `thelingolegacyv-5` | Modified 2026-11-09 21:39 UTC | Latest recorded deployment `ecd71a70-e476-4318-92a7-35249ced360b`, 100% version `2d161fa5-598f-4998-ada8-7ac4c72c3461`; message references version 137. The script was modified after this deployment record; verify uploaded-versus-deployed drift before release. |
| `lingo-flagship-root` | Modified 2026-10-30 | Deployment `31ccefbb-ddf4-4a62-974b-3ee9d0bc81d3`, 100% version `658acd1a-997b-45cd-b8fc-e59c59b26b45`. |
| `lingo-ecosystem-atlas` | Modified 2026-11-02 | Deployment `6dfd9de7-c594-4cce-8b24-4cb6c2868bc7`, 100% version `367586a9-f3c9-4fa4-838e-38c3014575d2`. |
| `lingo-static-backup-proxy` | Modified 2026-10-25 | Deployment `738c80e8-f535-4712-9339-e8b495152c89`, 100% version `a60ca6d2-fc20-4bf8-8e42-cb4a4b3b9708`. |
| `lingo-studio-control-center-staging` | Modified 2026-11-08 | Latest listed deployment `a61fd6e1-65b8-47e1-9cd0-a04f1b307669`, 100% version `e142ffd0-8e76-495d-a9f0-e6a3c9ef3558`. |
| `lingo-resilience-gateway` | Modified 2026-11-09 | Deployment `b5c013ef-dc08-4e22-aecf-6d0e83254a09`, 100% version `1ae535a8-7c10-4e16-9b60-21db5cc602ee`. |
| `lingo-flagship-site-preview` | Modified 2026-11-06 | Latest listed deployment `50c5d595-4311-4071-8077-61a8355cd14d`, 100% version `8bac94fc-eb0b-4175-a151-de4050346086`; preview script has no route in the 21-route zone inventory. |

The deployment API shows the currently configured 100% version per deployment record. It does not by itself certify browser behavior, data bindings, asset integrity or feature acceptance.

### DNS inventory and immediate concerns

The zone contains 34 DNS records:
- Apex A record `thelingolegacy.com → 192.0.2.0` (proxied). This address is in RFC 5737 TEST-NET-1 and must not be treated as a verified origin IP.
- Proxied AAAA records use `100::` for the LINGO subdomains listed in the live inventory.
- `admin.thelingolegacy.com` CNAMEs to `admin-thelingolegacy.firebaseapp.com` and is DNS-only.
- `app.thelingolegacy.com` CNAMEs to `my-flutter-app.pages.dev` and is DNS-only.
- `casino.thelingolegacy.com` CNAMEs to `proxy-v2.appdeploy.ai` and is proxied.
- `launch.thelingolegacy.com` CNAMEs to `thelingolegacy-static-backup.pages.dev` and is proxied.
- `atlas.thelingolegacy.com` and `www.thelingolegacy.com` CNAME to apex and are proxied.
- Google MX records, SPF, DMARC and two stale-looking `_vercel` verification TXT records remain.
- `resilience` and `studio-preview` have proxied AAAA records.

Do not delete, rewrite or repoint these records as part of this inventory. Verify live resolution, service ownership and dependency before any DNS change. The `app` and `admin` DNS destinations need authenticated project ownership and deployment checks.

### Cloudflare Access inventory

14 Access applications were returned:
1. LINGO Resilience Gateway — Public Static Fallback
2. LINGO Public Website Routes — thelingolegacyv-5
3. LINGO Public Website Root — lingo-flagship-root
4. All Workers
5. thats-my-lingo - Cloudflare Workers
6. sparkling-rain-29a3 - Cloudflare Workers
7. thelingolegacyv5 - Cloudflare Workers
8. thelingolegacy - Cloudflare Workers
9. legacyweb1 - Cloudflare Workers
10. nextjs-lingolegacy - Cloudflare Workers
11. thelingolegacy-v2 - Cloudflare Workers
12. thelingolegacyv4 - Cloudflare Workers
13. thelingolegacy-v3 - Cloudflare Workers
14. astro-blog-starter-template - Cloudflare Workers

Prior read-only policy inspection identified legacy applications sharing a bypass-everyone policy and four email-domain matchers whose value is formatted as a full email address. Re-read all 14 policy documents and their app-to-route relationships before remediation. No Access policy was changed.

## Runtime and provider alignment

| Layer | Evidence | Current disposition |
|---|---|---|
| Canonical edge | Live Cloudflare route and script inventory above | ACTIVE CONFIGURATION; release acceptance incomplete |
| Canonical Worker source | `TheLingoLegacy/wrangler.jsonc` names `thelingolegacyv-5`, entrypoint `worker.js`, apex/www routes | SOURCE/EDGE ALIGNED for apex/www; exact-root and atlas use separate Workers |
| Parallel web app | `TheLingoLegacy-Web/package.json` confirms Next.js 15.5.28, React 19.3.1, Firebase SDK, OpenNext Cloudflare scripts; Wrangler entrypoint `.open-next/worker.js` | NOT PROVEN DEPLOYED TO A CANONICAL ROUTE |
| Firebase | `.firebaserc` points at project ID `lingo-legacy-production`; `lib/firebase_options.dart` still contains `YOUR_*` placeholders | AUTHENTICATED CONFIG NOT COMPLETE |
| Firebase rules | Oasis-specific rules exist under `studio-sites/games/oasis-platform/firebase-functions/firestore.rules`; no root/global ruleset is established | SCOPE-LIMITED; NOT PROVEN DEPLOYED |
| Flutter | `lib/firebase_options.dart` placeholders; Android project incomplete; iOS/macOS/Windows/Linux runners absent in inspected tree | NOT BUILD-READY |
| Android signing | PR #532 adds protected env-based release signing and fails release tasks closed without secrets | OPEN / DRAFT / NOT MERGED |
| Firebase Hosting | PR #533 removes repository-root Hosting target and adds scope verifier | OPEN / DRAFT / NOT MERGED |
| AppDeploy | Seven app records were reported ready in previous read-only status checks; provider credits/status conflict and stored QA snapshots are stale | PROVIDER-READY RECORD ≠ FEATURE ACCEPTANCE |
| Vercel | One current commit status context reports Vercel failure; several template/media READMEs still describe Vercel deployment | LEGACY / CONFLICTING — no production authority |
| Game runtimes | `THATS-MY-LINGO` is browser-local and demo-only per README; Spades repo is Vite/Express/Firebase | CLIENT SOURCE EXISTS; backend/auth/security acceptance incomplete |

## Immediate corrections and owner assignments

1. **Single authority:** keep `TheLingoLegacy` as production code source; update the `LINGO_LEGACY_HQ` README authority language to governance/reference; classify `TheLingoLegacy-Web` as parallel candidate pending source/runtime comparison.
2. **Repository dispositions:** every repo needs one explicit state: CANONICAL, ACTIVE CHILD, MERGE, REFERENCE, TEMPLATE, ARCHIVE, EMPTY. Never delete or rename before owner review and content/asset backup.
3. **Human owners:** GitHub account owner is `thelingolegacy-blip`; no named CODEOWNERS/human approver evidence was established in this API listing. Add named accountable product owners and reviewers before accepting product-specific work.
4. **Route ownership:** map each of the 21 Worker routes to a product surface, repo path, runtime, backend, asset bucket, owner, support path and rollback target. This inventory maps routes to scripts but not yet all products to source paths.
5. **Deployment drift:** `thelingolegacyv-5` script modified 2026-11-09 21:39 UTC while its latest listed deployment record is older. Verify versions and deployed source before any production promotion.
6. **Security:** inspect all Access policies, remove bypass only through a staged approved change, validate CSP/rate limits and verify deployed static asset manifests.
7. **Firebase:** authenticated Firebase app/project discovery and security-rule deployment require a connected Firebase integration and authorized project access. Do not invent app IDs, service credentials or project associations.
8. **Native builds:** generate and commit Flutter platform runners only after a reproducible Flutter SDK/lockfile build environment is available; build Android on Linux, iOS/macOS on macOS, Windows on Windows, and Linux desktop on Linux. Device/browser acceptance remains separate.
9. **Release:** independent security/privacy/legal/accessibility review, exact build provenance, smoke test, rollback rehearsal and separate production promotion approval remain mandatory.

## Evidence source and limits

- GitHub repository listing: 38 repositories under owner `thelingolegacy-blip`; 32 public, 6 private.
- GitHub README and manifest inspection across portfolio; exact source hashes were retrieved during the 2026-11-09 audit.
- Cloudflare account/zone APIs read-only: zone ID `91c3f6315fb3ca132b22744721103f88`; account plan Free Website; routes, DNS, Worker scripts, deployments and Access apps enumerated.
- GitHub current combined status for main baseline included a failing `Vercel – the-lingo-legacy` context.
- No production Worker, route, DNS, Access policy, Firebase project, app registration, credential, secret, native signing identity, or payment setting was modified.
- No native device build, penetration test, privacy specialist review, legal review, rollback exercise or production acceptance was performed by this inventory.

**Disposition:** IN PROGRESS — portfolio and edge inventory substantially reconciled; product owner/source-path mapping and backend/runtime acceptance remain BLOCKED. Production remains PROTECTED HOLD.


## Access-policy and preview-version refresh — 2026-11-09 21:56 UTC

### Access policies — exact read-only policy inspection

- Three explicitly named public surfaces use `bypass` for `everyone`: the public resilience fallback, the public apex/www route app, and the exact-root public app. These are intentional public surfaces only if their content remains non-sensitive and the app-to-domain mapping is verified.
- Eight legacy/preview Worker Access apps also contain a reusable `bypass everyone` policy: That’s My Lingo, sparkling-rain, thelingolegacyv5, thelingolegacy, legacyweb1, nextjs-lingolegacy, thelingolegacy-v2 and thelingolegacy-v3. Treat these as publicly reachable preview surfaces until proven otherwise; they are not acceptable for admin/studio/private preview content.
- Four of those legacy policies use an `email_domain` matcher whose configured value is a full email address rather than a domain. The exact value is intentionally not reproduced here. This is malformed/redundant policy configuration and must be corrected after identifying the intended operator identity and preview ownership.
- The `All Workers` application has allow-only policies for Cloudflare account members and a specified operator email. Other legacy apps have account-member allow policies, but an `everyone` bypass in the same app overrides the intended protection.
- The app details expose Worker destination IDs but did not return a domain field. Route-to-Access-app-to-Worker destination mapping is therefore not yet fully resolved.

**No Access policies were modified.** First identify the preview/admin surface for each Worker destination and confirm which previews must remain public. Then stage a least-privilege policy correction and verify no public production hostname is unintentionally gated.

### Cloudflare preview uploads triggered by GitHub branch updates

Read-only Worker version inventory now shows the GitHub branches produced automatic **preview-only** Worker version uploads on `thelingolegacyv-5`:
- Version 290 — Firebase Hosting remediation branch; uploaded 2026-11-09 21:39 UTC; `has_preview=true`.
- Version 291 — portfolio reconciliation branch; uploaded 2026-11-09 21:52 UTC; `has_preview=true`.
- Version 292 — Flutter preview/bootstrap branch; uploaded 2026-11-09 21:55 UTC; `has_preview=true`.

These uploads are preview artifacts, not production deployments. The latest deployment record remains 100% on the existing production version 137 (version ID `2d161fa5-598f-4998-ada8-7ac4c72c3461`); no deployment record assigns versions 290–292 traffic. The branch-to-preview upload integration is operating separately from the GitHub Actions workflow jobs that still fail before job creation.

**Operational correction:** GitHub branch pushes can cause Cloudflare preview-version uploads as a side effect. Future source branches should be treated as potentially creating preview artifacts. This audit did not promote a preview version or change production routes.


## Product path and canonical-entrypoint crosswalk — 2026-11-09

The canonical Worker uses the `ASSETS` binding and falls through to `env.ASSETS.fetch(request)` for non-API requests. Wrangler config sets the asset directory to the repository root (`.`). The following entrypoint files were individually confirmed to exist in `TheLingoLegacy/main`; their existence is source evidence, not proof of current browser acceptance.

| Product path | Entrypoint in canonical repository | Declared source repository in `studio/surface-contracts.json` | Current interpretation |
|---|---|---|---|
| `/` | `index.html` | `TheLingoLegacy` | Exact-root route is separately assigned to `lingo-flagship-root`; do not assume main Worker handles root. |
| `/lingoarcade/` | `lingoarcade/index.html` | `TheLingoLegacy` | Canonical arcade shell; game-specific runtime acceptance remains separate. |
| `/thats-my-lingo/` | `thats-my-lingo/index.html` | `THATS-MY-LINGO` | Canonical repo contains a copy; compare with product repo before assigning sync authority. |
| `/kottons-code/` | `kottons-code/index.html` | `kottens-code-engine` | Canonical repo contains a copy; external repo/source asset sync and privacy review remain open. |
| `/lane/` | `lane/index.html` | `Loyaltylaneapparel` | Canonical repo contains a copy; commerce remains preview/browse-only until backend/legal acceptance. |
| `/media/` | `media/index.html` | `Theriseofzavione` | Canonical repo contains a copy; media rights and creator publishing acceptance remain open. |
| `/assets/` | `assets/index.html` | `lingo_assets` | Canonical repo contains an asset-library page; source asset provenance/sync still needs review. |
| `/store/` | `store/index.html` | `nextjs-lingolegacy` | Contract marks framework build required; do not treat static entrypoint presence as an accepted Next.js runtime. |
| `/ai/` | `ai/index.html` | `TheLingoLegacy` | Shell exists; askLINGO provider/backend execution is not production-enabled. |
| `/studio-hub/` | `studio-hub/index.html` | `TheLingoLegacy` | Entry point exists, but its current production route/preview boundary needs live acceptance. |

The route contract also declares `/arcade → /lingoarcade/` and `/game → /thats-my-lingo/` as `SOURCE_ALIAS` entries. They are not proven live redirects by the route contract alone. The repository `_redirects` file declares `/apparel/ → /loyalty-lane-apparel/` and a root redirect, but the active version-137 deployment's redirect metadata only showed the apparel redirect; the root hostname is separately assigned to `lingo-flagship-root`. Do not assume source redirect declarations are active at the edge without a live response check.

**Source-of-truth gap:** several product surfaces are declared as owned by separate product repositories while a page copy exists in `TheLingoLegacy`. The canonical registry must compare content/build provenance and declare whether the child repository or canonical copy is the maintained source. No silent overwrite or automatic mirroring is authorized by this crosswalk.


## Browser acceptance sample — 2026-11-09

A current public-browser retrieval sample was performed against the canonical host. This is a limited spot-check, not a full browser/device matrix.

| Route | Browser result | Acceptance interpretation |
|---|---|---|
| `/thats-my-lingo/` | Retrieved current page | Page explicitly labels itself virtual-currency entertainment only, with no cash betting, wagering or cash-out. Backend section still says Firebase services await keys/billing approval; global leaderboard remains hidden pending auth, moderation, anti-cheat and privacy work. |
| `/kottons-code/` | Retrieved page | Static Cloudflare experience. Social links still lead to platform search until official channel URLs are verified. Page includes child-directed content and family/character narrative details; privacy review must reconcile public copy with the AppDeploy source scan before acceptance. |
| `/lane/` | Retrieved page | Shared Studio shell; page says source implementation only and production promotion remains gated. Not a verified checkout/commerce runtime. |
| `/ai/` | Retrieved page | askLINGO shell; page explicitly says availability is runtime-dependent and does not claim a live model provider. |
| `/lingoarcade/` | Browser retrieval returned cache miss | NOT VERIFIED; not proof of an HTTP 404. |
| `/media/`, `/assets/`, `/store/` | Browser retrieval returned cache miss | NOT VERIFIED; no launch acceptance. |
| `/studio-hub/` | Browser retrieval inaccessible | NOT VERIFIED; exact-root route is a separate Worker and staging/preview boundary needs testing. |
| `/game` | Search/browser cache returned an older page crawled two weeks earlier with legacy star-marked naming | Treat as a stale legacy alias, not current product acceptance. Source contract marks `/game → /thats-my-lingo/` as `SOURCE_ALIAS`; the redirect is not proven live. |

The successful sample pages confirm only their accessible static content. They do not prove account creation, Firebase writes, commerce, global leaderboards, AI inference, native app builds, or current device accessibility. The browser tool's cache misses are recorded as inconclusive rather than failures.
