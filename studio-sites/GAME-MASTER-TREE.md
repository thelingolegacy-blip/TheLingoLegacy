# LINGO Universe — Master Game Tree & Design Bible
**Design baseline:** v1.0 draft for creator approval · **Branch:** studio/lingoarcade-lingoslots-enterprise-2026-10-11 · **State:** specification committed for review, not production-certified.

## 1. Canonical hierarchy
```text
THE LINGO LEGACY
├── Universe Portal / LINGO Nexus
│   ├── Lingo ID (identity; not yet connected here)
│   ├── Shared Profile / Consent / Accessibility
│   ├── Shared Event Fabric → Policy Engine → Worker Runtime
│   ├── Shared XP / Achievements / Quest Flags
│   ├── Store & Commerce Connectors (separate from game balances)
│   ├── Asset Registry / Media Pipeline / Audio / Voice
│   ├── Leaderboard Service (server-authoritative)
│   ├── Rewards Service (policy checked)
│   ├── Ledger / Reconciliation / Audit
│   ├── Notifications / Referral Attribution
│   └── Observability / Feature Flags / Release Gates
├── LINGOarcade (hub, discovery, rotating casual games)
├── LINGOslots (virtual-only reels and skill mini-games)
├── That's My Lingo (signature virtual slot experience)
├── Spades Is My Lingo (card tutorial and non-wagering play)
├── UhNo Lingo University (trivia, word and logic)
├── Kotton's Code (family story / WORD, HEART, FRIENDSHIP, DREAM, LEGACY)
├── Tricia's Escape (route puzzle adventure)
├── Doughboy's Oasis (exploration / resource puzzles)
├── Crazy Weasols (comedy / reflex / co-op)
├── Silly in Philly: The Streets Run on Loyalty (fictional-city narrative)
├── Jersey Shore: The Undead (stylized survival horror)
├── Lingo Eruptions (chain puzzle / timing)
└── Cashman Lingo Mania (fictional ledger / symbol puzzles; no real cash)
```

## 2. Product constitution — applies to every title
1. Each game owns its title, lore, characters, mechanics, art direction, sound identity, rulebook, scoring and accessibility profile.
2. Shared identity/progression does not imply shared wallets or automatic cross-store redemption. Cross-world rewards are explicit, policy-checked events.
3. Demo coins and XP are virtual, non-cash, non-transferable and non-redeemable. No deposits, cash-out, paid spins, wagering or cash prizes in this specification.
4. Core story progression cannot be pay-gated. Difficulty must be communicated; tutorials and retry/hint paths must be available.
5. No active sweepstakes or prize promotion until official rules, eligibility, geography, dates, prize disclosures, free entry method where required, privacy terms and qualified legal review are approved.
6. No real account, authoritative balance, score, prize, referral reward or leaderboard is trusted from browser state. Server-side validation is mandatory before production.
7. Original IP only or documented rights: no unlicensed characters, logos, music, fonts, voices or third-party franchise imitation.
8. Accessibility baseline: keyboard navigation, focus visibility, captions/transcripts, contrast, reduced motion, non-audio cues, scalable text and pause controls where relevant.
9. Data minimization: age/territory controls appropriate to each product, consent/version records, account export/deletion, retention policy and incident response.
10. Fail-closed release: SOURCE → EVIDENCE → VERIFICATION → ACCEPTANCE → PASSED → AUTHORIZATION → PROMOTION. No merge/deploy/activation while required gates are blocked.

## 3. Shared account, progression and ledger model
- **Identity:** Lingo ID via Firebase Auth or approved equivalent; verified email where suitable; recovery, deletion/export, consent and policy versions.
- **XP:** progression-only; event has event_id, user_id, game_id, amount, source, session_id, timestamp, policy_version and idempotency key.
- **Achievements:** stable achievement_id, version, criteria, grant policy, revocation/reversal policy and localized description.
- **Quest state:** versioned flags, prerequisite graph, checkpoint, branch choices and save migration.
- **Demo wallet:** local prototype only. Production ledger must be append-only and server-authoritative with transaction_id, account_id, wallet_type, event_type, signed_amount, unit, source, idempotency_key, actor, status, correlation_id and reversal_of.
- **Leaderboard:** validated run/session, build version, score range, duration, anti-cheat signals, pseudonymous display name, opt-out, reset/tie rules and moderation/audit.
- **Referral:** opaque server-generated token, attribution consent, qualifying event, abuse/self-referral checks, caps, disclosures and reversal process.
- **Notifications:** separate in-app/email/push consent; deduplication, throttling, delivery logs, unsubscribe/suppression.
- **Store connector:** product/catalog/order status only through least-privilege verified APIs; game code cannot invent purchases or mutate orders.
- **Media registry:** asset_id, kind, path, version, SHA-256, owner, license, alt/transcript, variant, usage territory, source master and approval state.

## 4. Standard game tree
```text
GAME
├── Identity (title, logo, poster, genre, audience, content rating)
├── Player journey (discover → onboarding → tutorial → play → recap → return)
├── Rules (goal, controls, state machine, fail/win, scoring, assists, pause)
├── Content (world map → chapters/levels → encounters → endings)
├── Systems (save, XP, achievements, events, anti-cheat, moderation)
├── Economy (demo-only rules, reward eligibility, caps, ledger integration)
├── UI (home, pause, settings, help/rules, scoreboard, results, error states)
├── Media (key art, character sheets, UI kit, animations, SFX, music, voice, captions)
├── Accessibility & safety (controls, motion, audio alternatives, age/territory)
├── Services (identity, save, score, rewards, telemetry; mock vs production boundary)
└── Acceptance (tests, security, rights, accessibility, telemetry, independent QA)
```

## 5. Shared scoring / reward rules
- Skill game scores are deterministic from validated inputs where possible. Randomized outcomes disclose their nature and do not promise outcomes.
- XP grants are bounded per activity/session/day and idempotent. Replays cannot duplicate grants.
- Leaderboard points and wallet balances are separate concepts.
- Cosmetics, story flags and badges are preferred rewards; no cash value or redemption promise.
- Every score screen explains score components, assist usage and any ranking eligibility.
- Anti-cheat: server checks bounds, timing, replay, duplicate submission, build version and suspicious patterns; suspicious runs are withheld pending review, not silently accepted.
- Tie rules and reset windows are published per leaderboard.

## 6. Master asset & production pipeline
Brief → canon lock → design doc → flow map → graybox → mechanics prototype → playtest → script/beat sheet → storyboard → animatic → asset production → implementation → accessibility/rights review → QA → release candidate → independent verification → approval → controlled release.
Each asset gets a manifest entry and rights evidence. AI-generated assets must be reviewed for brand consistency, similarity, artifacts, age suitability and rights terms. Voice likeness requires explicit authorization. Audio has transcript/cue labels and mute/volume controls. Animation includes reduced-motion variant.

## 7. Master test gates
- G0: approved scope, canon and ownership.
- G1: design/rules complete and no unresolved critical ambiguity.
- G2: real runner assigned; runner_id > 0, runner name populated, steps instantiated, sentinel executed and logs retrievable.
- G3: unit, integration, build, lint and content-schema checks pass.
- G4: security/privacy/anti-cheat and economy abuse review passes.
- G5: accessibility and device/browser coverage passes.
- G6: all media rights, captions, alt text and provenance accepted.
- G7: game QA, save migration, telemetry and failure recovery pass.
- G8: independent public reachability and route tests pass.
- G9: required human approvals and review checks pass.
- G10: controlled release, rollback path and post-release monitoring accepted.
**Current governance note:** this document does not change the existing G02 runner block or authorize production deployment.

## 8. Per-title specification index
| Title | Primary loop | Story / progression | Core skill |
|---|---|---|---|
| LINGOarcade | Discover → select → play → recap | Portal/world unlocks | Variety |
| LINGOslots | Free demo spin / symbol hunt | Emblems and cosmetic badges | Pattern recognition |
| That's My Lingo | Reels → result → optional quest | House of Symbols | Symbol literacy; no real-money stakes |
| Spades Is My Lingo | Learn → practice hand → score recap | Table stories | Card strategy |
| UhNo Lingo University | Choose subject → answer → review | Campus/archive | Knowledge and logic |
| Kotton's Code | Find clue → help → puzzle → reflect | Five Code Levels | Words, empathy, friendship |
| Tricia's Escape | Inspect → route puzzle → choose → escape | Exit Vector | Spatial logic |
| Doughboy's Oasis | Explore → gather clues → repair | Waterline | Planning |
| Crazy Weasols | Sort → relay → resolve chaos | Great Mix-Up | Reflex and cooperation |
| Silly in Philly | Gather items → rhythm → community event | Block Party Protocol | Rhythm and teamwork |
| Jersey Shore: The Undead | Scout → manage resources → stealth puzzle | Signal in the Fog | Planning and tension |
| Lingo Eruptions | Match → chain → stabilize | Pressure Point | Pattern speed |
| Cashman Lingo Mania | Inspect ledger → reconcile symbols | Golden Ledger | Accuracy and integrity |

## 9. Finalization boundary
The design baseline below is intentionally detailed enough to guide implementation, but "finalized" for production requires creator/canon approval, content ratings, legal review where needed, and executable acceptance evidence. These documents do not mean the games are fully implemented or deployed.
