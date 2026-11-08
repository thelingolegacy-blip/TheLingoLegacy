# Studio Preview Host — Runtime Provenance Record

**Observed:** 2026-11-06  
**Scope:** Read-only investigation of `studio-preview.thelingolegacy.com`  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Related:** [Route-level agent](../ROUTE-LEVEL-AGENT.md), [Master Recovery #480](https://github.com/thelingolegacy-blip/TheLingoLegacy/issues/480), [PR #483](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/483)

## Disposition

**PROVENANCE PARTIALLY ESTABLISHED — ROOT CAUSE / FIX NOT ACCEPTED.**

The hostname is a Cloudflare Worker Domain attached to `lingo-studio-control-center-staging`. The live Worker source is retrievable from Cloudflare, but its source is not currently correlated to a GitHub commit. The domain binding's environment metadata says `production`, while the deployed Worker source hardcodes `ENVIRONMENT = "staging"`. Do not change the domain binding, Worker route, DNS, or script until source ownership and the intended environment contract are reviewed.

## 1. Cloudflare account and zone read-back

Read-only Cloudflare API results:

- Zone: `thelingolegacy.com`; status `active`; full zone.
- Hostname DNS record: `studio-preview.thelingolegacy.com`.
- Record: AAAA `100::`, proxied `true`, TTL `1`.
- Worker Domain: `studio-preview.thelingolegacy.com`.
- Worker Domain ID: `987eff32ee4e30c4916fb4a9693ee24f4b5c590a`.
- Attached service: `lingo-studio-control-center-staging`.
- Worker Domain environment: `production`.
- Worker Domain enabled: `true`.
- Worker Domain previews_enabled: `false`.

The hostname is not represented as a conventional entry in the zone's Worker Routes list; it is attached through the separate Worker Domains configuration. Do not misdiagnose the lack of a `studio-preview` Worker Route row as an unbound hostname.

## 2. Deployed Worker identity

- Script: `lingo-studio-control-center-staging`.
- Active deployment ID: `a61fd6e1-65b8-47e1-9cd0-a04f1b307669`.
- Active version: `6`.
- Version ID: `e142ffd0-8e76-495d-a9f0-e6a3c9ef3558`.
- Version created: `2026-11-06T03:37:56.109299Z`.
- Script ETag: `a4af202764fb4914a0bd109796432b539fe3b6a380b2832358d599a10dff39de`.
- Compatibility date: `2026-11-02`.
- Tags: `lingo`, `staging`, `read-only`, `studio-control-center`.
- Bindings: none.
- Observability/log persistence: enabled.
- Deployed source is retrievable from Cloudflare, but no matching source file or commit was found in the inspected GitHub repository search. The Cloudflare version is therefore not yet reproducibly tied to GitHub's source of truth.

## 3. Relevant deployed source behavior

The retrieved Worker source:

1. Declares `ENVIRONMENT = "staging"` and rejects requests if that constant differs.
2. Registers 16 AppDeploy origins in a `ROUTES` array.
3. Proxies `/_next/static/*` to the Universe Gateway AppDeploy origin.
4. Proxies an allowlist of `/_next/data/{buildId}/{slug}.json?slug={slug}` requests to that same Universe Gateway origin.
5. Proxies `/resources/KottonsCode-world-[1-4].jpeg` to the Kotton's Code AppDeploy origin.
6. Allows only GET/HEAD, blocks API/auth/OAuth/admin endpoints, strips upstream cookies, and adds defensive response headers.
7. Serves `/healthz` and `/healthz/apps` from the staging proxy.

This establishes the shared proxy as the common routing layer used by the two affected apps. It does not yet establish whether the origin's static export is missing files, AppDeploy's origin router rejects them, the proxy's request mapping is incorrect, or the current Worker version changed behavior after the recorded failures.

## 4. Correlated application evidence

### Universe Gateway

- AppDeploy app: `lingolegacy-universe-gateway-h6kqu4`.
- Latest stored source version: `1793645836683`, dated `2026-11-02T18:57:16.683Z`.
- Source uses Next.js static export, empty `basePath`, and `trailingSlash: true`.
- The stored source does not contain the preview hostname.
- The latest reported failing requests before Worker version 6 deployment included:
  - `/_next/static/chunks/pages/index-1483a766349a911f.js`
  - `/_next/static/chunks/pages/atlas-1ba14b1edd4e18ec.js`
  - `/_next/static/chunks/pages/[slug]-a6a015ca7ad6a879.js`
  - `/_next/data/RnV8kGF9V8qaCf5FTqAbe/legacy.json?slug=legacy`
  - `/_next/data/RnV8kGF9V8qaCf5FTqAbe/studio.json?slug=studio`
- The `legacy.json` and `studio.json` requests returned HTTP 404 with `Route not registered.`.

### Kotton's Code

- AppDeploy app: `kotton-s-code-cartoon-studio-509py3`.
- Latest stored source version: `1791085722992`, dated `2026-10-04T03:48:42.992Z`.
- All four image paths exist in the AppDeploy resource inventory:
  - `public/resources/KottonsCode-world-1.jpeg`
  - `public/resources/KottonsCode-world-2.jpeg`
  - `public/resources/KottonsCode-world-3.jpeg`
  - `public/resources/KottonsCode-world-4.jpeg`
- The app source requests those resources using root-relative `/resources/...` paths and does not contain the preview hostname.
- AppDeploy recorded image load failures through the shared preview hostname before Worker version 6 was deployed.

## 5. Timing and post-deployment observation

- Latest cited Gateway errors occurred at `2026-11-06T03:34:38.518Z`.
- Cloudflare Worker version 6 was deployed at `2026-11-06T03:37:56.109Z`, approximately 3 minutes 18 seconds later.
- AppDeploy error queries scoped to timestamps after version 6 returned empty frontend and backend error arrays for both Gateway and Kotton's Code.
- This is a useful post-deployment observation, but it is not a controlled route test and does not prove the defect was fixed. No current browser/network response or direct upstream HTTP status was retrievable in this session.

## 6. Unresolved provenance and acceptance gaps

- The Cloudflare Worker source is not yet committed or correlated to a GitHub SHA.
- The Worker Domain metadata says `production` while the script itself says `staging`; intended semantics and ownership require review.
- AppDeploy source snapshots are older than the latest Cloudflare Worker deployment.
- Direct browser/HTTP checks of the AppDeploy origins and custom preview hostname were unavailable from the current inspection environment.
- The Cloudflare Custom Hostnames endpoint returned a quota-related 403; that endpoint is not the same as the Worker Domains binding that was successfully read.
- No controlled tests have established whether the static chunk and JSON paths return expected bytes through the preview host after version 6.

## 7. Required next steps before a fix

1. Preserve the exact live Worker source, version metadata, deployment ID, and ETag in GitHub as a reviewed source snapshot; do not silently treat the snapshot as canonical until the owner approves source ownership.
2. Establish the intended environment contract for the Worker Domain (`production` metadata) versus the script's staging guard.
3. In an isolated test harness using the existing repository conventions, exercise the exact paths against mocked upstream responses and assert URL, method, query, response status, content type, and redirect behavior.
4. Obtain retrievable current HTTP/browser evidence for the two AppDeploy origins and the preview host, tied to the exact app source versions and Worker version 6.
5. Only after the tests isolate a reproducible defect, make the smallest source-controlled change and open a separate draft PR. Do not edit the Cloudflare Worker, Worker Domain, DNS, AppDeploy source, or deploy as part of this diagnostic step.
6. Require independent route verification, artifact/log references, SHA-256 evidence, and rollback instructions before any staging deployment. Production remains separately protected.

## 8. Safety statement

This investigation was read-only. No Cloudflare DNS, Worker Domain, Worker Route, Worker script, AppDeploy source/resource/deployment, secret, billing, payment, GitHub main branch, or production/LKG state was modified. No build, deployment, retry, or provider-credit spend was initiated.

**Current result:** runtime owner and deployed proxy logic identified; source-to-GitHub correlation and controlled route reproduction remain BLOCKED. Production remains HOLD; G02 remains BLOCKED / UNVERIFIED; LKG remains PROTECTED.
