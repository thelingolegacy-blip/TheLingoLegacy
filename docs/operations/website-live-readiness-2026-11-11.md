# LINGO Legacy — Website Live Readiness Checkpoint

**Date:** 2026-11-11  
**Canonical source:** `thelingolegacy-blip/TheLingoLegacy`  
**Canonical branch:** `main`  
**Observed main commit:** `aaa9cd8462ced19ea86cb4d8bfd21672409c8b6e`  
**Production posture:** Public discovery website is live; full product activation and release certification remain gated.

## 1. Public website state

- Public homepage: https://thelingolegacy.com/
- The homepage responds publicly and presents the LINGO Legacy ecosystem.
- The visible copy still identifies the experience as a candidate and says destinations must be connected to verified routes before activation.
- Account creation and wallet actions are explicitly withheld pending secure-service verification.
- This is a live discovery surface, not proof that all listed product destinations are operational.

## 2. Cloudflare route ownership

The apex has an intentional split between the exact root path and subpaths:

| Pattern | Worker | Purpose |
|---|---|---|
| `thelingolegacy.com/` | `lingo-flagship-root` | Exact-root flagship homepage |
| `thelingolegacy.com/*` | `thelingolegacyv-5` | Main application and subpath router |
| `www.thelingolegacy.com/*` | `thelingolegacyv-5` | WWW traffic |
| `atlas.thelingolegacy.com/*` | `lingo-ecosystem-atlas` | Ecosystem Atlas |

The exact-root and wildcard patterns are separate route scopes. Their coexistence is not, by itself, evidence of a collision. Validate Cloudflare route precedence and actual requests before changing either route.

## 3. Worker deployment provenance

### Exact-root Worker: `lingo-flagship-root`

- Active deployment: version 1, ID `658acd1a-997b-45cd-b8fc-e59c59b26b45`.
- Active deployment created: 2026-10-25.
- Version 2, ID `1009da37-9128-44c2-9853-f277eb791c31`, alias `lingo-root-asklingo-preview`, uploaded 2026-10-30.
- Version 2 is marked preview-only and has not been promoted.
- Preview URLs were enabled for this Worker for inspection; the workers.dev production hostname remains disabled.
- Preview content and all navigation, asset, PWA, accessibility, mobile, and security behavior still require functional verification.

### Main Worker: `thelingolegacyv-5`

- Active production deployment: version 137, ID `2d161fa5-598f-4998-ada8-7ac4c72c3461`, deployed 2026-10-25.
- Version 300, ID `c5462ec6-95a5-4a51-89e7-a1a0bd8e3c67`, alias `work-staging-isolation-audit-2026-11-11`, uploaded 2026-11-11.
- Version 300 is a staging-isolation audit upload, not a production promotion authorization.
- Do not promote version 300 solely because it is the latest uploaded version.

## 4. GitHub release-control state

- Canonical `main` commit: `aaa9cd8462ced19ea86cb4d8bfd21672409c8b6e`.
- Commit signature reported verified.
- GitHub reports `main` is not protected and required status checks are disabled.
- Latest sampled PR workflow runs (2026-11-11 around 11:19 UTC) ended in `startup_failure`.
- The sampled commit status includes a failed Vercel check. Vercel is not an approved deployment target for this architecture.
- G02 remains FAIL / UNVERIFIED. Do not activate or duplicate a self-hosted runner without the required evidence and token-exposure remediation.

## 5. AppDeploy deployment blocker

AppDeploy returned `CREDITS_EXHAUSTED` and blocked deployment because the balance is below its 16-credit minimum. No AppDeploy changes were made. Do not retry the AppDeploy deployment workflow until the balance is restored.

## 6. Required path to a safe website update

1. Restore reliable GitHub Actions startup and collect job-level execution evidence.
2. Add and verify appropriate branch protection and required checks before relying on `main` as a release gate.
3. Verify the exact-root Worker preview end to end: links, destinations, search/filter behavior, PWA assets, AskLINGO, mobile navigation, accessibility, CSP, and security headers.
4. Reconcile the deployed Worker bundle, assets, bindings, and Wrangler configuration against the canonical GitHub source.
5. Confirm that all destination routes are backed by real, tested application routes; keep unready destinations clearly marked as previews or planned.
6. Run staging smoke tests and record artifact, commit, Worker-version, and test evidence.
7. Promote only the reviewed version using a reversible deployment strategy.
8. Verify apex, WWW, critical subpaths, cache behavior, security headers, and error rates after promotion.

## 7. Change record

This checkpoint is documentation only. It does not change DNS, Cloudflare production routes, Worker traffic allocation, Firebase Hosting, payment activation, or release gates. It records observed state and the required evidence for the next controlled update.


## 8. Preview-only navigation repair candidate (2026-11-11)

- GitHub PR #548 now includes a source-tracked exact-root Worker candidate at `cloudflare/flagship-root/worker.js` and its provenance/update notes.
- The candidate corrects catalog hrefs to existing canonical pages, routes Doughboys Oasis to its preview vertical slice, routes LINGOworld to its existing page, and keeps identity, wallet, marketplace, cinema, and investment placeholders gated.
- The homepage now describes the public discovery portal as live while destination activation remains staged.
- Cloudflare accepted the candidate as Worker version 3, ID `fa6ca7f6-7431-4d22-885d-782c5c9e3631`, alias `flagship-nav-repair-2026-11-11`, uploaded 2026-11-11 11:53 UTC.
- Version 3 is a preview upload only. The active deployment remains version 1, ID `658acd1a-997b-45cd-b8fc-e59c59b26b45`, at 100% traffic. No production traffic was moved.
- Preview URL: https://flagship-nav-repair-2026-11-11-lingo-flagship-root.thelingolegacy.workers.dev/
- The preview URL could not be opened by the available web inspection surface; independent browser QA is still required.
