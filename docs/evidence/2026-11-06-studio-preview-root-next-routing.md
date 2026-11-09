# Studio Preview Root-Level Next.js Routing — 2026-11-06

## Finding

The initial static-asset repair was deployed, but the Universe app still requested root-level Next.js resources that the gateway did not route.

Independent Cloudflare Browser Rendering checks against the staging custom domain observed:

- `/apps/universe/studio/` returned the Studio / Enterprise page HTML.
- The rendered HTML contained correctly prefixed script and stylesheet references under `/apps/universe/_next/static/...`.
- The Next.js runtime also emitted root-level prefetch references under `/_next/static/...`.
- Direct Browser Rendering navigation to `/_next/static/chunks/695-948c687547f7d4e5.js` and `/_next/data/RnV8kGF9V8qaCf5FTqAbe/studio.json?slug=studio` returned `Route not registered.`.

The AppDeploy source confirms:

- `next.config.ts` uses `output: 'export'` and `trailingSlash: true`.
- `pages/[slug].tsx` uses `getStaticPaths()` and `getStaticProps()`.
- Its static page slug set is `legacy`, `slots`, `arcade`, `library`, `media`, `world`, `lane`, `legacyxclub`, and `studio`.

## Staging-only remediation

Committed to the existing draft PR branch:

- Root-level `/_next/static/*` alias pinned only to the Universe AppDeploy origin.
- Narrow `/_next/data/<build-id>/<known-slug>.json?slug=<same-slug>` alias for the nine known static-export pages.
- Unknown slugs, missing/mismatched/duplicate query values, extra query parameters, and all other `/_next/data/` paths are denied.
- `/_next/image`, API, auth, OAuth, admin, internal, and other protected paths remain denied.
- GET/HEAD-only behavior, origin pinning, redirect blocking, no-cookie forwarding, and response security headers are preserved.
- Relative `./` navigation and asset references are rebased to the application prefix.
- Added `scripts/tests/studio-preview-routing.test.mjs` and a static-CI step to execute it.

## Deployment evidence

- Worker: `lingo-studio-control-center-staging`
- Worker version number: **6**
- Worker version ID: `e142ffd0-8e76-495d-a9f0-e6a3c9ef3558`
- Deployment ID: `a61fd6e1-65b8-47e1-9cd0-a04f1b307669`
- Allocation: **100%** on version 6
- Source bytes: **10,319**
- Deployed source SHA-256: `908f592c4c572ba27d470fd0de729919ab9c54650449e7d286b5e475ad001011`
- Existing tags, compatibility date, empty bindings, and persistent observability settings were preserved.
- Custom domain `studio-preview.thelingolegacy.com` remains attached and enabled.

## Live staging verification

Cloudflare Browser Rendering returned the following results after the version 6 deployment:

| Probe | Result |
|---|---|
| Root-level Next.js static bundle | Served JavaScript content (7,024-character rendered document) |
| Root-level `studio.json` static data | Served JSON with `__N_SSG: true` and Studio page data |
| Root-level `legacy.json` static data | Served JSON with `__N_SSG: true` and LINGOlegacy page data |
| Universe Studio page | HTML returned; expected title/headline present; relative Membership link rebased to `/apps/universe/legacy/` |
| Universe Legacy page | HTML returned; expected title/headline and Studio navigation present |
| Unapproved `admin.json` data path | Explicitly denied: `Static page data path not allowed.` |
| Root `/api/runtime/...` path | Explicitly denied: `Protected application endpoints are not proxied.` |
| Kotton’s Code world image 1 | Image document returned at 1024×1024 |
| Gateway origin health | `/healthz/apps` checked 16 origins; **16/16 HEAD requests returned 200**, `ok: true` |
| AppDeploy Universe/Kotton errors since deployment | No frontend or backend errors returned by the status checks |

The 16-origin health result is an origin availability check only; it does not certify application features or backend authorization.

## Checks and remaining limitations

- Deployed source hash was independently retrieved and calculated from Cloudflare's Worker content endpoint.
- Live GET probes for static assets, static data, page HTML, protected data, protected API paths, and the Kotton image were performed through Cloudflare Browser Rendering.
- The repository regression test is added but **has not executed**. The latest GitHub Actions attempts ended in `startup_failure` with zero jobs; this is not a code-test result.
- A direct POST-method probe was not independently completed. The deployed source retains the explicit GET/HEAD-only guard, and the added regression test asserts POST returns 405.
- Full interactive click-through, complete mobile/desktop acceptance, and independent security review remain outstanding.

## Release disposition

**STAGING ROUTING REPAIR DEPLOYED — PARTIAL ACCEPTANCE ONLY.** The preview's root-level Next.js assets and known static data routes now resolve, while protected routes remain denied. Production Worker routes, DNS, code, Firebase, payments, and secrets were not changed. PR #473 remains draft; CI/G02 and production promotion remain blocked.
