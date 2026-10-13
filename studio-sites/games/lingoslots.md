# LINGOslots — Game Design Specification v1.0

**Status:** detailed design baseline for implementation and creator approval; not a claim of production completion.
**Genre:** Virtual-only reel demo and symbol puzzle

## Identity
- **Game ID:** LINGOSLOTS
- **Universe:** The Lingo Legacy / LINGO Nexus
- **Experience promise:** A distinct, self-contained game identity and mechanic set connected to shared opt-in identity and progression.
- **Core loop:** Read rules → choose demo spin → reels animate → show result and explanation → optional symbol quest
- **Art direction:** Gold-framed reels, purple energy trails, unique symbol family, non-flashing wins, restrained motion, opt-in synthesized UI audio.
- **Story arc:** Reel Rally: symbols from different worlds appear in a portal machine. Find emblems in a separate skill-based symbol hunt to unlock lore and cosmetic badges; the story never depends on spending coins.

## Rulebook
Demo coins only, no monetary value. No deposits, cash-out, paid spins, wagering, prizes or redemption. Outcomes use a documented pseudorandom demo model; do not market as gambling odds or promise returns. Provide clear stop/pause, sound off, result history and responsible-play information. No purchase-linked rewards.

## Player flow
1. **Discover:** title card, genre/age-appropriate content notice, rules and accessibility shortcuts.
2. **Onboard:** controls, objective, scoring and one safe practice run.
3. **Play:** clear state transitions, pause/restart where appropriate, readable feedback and no hidden purchase dependency.
4. **Resolve:** explicit win/loss/completion condition and explainable score breakdown.
5. **Progress:** grant eligible XP/achievement/quest flags through idempotent events; rewards are separated from scores.
6. **Return:** optional next challenge, replay or exit. No coercive streak language or dark patterns.

## System tree
```text
LINGOslots
├── Identity: logo, poster, genre, content notice, versioned rules
├── Home: Play / Story / How to Play / Leaderboard / Settings / Help
├── Tutorial: objective → controls → example → practice → recap
├── Core mode: Read rules → choose demo spin → reels animate → show result and explanation → optional symbol quest
├── Story: chapter map → scene → choice → encounter → checkpoint → ending
├── Results: score components → XP eligibility → badge / quest state
├── Player controls: pause, restart, sound, captions, motion, text scale
├── Persistence: guest-local save; production sync only after authenticated service
├── Events: session_start, tutorial_complete, run_complete, score_submitted,
│          quest_choice, achievement_earned, settings_changed, error_recovered
├── Media: key art, logo, UI kit, characters, backgrounds, animation, SFX, music
└── Release: tests → security → accessibility → rights → independent QA → approval
```

## Scoring and rewards
- Score inputs, formula, rounding and tie-break rules must be documented in executable tests before release.
- XP is separate from score and wallet balance. Apply per-session/day caps and idempotency keys.
- Do not trust client-submitted balance or score. Production leaderboard submissions require server validation, version/build identity, timing bounds and anti-cheat checks.
- Cosmetic/story rewards only in this baseline. No real-money wagers, payouts, cash-out, paid spins or redeemable prizes.

## UX and accessibility
- Keyboard/touch/controller input where relevant; visible focus; minimum readable contrast and scalable text.
- Captions/transcripts for speech and meaningful sound; visual alternative to essential audio cues.
- Respect reduced-motion; no rapid strobing; pause/exit always reachable.
- Clear loading, offline, retry, empty leaderboard, service failure and save-conflict states.
- Localization-ready UI strings; avoid text embedded in artwork where possible.

## Content and asset checklist
- Approved wordmark and app icon in SVG + PNG exports.
- Key art, title card, UI symbols, character/world sheets and animation states.
- Audio cue sheet, licensed/owned music, sound effects, voice script, pronunciation notes and captions.
- Asset manifest: asset_id, kind, path, version, SHA-256, owner, license, territory, alt/transcript, variants, source master and approval status.
- Every AI-generated visual/audio item receives creator review for quality, brand fit, similarity, rights terms and age suitability.

## Data and services
- **Prototype:** local state only, clearly labeled as demo.
- **Production:** Lingo ID, server save, score API, XP/achievement service, telemetry, moderation/report path and deletion/export support.
- Events are versioned and privacy-minimized. Do not collect precise location or unnecessary personal information.
- Store, referral, notifications and wallet integrations are least-privilege services, never direct trust from the client.

## QA acceptance matrix
No negative balances, result state consistency, rapid-click debounce, keyboard controls, audio opt-in, reduced motion, clear virtual-only disclosure.
- Rules can be completed without ambiguity; tutorials accurately reflect implementation.
- All win/loss/pause/restart/exit/error paths are covered.
- Save/reload and version migration do not duplicate rewards or corrupt progress.
- Accessibility, content rating and asset rights are signed off.
- Telemetry is schema-validated and contains no secrets or unnecessary PII.
- Server rejects malformed, duplicated, impossible or out-of-range score/reward events.
- Rollback and feature-flag disable path are tested before any release.

## Open release dependencies
- Creator/canon approval of story, names, character sheets and endings.
- Final rating, localization and territory rules.
- Approved original/licensed media and voice rights.
- Production backend and account integration.
- Successful runner dispatch, CI logs, test evidence, independent reachability and required human approvals.

**Release state:** design specified; implementation/certification/deployment must be proven separately.