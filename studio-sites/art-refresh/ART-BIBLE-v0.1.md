# LINGO Legacy Game Collection — Art Bible v0.1

**Status:** Initial design contract for isolated art-refresh work  
**Brand foundation:** Industrial Noir; metallic gold and royal purple  
**Tagline:** Loyalty. Legacy. Language.  
**Authority:** Per-title game specs and canonical game registry remain the source of truth.

## 1. Creative principle

Build one recognizable LINGO Legacy universe, not one repeated art style. Collection-level consistency comes from craft, framing, quality, typography discipline, and restrained brand accents. Each title must keep its own genre silhouette, emotional tone, and readable identity.

## 2. Shared brand tokens

| Token | Initial value | Usage |
|---|---|---|
| Obsidian | `#0B0B10` | Primary dark surfaces and negative space |
| Graphite | `#20212A` | Secondary panels and frames |
| Royal Purple | `#5426A8` | Brand accent, focus, select game accents |
| Deep Violet | `#24113F` | Background gradients and shadow fields |
| Metallic Gold | `#D6AD52` | Premium trim, keylines, insignia |
| Warm Ivory | `#F4EFE4` | High-contrast text on dark surfaces |
| Cool Silver | `#AEB4C0` | Secondary metadata and technical UI |

These are initial art-direction tokens, not a certified accessible palette. Verify foreground/background contrast for every actual component and state before acceptance. Never communicate state using color alone.

## 3. Art families

- **Casino / card / score attack:** crisp icon silhouettes, controlled metallic trim, strong symbol readability, no implication of real-money wagering or cash-out. All in-game rewards remain virtual.
- **Family / learning / cozy puzzle:** warm lighting, welcoming silhouettes, legible friendly forms, low visual clutter, clear interaction targets.
- **Mystery / escape / detective:** directional lighting, clue readability, atmospheric environments, restrained visual noise.
- **Survival horror:** deliberate contrast, readable threats, cinematic environmental storytelling, configurable intensity where appropriate.
- **Open-world / life simulation:** layered neighborhood/environment art, coherent time-of-day lighting, strong foreground/midground/background separation, original rights-cleared assets.
- **Arcade / physics / chain reaction:** bold shape language, clear motion direction, readable cause-and-effect, no rapid flashing or strobing.

## 4. Asset package per title

Required baseline:
1. Primary wordmark/logo (SVG source plus optimized web export).
2. Launcher tile / app icon (square master; 1:1 exports).
3. Cover or hero key art (16:9 master with safe crop area).
4. Portrait key art crop (4:5 or 3:4 as required by the surface).
5. Background/environment artwork where required by the game spec.
6. Loading/title screen composition.
7. In-game symbol, character, or object atlas when required by gameplay.
8. UI-state art: locked, selected, loading, empty, error, success, and offline where applicable.
9. Preview thumbnails and promo exports.
10. Alt text and source/rights record for every visual asset.

Do not create irrelevant asset types just to fill a checklist; mark them `not-applicable` with a rationale. Do not treat generated concept art as integrated game art until exported, named, added to the asset registry, and visually verified in the actual surface.

## 5. Responsive and export guidance

- Keep critical logos, faces, symbols, and title text within the central 80% safe region of hero compositions.
- Prepare separate crops when a single composition cannot survive both wide and portrait layouts; do not stretch or distort art.
- SVGs must have a valid `viewBox`, scalable shapes, no unnecessary embedded raster images, and meaningful accessible labeling when used as informative content.
- Raster assets should use WebP/AVIF for delivery where supported, with a high-quality source master retained according to repository conventions.
- Export density variants only where the consumer needs them; avoid redundant files.
- Provide lightweight previews for launcher surfaces and lazy-load large noncritical art.
- Keep text out of baked-in key art when it needs localization, responsive resizing, or accessibility support. Prefer live UI typography.

## 6. Accessibility and motion

- Meet WCAG 2.2 AA contrast for UI text and controls where applicable; verify actual rendered colors, not palette assumptions.
- Do not encode meaning through color alone; pair status colors with labels, shapes, or icons.
- Preserve visible keyboard focus and touch target sizing in surrounding UI.
- Avoid strobing, rapid flashes, and unnecessary motion. Provide reduced-motion alternatives for animated presentations.
- Add concise, context-appropriate alt text for informative art; use empty alt text for purely decorative imagery.
- Ensure logos remain identifiable at common mobile launcher sizes.

## 7. Naming and registry schema

Use stable canonical IDs and immutable versioned paths. Suggested path pattern:

`studio-sites/assets/games/<game-id>/<asset-role>.<version>.<ext>`

Examples:
- `studio-sites/assets/games/thats-my-lingo/logo.v1.svg`
- `studio-sites/assets/games/spades-is-my-lingo/cover.v1.webp`
- `studio-sites/assets/games/kottons-code/icon.v1.webp`

For each asset record:
- `assetId`, `gameId`, `role`, `path`, `version`
- `format`, `width`, `height`, `aspectRatio`
- `altText`, `decorative`
- `sourceType`, `creator`, `licenseOrRights`, `approvalStatus`
- `sha256`, `status`, `consumerReferences`, `verificationEvidence`

Allowed lifecycle statuses: `planned`, `in-progress`, `concept`, `needs-review`, `approved`, `integrated`, `verified`, `blocked`, `not-applicable`. Never use `verified` without recorded evidence.

## 8. Pilot order

1. **That’s My Lingo** — premium symbol clarity and virtual slot presentation.
2. **Spades Is My Lingo** — strong card/table identity and readable suit/rank assets.
3. **Kotton’s Code** — family-friendly original character and learning-world identity; inspect existing character references before finalizing artwork.

The pilot validates the art bible and integration process. It does not certify the games' mechanics or authorize production promotion.

## 9. Review gates

- **Source gate:** canonical title/spec and source art references identified.
- **Design gate:** concept and crops approved against the art family and brand tokens.
- **Rights gate:** asset origin and permitted use documented.
- **Implementation gate:** paths registered; consumers updated without gameplay changes.
- **Technical gate:** file format, dimensions, hash, references, loading and fallbacks validated.
- **Visual/accessibility gate:** mobile and desktop screenshots, contrast, reduced-motion and keyboard/touch behavior checked.
- **Acceptance gate:** evidence attached and reviewer disposition recorded.

Follow the repository fail-closed chain: SOURCE → EVIDENCE → VERIFICATION → ACCEPTANCE → PASSED → AUTHORIZATION → PROMOTION. No production release follows from this document alone.
