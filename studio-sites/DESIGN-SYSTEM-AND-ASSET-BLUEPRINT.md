# LINGO Studio Design System & Asset Production Blueprint

Status: implementation baseline / production media not yet cleared.
Owner: The Lingo Legacy.
Tagline: Loyalty. Legacy. Language.
Canonical product names: LINGOarcade, LINGOslots, LINGO Nexus.

## 1. Art direction
- Core look: Industrial Noir — deep black graphite surfaces, restrained metallic highlights, gold for status/value, royal purple for world identity, controlled crimson for alerts and high-energy moments.
- Layout: editorial hero + asymmetric stage; modular game tiles; visible information hierarchy; high contrast and generous tap targets.
- Materials: brushed metal, smoked glass, etched glyphs, subtle grain. Avoid cluttered casino clichés, copied third-party marks, misleading real-world value cues, and uncontrolled neon.
- Motion: 160–240 ms interface transitions; 450–700 ms reward reveals; longer world transitions only when skippable. Respect reduced-motion preferences.
- Sound: opt-in, muted by default, short original procedural UI tones for prototype; no external audio dependency. Every cue has a mute path and a non-audio visual equivalent.

## 2. Design tokens
| Token | Value | Use |
|---|---|---|
| ll-ink | #08090D | Global background |
| ll-panel | #14131A | Panels/cards |
| ll-metal | #777985 | Neutral border and secondary metal |
| ll-gold | #F7C95F | Primary highlight, XP and loyalty indicators |
| ll-purple | #6F35B5 | World identity / primary actions |
| ll-crimson | #F15B67 | Error, hazard, critical state only |
| ll-text | #F7F4FB | Primary text |
| ll-muted | #B6B1C2 | Secondary text |
| ll-radius-card | 16px | Card surfaces |
| ll-radius-control | 10px | Buttons and form controls |
| ll-focus | 3px solid #F7C95F | Keyboard focus indicator |

Use tokens as a shared system; per-world palettes may add accents but cannot replace accessible text/focus contrast.

## 3. Component inventory
- Global shell: brand lockup, route navigation, sound toggle, environment/status badge.
- World card: title, genre, short hook, status, original icon, accessible action label.
- Game stage: responsive game surface, pause/help/settings actions, state announcement region.
- Primary/secondary/destructive buttons with disabled, loading, focus, hover and pressed states.
- Tabs/navigation with current state communicated semantically, not color alone.
- Wallet card: clearly labeled virtual demo balance; never implies monetary value.
- Ledger row: event ID, timestamp, reason, signed virtual delta, resulting balance, correlation ID; server-authoritative ledger required for real accounts.
- Scoreboard: season/window, score, rank, game mode, data freshness, anti-cheat status; demo data visibly labeled.
- Story chapter card: chapter title, objective, accessibility options, progress, content rating.
- Referral card: local-only preview until authenticated attribution and abuse prevention exist.
- Notification center: unread count, category, timestamp, dismissal state and preference control.
- Settings panel: audio, motion, captions, text scale, contrast, controls, privacy, account, session.
- Rules/safety panel: scoring, progression, eligibility, privacy, virtual economy and dispute contact.
- Empty/error/loading/offline states for each data-driven panel.
- Confirmation modal for irreversible account actions; no destructive action on hover or single ambiguous tap.

## 4. Screen inventory
1. Universe portal — discover all registered game identities, status labels and access routes.
2. LINGOarcade — world catalog, genre filters, featured story, continue-playing and studio pipeline.
3. LINGOslots — demo machine, bet selector using valueless demo coins, spin, result explanation, paytable/rules, reset and session history.
4. Player dashboard — overview, mini-games, story, leaderboards, rewards, virtual bank/ledger, referrals, notifications, rules, settings, account.
5. Game detail — synopsis, content note, mode, players, controls, accessibility, release state and launch action.
6. Story mode — chapter map, scene beats, dialogue, objective, choices, checkpoints, consequence summary and recap.
7. Scoreboard — filter by game/mode/season, sorting, personal best and demo/server-authoritative labels.
8. Wallet/ledger — virtual balances by currency, append-only entries, reconciliation and audit metadata.
9. Rewards — XP, achievements, streaks and earned cosmetic unlocks; no purchasable chance or cash-equivalent prize.
10. Sweepstakes — disabled until legal counsel approves official rules, jurisdictions, eligibility, disclosures, privacy, drawing and no-purchase route where applicable.
11. Identity — sign-up/login UI can be prototyped; production account creation requires real identity service, validation, rate limiting, session security and privacy controls.
12. Studio operations — build provenance, gate state, last-known-good pointer and release evidence; no client-side control can authorize production activation.

## 5. Original asset brief templates
Create each asset from original concepts and verify rights before production use. Do not copy trademarked logos, game UI, recognizable characters, or third-party soundtracks.

### LINGOarcade logo
Original monogram LA built from etched graphite-metal strokes, gold edge light, a restrained royal-purple glow, clean geometric silhouette, transparent background, centered, scalable vector-like finish, no mockup, no extra text, no third-party marks.

### LINGOslots logo
Original LS / LINGOslots identity with a machined metallic frame, gold highlight, deep purple inner light and a single restrained crimson signal; premium arcade, not a real-money casino advertisement; transparent background; no coins implying cash value, no third-party marks.

### Universe tile icons
Produce one consistent icon per game. Use distinctive silhouettes and the relevant game mood; maintain consistent stroke, lighting direction, optical scale and safe-area. Export SVG master plus optimized WebP/PNG fallback and accessible text label.

### Motion set
- brand-idle: low-amplitude light sweep, loop 6–8 seconds.
- tile-hover: lift 2–4 px, subtle edge glow, never essential to comprehension.
- chapter-reveal: title + one thematic glyph; skip button always present.
- reward-earned: concise confirmation and explicit virtual/cosmetic reward name.
- error-state: static icon and clear explanation; do not rely on shaking/flashing.
- loading: progress indicator with status text; reduced-motion static alternative.

### Audio cue set
ui-focus, ui-confirm, ui-back, world-enter, chapter-complete, reward-earned, error-soft. Keep brief, original, user-controlled and nonessential. Store source master, compressed web version, loudness, duration, rights, and cue description.

## 6. Export and manifest requirements
For each production asset capture stable asset_id, game, category, path, semantic version and SHA-256; source master and runtime export; creator/owner, license, evidence of rights, territory and expiration if applicable; alt text, transcript/cue description, focal point, light/dark variant; dimensions, format, file size, color profile and dependency references; status draft/review/approved/rejected/retired; approval record and reviewer. Only approved assets with verified rights may be promoted.

## 7. Interaction and accessibility acceptance
- Keyboard-only navigation reaches every action in logical order.
- Focus is visible and never trapped; modal focus returns to trigger.
- Inputs have persistent labels and useful error messages.
- Color is never the only carrier of state.
- WCAG 2.2 AA contrast targets are checked in actual rendered UI.
- Text scales to 200% without clipping or loss of function.
- Reduced motion disables nonessential animation; audio is off until explicit opt-in.
- Game results, balance changes and notifications are announced to assistive technology.
- Touch targets aim for 44×44 CSS px.
- No auto-playing audio, deceptive countdowns, manipulative near-miss effects, or simulated monetary wins.

## 8. Production completion definition
A design is not production-complete until original source files and exports exist, hashes and provenance are recorded, rights are cleared, the asset manifest validates, visual regression checks pass, browser/mobile QA passes, accessibility is reviewed, and the relevant game service is authenticated and server-authoritative. A prompt or placeholder is not an asset deliverable. This document is a production blueprint, not evidence that all art, audio or animation files have already been generated.