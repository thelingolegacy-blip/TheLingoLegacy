# LINGOlegacy Master Game Universe — Production Foundation

**Status:** Isolated development branch; production remains protected  
**Branch:** `studio/lingo-game-universe-foundation-2026-11-06`  
**Source of truth:** `thelingolegacy-blip/TheLingoLegacy`  
**Date:** 2026-11-06

## Mission

Build the existing LINGO game portfolio into original, fully playable, visually complete and sound-enabled experiences. Reuse existing source, assets, design decisions, characters, mechanics and previous creative work before creating replacements. Do not represent a preview, design, generated asset, build, or deployment as accepted until the relevant tests and independent evidence exist.

## Portfolio canon

The game registry in `portfolio-registry.json` is the machine-readable index. Current confirmed title groups:

- **LINGOslots:** That's My Lingo; Spades Is My Lingo; Uhno Lingo U-No; Lingo Lions Eruptions; Cashman Lingo Mania.
- **LINGOarcade:** Tricias Escape; Doughboys Oasis; Crazy Weasols; Silly in Philly; Jersey Shore: The Undead.
- **LINGOlibrary:** KottonsCode; Dice Shift Hotel; Legacy Legends; The Block I Grew Up On; Say It Again.

## Shared technical baseline

- **High-fidelity 3D:** Unreal Engine 5 for open-world action, vehicles, high-density environments and authoritative multiplayer.
- **Stylized 3D / cross-platform:** Unity when a title's visual pipeline and target platforms justify it.
- **Browser-native games:** Phaser for 2D and arcade gameplay; Three.js for browser 3D; PixiJS for renderer-heavy 2D interfaces.
- **Shared code and contracts:** TypeScript schemas and versioned APIs for browser/backend integration; engine-specific C++ or C# gameplay modules where needed.
- **Simulation/render separation:** saveable deterministic gameplay state is independent from canvas, scene, animation and UI objects.
- **Common gameplay modules:** stats, effects, combat, inventory, building, production queues, progression DAGs, AI, world state, saves, analytics and QA.
- **Networking:** server-authoritative validation for multiplayer and competitive games; client prediction and reconciliation only where appropriate.
- **Casino/card outcomes:** server-side cryptographic RNG and auditable math. Clients animate outcomes but never determine or secretly alter them. Current products remain virtual/demo-only unless separately authorized and legally reviewed.

## Asset and presentation standard

Every shipped playable milestone must include an asset manifest and a coherent visual/audio treatment: original characters, environments, UI, animation, particles, music, sound effects, voice only where approved, captions, mute controls and reduced-motion behavior. Generated or placeholder assets must be labelled as such until approved and replaced where needed. Preserve the Industrial Noir / Crimson Shadow visual direction for the flagship and each title's own established identity.

## Parallel workstreams

1. **Portfolio and source reconciliation:** inventory GitHub repositories, AppDeploy snapshots, existing files, media and previous design decisions. Map every asset to a title and provenance.
2. **Shared game foundation:** define module contracts, schemas, deterministic simulation tests, save versioning, input maps, asset manifests and telemetry boundaries.
3. **Existing playable titles:** prioritize extending and testing existing Crazy Weasols, Jersey Shore: The Undead and That's My Lingo previews rather than rebuilding them.
4. **Story and family titles:** reconcile KottonsCode canon, character sheets, world art, scripts, animation and age-appropriate interactions; then advance Dice Shift Hotel and the remaining library titles.
5. **Card games and new arcade titles:** recover the Spades repositories and rules before selecting the canonical source; build remaining titles against shared contracts.
6. **3D flagship experiences:** prototype the highest-value 3D gameplay vertical slice only after the specific title's camera, core loop, platform targets and asset pipeline are documented.

## Required acceptance per title

A title is not "playable complete" until a tester can launch it, understand the objective, use its controls, complete a representative gameplay loop, experience win/loss or resolution states, hear/adjust audio, save and reload supported progress, and recover from errors. Verify responsive layouts and actual touch/keyboard/controller support as claimed. Capture reproducible test steps, screenshots or recordings, console/build logs, test results and commit correlation.

## Governance

- Work only on isolated development branches and staging previews until acceptance.
- Preserve the protected last-known-good production baseline.
- G02 remains FAIL / UNVERIFIED; downstream release gates remain held.
- No production route changes, live credential activation, paid purchases, merges, deployments or promotions without their separate required authorization and verified gates.
- Do not register or install plugins indiscriminately. Record official source, version, license, dependencies, engine compatibility, security review and test evidence before approval.
- Never copy protected GTA, Call of Duty, Zelda, Crash or Casper content. Use those only as high-level genre/quality references; create original LINGO intellectual property.

## Immediate next actions

1. Reconcile source repositories and all existing playable staging apps.
2. Recover complete source snapshots and asset manifests for the three existing playable previews and KottonsCode.
3. Run clean builds and functional playtests without modifying production.
4. Identify and close the first title-specific gameplay, audio, visual, save and input gaps.
5. Repeat across the portfolio and publish an evidence-based readiness matrix.
