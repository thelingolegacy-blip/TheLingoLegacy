# Doughboy’s Oasis — Completion Wave 1 Design

**Date:** 2026-11-13  
**Status:** Approved execution direction under the founder’s explicit request to proceed with available work; branch-only until verification and review  
**Product:** Doughboy’s Oasis / Money Mile  
**Authority:** `thelingolegacy-blip/TheLingoLegacy`, GitHub `main`

## Intent
Turn the existing Doughboy’s Oasis browser prototypes into one coherent, playable first-game experience. Prioritize the existing exploration vertical slice, campaign state, racing prototype and Oasis Exchange over starting additional game launches. This is the first complete-game workstream in the LINGO portfolio.

## What exists
- `studio-sites/games/doughboys-oasis-vertical-slice.html`: an exploration/life-simulation prototype with local save, NPC interactions, missions, crew creation, territory, checkpoints, radio controls and settings.
- `studio-sites/games/doughboys-oasis-racing/index.html`: a Canvas 2D story-racing prototype.
- `studio-sites/games/doughboys-oasis-racing/campaign-state.js` and tests: a guest-local, idempotent story progression model.
- `studio-sites/games/doughboys-oasis-store.html`: an Oasis Exchange prototype using earned demo currency only.
- `studio-sites/games/doughboys-oasis-856-region.html`: a fictional district atlas.

The racing page currently references five DOM IDs that are not present in its HTML (`jobState`, `inviteState`, `qualState`, `qualProgress`, `finalState`). Its initial UI render can therefore fail before gameplay begins.

## Goals
1. Repair the race prototype’s missing mission UI contract and preserve campaign gating.
2. Give the existing modes one clear game entry point linking Story/Explore, Money Mile Racing, Oasis Exchange and the 856 Atlas.
3. Keep the current no-build, static-browser delivery model and existing Canvas 2D implementation for this wave.
4. Preserve responsive touch and keyboard play, readable HUD, local-save disclosure, pause/exit/retry clarity and reduced-motion support.
5. Keep demo currency local, fictional and non-transferable. No real-money wagering, cash-out, paid spins, redeemable prizes or payment activation.
6. Add repeatable source-level regression tests for DOM contracts and launcher routes.
7. Document remaining production dependencies without claiming the game is launch-certified.

## Non-goals
- No migration to Phaser, Unity or a new framework in this wave; that would add risk and delay without solving the immediate broken UI contract.
- No production account sync, cloud saves, leaderboard authority, wallet integration, real payments, GPS or live multiplayer.
- No publishing, deployment, custom-domain routing or public monetization activation.
- No use of unapproved licensed characters, music or third-party artwork.

## Approaches considered
1. **Repair and connect the existing static Canvas 2D experiences — selected.** Lowest-risk path; preserves current source and delivery model, fixes the known blocker, and connects the existing prototypes into one coherent game floor.
2. **Migrate the game to Phaser + TypeScript + Vite.** Better long-term scene architecture, but requires a build pipeline and migration of existing prototype logic; defer until the first playable vertical slice is verified.
3. **Build a Unity WebGL release.** Appropriate for a later richer cross-platform game, but materially increases asset, build, hosting and CI requirements.

## Architecture
The existing campaign-state module remains the authoritative client-side prototype model for story facts and race unlocks. Canvas rendering remains presentation-only. The launcher is navigation, not a new game engine. The Oasis Exchange remains a separate local demo ledger and must disclose that it is not connected to the campaign save or any real financial service unless a later verified integration is implemented.

## Acceptance
- Every DOM selector used by the racing page resolves to exactly one element.
- The initial racing UI renders without null-reference failure.
- Story prerequisites prevent out-of-order mission, race and Nexus completion.
- The game launcher links only to existing, verified source paths.
- Mobile and desktop layouts remain usable; keyboard and touch controls are discoverable.
- Tests are added and executed where the available runtime permits; unavailable CI execution is recorded as blocked, never passed.
- All release status remains prototype / staging until browser playtest, asset-rights review, accessibility review and backend/security acceptance are complete.
