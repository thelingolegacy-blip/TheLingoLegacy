# LINGO Legacy Game Art Refresh — Phase A Inventory

**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Branch:** `studio/game-art-refresh-phase-a`  
**Audit date:** 2026-10-28  
**Scope:** source-backed game catalog and currently visible shared art paths  
**Disposition:** inventory baseline only; no production assets replaced.

## Verified catalog baseline

The checked-in `studio-sites/GAME-BIBLE-INDEX.md` names 13 game specifications. The registry `studio-sites/config/game-registry.json` currently has 17 entries, four of which are Doughboy's Oasis support experiences/store/atlas/mode/lab rather than additional canonical standalone titles. The separate 56-title collection is not fully represented by these two files and must be reconciled against its authoritative catalog before claiming complete 56-title coverage.

| Canonical title | Registry ID | Current registry baseline | Existing matching logo file |
|---|---|---|---|
| LINGOarcade | `lingoarcade` | design-preview | `assets/logos/lingoarcade.svg` |
| LINGOslots | `lingoslots` | local-demo | `assets/logos/lingoslots.svg` |
| That’s My Lingo | `thats-my-lingo` | design-spec | `assets/logos/thats-my-lingo.svg` |
| Spades Is My Lingo | `spades-is-my-lingo` | design-spec | `assets/logos/spades-is-my-lingo.svg` |
| UhNo Lingo University | `uhno-lingo-university` | design-spec | `assets/logos/uhno-lingo-university.svg` |
| Kotton’s Code | `kottons-code` | design-spec | **Missing from shared logo directory** |
| Tricia’s Escape | `tricias-escape` | design-spec | `assets/logos/tricias-escape.svg` |
| Doughboy’s Oasis | `doughboys-oasis` | local-prototype | `assets/logos/doughboys-oasis.svg` |
| Crazy Weasols | `crazy-weasols` | design-spec | `assets/logos/crazy-weasols.svg` |
| Silly in Philly: The Streets Run on Loyalty | `silly-in-philly` | design-spec | `assets/logos/silly-in-philly.svg` |
| Jersey Shore: The Undead | `jersey-shore-undead` | design-spec | `assets/logos/jersey-shore-undead.svg` |
| Lingo Eruptions | `lingo-eruptions` | design-spec | `assets/logos/lingo-eruptions.svg` |
| Cashman Lingo Mania | `cashman-lingo-mania` | design-spec | `assets/logos/cashman-lingo-mania.svg` |

## Initial asset findings

- The shared asset manifest at `studio-sites/assets/manifest.json` currently contains two logo placeholders with null paths and null SHA-256 values, plus one code-generated UI-feedback audio entry.
- The logo directory contains 12 SVG files corresponding to 12 of the 13 catalog titles above. File presence is not proof that a logo is final, visually approved, rights-cleared, or integrated into every game surface.
- This initial audit did not establish the presence or acceptance of final cover art, launcher tiles, hero backgrounds, loading screens, character sheets, symbol atlases, UI-state illustrations, responsive crops, or export/source files for each title.
- Do not infer image dimensions, contrast, visual quality, licensing status, or rendered behavior from filenames alone. Inspect SVG source and browser renders in the next audit pass.
- The registry and manifest use explicit placeholder statuses; preserve that fail-closed distinction.

## Required next actions

1. Inspect all 12 existing SVG logo sources and render at small/mobile and large/desktop sizes.
2. Record actual dimensions/viewBox, palette, typography, accessible name, hash, provenance, and current consumer references for each file.
3. Create the missing Kotton’s Code logo only after confirming the character/brand source and approved direction.
4. Inventory all image and CSS background references in the game studio pages, including embedded/inline artwork.
5. Reconcile the separate 56-title master list against repository records and assign stable canonical IDs; do not treat support pages as independent titles without an explicit catalog decision.
6. Produce a pilot art package on this branch; run asset-reference and visual QA before requesting review.
7. Keep production and deployment gates unchanged. This branch is isolated and does not authorize a release.

## Acceptance evidence

- [x] Canonical 13-title game-bible index inspected.
- [x] Registry inspected and 17 registry entries noted.
- [x] Shared asset manifest inspected.
- [x] Logo directory listing inspected; 12 SVG files found.
- [ ] SVG source and visual render audit complete.
- [ ] 56-title authoritative catalog reconciled.
- [ ] Pilot art assets created and integrated.
- [ ] Automated reference checks pass.
- [ ] Mobile/desktop visual QA and rights review complete.
