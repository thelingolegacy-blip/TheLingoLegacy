# LINGO Studio Preview — Browser QA Evidence

**Evidence date:** 2026-11-04 (UTC)  
**Environment:** Isolated Cloudflare Pages preview  
**Git branch:** `studio-hub/recovery-preview-2026-11-04`  
**Production state:** Untouched. No DNS, production Worker routes, production deployment, or main-branch promotion performed.

## Verified deployment

- Latest preview deployment for the page-title correction: `a4ae44a3-663d-43d5-b9cc-28f7331e973a`
- Preview origin at the page-title correction: `https://a4ae44a3.lingo-legacy-github-integration-test.pages.dev`
- Latest KottonsCode identity preview: deployment `29317584-6a34-4fe5-a90e-b67c7001523d`, source commit `53a1b540ee44a62b69fe6a01dc07d02fe4df767a`, URL `https://29317584.lingo-legacy-github-integration-test.pages.dev`; build and deploy both reported `success`, deploy completed `2026-11-04T22:00:44.822836Z`.
- Latest complete evidence preview at that stage: deployment `ed865832-32c9-4511-ab0f-ea37626eda0d`, source commit `31f02cb2836d0e2e31c9a65404575b0f0c52eddb`, URL `https://ed865832.lingo-legacy-github-integration-test.pages.dev`; build and deploy both reported `success`, deploy completed `2026-11-04T22:06:10.078680Z`.
- Latest Studio Hub root-entry preview: deployment `9f7c0b67-cf90-470b-9384-b9f2a519ddf1`, source commit `e81f4a720c11d5790ffe17826b6a2ca99e00ee3a`, URL `https://9f7c0b67.lingo-legacy-github-integration-test.pages.dev`; build and deploy both reported `success`, deploy completed `2026-11-04T22:09:57.767173Z`.
- Source commit: `8c4462dc2ca3ad2d77f70a7770fb599779fc8d01`
- Cloudflare Pages stages: queued, initialize, clone_repo, build, deploy — all reported `success`.
- Deploy completed: `2026-11-04T21:56:36.817917Z`.

Earlier functional smoke deployment:
- Deployment: `f7a09645-2988-4de5-9b3b-d7e3bec38451`
- Source commit: `ad51371c4e56ae8dd8dcd93c718038fd109d91ec`
- Build and deploy stages: `success`.

## Browser checks

All viewport checks below used a 390 × 844 mobile viewport with touch enabled.

| Surface | Check | Result |
|---|---|---|
| Studio Hub | Mobile menu opens | PASS |
| Studio Hub | Preview root redirects to `/studio-hub/`; legacy casino home is preserved at `/legacy-home/` with `noindex,nofollow` | PASS |
| Studio Hub | Three featured product logos load (That’s My Lingo, Doughboy’s Oasis, Crazy Weasols) | PASS |
| Studio Hub | No horizontal overflow | PASS |
| LINGOarcade | Six world cards render with launch destinations | PASS |
| LINGOarcade | Six world-logo images load | PASS |
| LINGOarcade | No horizontal overflow | PASS |
| That’s My Lingo | Reel spin responds; demo bank changes from 5,000 to 4,750 and XP shows 25 | PASS |
| That’s My Lingo | No Stripe/checkout anchors in rendered page | PASS |
| That’s My Lingo | Page title and metadata now identify a playable preview | PASS |
| That’s My Lingo | No horizontal overflow | PASS |
| Doughboy’s Oasis vertical slice | Canvas and 33 interactive controls render | PASS |
| Doughboy’s Oasis vertical slice | No horizontal overflow | PASS |
| KottonsCode | Two inline scripts pass syntax checks; mobile world and controls render | PASS |
| KottonsCode | Safe-crossing quest choice updates feedback and completion progress; restart resets progress | PASS |
| KottonsCode | No horizontal overflow | PASS |
| KottonsCode | Dedicated book-and-paw icon and favicon load; header no longer uses the That’s My Lingo mark | PASS |
| TML and KottonsCode preview | Rendered pages contain zero Stripe/checkout/payment anchors | PASS |
| TML preview | Square CTA reports preview-only; no Square account/payment processing connected | PASS |
| Tricia’s Escape | First memory room completes; +3 XP; next room increases to four symbols | PASS |

### Play Lab route smoke test

On deployment `f7a09645`, all 13 registered game IDs loaded their expected game title and at least one control in the mobile browser. No horizontal overflow was observed on any route:

`arcade`, `slots`, `tml`, `spades`, `uhno`, `kotton`, `tricia`, `doughboy`, `weasols`, `philly`, `undead`, `eruptions`, `cashman`.

Interaction samples:
- LINGOarcade: correct target tap awarded 1 XP.
- LINGOslots: spin consumed 5 local demo points; no matching combination on that run.
- Spades Is My Lingo: card selection processed; opponent won that randomized trick.
- UhNo Lingo University: valid color/number match awarded 1 XP.
- Kotton’s Code: five-letter guess was accepted and the tested run solved for HEART (+5 XP).
- Silly in Philly: first neighborhood choice updated loyalty and awarded 2 XP.
- Lingo Eruptions: tile tap processed; that random board did not form a qualifying chain.
- Cashman Lingo Mania: gold-token tap awarded 1 demo XP.

Earlier Oasis Play Lab check reached “Oasis reached” and awarded 5 XP after three resource decisions. Earlier Crazy Weasols check accepted a target tap and awarded 1 XP. These are local-session prototypes, not account-backed or production game services.

KottonsCode privacy note: the source contains a release comment requiring permission confirmation before publishing real family names, especially minors. Treat this as a public-release blocker until names are approved or replaced with approved aliases.

## Source identifiers at inspection

- `studio-hub/index.html`: `dde468fe71babcb13f498f0348ae62e5e9b86dfd`
- `studio-sites/play/index.html`: `f85e2f5af36b20166e2497b07e9b20b70d436713`
- `studio-sites/lingoarcade/index.html`: `c638aad1d9c0d842cf84cb625d82cbeac66da43b`
- `thats-my-lingo/index.html`: `c557c43c668d1aae40a03d63f1ad20c46f853222`
- `studio-sites/games/doughboys-oasis-vertical-slice.html`: `2173af8b8f7e7426ee1b1ddbf720ad66c0fd18fe`
- `assets/premium-studio-refresh.js`: `5e11cfcf1f0beea08ddfa1b7ea68344955de2044`
- `kottons-code/index.html`: `58cca1bac201b0aa23968e6189dbd85f74c50d17`
- `assets/logos/kottons-code-icon.svg`: `7bb1d49a98b3a0b64646ef8cd547a54a809f8fc9`
- `assets/logos/kottons-code-mark.svg`: `b91c6f220dafa11f394c863a2caae8543b23afd9`
- `index.html` (preview root redirect): `fe597272d65a2d93fbb4310ae1d8ef67a18eacf9`
- `legacy-home/index.html` (noindex archive): `d5d34dbeb73e6d52ed2c332cbfe2c3d8c0237c85`
- `studio-hub/index.html`: `001722833875afe7dd2599812f2225e0999b1d38`
- `studio-sites/lingoslots/index.html`: `e3eb4a9c87e1a3bb556c864692a6f4c2a5476738`

These are Git blob identifiers, not SHA-256 checksums.

## Remaining release blockers

1. The game prototypes keep XP, bank, and progress in local browser/session state; shared identity, cloud saves, multiplayer, and authoritative leaderboards are not connected.
2. The Oasis vertical slice has a rendered canvas and controls, but the full mission progression, NPC interaction, persistence, and device-specific gameplay still need a dedicated end-to-end acceptance pass.
3. Kotton’s Code needs a dedicated content, accessibility, and gameplay acceptance pass; a prior AppDeploy QA snapshot reported a script error and is not treated as cleared by these Cloudflare checks.
4. The shared navigation contains additional legacy destinations that need a complete route audit.
5. The G02 runner/host execution and sentinel evidence remain a separate release gate. A successful Cloudflare static asset deployment does not satisfy G02.
6. No production release authorization has been granted or exercised.

## Acceptance statement

This record establishes successful static preview deployment and the specific mobile browser smoke tests listed above. It does **not** establish production readiness, backend integration, account security, release acceptance, G02 qualification, or authorization to promote.


## Production baseline — read-only route audit

Production was inspected without changing DNS, Workers, source, or routing:

- `https://thelingolegacy.com/` and `https://www.thelingolegacy.com/` both rendered the current legacy homepage title.
- `https://thelingolegacy.com/studio-hub/` returned a not-found response. The new Studio Hub remains preview-only.
- Production `/thats-my-lingo/` still serves the older title “Production Entertainment Platform” and exposes five anchors to `/drop/#stripe-checkout`.
- Production `/kottons-code/` exposes two anchors to `/drop/#stripe-checkout`.
- The corresponding latest staging preview pages have zero Stripe/checkout/payment anchors.

**Production risk / release blocker:** the payment-related links are still present in production source/runtime. They were not clicked and no purchase was initiated. Keep production protected; prepare a reviewed production patch and release checklist before any promotion. Do not treat the staging fixes as already applied to the live domain.


## Production Worker status — read-only API snapshot

At `2026-11-04T22:02:57Z`, read-only requests to the production Worker returned:

- `/api/v1/platform/status`: `SERVING / RELEASE-LOCKED`, runtime `cloudflare-worker`, version `5.0.0-studio-platform`.
- Production mutation: `FROZEN`; LKG: `PROTECTED`.
- G02 runner: `FAIL / UNVERIFIED`.
- G03 CI execution through G11 acceptance: `BLOCKED`.
- Reported integrations: Stripe, Beacon webhook, Twilio, D1, KV, R2, and Firebase all `false`.
- Real-money gameplay, cash-out, and harmful bypass all `false`.
- `/healthz` returned `ok`.
- `/api/v1/platform/modules` returned a 21-name module catalog. A catalog entry is not proof that its backend, storage, authentication, or live operations are connected.
- `/api/v1/site/context` reported feature flags for premium studio, live ops, askLINGO, and analytics as true, while the platform status reports those external integrations/storage services as false. Treat these flags as surface/UI declarations, not integration acceptance.

No production API mutations were sent.


## GitHub Actions status for draft PR #451

For head commit `3b20a20969bc46a1db183c41c398d43bfc3014ff`, GitHub reported five pull-request workflow runs, all completed with conclusion `startup_failure`:

- `Studio Static Validation` — run `41921935970`
- `Crimson Smoke UI — static validation` — run `41921937686`
- `Studio Preview Package` — run `41921934205`
- `Lingo Legacy Static CI` — run `41921932363`
- `G02 Runner Image Build (no publish)` — run `41921930678`

Each run returned zero job records and zero artifacts. With no jobs, there are no runner IDs, step summaries, job logs, or build artifacts to inspect. The affected workflow definitions use `ubuntu-latest`, so this startup failure is broader than the dedicated `lingo-g02` self-hosted runner label alone. The production Worker independently continues to report G02 as `FAIL / UNVERIFIED`.

GitHub also returned a successful Vercel status context for the commit. This is not accepted as evidence for the approved Cloudflare architecture, static validation, G02 execution, or release acceptance.

**CI acceptance:** BLOCKED. Do not merge draft PR #451. The successful Cloudflare Pages static preview deployment is separate evidence and does not repair the GitHub Actions startup failure.


## Studio Hub root and internal route audit

The current preview root was tested after the root redirect change:

- Requesting `/` lands at `/studio-hub/` and renders “LINGO Studio Hub — One Legacy. Many Worlds.”
- `/legacy-home/` preserves the former casino homepage as a noindex archive.
- The Studio Hub search input filters the directory; the mobile menu opens; featured product logos load; no horizontal overflow was observed.
- All 31 internal destinations extracted from the That’s My Lingo and KottonsCode navigation/content link sets loaded with their expected page titles in the preview browser.
- The 12 non-control-plane Studio Hub destinations tested loaded; the `/studio/` control-center shell also loads, but its live status fetch returns 404 on the static Pages preview because that preview has no attached Worker API. The UI correctly displays “Live status unavailable” and keeps its release state fail-closed.
- The production root has not been redirected. Production `/studio-hub/` remains unavailable until a separately reviewed production promotion.



### Repeated Actions startup failure after root-entry changes

The same five workflows were retriggered on the Studio Hub root-entry commit `b9abb2611ef69c8e6d04bab99d2dd5da794556af` and the archived-homepage labeling commit `e81f4a720c11d5790ffe17826b6a2ca99e00ee3a`. All ten additional runs completed with `startup_failure`:

- Root-entry commit: `41922734675`, `41922736781`, `41922732935`, `41922731051`, `41922729116`.
- Archive-label commit: `41922770293`, `41922772316`, `41922768243`, `41922765963`, `41922764035`.

Every one of these ten runs returned zero jobs and zero artifacts. This repeatability across unrelated static and runner-image workflows confirms the current PR CI evidence gap remains unresolved; it is not a source-level test failure because the jobs never instantiated.


## Latest staging regression pass — 2026-11-04T22:13Z

**Cloudflare Pages deployment:** `2a2c8893-fa53-4c4b-bd8b-adaea41c3785`  
**Preview URL:** https://2a2c8893.lingo-legacy-github-integration-test.pages.dev  
**Source commit:** `122ea3c3f14ff05443df97713dd46292f486cd8c`  
**Cloudflare stages:** queued, initialize, clone_repo, build, deploy — all `success`; deploy completed `2026-11-04T22:12:51.403492Z`.

### Primary entry and visual checks

- Preview root `/` redirected to `/studio-hub/`; rendered title `LINGO Studio Hub — One Legacy. Many Worlds.`.
- Hub rendered at 390 × 844 mobile viewport, no horizontal overflow, and mobile menu opened.
- All seven Hub brand/experience images loaded: LINGOlegacy, LINGOarcade, LINGOslots, That’s My Lingo, KottonsCode, Doughboy’s Oasis, and Crazy Weasols.
- LINGOlegacy tile copy now labels the linked destination as a **portal preview** and explicitly says shared identity, account and wallet services are not connected.
- LINGOslots decorative sigil is now `LL.`, not a star mark.

### Route and game-floor checks

- Twelve primary Hub destinations rendered their expected page titles; no 404 page was observed on the tested routes: `/studio-sites/`, `/studio-sites/lingoarcade/`, `/studio-sites/lingoslots/`, `/thats-my-lingo/`, `/kottons-code/`, `/library/`, `/media/`, `/lingo-ai/`, `/loyalty-lane-apparel/`, the Oasis vertical slice, the Crazy Weasols Play Lab route, and `/studio/`.
- All 13 Play Lab game IDs loaded a named game surface with at least one interactive control and no horizontal overflow: `arcade`, `slots`, `tml`, `spades`, `uhno`, `kotton`, `tricia`, `doughboy`, `weasols`, `philly`, `undead`, `eruptions`, and `cashman`.
- LINGOslots spin executed; demo bank changed from 1,000 to 990 coins. No checkout action was present.
- The dedicated Doughboy’s Oasis vertical slice rendered one canvas and 33 buttons at the tested mobile viewport. The first delivery mission completed in browser testing: local demo Dough increased from 120 to 148, reputation from 0 to 14, one Supplier Agreement item was added, and the local save indicator updated.
- Oasis crew creation, territory contest, radio station change, and CPU rival toggle were exercised. Territory influence changed from 5 to 16, rival influence from 20 to 14, reputation to 3; save indicator updated; no browser error occurred.

### Defect found and corrected

The Oasis territory contest referenced an undeclared `territories` array. Browser error capture confirmed `ReferenceError: territories is not defined`, which prevented the post-contest UI update. The branch patch now retains the already-defined Amity Heights district rather than selecting from a nonexistent array. The latest deployment retest confirmed updated influence/reputation, radio station change, CPU toggle, autosave indicator, and zero browser errors. This is a tested preview-only correction.

### Free-mode UI audit

On the current staging preview, the following mobile pages were inspected for enabled purchase/payment actions: `/drop/`, `/monetization/`, `/loyalty-lane-apparel/`, `/thats-my-lingo/`, and `/kottons-code/`. The Drop page exposes three disabled buttons labelled “Payments paused”; the other four pages expose no matching payment/checkout/purchase/subscribe actions. No checkout flow was initiated. This is a UI-level check only; Worker billing behavior still needs isolated Worker-runtime tests.

### GitHub Actions execution status

Latest tested source commit: `122ea3c3f14ff05443df97713dd46292f486cd8c`.

Five required workflows completed with conclusion `startup_failure`:
- G02 Runner Image Build (no publish), run `41923229460`
- Crimson Smoke UI — static validation, run `41923227642`
- Studio Static Validation, run `41923225727`
- Lingo Legacy Static CI, run `41923223943`
- Studio Preview Package, run `41923222267`

For each of these runs, GitHub's jobs endpoint returned **zero jobs** and the artifacts endpoint returned **zero artifacts**. These runs therefore do not provide step-level execution evidence, runner assignment, logs, or artifacts. They are not PASS results. The independent Cloudflare Pages preview deployment succeeded; it does not replace GitHub Actions or G02 acceptance.

## Current branch / review boundary

- Draft PR: [#451](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/451)
- Branch: `studio-hub/recovery-preview-2026-11-04`
- Comparison snapshot: 52 commits ahead of `main`, 0 behind; 22 changed files at inspection time.
- PR remains open and draft. No merge, production deployment, DNS change, production Worker route change, or promotion occurred.
- `_redirects` adds a root-to-`/studio-hub/` 302 for the isolated Pages preview project only. Production DNS and Worker routing are unchanged.

**Disposition:** STAGING PREVIEW FUNCTIONALITY VERIFIED FOR THE FLOWS LISTED ABOVE; PRODUCTION HOLD. Backend identity, cloud saves, Firebase initialization, native app builds, Worker runtime acceptance, G02 host/runner evidence, full accessibility/security/performance review, and explicit promotion authorization remain outstanding.


## Evidence-record publication and final recheck — 2026-11-04T22:14Z

- The QA record itself was published in Cloudflare Pages deployment `3e87daf8-0f45-4d92-a299-a3ab00ce7cc5`, URL https://3e87daf8.lingo-legacy-github-integration-test.pages.dev; all five Pages stages completed successfully.
- The deployment contains the same tested application source as commit `122ea3c3f14ff05443df97713dd46292f486cd8c`; the new source change after that commit was this evidence document only.
- Final root-entry recheck on the evidence deployment again resolved `/` to `/studio-hub/`, rendered the Studio Hub title and H1, and reported no horizontal overflow.
- Five principal surfaces (Studio Hub, That’s My Lingo, KottonsCode, LINGOarcade, and Doughboy’s Oasis) each completed a mobile interaction smoke test with zero captured JavaScript window errors and no horizontal overflow. These are the specific tested actions documented above, not a blanket claim that every control is production-ready.

The evidence-only commit `fab3ec592e3c327ee31a3146c3139ae774ca59b2` also triggered five GitHub Actions workflows. All five again concluded `startup_failure`: runs `41923437419`, `41923435508`, `41923431399`, `41923433439`, and `41923429564`. Each run returned zero jobs and zero artifacts. This confirms the Actions startup issue is recurring; it still does not establish runner assignment or job execution.
