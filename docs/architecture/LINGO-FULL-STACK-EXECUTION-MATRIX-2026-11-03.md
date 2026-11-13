# LINGOlegacy — Full-Stack Foundation Execution Matrix
**Snapshot:** 2026-11-03  
**Work branch:** `foundation/full-stack-orchestration-2026-11-03`  
**Authority:** `thelingolegacy-blip/TheLingoLegacy`  
**Disposition:** Isolated planning and contract-validation lane. No production mutation or release certification.

## Mission
Unify the existing LINGOlegacy web, mobile, game, media, identity, backend, infrastructure, and operations work into one traceable build system. Reuse existing repositories, projects, apps, blueprints, and integration contracts. Do not create duplicate control centers or duplicate source-of-truth registries.

## Non-negotiable controls
- No billing: no paid plans, paid API calls, paid upgrades, usage overages, or services that require a payment method without a verified no-charge path.
- No payments, wagering, cash-out, paid spins, or redeemable prize systems in game builds.
- No disabling security controls, deny-by-default rules, audit logs, backups, release gates, or evidence requirements.
- No production DNS, Worker route, production Firebase, production AppDeploy, secret, or deployment mutation in this work lane.
- No credentials, API tokens, private keys, or real secrets in source, browser bundles, generated config, logs, or artifacts.
- Do not claim a service is healthy because a dashboard says so. Report UNKNOWN until a direct, reproducible check exists.
- Preserve all existing PRs and branches. PR #445 remains the canonical staging integration vehicle; do not duplicate its control-center package.

## Current observed baseline (2026-11-03)
| Area | Observed | Interpretation / constraint |
|---|---|---|
| GitHub | 38 accessible repositories; `thelingolegacy-blip/TheLingoLegacy` is public | Use existing repos; public-repo GitHub-hosted Actions can provide an independent CI lane. |
| AppDeploy | 18 apps on Free plan; monthly credits observed | Preserve apps. No new deploys until usage/credit consumption is explicitly budgeted and no-billing behavior verified. |
| Cloudflare | `thelingolegacy.com` zone active on Free Website plan | Existing production zone and routes are protected. |
| Workers | 8 Worker scripts observed, including production and staging workers | Do not repurpose or overwrite production Workers. |
| Pages | 3 projects observed | Existing Flutter Pages mapping is not a current health pass. |
| D1 | 3 databases observed; metadata reported zero tables | Do not assume schema or data health; inspect each environment separately before any migration. |
| R2 | API returned 403, “Please enable R2 through the Cloudflare Dashboard” | Leave disabled; enabling may create a new service/billing dependency. |
| Firebase | Production architecture references exist; staging project and emulator execution not verified | No Firebase production mutation. Establish a separate staging project only through verified owner-authorized setup. |
| Flutter | `my-flutter-app` Pages project mapped to `app.thelingolegacy.com`; last observed deployment 2026-08-30 | Treat current app health and build provenance as UNKNOWN until rebuilt and probed in an isolated preview. |
| Self-hosted | No current host inventory or persistent G02 runner proof in this inventory | Do not invent nodes, container counts, or host telemetry. |
| G02 | Separate runner-evidence lane | G02 remains blocked until runner_id > 0, matching runner identity, executed steps, retrievable logs/artifacts, telemetry correlation, and independent verification. |

Machine-readable counterpart: `config/stack-foundation/stack-registry.json`.

## Correct ownership and lanes
```text
LINGOlegacy_MASTER (governance, brand, legal, release authority)
└── TheLingoLegacy (source integration and ecosystem index)
    ├── Web / Studio Hub ── Cloudflare Pages + Workers
    ├── Mobile clients ── Flutter (Android / iOS / Web)
    ├── Identity & application data ── Firebase only where approved
    ├── Edge APIs ── Cloudflare Workers
    ├── Data stores ── D1 / Firebase selected by domain; no duplicate writes
    ├── Games ── LINGOarcade / LINGOslots / per-title game packages
    │   └── LINGO Lions Eruptions (browser-first 2D vertical slice)
    ├── Media ── original art, sprites, backgrounds, animation, audio, captions
    ├── CI ── GitHub-hosted Actions for public-repo checks
    ├── G02 ── separate self-hosted runner qualification; not a CI fallback
    └── Recovery ── immutable artifacts, hashes, backup/restore evidence
```

### Repository lane rules
- `TheLingoLegacy`: integration index, canonical route registry, shared platform contracts, web/game entry points.
- `LingoLegacy-MasterBlueprint`: governance and cross-portfolio master blueprint; do not fork its canon into competing documents.
- `lingo_assets`: asset masters and rights/manifest records when its current state and permissions are verified.
- `lingo_backend`: backend implementation candidate; verify existing language/runtime and current source before assigning new services.
- `lingo_admin_console`: admin UI candidate; preserve existing LINGO Enterprise Control Center and PR #445 as the active control-center integration path.
- Dedicated title repositories (e.g. `THATS-MY-LINGO`, `Kotton-code-engine`, `Spades-is-my_Lingo`) remain title-owned. No bulk migration or repo renaming.

## Stack decisions
### Web and edge
- Cloudflare Pages for static/preview surfaces and Workers for edge/API functions.
- Existing production Worker `thelingolegacyv-5` and production route bindings are protected.
- Existing staging Workers remain isolated; staging probes must not mutate production.
- Use D1 only for explicitly assigned edge-native records after schema and quota review. Do not mirror Firebase data into D1 without a domain ownership contract.
- R2 stays disabled. Use repository-managed small assets and local development assets until storage pricing, limits, and account enablement are verified.

### Mobile
- Flutter is the cross-platform client. Keep domain logic in packages/services rather than embedding provider logic in screens.
- Build targets: Android, iOS, and Flutter Web; each has a separate build identity and test matrix.
- Use environment-specific config templates. Firebase configuration files are not credentials, but server secrets must never enter the app.
- Existing `my-flutter-app` project is not accepted as a current mobile release until commit provenance, Flutter build logs, artifact hash, route probe, and device tests are retrievable.

### Backend and identity
- Separate public API, privileged control plane, and game/session services.
- Firebase Auth/Firestore/Functions remain candidates for identity and server-authoritative game state only after staging setup and emulator verification.
- Cloudflare Worker API is the edge boundary; it validates origin, request schema, identity assertions, rate limits, and correlation IDs before forwarding.
- Never trust browser-submitted score, XP, rewards, inventory, wallet, or admin role.
- Use deny-by-default rules, least privilege, idempotency keys, audit events, and explicit environment separation.

### CI and operations
- New foundation contract checks run on GitHub-hosted `ubuntu-latest` for this public repository; no G02 runner dependency and no third-party action dependency in the initial contract workflow.
- Workflow validates JSON, shell syntax, repository structure, secret-pattern guardrails, and manifest invariants.
- G02 remains a separate qualification program. A GitHub-hosted CI pass cannot be represented as G02 host acceptance.
- No workflow may deploy, promote, mutate DNS, rotate secrets, or change production routing.

## LINGO Lions Eruptions — playable vertical slice
Existing design source: `studio-sites/games/lingo-eruptions.md`. Its registry status is DESIGN-SPEC, not a verified release.

### Build sequence
1. **G0 — Canon lock:** creator-approved lion identity, glyph system, palette, rules, scoring, audience, and story premise.
2. **G1 — Graybox:** deterministic board generation, adjacency/match rules, blockers, legal moves, win/loss and restart.
3. **G2 — Playable loop:** touch/mouse/keyboard input, match resolution, cascades, score recap, pause/restart and tutorial.
4. **G3 — Visual production:** original lion hero, logo, title screen, volcanic background layers, glyph/ball symbols, buttons, panels, particles and reward badges.
5. **G4 — Motion/audio:** falling and flying pieces, eruption burst, molten trails, expanding Wild effect, cascade transitions, original SFX/music, mute and reduced-motion alternatives.
6. **G5 — Persistence:** guest-local save first; optional authenticated save only after backend authorization and security tests.
7. **G6 — QA:** deterministic scoring tests, solvable-board tests, touch hit targets, reduced motion, keyboard support, responsive layouts, browser matrix and performance budget.
8. **G7 — Release candidate:** immutable build, asset manifest, SHA-256, test logs, rights review, accessibility acceptance, independent route probe and separately authorized release.

### Game rules and economy
- Free play only; virtual points and progression are non-cash, non-transferable, and non-redeemable.
- No pay-to-continue, paid spins, real-money wagers, cash-out, sweepstakes or prizes.
- Score and XP remain separate. Any production score or reward requires server validation and idempotent event processing.
- Provide relaxed and timed modes; pause, restart, sound, captions, text scale and reduced-motion controls.
- Never use strobing effects or audio-only essential cues.

## Master media and asset pipeline
```text
BRIEF → CANON LOCK → STORYBOARD → STYLE FRAMES → ASSET MASTER
→ SPRITE / LAYER EXPORT → ANIMATION → GAME INTEGRATION
→ RIGHTS REVIEW → QA → MANIFEST + HASH → APPROVAL
```
Required asset families:
- Brand: primary wordmark, compact mark, app icon, title card, loading screen.
- Characters: lion hero front/side/3-quarter, idle, roar, win, lose, damaged, celebration; expression and scale sheets.
- Environments: volcanic arena, obsidian chamber, molten cavern, chapter-select map, bonus scene; parallax foreground/midground/background.
- Gameplay: glyph/ball atlas, blockers, Wild symbol, chain meter, score tokens, buttons, panels, overlays, particles.
- Motion: idle loops, ball drop, match pop, chain trail, eruption, Wild expansion, transition, victory/defeat.
- Audio: original music, UI cues, match/chain/eruption/bonus cues, captions and transcripts.
Every asset manifest record must include asset_id, title, kind, source master, version, path, SHA-256, owner, license/rights evidence, usage territory, alt text/transcript, variants, creator review, and approval status. AI-generated media is a draft until quality, similarity, rights, brand, and age-suitability review passes.

## Blocker handling: repair without weakening rails
| Blocker class | Permitted repair | Prohibited shortcut |
|---|---|---|
| Missing optional service | Feature-flag it off; keep core game local and playable | Falsify health or remove auth checks |
| Startup/config error | Correct schema, command, path, dependency pin, or environment template; rerun tests | Disable failing tests or safety gates |
| No runner assigned | Use the separate GitHub-hosted contract lane for non-G02 CI; preserve G02 blocker | Call queued/startup_failure a pass or relabel G02 |
| Firebase unavailable | Keep guest/local mode; use emulator only when installed and verified | Point staging app at production Firebase |
| R2 unavailable | Keep assets in repo/local store; record storage as unavailable | Enable R2 without quota/billing review |
| Secret missing | Stop privileged action; use provider secret-entry workflow after owner-controlled entry | Put a token in source, chat, HTML, or generated .env |
| Provider quota unknown | Stop before provisioning; inspect plan/limits first | Assume free/unlimited or allow overages |
| Live probe blocked by egress | Probe from an authorized permitted network and preserve response evidence | Treat environment 403 as app health or app failure |

## Acceptance contract
A work item is accepted only when its source commit, execution environment, actual command/run, logs, artifact, SHA-256, independent check, reviewer, and authorization are recorded. A provider “ready” status or a static dashboard is not independent acceptance.

Required state-change manifest fields:
- UTC timestamp
- environment and resource identity
- source commit and artifact digest
- operation and before/after state
- actor/authorization reference
- verification command and result
- rollback/LKG identity
- evidence URI and SHA-256

## Immediate next execution order
1. Finish read-only inventory of existing repo lanes, PRs, Workers, Pages, D1, Firebase and AppDeploy snapshots.
2. Keep PR #445 as the Studio Control Center integration vehicle; reconcile its live evidence with its static dashboard snapshot.
3. Establish the independent GitHub-hosted contract CI path without touching G02.
4. Build LINGO Lions Eruptions as a local-first playable browser vertical slice and keep media masters separately versioned.
5. Validate Flutter build and Firebase staging/emulator prerequisites without pointing to production.
6. Add service adapters one at a time; only activate integrations after quota, security, and test gates pass.
7. Stage deployment candidates; no production promotion without the full evidence chain and separate authorization.

**Current release state:** foundation planning branch created; implementation and certification remain pending. No production resources changed.
