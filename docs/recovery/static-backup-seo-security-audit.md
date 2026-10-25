# Static backup recovery audit — 2026-10-25

## Scope and result

A dedicated Cloudflare Pages project, `thelingolegacy-static-backup`, is configured with repository source `recovery/static-backup-2026-10-24`, automatic deployments disabled, and custom domains unattached.

The first deployment used the repository root and uploaded 511 files. This was broader than the public-site scope and could expose internal engineering/source files via the Pages hostname. The project configuration was then changed to use `static-site` as its root directory. A curated static-site tree was added with 37 public route HTML files, required public CSS/JS/SVG assets, a 404 page, security headers, redirects, manifest, robots file, and curated sitemap. The initial isolated deployment using that root reported successful clone/build/deploy. The alias-map deployment for commit `c3e6d58deb51f1d907b6a01d0b8dcbe322fc57a7` completed successfully as deployment `cd745da8-c8db-410a-9cdb-8944a1dd1a61`.

## Route-integrity findings and remediation

- Browser-rendered link extraction found that the homepage's navigation contains public aliases not included in the 37-page curated tree (for example `/lingoarcade/`, `/lane/`, `/media/`, `/store/`, and `/ai/`).
- Added temporary 302 aliases in `static-site/_redirects` for the primary public navigation and studio aliases. Deployment logs confirm 18 valid redirect rules, 1 valid header rule, 65 deployable assets, and successful publication. Browser-rendered content checks confirmed `/lingoarcade/`, `/lane/`, `/media/`, `/store/`, `/ai/`, `/loading/`, `/studio-assets/`, and `/studio-world-os/`, and `/studio-production/` resolve to intended curated targets. `/studio-production/` also resolves to the intended `/live-casino-studio/` target. Actual response headers and HTTP status codes still need independent live HTTP verification. Nine public aliases were rechecked against this newest deployment and resolve to the intended curated targets.
- The homepage also contains links to internal/operational destinations (for example admin, launch operations, integration readiness, and test routes). Those destinations remain excluded from the public tree by design; their presence as hidden/flagged HTML links is a crawl-noise issue and must not be interpreted as proof those operational pages should be published. Keep them out of the sitemap and verify they resolve to the intended 404/deny behavior.
- A 100-URL browser-rendering crawl was started for route discovery and canceled after early results showed extensive hidden operational links; no full-site crawl acceptance is claimed.
- A separate browser-rendered asset-reference audit covered all 37 curated HTML routes. It found one missing local asset, `/assets/studio-ui-icons.svg`; added a same-origin SVG sprite defining all eight referenced symbols (`arrow`, `bolt`, `grid`, `play`, `shield`, `spark`, `studio`, `wallet`).
- Three KottonsCode pages referenced Vercel-only `/_vercel/insights/script.js`, which is not part of the Cloudflare Pages root. Removed the Vercel analytics bootstrap and script tag from those three static pages rather than publishing a fake analytics endpoint.
- The follow-up Pages deployment for commit `613d1a9d7b8bce61392d4ffb07972b57666ff9ee` completed successfully as deployment `ebd53df5-ea64-48dd-b88e-1223a6ef146c` (`https://ebd53df5.thelingolegacy-static-backup.pages.dev`). Browser-rendered content checks confirm the homepage no longer references the Vercel-only analytics script, the new SVG sprite is served with all eight symbol IDs, and all three KottonsCode pages render without the Vercel script reference.

## SEO findings and remediation

- Original sitemap listed 114 URLs.
- 113 listed URLs mapped to an HTML route in the repository tree; `/vercel-hard-lock/` did not.
- Replaced the backup branch sitemap with 37 public canonical URLs; removed admin, integration-readiness, launch-operations, and other internal/operational destinations.
- Preserved the existing crawler policy in `robots.txt` rather than silently changing the owner's AI-crawler preferences.
- Added `X-Robots-Tag: noindex, nofollow, noarchive` to the static backup headers to avoid indexing a duplicate staging copy.
- Existing page canonical and Open Graph metadata still point to `https://thelingolegacy.com/`, not the Pages hostname.
- Audited all 37 selected routes for title, meta description, and canonical URL. Added Organization/WebSite JSON-LD to the homepage and added missing canonical tags to five public-information pages. Repointed two public-homepage documentation links to the public release-notes page because internal Markdown files are intentionally excluded.
- No production DNS, canonical Worker, or custom domain was changed.

## Security boundary

- Pages project build root: `static-site`, not repository root.
- The Pages project serves only the curated `static-site/` root; repository control-plane, config, docs, and operator source files are outside that deployment root. The root-level redirect rules use supported 302 statuses as defense in depth; the curated static site's redirect file contains only valid public-link redirects.
- Security headers include nosniff, referrer policy, permissions policy, frame denial, HSTS, CSP, COOP, and X-Robots-Tag.
- Firebase client configuration in the source repository contains placeholder values; it is not a working credential set.
- This backup is static only. It does not certify Firebase authentication, dynamic API routes, wallet/loyalty transactions, checkout, or server-side state.
- The repository's production Worker still has a separate root-assets security review requirement; this report does not certify or change that Worker.

## Independent live verification — 2026-10-25

### Isolated Cloudflare Pages backup

- Latest deployment: `c8f84820-2257-428b-b77d-61d598c5ece8`, URL `https://c8f84820.thelingolegacy-static-backup.pages.dev`, source commit `b4bdbd918070154050c042713ed809c08264be22`. Cloudflare API confirms all five deployment stages completed successfully.
- Browser-side real `fetch()` checks confirmed the sitemap returns HTTP 200 with `application/xml`, contains 37 unique routes, and every route returns HTTP 200 HTML with an H1 and canonical URL matching its path. All 37 pages have the intended `X-Robots-Tag: noindex, nofollow, noarchive`.
- 24 unique linked local CSS/JS/SVG assets returned HTTP 200 with expected content types. The missing `/_cloudflare/insights/script.js` reference on `/living-universe/` was removed; the latest deployed route crawl found no remaining references to that missing analytics resource.
- All nine tested aliases resolve to their intended targets: `/lingoarcade/`, `/lane/`, `/media/`, `/store/`, `/ai/`, `/loading/`, `/studio-assets/`, `/studio-world-os/`, and `/studio-production/`.
- The deliberately nonexistent route and sampled sensitive paths returned HTTP 404. The backup returned CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Robots-Tag` on tested responses.
- Mobile DOM audit at approximately 390 px width: one H1, main landmark present, no missing image alt attributes, no unnamed buttons, no positive tabindex values, 17 focus-visible/focus-related CSS rules and 14 reduced-motion media rules. No forced-colors media rules or skip-navigation link were found. This was a DOM/CSS inspection, not a real keyboard-only interaction test; forced-colors and contrast acceptance remain incomplete.

### Production domain — independently observed

- Browser-side live GET probes against `https://thelingolegacy.com` found `/healthz` returning HTTP 200 HTML instead of the expected plain-text health response; `/assets/studio-ui-icons.svg`, `/sitemap.xml`, `/robots.txt`, and a deliberately nonexistent path all returned HTTP 200 with the same homepage HTML. `/api/v1/runtime` and `/api/v1/platform/gates` returned HTTP 404 JSON.
- Sampled sensitive paths (`/.github/workflows/runner-dispatch-diagnostic.yml`, `/.env.example`, `/wrangler.jsonc`, `/.git/config`, `/scripts/`, `/config/`, and `/ops/estate/estate-manifest.json`) returned homepage HTML rather than the requested file content. This is reassuring for these probes but does not close the broader root-assets review.
- The production homepage response did not include a CSP header and returned `X-Frame-Options: SAMEORIGIN`; production DOM inspection found no focus/focus-visible CSS rules, no reduced-motion or forced-colors rules, and no skip-navigation link. These are live acceptance defects or gaps, not a production release pass.
- Production source configuration still has `assets.directory: "."` and the active Worker calls `env.ASSETS.fetch(request)`. Do not change production routing/assets until a release-specific allowlisted asset root and complete route-parity/security probes pass.

## Verification still required

- Repair production path dispatch so health, static assets, sitemap, robots.txt, unknown routes, and required API contracts return correct status/content types; add CSP and complete security-header acceptance.
- Resolve G02 runner dispatch with authorized Actions-policy and runner inventory evidence, an actual runner assignment, executed sentinel, retrievable logs, and checksum-verified artifact.
- Supply genuine Firebase configuration through the authorized project owner and verify Auth, database/storage rules, and runtime access; placeholders remain in main.
- Complete real keyboard-only testing, forced-colors emulation, contrast acceptance, and mobile interaction checks on the backup and production candidate.
- Finish the production Worker asset-root review with a release-specific public asset manifest and independent sensitive-path/route-parity probes.
- Separate acceptance decision before attaching any canonical domain or merging to main.

## Release governance

No merge, production deployment, DNS mutation, canonical Worker change, billing mutation, or gate promotion was performed. G02 remains blocked and production/LKG remains protected.
