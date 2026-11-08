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


## 8. Aggregate origin health and AppDeploy account-credit discrepancy

A subsequent live read-only request to `GET /healthz/apps` returned HTTP 200 JSON with:
- `checked: 16`
- `ok: false`
- all 16 registered app slugs reporting `status: 403`, `ok: false`

The Worker source shows that this endpoint performs a `HEAD /` request to each registered AppDeploy origin and marks only 2xx/3xx as healthy. This result is consistent with the independently observed 403 app-root responses for the Universe Gateway and Kotton's Code apps. It is not inconsistent with the individual static chunk/data/image resource checks returning 200: the health endpoint probes app-root access, not those specific static resources.

By contrast, `GET /healthz` returns HTTP 200 with `status: "ready"` and `routeCount: 16`. The source confirms this is a process/configuration readiness response and does not test origin availability. Therefore:
- `/healthz` = Worker process/route registration readiness.
- `/healthz/apps` = current app-origin reachability; presently failing 16/16.

A new no-dependency regression test covers this distinction and asserts that 16 upstream 403 responses produce `ok: false` while the process-level `/healthz` remains ready. It has been added to the PR test harness but remains NOT RUN.

AppDeploy account-level and per-app status signals also conflict:
- Read-only account overview for the connected AppDeploy account reports free plan, `monthly.available = 21.682826667`, reset `2026-11-17T00:00:00Z`, top-up balance 0, and no renewal payment failure.
- Per-app status for both affected apps separately emits the warning “credit balance is exhausted.”
- Both per-app status records report deployment `ready` and empty frontend/backend error arrays since the v6 deployment timestamp.
- A second read-only scrape using the stealth proxy also received HTTP 403 “Access restricted” for both app roots; this is not specific to the basic scraper.

The account overview and app-status credit warning are contradictory. Do not claim the account has no credits, and do not claim credits definitively cause the 403. No payment, top-up, plan change, deployment, or retry was performed. Provider support/account-level reconciliation is required to establish the actual credit enforcement state.

## 9. Updated assessment

- **PASS:** Tested static resources are individually available at their AppDeploy origins and through the preview Worker.
- **FAIL:** Aggregate app-origin health is 16/16 HTTP 403.
- **FAIL:** Both tested AppDeploy app roots are HTTP 403 “Access restricted” through basic and stealth scraping.
- **CONFLICT:** Account overview reports 21.682826667 monthly credits available while per-app status warns that credits are exhausted.
- **PASS (limited meaning):** Worker process health endpoint responds ready; this does not imply app-origin readiness.
- **NOT ACCEPTED:** Full preview experience, application-shell availability, and normal browser image rendering remain unverified.

**Operational conclusion:** Do not change the Worker, DNS, hotlink-protection setting, or AppDeploy app source to work around the 403s. First reconcile AppDeploy's account-level credit state and provider access restriction, then repeat the 16-origin health check and a browser-based app-shell/image test. Keep production HOLD and last-known-good protected.

A second connected AppDeploy authorization for the same account/user ID was checked read-only. It returned the same free-plan monthly balance (`21.682826667`, reset `2026-11-17T00:00:00Z`) and reproduced the same per-app “credit balance is exhausted” warnings for both apps. This makes a single-connection token anomaly less likely, but the account-level/per-app contradiction remains unresolved.
