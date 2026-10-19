# The Lingo Legacy — Canonical Game Build Ledger

**Record version:** 1.0  
**Prepared:** 2026-10-19  
**Authority:** `thelingolegacy-blip/TheLingoLegacy`  
**Branch:** `docs/game-build-ledger-2026-10-19`  
**Disposition:** Draft evidence register; not a release certification.

## Purpose and operating rule

This ledger separates design intent, source artifacts, interactive prototypes, verified builds, deployed surfaces, and production acceptance. A registry status, README statement, successful source fetch, or deployment marked READY is not by itself proof that the complete game works.

**Fail-closed evidence chain:** SOURCE → EVIDENCE → VERIFICATION → ACCEPTANCE → PASSED → AUTHORIZATION → PROMOTION.

No title is production-certified by this ledger. Blank or `NOT VERIFIED` fields are deliberate; do not infer a pass. Preserve the last-known-good production state while release gates are blocked.

## Evidence status vocabulary

- **DESIGN-SPEC** — design and mechanics are documented; a complete runnable build is not established.
- **DESIGN-PREVIEW** — discovery or presentation surface exists; not the full game.
- **LOCAL-DEMO** — local/browser interactions exist; persistence and authority may be local only.
- **STATIC-INTERACTIVE-PROTOTYPE** — interactions are implemented in a static page, not necessarily a full game runtime.
- **ISOLATED-DRAFT** — work is on an unmerged branch or draft PR.
- **DEPLOYMENT-OBSERVED** — a hosting provider reports a deployment; this is not complete-game QA.
- **BLOCKED** — a required gate has failed or lacks qualifying evidence.
- **NOT VERIFIED** — no qualifying evidence was established during this review.
- **PRODUCTION-CERTIFIED** — may be assigned only after all applicable release predicates and independent evidence pass.

## Canonical 13-title catalog

The canonical catalog is sourced from `studio-sites/config/game-registry.json`, `studio-sites/GAME-MASTER-TREE.md`, `studio-sites/GAME-BIBLE-INDEX.md`, and the per-title specifications in `studio-sites/games/`.

| ID / canonical title | Registry baseline | Current implementation evidence | Authoritative source / record | Build, commit, test, deployment evidence | Blockers / next evidence |
|---|---|---|---|---|---|
| `lingoarcade` — LINGOarcade | DESIGN-PREVIEW | Studio/discovery surface and isolated experience work; full arcade runtime not verified | [Game spec](../studio-sites/games/lingoarcade.md) · [Registry](../studio-sites/config/game-registry.json) | Build SHA: NOT VERIFIED; automated test output: NOT VERIFIED; manual QA: NOT VERIFIED; live game runtime: NOT VERIFIED | Define and verify each included playable mode; runtime engine and release artifact; responsive/accessibility QA |
| `lingoslots` — LINGOslots | LOCAL-DEMO | Browser/local demo documented; not a production-authoritative economy | [Game spec](../studio-sites/games/lingoslots.md) · [Registry](../studio-sites/config/game-registry.json) | Build SHA: NOT VERIFIED; test output: NOT VERIFIED; deployment-to-commit mapping: NOT VERIFIED | Verify demo behavior and asset loading; label all balances as virtual demo units; do not connect rewards to cash or redemption |
| `thats-my-lingo` — That’s My Lingo | DESIGN-SPEC in master registry; separate static virtual-play implementation exists | [THATS-MY-LINGO repository](https://github.com/thelingolegacy-blip/THATS-MY-LINGO) documents a static browser game with localStorage demo progress; public `/casino/` source includes local reel interactions | [Game spec](../studio-sites/games/thats-my-lingo.md) · [Dedicated repo](https://github.com/thelingolegacy-blip/THATS-MY-LINGO) · [QA release report](https://github.com/thelingolegacy-blip/THATS-MY-LINGO/blob/main/docs/qa-release-report.md) | Vercel observed production deployment on 2026-07-31 for commit `c69698b98f320743b706ca17b9ad60b1e801101f`; project metadata says `live: false` and latest listed deployment cancelled. Full current live-route verification: NOT VERIFIED. | Resolve five-reel versus historical 5×3 / 20-payline design discrepancy; replace dollar-like labels with unambiguous Demo Coins; collect current validation/smoke/manual QA outputs; verify live route and rollback target |
| `spades-is-my-lingo` — Spades Is My Lingo | DESIGN-SPEC | A separate repository exists, but its inspected README is a generic AI Studio starter; complete Spades mechanics/build not established | [Game spec](../studio-sites/games/spades-is-my-lingo.md) · [Separate repository](https://github.com/thelingolegacy-blip/Spades-is-my_Lingo) | Build SHA: NOT VERIFIED; gameplay QA: NOT VERIFIED; deployment: NOT VERIFIED | Reconcile repository content with canonical spec; verify trick-taking rules, bids, partnership scoring, bot logic, and end conditions |
| `uhno-lingo-university` — UhNo Lingo University | DESIGN-SPEC | A simplified local matching prototype was described in previous project records; current build and exact canonical name not independently verified | [Game spec](../studio-sites/games/uhno-lingo-university.md) · [Registry](../studio-sites/config/game-registry.json) | Build SHA: NOT VERIFIED; tests: NOT VERIFIED; live route: NOT VERIFIED | Settle naming/format (University, U-NO, or alternate variant); verify complete game rules, progression and accessibility |
| `kottons-code` — Kotton’s Code | DESIGN-SPEC | Public explorer exists at `/kottons-code/`; game entry says “Games Coming Soon.” PR #313 is isolated interactive work; not released | [Game spec](../studio-sites/games/kottons-code.md) · [Engine repo](https://github.com/thelingolegacy-blip/Kotton-code-engine) · [PR #313](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/313) | Feature branch commit, qualifying CI execution, complete quest QA and production promotion: NOT VERIFIED | Verify PR #313 route behavior and quest flow; final story/art/audio/rights and child-safety QA; verify deployment path and live runtime |
| `tricias-escape` — Tricia’s Escape | DESIGN-SPEC | Transit mystery and route puzzle documented; runnable build not verified | [Game spec](../studio-sites/games/tricias-escape.md) | Build SHA: NOT VERIFIED; tests: NOT VERIFIED; deployment: NOT VERIFIED | Implement/test clue logic, route-state transitions, hint/retry behavior, save/load and chapter completion |
| `doughboys-oasis` — Doughboy’s Oasis | DESIGN-SPEC | Exploration/resource-puzzle design plus a separate larger OASIS concept; complete title build not verified | [Game spec](../studio-sites/games/doughboys-oasis.md) · [OASIS blueprint PR #294](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/294) | Build SHA: NOT VERIFIED; game QA: NOT VERIFIED; live runtime: NOT VERIFIED | Keep small exploration game distinct from OASIS: CREWS & LEGACIES; verify resource loop, environment state and completion conditions |
| `crazy-weasols` — Crazy Weasols | DESIGN-SPEC | Reflex/sorting/relay concept documented; runnable build not verified | [Game spec](../studio-sites/games/crazy-weasols.md) | Build SHA: NOT VERIFIED; tests: NOT VERIFIED; deployment: NOT VERIFIED | Verify input timing, scoring, difficulty, restart, reduced motion and keyboard/touch play |
| `silly-in-philly` — Silly in Philly: The Streets Run on Loyalty | DESIGN-SPEC | Fictional-city story/rhythm/community concept documented; runnable build not verified | [Game spec](../studio-sites/games/silly-in-philly.md) | Build SHA: NOT VERIFIED; tests: NOT VERIFIED; deployment: NOT VERIFIED | Define a bounded vertical slice, narrative choice/save rules, rights-cleared media and content-safety QA |
| `jersey-shore-undead` — Jersey Shore: The Undead | DESIGN-SPEC | Stylized survival-horror concept documented; runnable build not verified | [Game spec](../studio-sites/games/jersey-shore-undead.md) | Build SHA: NOT VERIFIED; tests: NOT VERIFIED; deployment: NOT VERIFIED | Verify stealth/threat state, radio/rescue loop, checkpoint/retry behavior, accessibility and content rating |
| `lingo-eruptions` — Lingo Eruptions | DESIGN-SPEC | Glyph matching/chain-reaction concept documented; standalone build not verified | [Game spec](../studio-sites/games/lingo-eruptions.md) | Build SHA: NOT VERIFIED; tests: NOT VERIFIED; deployment: NOT VERIFIED | Resolve possible “Lingo Lions” naming conflict; verify board logic, chain resolution, timing, scoring and non-strobing effects |
| `cashman-lingo-mania` — Cashman Lingo Mania | DESIGN-SPEC | Fictional ledger/symbol puzzle concept documented; runnable build not verified | [Game spec](../studio-sites/games/cashman-lingo-mania.md) | Build SHA: NOT VERIFIED; tests: NOT VERIFIED; deployment: NOT VERIFIED | Verify puzzle generator, answer validation, hints, progression and non-cash framing |

## Additional projects — tracked separately from the canonical 13

| Project | Evidence level | Source | Build/release status | Required next evidence |
|---|---|---|---|---|
| OASIS: CREWS & LEGACIES | Blueprint / prototype claims; full persistent world not verified | [PR #294](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/294) | Draft; production multiplayer, authoritative persistence, real GPS, console and VR builds NOT VERIFIED | Define platform-specific vertical slice; prove server authority, multiplayer sessions, territory persistence, security and operational cost |
| Multiplayer Rap Arena | STATIC-INTERACTIVE-PROTOTYPE | [Source](https://github.com/thelingolegacy-blip/TheLingoLegacy/blob/main/multiplayer-rap-arena/index.html) | Local buttons swap static verse sets; realtime multiplayer NOT IMPLEMENTED/VERIFIED | Browser QA; backend/session service; moderation, abuse reporting, privacy and multiplayer E2E tests |
| Auto Racing Universe | STATIC-INTERACTIVE-PROTOTYPE / blueprint | [Source](https://github.com/thelingolegacy-blip/TheLingoLegacy/blob/main/auto-racing-universe/index.html) | Local countdown and static race/tournament presentation; server-authoritative races NOT VERIFIED | Fix/test timer edge cases; define deterministic race simulation, tournament scheduling, server result validation and rewards controls |
| LINGO Impact | Prior-chat concept/build descriptions only in this review | Repository/build source NOT ESTABLISHED | NOT VERIFIED | Locate canonical repository, commit and runnable artifact; test combat, health, hit-stun, input/gamepad feedback and restart |
| Lingo Lions | Naming/reference conflict | Reconcile with Lingo Eruptions | NOT VERIFIED as a separate canonical title | Creator decision and registry/spec update through reviewed PR |
| Kotton’s Code Studio OS | Separate studio/production pipeline repository | [Kotton-code-engine](https://github.com/thelingolegacy-blip/Kotton-code-engine) | Source repo exists; production game deployment not certified by its README | Link each shipped game build to the engine pipeline; prove independent deployment and QA |

## Shared engine / service work

The intended five-engine architecture is: LINGO Core Runtime, LINGOslots Engine, LINGOarcade Engine, LINGO World Engine, and LINGO Experience Engine. Registry entries and interface demos do not prove these are fully implemented or connected.

| Shared component | Target contract | Current evidence disposition |
|---|---|---|
| Lingo ID / identity | Auth, consent, profile, recovery and deletion | NOT VERIFIED as integrated across the game catalog |
| Save / quest flags | Versioned, user-owned save state and migration | Local browser state is demo-only; production authority NOT VERIFIED |
| XP / achievements | Idempotent, policy-checked grants with audit | Contract documented; cross-game production integration NOT VERIFIED |
| Wallet / demo economy | Virtual-only, non-transferable, non-redeemable; server authority for any persistent balance | Browser-local demo balances exist; production ledger NOT VERIFIED |
| Leaderboards | Server-authoritative scores, anti-cheat, moderation and reset rules | Design contract documented; production service NOT VERIFIED |
| Assets / audio / voice | Versioned registry, rights/provenance, accessibility metadata | Experience prototype includes CSS-generated treatments and procedural audio; final media approvals NOT VERIFIED |
| Telemetry / release gates | Privacy-safe events, traceable build/version, verifiable gates | Partial analytics scripts/contracts exist; full game-specific telemetry validation NOT VERIFIED |

## Release gate checklist — per title

A title may not move to **PRODUCTION-CERTIFIED** until its record contains all applicable items below.

- [ ] Canonical repository, path, branch, commit SHA, and owner recorded.
- [ ] Build artifact is reproducible; engine/runtime and version are recorded.
- [ ] Automated validation output is attached to the exact commit.
- [ ] A real CI runner is assigned; runner ID/name, instantiated steps, sentinel execution and retrievable logs are evidenced.
- [ ] Unit, integration, gameplay and end-to-end checks pass with retained artifacts.
- [ ] Manual QA records desktop/mobile/tablet, keyboard/touch/gamepad as applicable, accessibility, save/reload, restart, corrupt-state and error paths.
- [ ] Final media, fonts, music, voices and other assets have documented provenance, rights and approvals.
- [ ] Security, privacy, age/territory, moderation and data-retention review is complete where applicable.
- [ ] Economy and monetization comply with the virtual-only rules; no deposits, cash-out, paid spins or redeemable rewards.
- [ ] Deployment URL maps to the exact commit/build; independent live smoke tests pass.
- [ ] Rollback target and operator are recorded.
- [ ] Independent reviewer verifies evidence; acceptance and promotion authorization are recorded.

## Canonical per-build record template

Duplicate this block for every new build. Do not fill missing values by inference.

```yaml
game_id: NOT_VERIFIED
canonical_title: NOT_VERIFIED
repository: NOT_VERIFIED
path: NOT_VERIFIED
branch: NOT_VERIFIED
commit_sha: NOT_VERIFIED
engine_runtime_version: NOT_VERIFIED
build_artifact_uri: NOT_VERIFIED
artifact_sha256: NOT_VERIFIED
ci_run_id: NOT_VERIFIED
runner_id: NOT_VERIFIED
runner_name: NOT_VERIFIED
steps_instantiated: NOT_VERIFIED
sentinel_result: NOT_VERIFIED
logs_uri: NOT_VERIFIED
automated_test_results: NOT_VERIFIED
manual_qa_record: NOT_VERIFIED
security_privacy_review: NOT_VERIFIED
asset_rights_review: NOT_VERIFIED
deployment_id: NOT_VERIFIED
deployment_url: NOT_VERIFIED
live_smoke_test: NOT_VERIFIED
rollback_target: NOT_VERIFIED
independent_verifier: NOT_VERIFIED
acceptance_status: BLOCKED
promotion_authorization: NOT_AUTHORIZED
```

## Current cross-catalog blockers

1. **G02 runner dispatch:** remains BLOCKED until a real runner accepts and executes the job and the full evidence predicate passes.
2. **Production certification:** no catalog-wide claim is made; each game needs its own build and QA evidence.
3. **Repository reconciliation:** standalone repos, monorepo specs and isolated PRs must be mapped to canonical ownership without silently merging or overwriting.
4. **Naming/mechanics:** settle Lingo Eruptions/Lingo Lions, UhNo naming variants, and the five-reel versus 5×3/20-payline That’s My Lingo discrepancy.
5. **Deployment and reachability:** hosting status must be matched to the exact commit and verified by independent live tests.
6. **Production hold:** do not merge/promote the ledger or game changes to production while required gates remain blocked. This document is a draft audit artifact, not authorization.


## Ledger artifact's own CI evidence (2026-10-19)

- Draft PR: [#316](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/316).
- Commit submitted for validation: `09c575ca596fd7ab878c3ccd57bbccb28703de10`.
- GitHub Actions run `39222173722` (`Lingo Legacy Static CI`): **completed / failure**.
- Job `validate` (job ID `117959809407`): `steps = null`, `logs_url = null`; job-step query returned an empty list, artifact query returned no artifacts, and job-log retrieval returned `BlobNotFound` for the contemporaneous G02 investigation.
- Interpretation: this is not a source-validation pass and does not establish that the markdown file failed a content rule. The runner/execution evidence is insufficient to attribute the failure to the ledger content. PR #316 remains draft and must not be promoted.


### Follow-up retry evidence (2026-10-19, 08:22 UTC)

- Draft PR #316 remains open, unmerged, and in draft state. Current head commit: `337804f08edc15800708a6f98fc4fd1c379fb10d`. No submitted code review or inline review threads were returned at the time of this check.
- A retry of failed jobs was accepted by GitHub for run `39222173722`, but the new attempt still failed as run `39222222337` (`Lingo Legacy Static CI`, run number 1393).
- The `validate` job (`117959969013`) completed with failure, `steps = null`, and no retrievable logs. A separate job-step query returned an empty list; log retrieval again returned `BlobNotFound`; no artifacts were present.
- Conclusion: retry did not recover execution evidence. G02/CI execution remains BLOCKED. This connected GitHub interface can inspect workflow results and request reruns, but it does not expose an action to start or repair the self-hosted runner daemon on its host. Host-side runner service, matching labels, network/polling, and repository/org runner-group authorization still need direct verification by an authorized operator.

## Evidence sources


- [G02 Self-Hosted Runner Recovery Runbook](./G02-SELF-HOSTED-RUNNER-RECOVERY.md) — read-only-first host/service diagnosis, GitHub runner-group authorization checks, safe repair sequence, and exact acceptance evidence required before marking G02 PASS.
- [Game Master Tree](../studio-sites/GAME-MASTER-TREE.md)
- [Game Bible Index](../studio-sites/GAME-BIBLE-INDEX.md)
- [Game Registry](../studio-sites/config/game-registry.json)
- [Individual game specifications](../studio-sites/games/)
- [PR #315 — arcade/slots experience](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/315)
- [PR #313 — Kotton’s Code interactive work](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/313)
- [PR #314 — Kotton’s Code route repair](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/314)
- [PR #303 — engine/world registry work](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/303)
- [PR #294 — OASIS blueprint](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/294)
- [That’s My Lingo dedicated repository](https://github.com/thelingolegacy-blip/THATS-MY-LINGO)
- [Kotton’s Code engine repository](https://github.com/thelingolegacy-blip/Kotton-code-engine)

**Audit limitation:** This ledger reflects source and deployment records accessible during the 2026-10-19 review. It does not assert recovery of deleted conversations, unindexed assets, inaccessible local builds, or artifacts not exposed by connected tools. Update records only when new evidence is captured and independently verified.
