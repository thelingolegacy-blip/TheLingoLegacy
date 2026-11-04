# LINGO Staging Qualification — 2026-11-04

**Disposition:** STAGING FUNCTIONALITY VERIFIED FOR THE TESTED FLOWS; PRODUCTION HOLD  
**Verified at:** 2026-11-04T21:55:00Z  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Branch:** `studio-hub/recovery-preview-2026-11-04`  
**Source commit under test:** `ad51371c4e56ae8dd8dcd93c718038fd109d91ec`

## Cloudflare Pages deployment

- Project: `lingo-legacy-github-integration-test`
- Deployment ID: `f7a09645-2988-4de5-9b3b-d7e3bec38451`
- Preview: https://f7a09645.lingo-legacy-github-integration-test.pages.dev/
- Queued, initialize, clone_repo, build, and deploy stages: **SUCCESS**
- This is an isolated Pages preview. No custom production domain, DNS record, production Worker route, or main-branch change was made.

## Browser and interaction evidence

All tests below used a 390×844 mobile viewport with JavaScript enabled and a browser-rendering session.

| Surface / flow | Observed result |
|---|---|
| Studio Hub | Mobile menu opened; 3 images loaded; 0 broken images. That’s My Lingo links to `/thats-my-lingo/`; Doughboy’s Oasis links to the Amity Heights vertical slice. |
| LINGOarcade | All 6 canonical SVG world logos loaded successfully. |
| That’s My Lingo full game floor | Spin action executed. Demo bank changed from 5,000 to 4,750 for a 250 Demo Coin bet; XP increased to 25. No cash-value jackpot display or active payment link remained in the rendered DOM. |
| Play Lab | 13 game cards rendered. Direct launch routes and click interactions verified: That’s My Lingo mini-game (+3 demo XP), Crazy Weasols (+1), Tricia’s Escape (room unlocked, +3), Doughboy’s Oasis resource round (Oasis reached, +5), Jersey Shore: The Undead (5 turns completed, 5 XP, health 5/5). |
| Doughboy’s Oasis vertical slice | Browser movement/interact path reached Ms. Bell; the first delivery mission completed through negotiation. Local demo state: Dough 120→148, reputation 0→14, Supplier Agreement item added. |
| KottonsCode | “Listen and look for clues” completed the River Clue mini-quest; progress reached 100% and the lesson feedback rendered. |

These are local browser demonstrations. They do **not** establish remote accounts, cloud saves, cross-device persistence, multiplayer, store builds, or production service integrations.

## Staging service evidence

### World Engine

- `/healthz`: `status=ok`, `database=reachable`, `worldCount=5`, `cacheBinding=true`.
- `/api/v1/worlds`: returned 5 catalog entries.
- Entries: That’s My Lingo, Crazy Weasols, Tricia’s Escape, Doughboy’s Oasis, Jersey Shore: The Undead.
- That’s My Lingo registry metadata is version `staging-2026-11-04.2`, engine `virtual-reel-v1`.
- These entries are in the isolated staging database bound only to `lingo-world-engine-staging`; the staging registry state is not a production release or promotion.

### Studio Control Center

- `/healthz/apps`: 16 of 16 configured origins returned HTTP 200.
- The gateway itself explicitly identifies as a **static preview proxy**. Its health result does not prove application APIs, write persistence, authentication callbacks, or production routing.

## Free-mode and payment guardrails

- Removed dynamic Stripe/founder checkout links injected by `assets/premium-studio-refresh.js`.
- Replaced payment calls-to-action with disabled preview labels.
- Replaced dollar-denominated jackpot labels with Demo Coin labels.
- Rendered That’s My Lingo page audit: 0 links matching checkout/payment destinations.
- No billing, paid upgrade, payment provider, or cash-out configuration was changed or enabled.

## Production and release blockers — not accepted

1. `app.thelingolegacy.com` currently renders a browser error page rather than the Flutter app.
2. `lib/firebase_options.dart` on `main` still contains `YOUR_...` placeholders; `lib/main.dart` awaits `Firebase.initializeApp` before `runApp`. Genuine Firebase app configuration and service verification are still required. No keys were fabricated.
3. Android/iOS native project scaffolding is not evidenced as buildable in the latest recorded repository audit.
4. G02 remains BLOCKED / UNVERIFIED. Issue #242 records no provisioned persistent runner host, positive runner ID/name, executed steps, retrievable logs, or artifacts. Do not register a duplicate runner or bypass the G02 evidence gate.
5. Production apex/root and `hub` routing were not changed. The production `hub` subdomain still serves the older That’s My Lingo casino landing page; the new Studio Hub remains staging-only.

**Release decision:** No merge, production promotion, DNS change, Worker route change, Firebase mutation, or G02 acceptance is authorized by this qualification. Continue fail-closed until the missing Firebase, native-build, G02, and production-routing evidence is independently verified.

## Source integrity — SHA-256

Hashes were computed from the exact file contents fetched from the branch at source commit `ad51371c4e56ae8dd8dcd93c718038fd109d91ec`.

| File | Bytes | Git blob SHA-1 | SHA-256 |
|---|---:|---|---|
| `studio-hub/index.html` | 15,191 | `dde468fe71babcb13f498f0348ae62e5e9b86dfd` | `fd99b3e981ba1503ebe12af003f32b1254c0e758e4f6fd873b48af96b5d63b6d` |
| `studio-sites/play/index.html` | 24,306 | `4cf9bda1c78c80d76fd6e35622894609e1df9c21` | `b364c6dc6a2c51aec9c61d25ce38827c083c175a4e8a4a85bb2eb9e61b257c84` |
| `studio-sites/lingoarcade/index.html` | 5,403 | `c638aad1d9c0d842cf84cb625d82cbeac66da43b` | `a16491d6c32eab13bcbcd5b318f7ef54ae21538c76492f362026aae48135d4e4` |
| `studio-sites/games/doughboys-oasis-vertical-slice.html` | 37,001 | `2173af8b8f7e7426ee1b1ddbf720ad66c0fd18fe` | `d6494db2bc6718f110cdb292deb69c14f78143f15915711a0dc4d25d748499ae` |
| `thats-my-lingo/index.html` | 56,113 | `0f9d0d8091a168eaf13bb60997b852a5552d2699` | `6acfca5e12965f70ada0226a0ebc618a01e4835d5af5e5ee54ef493ad92a55cc` |
| `kottons-code/index.html` | 38,031 | `f46d3a499c9fa0a963b82efeb128bdd68d7d3e13` | `433fb6e37c0b8193f4d682ffcdee0c1b2067c3cf01484787233f84ebf01beeb7` |
| `assets/premium-studio-refresh.js` | 13,756 | `5e11cfcf1f0beea08ddfa1b7ea68344955de2044` | `590d56e888d222e864c1f455386e8cfd1f3cf8724fd7fa140e575175355af211` |

---
This record documents the tested staging state only. It is not a production acceptance certificate.
