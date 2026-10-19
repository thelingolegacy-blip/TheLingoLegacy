# LINGOarcade + LINGOslots — Experience Implementation Plan

**Branch:** `studio/game-experience-completion-2026-10-19` · **Surface:** `studio-sites/experience/` · **Release authority:** preview only.

## Implemented in this branch
- Interactive selector for five LINGOarcade worlds and five LINGOslots titles.
- Data-driven characters, motives, signature moves, voice direction, chapter beats and missions.
- Local mission briefing/completion feedback and reset control.
- CSS-generated animated portal/world treatments and theme accents.
- Opt-in procedural sound cues; muted by default.
- Responsive layouts and reduced-motion support.
- JSON content registry with explicit virtual-only and fail-closed policy.
- Static validation workflow; no deployment step.

## Content coverage
| Division | Worlds |
|---|---|
| LINGOarcade | Tricia’s Escape; Doughboy’s Oasis; Crazy Weasols; Silly in Philly: The Streets Run on Loyalty; Jersey Shore: The Undead |
| LINGOslots | That’s My Lingo; Spades Is My Lingo; UhNo Lingo University; Lingo Eruptions; Cashman Lingo Mania |

Each world includes a setting, logline, visual direction, mechanic summary, three character concepts, two chapter outlines, three missions and four sound-cue labels.

## Remaining production work
1. Creator/canon review for story, names, dialogue and continuity.
2. Original art: character model sheets, turnarounds, expressions, backgrounds, UI atlas, animation source and optimized exports.
3. Audio production: cue-specific compositions, ambience, mix/master, captions, provenance and rights evidence. Procedural tones are sound-direction previews, not final scored assets.
4. Implement each named gameplay mechanic in its target engine; add deterministic tests and save/version migration.
5. Add authenticated identity, server-authoritative score/XP, idempotent events, privacy controls and anti-cheat where applicable.
6. Complete accessibility review, real-device browser QA, performance budgets, security review, asset integrity and IP/license review.
7. Obtain real CI runner assignment/logs, immutable artifact provenance, independent preview reachability, acceptance and rollback evidence.
8. Promote production only after every applicable gate passes and explicit authorization is recorded.

**Important:** this is a substantive studio experience and content baseline, not evidence that every standalone game is complete, certified, legally cleared or production-ready.
