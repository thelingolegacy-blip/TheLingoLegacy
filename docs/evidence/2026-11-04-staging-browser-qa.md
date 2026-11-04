# LINGO Studio Preview — Browser QA Evidence

**Evidence date:** 2026-11-04 (UTC)  
**Environment:** Isolated Cloudflare Pages preview  
**Git branch:** `studio-hub/recovery-preview-2026-11-04`  
**Production state:** Untouched. No DNS, production Worker routes, production deployment, or main-branch promotion performed.

## Verified deployment

- Latest preview deployment for the page-title correction: `a4ae44a3-663d-43d5-b9cc-28f7331e973a`
- Preview origin: `https://a4ae44a3.lingo-legacy-github-integration-test.pages.dev`
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
