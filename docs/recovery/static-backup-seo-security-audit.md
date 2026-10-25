# Static backup recovery audit — 2026-10-25

## Scope and result

A dedicated Cloudflare Pages project, `thelingolegacy-static-backup`, is configured with repository source `recovery/static-backup-2026-10-24`, automatic deployments disabled, and custom domains unattached.

The first deployment used the repository root and uploaded 511 files. This was broader than the public-site scope and could expose internal engineering/source files via the Pages hostname. The project configuration was then changed to use `static-site` as its root directory. A curated static-site tree was added with 37 public route HTML files, required public CSS/JS/SVG assets, a 404 page, security headers, redirects, manifest, robots file, and curated sitemap. The initial isolated deployment using that root reported successful clone/build/deploy. The alias-map deployment for commit `c3e6d58deb51f1d907b6a01d0b8dcbe322fc57a7` completed successfully as deployment `cd745da8-c8db-410a-9cdb-8944a1dd1a61`.

## Route-integrity findings and remediation

- Browser-rendered link extraction found that the homepage's navigation contains public aliases not included in the 37-page curated tree (for example `/lingoarcade/`, `/lane/`, `/media/`, `/store/`, and `/ai/`).
- Added temporary 302 aliases in `static-site/_redirects` for the primary public navigation and studio aliases. Deployment logs confirm 18 valid redirect rules, 1 valid header rule, 65 deployable assets, and successful publication. Browser-rendered content checks confirmed `/lingoarcade/`, `/lane/`, `/media/`, `/store/`, `/ai/`, `/loading/`, `/studio-assets/`, and `/studio-world-os/`, and `/studio-production/` resolve to intended curated targets. `/studio-production/` also resolves to the intended `/live-casino-studio/` target. Actual response headers and HTTP status codes still need independent live HTTP verification.
- The homepage also contains links to internal/operational destinations (for example admin, launch operations, integration readiness, and test routes). Those destinations remain excluded from the public tree by design; their presence as hidden/flagged HTML links is a crawl-noise issue and must not be interpreted as proof those operational pages should be published. Keep them out of the sitemap and verify they resolve to the intended 404/deny behavior.
- A 100-URL browser-rendering crawl was started for route discovery and canceled after early results showed extensive hidden operational links; no full-site crawl acceptance is claimed.

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

## Verification still required

- Independent live HTTP checks of the Pages URL, actual status codes, response headers, and 404 behavior.
- Confirm the latest alias-map deployment's redirect parser reports zero invalid redirect lines and all public alias targets resolve.
- Confirm sensitive-path redirects return 404 and headers are present in real responses.
- Verify all linked CSS/JS/SVG resources and route navigation in desktop and mobile browsers.
- Keyboard-only, reduced-motion, forced-colors, and contrast acceptance.
- Separate acceptance decision before attaching any canonical domain or merging to main.

## Release governance

No merge, production deployment, DNS mutation, canonical Worker change, billing mutation, or gate promotion was performed. G02 remains blocked and production/LKG remains protected.
