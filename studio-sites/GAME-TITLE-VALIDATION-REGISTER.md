# GDeveloper — Title-Specific Game Validation Register

**Parent standard:** [GDeveloper Game Development Execution Standard](GAME-DEVELOPMENT-EXECUTION-STANDARD.md)  
**Master design source:** [Game Master Tree](GAME-MASTER-TREE.md)  
**Date:** 2026-11-07  
**Status:** validation planning and source review; no title is independently accepted or production-certified.

## Validation method

The repository contains game design specifications and several local/prototype implementation plans. This register distinguishes document presence from executable evidence. No gameplay build, device matrix, network integration, asset-rights package or independent acceptance is inferred from a design document.

Common mandatory tests for every title:
- Install/build and startup on every declared platform/device class.
- First-run tutorial, controls, pause/resume, exit, restart, win/loss/complete and error/recovery states.
- Deterministic or seeded mechanics tests where fairness/reproducibility matters.
- Save/load, schema migration, interrupted session and offline/network recovery.
- Server-authoritative identity, score, inventory and reward tests wherever connected.
- Keyboard/controller/touch, screen reader labels, contrast, text scaling, captions/transcripts, audio alternatives and reduced-motion.
- Performance/memory/frame pacing/load time and low-end device tests.
- Content rating, privacy/age/territory, moderation, asset and voice/music rights review.
- Artifact, source commit, build environment, test logs, defect disposition and independent signoff.

## Title validation matrix

| Portfolio | Title / canonical identity | Spec found | Title-specific acceptance focus | Current disposition |
|---|---|---:|---|---|
| LINGOslots | That’s My Lingo | Yes | Reel math/weighted outcomes, paytable consistency, demo balance invariants, no real-value wagering or cash-out, clear odds/rules disclosure, animation/audio accessibility | Design baseline; tests not evidenced |
| LINGOslots | Spades Is My Lingo | Yes | Deal integrity, bidding, follow-suit, trump, nil and scoring variants, deterministic replay, table-state recovery and accessible card identification | Design baseline; tests not evidenced |
| LINGOslots | Uhno Lingo U-No / UhNo Lingo University | Yes, under alternate name | Confirm canonical title; rules/question correctness, ambiguity review, learning explanations, reading-level and timer accessibility | Naming decision open; tests not evidenced |
| LINGOslots | Cashman Lingo Mania | Yes | Ledger/puzzle arithmetic, immutable score history, clear explanations, no cash-value or payout implication | Design baseline; tests not evidenced |
| LINGOslots | Lingo Lions Eruptions | No dedicated title spec located | Author canon/game bible, define mechanics, title-owned visual/audio identity, state machine, safety and acceptance tests | Blocked: spec/canon gap |
| LINGOarcade | Tricias Escape | Yes | Route-graph solvability, clue consistency, assist/retry path, checkpoint integrity and spatial accessibility | Design baseline; tests not evidenced |
| LINGOarcade | Doughboys Oasis | Yes; expanded spec and Unity vertical-slice planning also found | Vertical-slice scope, world streaming/performance, deterministic state, race handling, save migration, network failure, server-authoritative progression and economy boundaries | Detailed planning/prototype path; QA evidence not verified |
| LINGOarcade | Crazy Weasols | Yes | Physics determinism, collision edge cases, co-op synchronization if enabled, safe chaos/motion limits and recovery | Design baseline; tests not evidenced |
| LINGOarcade | Silly in Philly | Yes | Fictional geography/cultural review, rhythm timing/latency, music/voice rights, accessibility alternatives and branch rejoin | Design baseline; tests not evidenced |
| LINGOarcade | Jersey Shore: The Undead | Yes | Content rating, co-op/network disconnect/rejoin, save consistency, accessibility and intensity controls | Design baseline; tests not evidenced |
| LINGOlibrary | KottonsCode / Kotton’s Code | Yes | Creator-approved canon, child-directed privacy, parental/family controls, age-appropriate content, image/voice rights, accessibility and no unnecessary child data | Design baseline; privacy/canon review remains required |
| LINGOlibrary | The Block I Grew Up On | No individual title spec located | Author book/game brief, audience/content rating, rights, story structure and reading/accessibility plan | Blocked: title spec gap |
| LINGOlibrary | Say It Again | No individual title spec located | Author book/game brief, interaction loop if digital, rights and accessibility plan | Blocked: title spec gap |
| LINGOlibrary | Dice Shift Hotel | No individual title spec located | Author game bible, dice probabilities/rules, deterministic test fixtures, accessibility and demo-economy boundary | Blocked: title spec gap |
| LINGOlibrary | Legacy Legends | No individual title spec located | Author story/game brief, canon/character ownership, progression and rights package | Blocked: title spec gap |

## Platform and catalog validation

| Surface | Required checks | State |
|---|---|---|
| LINGOarcade hub | Catalog schema, title metadata, age rating, availability flags, launch/empty/error states, deep-link routing | Not executed |
| LINGOslots hub | Demo-only labels, no real-value transactions, title routing, accessible rules/help, balance reset/invariants | Not executed |
| LINGOlibrary catalog | Book vs interactive work type, author/creator rights, edition/version metadata, age/readability tags, correct world ownership | Not executed |
| Shared GDeveloper services | Lingo ID boundary, profile consent, save schema, progression idempotency, asset registry, telemetry minimization, moderation and rollback | Not executed |

## Cross-title safety and economy gates

- Demo currency and XP are virtual, non-cash, non-transferable and non-redeemable.
- No deposits, cash-out, paid spins, wagering, real-value prizes or sweepstakes activation in this baseline.
- Scores, rewards, entitlements and wallet state from a client are untrusted.
- Child-facing titles require a dedicated privacy, consent and parental-controls review before collecting account or gameplay data.
- AI-generated art, audio, voice or story content requires human quality review, rights/provenance records and likeness consent where applicable.
- No unlicensed characters, brands, music, voices or franchise assets.

## Evidence required per title

A title can move from design to implementation only with an approved brief and engine/platform ADR. It can move from prototype to staging only with a reproducible build and test logs. It can be accepted only with:
1. exact commit/build/environment/artifact identifiers;
2. completed unit, integration, gameplay and device/browser tests;
3. security/privacy, accessibility, rights and content-rating signoffs;
4. defects triaged with no unresolved release-blocking issues;
5. separate independent QA report and named human acceptance;
6. rollback, monitoring and support plan.

**Current release authority:** PROTECTED HOLD; G02 FAIL / UNVERIFIED; downstream gates remain held. This register does not authorize merge, deployment, monetization, prize activation or release.