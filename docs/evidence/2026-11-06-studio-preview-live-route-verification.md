# Studio Preview Host — Live Route Verification Addendum

**Observed:** 2026-11-06  
**Scope:** Read-only HTTP checks of the current shared preview hostname and the two AppDeploy origins  
**Worker:** `lingo-studio-control-center-staging`, active version 6  
**No runtime or provider configuration changed.**

## 1. Current shared-host results

Read-only live fetches against `https://studio-preview.thelingolegacy.com` returned:

| Request | Status | Content type | Result |
|---|---:|---|---|
| `GET /healthz` | 200 | application/json | Worker reports staging, ready, 16 routes, read-only |
| `GET /_next/static/chunks/pages/index-1483a766349a911f.js` | 200 | text/javascript | Chunk bytes returned |
| `GET /_next/data/RnV8kGF9V8qaCf5FTqAbe/legacy.json?slug=legacy` | 200 | application/json | Static page data returned |
| `GET /apps/universe/_next/static/chunks/pages/index-1483a766349a911f.js` | 200 | text/javascript | Prefixed app asset route returned bytes |
| `GET /apps/universe/_next/data/RnV8kGF9V8qaCf5FTqAbe/legacy.json?slug=legacy` | 403 | text/plain | Worker intentionally blocks protected `_next/data` paths inside the generic `/apps/{slug}/...` proxy |

The source uses an empty Next.js `basePath`; its supported static page-data route is the top-level `/_next/data/{buildId}/{slug}.json?slug={slug}` route, which returned 200. The prefixed `/apps/universe/_next/data/...` form is not the configured route and is blocked by the generic proxy's protected-path guard. Do not treat that noncanonical path alone as a product defect.

## 2. Direct AppDeploy origin checks

The exact upstream static resources were also requested directly:

| Origin request | Status | Content type |
|---|---:|---|
| Universe Gateway `/_next/static/chunks/pages/index-1483a766349a911f.js` | 200 | text/javascript |
| Universe Gateway `/_next/data/RnV8kGF9V8qaCf5FTqAbe/legacy.json?slug=legacy` | 200 | application/json |
| Kotton's Code `/resources/KottonsCode-world-1.jpeg` | 200 | image/png |

This establishes that the tested static chunk and page-data resources currently exist at the AppDeploy origins and are currently returned through the shared preview hostname. It does not prove that the app's HTML shell or all routes are healthy.

## 3. App shell access restriction

Firecrawl live fetches of both AppDeploy app roots returned HTTP 403 with the page text:

> Access restricted — This request could not be completed because access is restricted. Own this app? Open dashboard.

The same provider restriction was returned for `/apps/universe/` and `/apps/kottonscode/` through the preview hostname. Separately, AppDeploy's read-only app-status responses still reported both deployments as `ready`, with empty frontend/backend error arrays since the v6 deployment timestamp. Those responses also explicitly reported the AppDeploy credit balance exhausted.

The exhausted credit balance and app-shell 403 are correlated observations; this record does not assert that credits are definitively the cause of the 403. No retry, deployment, source change, or credit purchase was made.

## 4. Kotton's Code image and hotlink protection

- Direct AppDeploy origin image request: HTTP 200, `image/png`.
- Preview hostname image requests returned HTTP 403 Cloudflare Error 1011, “hotlinking” restricted.
- Top-level image request Ray ID: `a56474ea48710867` at `2026-11-06 13:31:07 UTC`.
- App-prefixed image request Ray ID: `a5647585d92cc5ab` at `2026-11-06 13:31:32 UTC`.
- Read-only Cloudflare zone settings show `hotlink_protection = on`, last modified `2026-08-05T10:46:28.855746Z`.

The test client did not establish a same-origin browser image request with a same-origin Referer header. Therefore the Error 1011 result is consistent with the configured hotlink-protection control and is **not proof** that a normal browser loading the image from the same preview site will fail. Do not disable hotlink protection to make a scraper test pass.

## 5. Version comparison access blocker

Cloudflare reports both version 5 and version 6 with `has_preview: true` in version metadata. However, read-only settings report:
- Account workers.dev subdomain: `thelingolegacy`.
- Script subdomain: `enabled = true`, `previews_enabled = false`.
- Worker Domain for `studio-preview.thelingolegacy.com`: `enabled = true`, `previews_enabled = false`.

Cloudflare documents per-version URLs at [Workers Version URLs](https://developers.cloudflare.com/workers/versions-and-deployments/version-urls/). The relevant preview/version URL setting is currently disabled for this script, so direct v5-versus-v6 version URL comparison is unavailable without changing access configuration. No such change was made.

## 6. Current assessment

- **PASS (current live route checks):** Worker health, exact top-level Next.js static chunk, exact top-level Next.js static page-data route, and prefixed static chunk route returned HTTP 200.
- **PASS (origin availability):** The tested Gateway chunk/data and Kotton image resources returned HTTP 200 directly from AppDeploy origins.
- **BLOCKED:** App shell routes return provider-level HTTP 403 “Access restricted”; AppDeploy reports exhausted credits. Provider cause requires confirmation.
- **BLOCKED:** A normal same-origin browser image load could not be tested; the scraper's standalone image request was blocked by zone hotlink protection, which is enabled.
- **BLOCKED:** Historical v5 source body and direct v5/v6 version URL comparison remain unavailable while version previews are disabled.
- **NOT ACCEPTED:** No controlled full browser session, end-to-end page render, or complete route matrix was performed.

**Conclusion:** The originally reported static chunk and top-level Next.js data paths are currently returning 200 through the live preview hostname. The current evidence does not justify changing the Worker or DNS. The remaining visible blockers are AppDeploy app-shell access restriction and an inconclusive hotlink-protection test for images. Root cause of the pre-v6 errors remains unproven because the v5 source body and version-by-version runtime comparison are unavailable.

## 7. Safety

All checks were read-only. No Worker, Worker Domain, DNS, zone setting, AppDeploy source/resource/deployment, account credits, secrets, billing, or production configuration was changed. No build, deployment, retry, or promotion was initiated. Production remains HOLD; G02 remains BLOCKED / UNVERIFIED; LKG remains PROTECTED.
