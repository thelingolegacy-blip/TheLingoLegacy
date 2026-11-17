# LINGO Creative & Media Asset Intake — 2026-11-17

Status: INTAKE IN PROGRESS — NON-PRODUCTION BRANCH
Branch: creative/media-asset-intake-2026-11-17
Purpose: Run creative asset recovery and production in parallel with CORE V2 engineering without changing release controls.

## Operating boundaries

- GitHub remains the source of truth. This branch is isolated from main.
- No production deployment, DNS change, publishing, G02 activation, payment activation, or merge is authorized by this intake.
- Do not treat concept boards, generated collages, storyboards, or mockups as final game/UI assets.
- Preserve original files; create versioned derivatives with source references and SHA-256 digests.
- Record creator/source, owner, license/rights, intended product, dimensions/duration, accessibility text/transcript, QC, brand approval, and publication state.
- Do not publish third-party/licensed characters without documented rights. The Doughboys Oasis All-Stars board contains recognizable third-party characters; create an original-only roster.
- User/family/pet photographs are private source material until individually classified and explicitly approved for a specific use. Do not expose or reuse unrelated personal photos in public product surfaces.
- Maintain canonical names: LINGOarcade (not LINGOarena), Crazy Weasols, and no star symbol in product names.

## Confirmed Library discoveries (metadata and selected visual inspection)

| Library item | Initial classification | Next action |
|---|---|---|
| Kotton’s Code Character Brand Guide.png | Character/brand reference; includes character lineup, world previews, logo variations and palette | Treat as source reference; review privacy/consent for depicted minors and approve final character canon |
| Kotton’s Code: The First Clue.png and numbered variants | Episode/storyboard and game/merchandise concept boards | Reconcile variants; separate actual production assets from mockups; check child-safety/privacy and copy |
| Kottonscode Holiday Puppy Collage.png | Personal pet/pup imagery arranged as brand collage | Keep source private; identify which images are intended for Kotton’s Code before deriving assets |
| Kottonscode: A Festive Puppy Game Show.png | Seasonal concept artwork | Review for reusable original assets; not a production export |
| IMG_6314.jpeg, IMG_6316(3).jpeg, IMG_6313.jpeg, IMG_6315.jpeg, IMG_6316(2).jpeg and other IMG_* photos | User-uploaded personal photo sources | Hold private; classify subject/use and obtain specific approval before editing or publishing |
| Neon Lingo Legacy Multiverse Dashboard.png | Ecosystem visual concept | Derive design tokens/layout references; do not use as a live UI screenshot |
| The Lingo Legacy Game Collection.png | Portfolio/game collection concept board | Reconcile product names and individual product art; not proof of game assets |
| That’s My Lingo Casino Lobby.png; Neon-Gold Lingo Casino Dashboard.png; The Lingo Legacy Neon Casino Dashboard.png | Casino look-and-feel concept art | Use only as visual references; remove stale sweepstakes/commerce/wagering claims; preserve play-only/no-cash-value scope |
| The Lingo Legacy: A Neon Brand Universe.png | Master visual direction | Use as concept reference; reconcile to canonical LINGO tree |
| Doughboys Oasis: All-Stars Character Roster.png; All-Star Racing Codex.png | Character/vehicle concept | Rights gate: do not publish recognizable licensed characters; develop original-only alternatives |
| Loyalty Lane Apparel Brand Redesign Board.png; Loyalty Lane Apparel Redesign Board.png; The Lingo Legacy Fashion Showcase.png | Apparel/fashion creative direction | Reconcile canonical current business naming and source product photography; no product claim without verification |
| Regal Gold and Purple Logo Crests.png | Brand/logo concept | Check against current no-star naming and approved logo master before derivation |
| The Lingo Legacy: Chapter One.png; LINGOworld_Chapter2_MASTER_LOCK.png | Prior-chat referenced portfolio/world visual masters | Locate current Library versions, compare revisions, and designate approved master |

## Prior conversation / connected creative-platform evidence

- Prior chat records identify additional Library assets: Cyberpunk Lingo Legacy Ecosystem Hub.png; Lingo Legacy: Neon Worlds Portal.png; The Lingo Legacy Universe Hub.png; The Lingo Legacy Universe Map(1).png; LINGOlegacy Neon Brand Asset Universe.png; LingOlibrary: Build Worlds, Publish Everywhere.png; The Lingo Legacy Apparel World.png; The Lingo Legacy: Neon Worlds Collage.png; Kotton’s Code: Ultimate UI Asset Kit.png; Kotton’s Code: Find the Code.png; and Kottons_Code_Season_1_Book_Publication_Package.zip. These remain source references until exact Library versions and contents are rechecked.
- Canva records identify Lingo Legacy Launch Master (14 pages), LINGO Legacy Launch Review Copy (7 pages), That’s My Lingo Visual Lookbook (5 pages), and That’s My Lingo Final Blueprint (5 pages). Prior audit noted title/typography QA and canonical-copy selection still needed; no edits/publishing were made.
- InVideo records from the prior audit: That’s My Lingo promo trailer had 30 project assets (10 audio, 20 video) but was script-only/blocked and had no verified export pages; five-game launch trailer had zero assets; Kotton’s Code Episode 01 had zero assets and remained scripting; TikTok promos and YouTube Season 1 episodes were also script-review/scripting with zero assets/export pages. Recheck current project state before relying on these older snapshots.
- A prior creative inventory found storyboard/cue sheets but no verified final audio bundle or completed animation/video export. Cue sheets are not audio deliverables.

## Repository media system already present (do not duplicate)

- config/assets/media-pipeline-contract.json: 12-stage contract; state staged, enabled false, G02 release gate.
- assets/studio/manifests/runtime-media.json: currently empty assets array.
- scripts/verify-media-pipeline.mjs and scripts/test-verify-media-pipeline.mjs: static manifest validator and tests.
- scripts/verify-asset-publication-scope.mjs: Cloudflare asset-publication scope guard.
- studio-sites/README.md and studio/MEDIA_PRODUCTION_UPGRADE.md: media pipeline/design intent and runtime guardrails.
- Existing design direction includes Crimson / White / Shadow Noire for shared studio surfaces; preserve product-specific palettes where canon requires (e.g. Kotton’s Code purple/gold).

## Parallel execution lanes

1. Source recovery: enumerate Library images, source packages, documents, Canva designs and InVideo projects; identify canonical master and duplicates.
2. Rights/privacy: source/owner/license register; private photo classification; minor/family privacy review; third-party IP exclusion.
3. Brand system: master logo and per-product logo lockups; palette/type/icon tokens; canonical naming.
4. Product visuals: responsive hero art, backgrounds, character sheets, UI symbols, game sprites, apparel/product photography.
5. Motion/video: original animation loops, scene sequences, trailers, captions/subtitles, vertical/social variants.
6. Audio: narration, character voices, original music/SFX, loudness/mix QC, transcripts/cue sheets.
7. Engineering integration: immutable asset IDs/versions, SHA-256, responsive variants, alt text/transcripts, lazy/preload rules, manifests and build checks.
8. Acceptance: rendering, mobile/desktop, accessibility, performance, rights, provenance, route smoke tests; keep publication disabled until separately accepted.


## New original concept asset generated during this intake

- File: `a_wide_cinematic_futuristic_cityscape_fantasy_hu.png`
- Working location: `/mnt/data/a_wide_cinematic_futuristic_cityscape_fantasy_hu.png` (session working storage; not yet committed to GitHub)
- Format: PNG, 1536 × 1024, 2,598,568 bytes
- SHA-256: `a040e18eb06ac838d9e64410bb33b70906c4db195bae5bbd9b518ae3f6af946e`
- Classification: original LINGO universe master-hero concept art; crimson dusk, black/chrome skyline, gold gateway, distinct creative districts.
- Status: GENERATED CONCEPT / NOT APPROVED / NOT IN RUNTIME MANIFEST / NOT PUBLISHED.
- Next: compare against current canonical visual system, derive responsive crops only after approval, transfer binary into versioned repository asset storage, and register source/provenance/accessibility metadata.

## First confirmed gap

The runtime manifest has zero registered assets. Library artwork and photo sources exist, but Library presence does not mean they are imported into GitHub, rights-cleared, connected to runtime routes, or production-ready.

## Intake completeness

This is a targeted first-pass intake, not yet a claim that every historical conversation, Library item, image, or external creative project has been exhausted. The Library image listing returned a continuation cursor after its first 100 newest images; continue pagination and targeted searches before declaring the inventory exhaustive.
