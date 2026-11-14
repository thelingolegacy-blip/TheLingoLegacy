# GDeveloper — Shared Game Development Execution Standard

**Parent:** LLG Tech Corps / Software Engineering  
**Portfolio owner:** LINGOlegacy_MASTER  
**Status:** Engineering baseline for review; no game is certified by this document.

## 1. Mission and ownership

GDeveloper means **Game Developer**. It owns game design, game-engine engineering, interactive systems, asset pipelines, game QA and game operations across LINGOslots, LINGOarcade and LINGOlibrary interactive experiences. Google Developer Services (Firebase, Google Cloud and SDKs) remain a separate infrastructure/tooling function.

## 2. Portfolio coverage

### LINGOslots
- That’s My Lingo
- Spades Is My Lingo
- Uhno Lingo U-No
- Cashman Lingo Mania
- Lingo Lions Eruptions

### LINGOarcade
- Tricias Escape
- Doughboys Oasis
- Crazy Weasols
- Silly in Philly
- Jersey Shore: The Undead

### LINGOlibrary interactive experiences
- KottonsCode
- The Block I Grew Up On
- Say It Again
- Dice Shift Hotel
- Legacy Legends

The portfolio list is a scope map. Each title retains its own canon, ownership, audience, rules, content rating, accessibility profile and technical decision record.

## 3. Engine and platform selection

Choose per title based on mechanics, art fidelity, team capability, device targets, build size, licensing, performance and maintenance cost:
- **Unity:** suitable cross-platform mobile, 2D/3D and shared gameplay systems.
- **Unreal Engine 5:** suitable high-fidelity 3D, advanced rendering and large-world needs.
- **Web engines (Phaser/PixiJS or equivalent):** suitable lightweight browser-first 2D experiences.
- Avoid forcing a single engine across the portfolio. Record the choice and upgrade path in a title-specific ADR.

Target platforms (web, iOS, Android, desktop, smart TV) are explicitly approved per title; do not assume every game ships everywhere.

## 4. Shared technical architecture

- GitHub remains source authority; Git LFS or approved asset storage handles large binaries.
- Shared services are accessed through versioned contracts: identity, profile, catalog, save/progression, achievements, score/leaderboard, media, moderation and telemetry.
- The game client is untrusted for authoritative scores, inventory, progression, reward eligibility and wallet state.
- Server-authoritative services validate competitive results, idempotency, replay protection, rate limits and suspicious activity.
- Deterministic simulation/state resolution is preferred where fairness, replay, testing or multiplayer correctness requires it.
- Game content is data-driven and versioned; saves have explicit schema versions and migration tests.
- AI tools are optional production assistants. AI-generated content requires human review, provenance, rights and quality checks. No AI model receives player data by default.

## 5. Full production pipeline

`CONCEPT → CANON/RIGHTS → GAME BIBLE → UX/FLOW → GRAYBOX → PLAYABLE VERTICAL SLICE → ART/AUDIO → IMPLEMENTATION → INTEGRATION → QA → RELEASE CANDIDATE → INDEPENDENT ACCEPTANCE → AUTHORIZATION → CONTROLLED RELEASE`

Every stage produces an inspectable artifact. No design document or browser prototype is represented as a complete game.

## 6. Quality requirements

- Core loop, win/fail states, progression, pause, save/load, error recovery and onboarding.
- Character, environment, UI, animation, sound, voice, VFX and responsive layout.
- Accessibility: keyboard/controller navigation, focus, contrast, captions/transcripts, text scaling, reduced motion, audio alternatives and remappable controls where applicable.
- Performance budgets per device class; memory, load time, frame pacing, battery and network-loss behavior.
- Security: input validation, server authority, anti-cheat, abuse prevention, account/session boundaries and safe error handling.
- Content safety: age rating, moderation, privacy, geography and parental/family controls where applicable.
- Asset rights: original or licensed assets only; source, license, territory, duration, consent and approval recorded.
- Monetization remains disabled by default. Virtual demo balances are non-cash, non-transferable and non-redeemable. Sweepstakes/prize mechanics require separate legal and compliance approval.

## 7. Per-title execution packet

Each title must link:
- approved game brief and canon bible;
- mechanics, state machine, rules, economy and progression specification;
- engine/platform ADR and build instructions;
- asset registry, rights evidence and checksums;
- API/schema contracts and mock/production boundary;
- unit, integration, deterministic/replay, accessibility, security and device test plans;
- performance budget and profiling evidence;
- release checklist, rollback and monitoring runbook;
- independent QA report and human acceptance record.

## 8. Release gates

G0 scope/canon/ownership; G1 design and rules; G2 runner assignment and executed sentinel evidence; G3 build/unit/integration; G4 security/privacy/economy; G5 accessibility/device QA; G6 rights/provenance; G7 save/progression/telemetry/recovery; G8 independent route/reachability; G9 human approvals; G10 controlled release and rollback monitoring.

Each gate is blocked until retrievable evidence is correlated to exact commit, build, environment and artifact. Current G02 remains FAIL / UNVERIFIED; downstream gates remain held. This standard does not authorize merge, deployment or production promotion.

## 9. Visual and audio production

Original visual direction, UI systems, character sheets, animation states, sound cues, voice and cinematic sequences are developed as title-owned assets using shared technical pipelines. Maintain editable masters, export presets, naming conventions, metadata, accessibility alternatives and source/license records. No unlicensed franchise characters, logos, music or likenesses.

## 10. Current disposition

This is the common execution standard for GDeveloper planning. Actual implementation, QA, rights clearance and release status must be reported per title. A registry entry, concept art, asset pack or local prototype is not production acceptance.