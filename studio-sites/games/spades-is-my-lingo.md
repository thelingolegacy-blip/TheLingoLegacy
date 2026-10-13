# Spades Is My Lingo — Game Design Specification v1.0

**Status:** detailed design baseline for implementation and creator approval; not a claim of production completion.
**Genre:** Trick-taking card strategy and social practice

## Identity
- **Game ID:** SPADES_IS_MY_LINGO
- **Universe:** The Lingo Legacy / LINGO Nexus
- **Experience promise:** A distinct, self-contained game identity and mechanic set connected to shared opt-in identity and progression.
- **Core loop:** Tutorial → set practice preferences → deal hand → bid → play tricks → score explanation → rematch
- **Art direction:** Premium card table, legible suit/color distinctions, card-face accessibility patterns, clear trick highlight and table-specific character portraits.
- **Story arc:** Four at the Table: four original characters learn communication and sportsmanship through practice hands. Dialogue branches on asking for clarification, helping a novice and graceful play; results unlock table cosmetics.

## Rulebook
Practice/non-wagering by default. Teach objective, bidding, following suit, trump/spades, trick winner, nil rules and scoring variants before play. Variant selector must name the ruleset and explain differences; do not silently change rules. No wagering or cash prizes.

## Player flow
1. **Discover:** title card, genre/age-appropriate content notice, rules and accessibility shortcuts.
2. **Onboard:** controls, objective, scoring and one safe practice run.
3. **Play:** clear state transitions, pause/restart where appropriate, readable feedback and no hidden purchase dependency.
4. **Resolve:** explicit win/loss/completion condition and explainable score breakdown.
5. **Progress:** grant eligible XP/achievement/quest flags through idempotent events; rewards are separated from scores.
6. **Return:** optional next challenge, replay or exit. No coercive streak language or dark patterns.

## System tree
```text
Spades Is My Lingo
├── Identity: logo, poster, genre, content notice, versioned rules
├── Home: Play / Story / How to Play / Leaderboard / Settings / Help
├── Tutorial: objective → controls → example → practice → recap
├── Core mode: Tutorial → set practice preferences → deal hand → bid → play tricks → score explanation → rematch
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
Deck integrity, legal play, turn order, trick winner, score calculator per selected variant, reconnect/timeout behavior, screen reader labels, color-blind patterns.
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