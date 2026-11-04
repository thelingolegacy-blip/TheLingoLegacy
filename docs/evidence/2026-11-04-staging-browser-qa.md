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
| Studio Hub | Preview root [0mredirects to `/studio-hub/`; legacy casino home is preserved at `/legacy-home/` with `noindex,nofollow` | PASS |
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

