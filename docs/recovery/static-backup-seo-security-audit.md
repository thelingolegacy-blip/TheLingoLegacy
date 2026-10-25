# Static backup recovery audit — 2026-10-24

## Scope and result

A dedicated Cloudflare Pages project, `thelingolegacy-static-backup`, is configured with repository source `recovery/static-backup-2026-10-24`, automatic deployments disabled, and custom domains unattached.

The first deployment used the repository root and uploaded 511 files. This was broader than the public-site scope and could expose internal engineering/source files via the Pages hostname. The project configuration was then changed to use `static-site` as its root directory. A curated static-site tree was added with 37 public route HTML files, required public CSS/JS/SVG assets, a 404 page, security headers, redirects, manifest, robots file, and curated sitemap. The isolated deployment using that root reports successful clone/build/deploy.

## SEO findings and remediation

- Original sitemap listed 114 URLs.
- 113 listed URLs mapped to an HTML route in the repository tree; `/vercel-hard-lock/` did not.
- Replaced the backup branch sitemap with 37 public canonical URLs; removed admin, integration-readiness, launch-operations, and other internal/operational destinations.
- Preserved the existing crawler policy in `robots.txt` rather than silently changing the owner's AI-crawler preferences.
- Added `X-Robots-Tag: noindex, nofollow, noarchive` to the static backup headers to avoid indexing a duplicate staging copy.
- Existing page canonical and Open Graph metadata still point to `https://thelingolegacy.com/`, not the Pages hostname.
- No production DNS, canonical Worker, or custom domain was changed.

## Security boundary

- Pages project build root: `static-site`, not repository root.
- Defense-in-depth redirects deny known repository-control, configuration, source, docs, and operator paths.
- Security headers include nosniff, referrer policy, permissions policy, frame denial, HSTS, CSP, COOP, and X-Robots-Tag.
- Firebase client configuration in the source repository contains placeholder values; it is not a working credential set.
- This backup is static only. It does not certify Firebase authentication, dynamic API routes, wallet/loyalty transactions, checkout, or server-side state.
- The repository's production Worker still has a separate root-assets security review requirement; this report does not certify or change that Worker.

## Verification still required

- Independent browser/HTTP checks of the Pages URL and key paths.
- Confirm sensitive-path redirects return 404 and headers are present in real responses.
- Verify all linked CSS/JS/SVG resources and route navigation in desktop and mobile browsers.
- Keyboard-only, reduced-motion, forced-colors, and contrast acceptance.
- Separate acceptance decision before attaching any canonical domain or merging to main.

## Release governance

No merge, production deployment, DNS mutation, canonical Worker change, billing mutation, or gate promotion was performed. G02 remains blocked and production/LKG remains protected.
