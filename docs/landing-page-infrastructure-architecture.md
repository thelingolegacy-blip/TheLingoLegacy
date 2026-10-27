# LINGO Legacy Landing Page — Infrastructure & Architecture Contract

**Status:** proposed baseline for review; not a production certification  
**Canonical origin:** `https://thelingolegacy.com`  
**Source of truth:** `thelingolegacy-blip/TheLingoLegacy`, branch `main`  
**Deployment boundary:** Cloudflare Worker + Workers Static Assets

## 1. Architecture decision

Keep the existing public website as a static-first, edge-controlled site. Do not introduce a second web framework or a parallel hosting origin to solve landing-page readiness. The repository currently has a root `index.html`, route folders containing `index.html`, shared assets in `assets/`, a Worker entrypoint in `worker.js`, and deployment configuration in `wrangler.jsonc`. There is no root `package.json` or Next.js app entrypoint on `main`; describing this deployment as a Next.js app would be inaccurate.

Cloudflare's static-asset binding serves the committed public files. The Worker owns canonical-host redirection, security headers, runtime metadata, health/status contracts, and the API namespace. The homepage remains usable as a document even if optional backend integrations are unavailable. Source code, operator scripts, credentials, and governance files must not be published as static assets.

## 2. Request path

```text
Browser
  -> Cloudflare DNS / TLS / custom domain
  -> Worker: worker.js
       -> canonicalize www to apex
       -> apply security and runtime headers
       -> /healthz and /api/* handled by explicit Worker routes
       -> public page/asset requests forwarded to ASSETS
  -> Workers Static Assets: root index.html, route index.html files, assets/*
```

The apex is canonical. The `www` hostname should redirect to the same path and query on the apex. This contract does not authorize changing DNS, Worker routes, traffic allocation, or a live deployment.

## 3. Repository responsibilities

| Layer | Source of truth | Responsibility |
| --- | --- | --- |
| Public page shell | `index.html` | Hero, core value proposition, primary CTAs, product destinations, trust/legal links |
| Route pages | `<route>/index.html` | Product-specific landing and discovery surfaces |
| Shared design | `config/design/design-tokens.json`, `assets/*.css` | Tokens, typography, responsive rules, accessible focus/motion behavior |
| Shared interaction | `assets/*.js` | Progressive enhancement only; core navigation must remain links |
| Edge runtime | `worker.js` | Canonical redirect, security headers, health, runtime APIs, controlled asset forwarding |
| Deployment config | `wrangler.jsonc` | Worker identity, custom-domain routes, asset directory and binding |
| Publication boundary | `.assetsignore` | Exclude source, scripts, docs, configuration and secret-bearing files from public asset upload |
| Release contract | `config/release/lingo-legacy-v1.0.0-rc.json` | Declared release surfaces and pending gates |
| Validation | `scripts/verify-landing-page-architecture.mjs` plus existing static/runtime gates | Fail closed on architecture drift |

## 4. Landing-page information architecture

The root page should orient visitors, not expose every operator control as a competing primary action.

1. **Header:** brand mark, compact primary navigation, clear mobile navigation.
2. **Hero:** one headline, one concise value proposition, one primary action and one secondary action.
3. **Primary destinations:** That’s My Lingo / games, LINGO worlds and stories, Loyalty Lane, media and creator studio.
4. **Proof and discovery:** explain what is available now versus preview, planned or gated.
5. **Trust:** safety, privacy, terms and contact links.
6. **Footer:** canonical product navigation, legal links, sitemap access where appropriate.

**Selected direction for this review branch: Unified flagship.** The root `index.html` now presents “One Legacy. Many Worlds.” as the brand-first entry point, uses “Loyalty. Legacy. Language.” as the brand tagline, and features `/thats-my-lingo/` as the primary experience with clear links to the Universe hub, Loyalty Lane Apparel, Kotton’s Code, LINGOarcade, studio work, and trust/legal destinations. The source patch is review-only; it does not alter the deployed exact-root Worker or production traffic. Keep operator dashboards and release controls out of the primary visitor journey.

## 5. URL and SEO contract

- Canonical page origin: `https://thelingolegacy.com`.
- Every indexable landing page needs a unique title, useful description and canonical URL.
- Root `index.html` remains the homepage; route folders map to trailing-slash URLs.
- `sitemap.xml` lists only intended canonical public routes and uses the canonical origin.
- `robots.txt` is advisory crawler guidance, not an access-control mechanism.
- `404.html` must remain available and must not be indexed.
- Internal primary CTA links must resolve to a tracked public route; do not imply a service is live unless runtime evidence confirms it.

## 6. Security, reliability and accessibility

- Keep `/api/*` under explicit Worker routing; unknown API paths return a controlled error rather than falling through to static HTML.
- Preserve security headers and the runtime response markers.
- Keep secrets, provider credentials, environment files, build output and control-plane files out of the static asset set.
- Prefer semantic landmarks, a single descriptive H1, keyboard-visible focus, reduced-motion support, meaningful image alt text, and touch targets at least 48px where practical.
- Keep core navigation functional without JavaScript. Interactive features must communicate preview/unavailable states truthfully.
- Do not treat a 200 response, successful asset upload, or build success alone as release acceptance.

## 7. Required validation layers

| Gate | Evidence required |
| --- | --- |
| Source contract | Architecture verifier confirms config, Worker routes, canonical metadata and required public files agree |
| Static site | Existing HTML/link/script/route validation passes |
| Asset boundary | Existing publication-scope verifier confirms sensitive files remain excluded |
| Runtime contract | Existing Worker API and security-header tests pass |
| Browser QA | Mobile/desktop render, keyboard-only navigation, contrast, reduced motion and 404 behavior checked in a real browser |
| Live probes | Apex and www redirect behavior, homepage, `/healthz`, runtime/status endpoints and representative product routes verified against the deployed version |
| Release authorization | G02 and all downstream gates independently pass; authorized promotion recorded |

## 8. Live infrastructure drift found during this review

A read-only Cloudflare account and zone inventory does **not** currently match the single-owner target above:

- The zone has an exact `thelingolegacy.com/` Worker route assigned to `lingo-flagship-root`.
- The broader `thelingolegacy.com/*` and `www.thelingolegacy.com/*` routes are assigned to `thelingolegacyv-5`.
- The checked-in `wrangler.jsonc` names `thelingolegacyv-5` and declares both apex and www patterns, so it does not describe the extra exact-root route.
- The Cloudflare GitHub build check for this PR attempted to build Worker `thelingolegacy`, which is absent from the read-only Worker inventory; Cloudflare reported: “This Worker does not exist on your account.”
- A Vercel preview check still runs and reports success, despite repository docs describing Vercel as retired. This is evidence of a preview integration, not evidence that Vercel serves production.
- A follow-up read-only inspection of Cloudflare Builds found a build configuration associated with the existing `thelingolegacyv-5` Worker tag. It is explicitly fail-closed: branch `__LINGO_FAIL_CLOSED_HOLD__`, production path include `__LINGO_DEPLOYMENT_DISABLED__/**`, preview builds disabled, and preview path include `__LINGO_PREVIEW_DISABLED__/**`. Its configured production commands are not a basis for an ad hoc preview activation.
- The missing `thelingolegacy` build configuration returns 404, and the existing `thelingolegacyv-5` configuration is intentionally held. Therefore the safe correction is **not** to enable builds or alter deployment commands in place. First define and review an isolated preview-only build configuration and prove its deployment command cannot publish production; preserve the current hold configuration until that review is accepted.
- Read-only workflow-job inspection for the latest PR head found zero jobs for all three GitHub Actions runs, each recorded as `startup_failure`. No job logs or step-level evidence exist for these attempts; this remains a dispatch/startup failure, not a test failure or pass.

These are control-plane drift findings, not permission to delete or redirect any route. The canonical content decision is now recorded in this branch: **Unified flagship**. The checked-in `index.html` is the source-level candidate, but the deployed exact-root route still points to the separate `lingo-flagship-root` Worker. This PR does not claim source parity with that Worker and does not authorize a route change. Keep production routing untouched until the source is reviewed, the intended Worker/build target is confirmed, parity is proven, and a controlled migration and rollback plan is approved.

Required external acceptance checks:
1. Confirm that the `thelingolegacyv-5` Worker and its checked-in `worker.js` are the intended production owner before any exact-root route migration.
2. Review a separate preview-only Cloudflare build configuration for the existing intended Worker. Do not replace the fail-closed production configuration or enable previews until commands, target, isolation, and no-production-deploy behavior are independently reviewed; then verify a successful preview build.
3. Reconcile the exact-root route with the intended canonical Worker only after source review and explicit production authorization; verify apex and www paths and queries.
4. Decide whether Vercel remains preview-only or is formally retired through a separately authorized change; do not treat its preview status as production acceptance.
5. Independently test live root, health, runtime, status, primary destinations, security headers, deployed source provenance, and rollback.
6. Restore G02 runner dispatch and collect independently retrievable CI evidence before certification. The latest inspected runs have no jobs, so retrying or interpreting them as test results would not provide acceptance evidence.

## 9. Release boundary

The architecture is reviewable and testable in source, but it is not certified by this document. G02 runner dispatch remains a separate hard blocker. No merge, deploy, DNS change, Worker traffic change, activation or production promotion is authorized by this architecture PR. Preserve the last-known-good production allocation until the existing evidence chain reaches acceptance and authorization.
