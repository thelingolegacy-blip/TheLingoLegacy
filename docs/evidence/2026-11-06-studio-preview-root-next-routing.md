# Studio Preview Root-Level Next.js Routing — 2026-11-06

## Finding

The initial static-asset repair was deployed, but the Universe app still requested root-level Next.js resources that the gateway did not route.

Independent Cloudflare Browser Rendering checks against the staging custom domain observed:

- `/apps/universe/studio/` returns the Studio / Enterprise page HTML.
- The rendered HTML contains correctly prefixed script and stylesheet references under `/apps/universe/_next/static/...`.
- The Next.js runtime also emits root-level prefetch references under `/_next/static/...`.
- A direct Browser Rendering navigation to `/_next/static/chunks/695-948c687547f7d4e5.js` returned the gateway's `Route not registered.` response.
- A direct Browser Rendering navigation to `/_next/data/RnV8kGF9V8qaCf5FTqAbe/studio.json?slug=studio` returned the same `Route not registered.` response.

The AppDeploy source confirms:

- `next.config.ts` uses `output: 'export'` and `trailingSlash: true`.
- `pages/[slug].tsx` uses `getStaticPaths()` and `getStaticProps()`.
- Its static page slug set is `legacy`, `slots`, `arcade`, `library`, `media`, `world`, `lane`, `legacyxclub`, and `studio`.

## Staging-only remediation prepared in this PR

- Add a root-level `/_next/static/*` alias pinned only to the Universe AppDeploy origin.
- Add a narrowly scoped `/_next/data/<build-id>/<known-slug>.json?slug=<same-slug>` alias for the nine known static-export pages.
- Reject unknown slugs, missing/mismatched/duplicate query values, extra query parameters, and all other `/_next/data/` paths.
- Keep `/_next/image`, API, auth, OAuth, admin, internal, and all unapproved data paths blocked.
- Preserve GET/HEAD-only behavior, origin pinning, redirect blocking, no-cookie forwarding, and response security headers.
- Rewrite relative `./` navigation and asset references to the application prefix so links remain inside `/apps/universe/`.
- Add `scripts/tests/studio-preview-routing.test.mjs` and invoke it from the static CI workflow.

## Checks and disposition

- Source changes committed to the existing draft PR branch.
- The regression test is added but has **not yet executed**.
- Existing GitHub Actions attempts for the PR commit ended in `startup_failure` with zero jobs; this is not a code-test result.
- The new Worker version has **not yet been uploaded or deployed** at the time this document is authored.
- The currently deployed staging Worker remains unchanged until the new source is verified and the staging deployment is performed.
- No production Worker, DNS, route, Firebase, payment, or secret changes are included.

**Disposition: STAGING REPAIR IN PROGRESS — NOT ACCEPTED.**
