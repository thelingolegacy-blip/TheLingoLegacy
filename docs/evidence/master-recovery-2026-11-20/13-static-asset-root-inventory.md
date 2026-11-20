# Static asset root inventory — 2026-11-20

## Method

- Source: complete, non-truncated recursive Git tree for PR #574 head `604a1b32e975a39800ce4ab8fd4bb88e46712b5f`.
- Tree SHA: `0aa764b1be68ee430fd09c39a7b389175bc68eee`.
- Compared root-level directories containing `index.html` against the candidate `.assetsignore` and release manifest `includedSurfaces`.
- No production HTTP fetch or external route probe was made.

## Counts

- 175 top-level repository entries.
- 119 top-level directories contain an `index.html`.
- 10 of those directories are excluded by the candidate `.assetsignore`.
- 109 top-level index directories remain in candidate static publication scope, assuming Wrangler's documented `.assetsignore` behavior.
- 43 of those 109 are not listed in release-manifest `includedSurfaces`.

## Unmanifested, non-excluded index directories

`ai`, `assets`, `auto-racing-universe`, `casino`, `casino-config`, `casino-upgrade`, `community`, `drop`, `full-entity-simulcast`, `games`, `landing`, `lane`, `legacy-home`, `library`, `lingo-ai`, `lingoarcade`, `live-casino-studio`, `loading`, `loyalty-lane-cycles`, `master-interface`, `media`, `monetization-safety`, `multiplayer-rap-arena`, `outer-crown-expansion`, `payload-matrix`, `signup-preview`, `social-play`, `spades-is-my-lingo`, `store`, `studio`, `studio-assets`, `studio-hub`, `studio-production`, `studio-sites`, `studio-ui-cleanup`, `studio-world-os`, `sweepstakes-visual-system`, `tapstich`, `trust-compliance`, `universe`, `visual-expansion`, `visual-showcase`, `worlds`.

## Interpretation

This does **not** establish that all 43 pages are confidential or unsafe. Some may be intentionally public product, game, media, or marketing surfaces. It does establish that the release manifest is not a complete publication allowlist and that static publication scope remains broader than the manifest.

The current static validator checks required exclusions, preservation of required public entrypoints, and conflicts between exclusions and manifest routes. It does not build a complete generated asset inventory or require every published directory to be explicitly approved.

## Required next step

Create an owner/product-approved route classification for every top-level index page and every root-level non-HTML asset. Distinguish:
- approved public customer-facing pages,
- public preview/demo pages,
- internal control-plane/operator pages,
- source/build/configuration material,
- deprecated or unowned routes.

Only after classification should the team design a generated public-file allowlist or expand exclusions. Do not blanket-exclude all 43 routes: preserve legitimate customer-facing surfaces. A Wrangler dry-run and generated asset-manifest review are required to prove the exact publication set.

No static asset, Worker, route, DNS, Pages project, or production deployment was changed as part of this inventory.
