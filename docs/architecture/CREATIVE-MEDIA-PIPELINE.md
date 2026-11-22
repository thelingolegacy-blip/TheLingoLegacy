# LINGOlegacy Creative & Media Pipeline — Working Architecture

**Status:** Working proposal; PR-only validation; not a production integration.
**Cost policy:** Free-tier-first. No paid services, paid APIs, new cloud resources, or recurring commitments without a separate cost and approval review.
**Release posture:** Production remains fail-closed; last-known-good remains protected.

## 1. Canonical source and ownership
- GitHub repository `thelingolegacy-blip/TheLingoLegacy` is the source of truth for code, schemas, design tokens, and release evidence.
- Canva is the creative authoring workspace; a Canva design link is a source reference, not proof of ownership, license, or publication approval.
- Cloudflare remains the intended web edge/runtime. No deployment is performed by this pipeline.
- Firebase is an optional application data/auth layer only where an existing project and no-cost quota support the feature. Do not enable billing or link a billing account as part of this workflow.
- Flutter is the mobile application target; Unity is the game-runtime target where appropriate.
- Git LFS is optional for large binary source assets. Check account quota before storing media.

## 2. Media intake and production stages
1. **Intake:** record product, title, creator, source, creation date, media type, intended use, and accessible Canva/source link.
2. **Rights gate:** capture license/permission evidence, territory, term, attribution, restrictions, and releases. Unknown means not cleared.
3. **Creation:** produce original artwork, UI symbols, game symbols, character sheets, backgrounds, audio, video, thumbnails, and motion assets.
4. **Technical preparation:** use SVG for scalable marks/icons; WebP/AVIF for raster imagery with fallbacks where required; optimized OGG/MP3 for short sound effects; keep source masters separate from delivery renditions.
5. **Validation:** inspect dimensions, file size, format, transparency, alt text, audio length, and SHA-256 checksum.
6. **Catalog:** add the asset to `creative/asset-manifest.json`; record unknowns explicitly.
7. **Review:** compare with canonical naming, visual system, rights, claims, accessibility, and destination requirements.
8. **Release:** only an explicitly approved asset with traceable evidence may be copied to a publication destination.

## 3. Canonical naming
Use exact product-family names: `LINGOlegacy`, `LINGOlane`, `LINGOslots`, `LINGOarcade`, `LINGOlibrary`, `LINGOmedia`, `LINGOworld`, and `LegacyXclub`.
Preserve product names as defined in the master registry. Do not introduce a star symbol into product names or Duolingo comparisons. Kotton’s Code remains its own world/IP; its book is also catalogued in LINGOlibrary.

## 4. UI/UX and CSS delivery
- Keep shared tokens in `config/design/design-tokens.json` and `assets/lingo-design-tokens.css`.
- Keep the existing shared runtime and icon registry authoritative unless a reviewed change supersedes them.
- New visual directions are opt-in CSS themes until approved; do not inject provisional styles globally.
- Mobile-first breakpoints must cover 320px, 768px, 1200px, and 1440px layouts.
- Interactive controls target at least 48px; preserve visible keyboard focus and semantic labels.
- Honor `prefers-reduced-motion`; never use flashing/strobing as the only signal.
- Test contrast, keyboard navigation, screen-reader labels, zoom/reflow, touch target spacing, and focus order.
- Preview, placeholder, disabled, and staged actions must never imply accounts, payments, rewards, or persistent backend features are active.

## 5. Feature pipeline
Every feature moves through: **SPEC → DESIGN → IMPLEMENTATION → AUTOMATED TEST → ACCESSIBILITY / SECURITY REVIEW → PREVIEW QA → ACCEPTANCE → RELEASE AUTHORIZATION**.
Feature contracts identify owner role, user journey, states, permissions, data model, API contract, analytics needs, error states, accessibility behavior, tests, rollback behavior, and evidence.
That’s My Lingo is non-real-wagering entertainment. Play Coin is non-redeemable and has no cash value. No cash-out, cash payouts, real-money betting, or dollar-denominated rewards are part of this pipeline. Any separately proposed sweepstakes requires independent legal review and official rules before promotion.

## 6. Free-first stack
| Layer | Default candidate | Guardrail |
|---|---|---|
| Source control | GitHub Free | Check private-repo Actions minutes and storage; do not assume unlimited private CI |
| CI | GitHub Actions PR-only validation | Keep tests deterministic and short; do not dispatch production workflows |
| Web edge/static assets | Existing Cloudflare account | Observe current plan quotas; no paid upgrade or deployment from this branch |
| App data/auth | Existing Firebase Spark-compatible services only | Exceeding quotas may stop service; never link billing automatically |
| Mobile | Flutter SDK and local tests | Build locally/CI only when toolchain exists |
| Games | Unity project-specific | Keep editor/license requirements visible; avoid paid add-ons |
| Browser QA | Playwright | Open-source runner; CI minutes and browser install time still count |
| Large media | Git LFS within free quota or existing approved storage | Track bandwidth/storage; no binary bulk upload without quota check |
| Design | Canva connected workspace | Canva AI generation is subject to plan quota; use manual/local alternatives when unavailable |

## 7. CI/CD boundaries
The proposed workflow runs only on pull requests and validates the creative asset manifest plus existing shared design-system contracts. It does not publish assets, deploy Workers, change DNS, write secrets, run migrations, link Firebase billing, or alter production.
A green PR workflow is not G02 acceptance, deployment evidence, or production authorization. Keep G02 and all production release gates fail-closed until independently verified.

## 8. Free-tier and spend controls
- Default new services to $0 usage and no payment method where supported.
- Set explicit spend budgets to $0 where supported; do not rely on an undocumented setting.
- Check actual account usage and quota before each media batch or CI expansion.
- Avoid storing generated video masters in Git LFS unless quota and retention needs are verified.
- Prefer static preview pages and local validation before provisioning backend services.
- Record any feature that requires paid compute, storage, bandwidth, AI generation, or distribution as blocked pending approval.

## 9. Acceptance evidence
Each asset or feature needs a source link, commit or design version, checksum where applicable, rights record, automated test result, accessibility result, preview QA, reviewer, and explicit disposition. Use `UNKNOWN / NEEDS EVIDENCE` instead of inferring a pass.

## 10. First delivery sequence
1. Complete Canva folder reconciliation without deleting or renaming originals.
2. Populate asset provenance and claims records.
3. Build a small original UI asset pack with source records.
4. Apply opt-in visual theme only to a preview surface after design review.
5. Run manifest and shared design-system CI checks.
6. Add Playwright preview tests for responsive navigation, key journeys, and accessibility smoke checks.
7. Implement one bounded vertical slice at a time; do not activate payments, real-money features, or production integrations.
