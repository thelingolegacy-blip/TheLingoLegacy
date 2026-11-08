# Cross-stack truth review — 2026-11-08

**Scope:** GitHub source, web frontend, Flutter client, Firebase configuration, Cloudflare delivery, and backend readiness.  
**Disposition:** Evidence review only. Production remains HOLD; no merge or deployment authorization is implied.

## Executive truth statement

The repositories contain meaningful implementation and hardening work, but the connected product is not yet a verified end-to-end production system. The most important blockers are GitHub Actions failing before jobs are created, unverified Firebase project configuration and security controls, missing production Worker backend bindings, and frontend account/commerce flows that are explicitly preview-only.

## Source-of-truth repositories

- thelingolegacy-blip/TheLingoLegacy — Flutter/mobile and shared platform source. PR #504 is the current cross-stack hardening proposal on branch hardening/flutter-firebase-cloudflare-2026-11-08.
- thelingolegacy-blip/TheLingoLegacy-Web — Next.js App Router, React, TypeScript, and OpenNext/Cloudflare web application. Its default branch is main.
- thelingolegacy-blip/LINGO_LEGACY_HQ — governance, operations, and G02 evidence repository. Main-based PR #48 is the runner recovery proposal; it remains draft.

GitHub is the source-of-truth system. A README, manifest, dependency, source route, or draft PR does not prove a live provider integration.

## GitHub and CI

- PR #504 code-bearing head reviewed before this documentation-only commit: d5bb1d8dc7d044550158dfe20ffb430baab2d771. This truth-review document is added by commit 7391bc6f5da601f25f9e2f0b428850db31633a60.
- Latest recorded Flutter Firebase Integrity run #132 (42505053676) ended startup_failure. A live GitHub Jobs readback returned zero jobs and the Artifacts readback returned zero artifacts. No Flutter workflow step ran.
- The other four latest PR #504 workflows are also recorded as startup failures with zero jobs and zero artifacts.
- The isolated Node contract harness reports 19 passing tests. These are source-level Node tests, not GitHub CI and not Flutter SDK validation.
- main is recorded as unprotected. CODEOWNERS and a PR template are documentation/repository files, not enforcement. An administrator must apply and verify branch protection/rulesets and Actions permissions.
- Do not merge PR #504 until exact-head CI, independent review, and acceptance evidence are available.

## Frontend — verified source facts

The Web repository's main branch package manifest identifies:
- Next.js 15.5.28, React 19.3.1, TypeScript 5.4.5.
- OpenNext for Cloudflare and Wrangler 4.129.1.
- Node.js >=22 and npm >=10.
- Build, type-check, lint, preview smoke, Cloudflare build, and dry-run scripts.

The repository README describes GitHub-to-Cloudflare delivery and no Vercel production dependency as the intended architecture. This is a repository declaration, not proof that every deployment is connected or current.

The checked-in wrangler.jsonc uses .open-next/worker.js, publishes .open-next/assets, sets workers_dev: true, and configures observability sampling at 100%. This differs from the separate flagship Worker configuration in PR #504, which records 10% sampling, query-string redaction, persistent invocation logs, and disabled traces. Treat these as distinct Worker configurations; do not assume settings automatically carry between them.

The homepage source currently labels the interface "STUDIO PRODUCTION" and several theatre rooms "LIVE". These labels must not be interpreted as proof that the underlying services are live.

The login and signup routes render AuthPortal from components/commerce/CommercePortal.tsx. The form only performs browser-side validation and sets local preview state. Its own success message explicitly says authentication is not connected and no account or session was created. The storefront source explicitly says purchases and checkout are not activated; its bag is local preview state.

The /api/health source route returns ok: true and a Cloudflare runtime label. This is a lightweight application response, not proof of database connectivity, authenticated backend readiness, or full production acceptance.

## Flutter — verified source facts

PR #504 moves Firebase client configuration to build-time Dart defines and provides a clearly labeled preview fallback when required values are absent or initialization fails. The Flutter shell itself states that accounts and cloud sync are unavailable in preview mode.

The workflow source is designed to run Node contract tests, Flutter dependency resolution, flutter analyze, flutter test, Flutter web build, Android debug build, and strict Firebase configuration validation. Because the latest GitHub run created no jobs, none of those Flutter commands is verified as executed on the current PR head.

No Android release signing configuration is claimed. iOS development workflow source is not evidence of an iOS build or store-ready artifact. Platform configuration and device/browser acceptance remain outstanding.

## Firebase — verified and unverified

- .firebaserc selects project ID lingo-legacy-production.
- The presence of that alias does not prove project existence, ownership, registered apps, or correct account access.
- Firebase Auth providers, authorized domains, App Check, Firestore/Realtime Database rules, Storage rules, Functions, billing, and repository variables remain unverified in the current evidence.
- Flutter client configuration is not a substitute for server-side authorization. Never place service-account JSON, admin keys, private keys, or long-lived bearer tokens in Flutter builds or public repository variables.
- No Firebase production deployment or authenticated end-to-end account journey is verified.

## Cloudflare — recorded live evidence and boundaries

PR #504's evidence records a live zone route inventory of 21 records: 18 routes owned by production Worker thelingolegacyv-5 and three explicit routes owned by separate Workers. The PR's route manifest and Wrangler config reportedly match the 18 routes for that Worker with zero missing and zero extra entries. This is a recorded provider readback; this review did not independently query the Cloudflare account.

The same evidence records query-string redaction and 10% request/log sampling applied and read back on production and staging Workers, with persistent invocation logs and traces disabled. The All Workers preview Access application was narrowed to account members and one exact operator email. Eight other per-worker Access applications still reference the shared bypass policy and require individual exposure review. Do not delete the shared policy globally.

The active production Worker is recorded as thelingolegacyv-5, with no D1 or Firebase binding. Therefore the production Worker is not yet the verified Firebase/D1 application backend.

The separate frontend repository's Wrangler config is not proof that its OpenNext Worker is currently deployed to the canonical production hostname. Confirm the actual Cloudflare Git integration, repository, branch, root directory, build command, deploy command, environment variables, and live deployment before calling that delivery path connected.

## Backend — verified and unverified

- Production thelingolegacyv-5 is recorded with no D1 or Firebase binding. Its deployed source still uses an isolate-local in-memory Map for Beacon rate limiting.
- PR #501 contains a Durable Object-backed rate-limit proposal, but the replacement is source-only and not active in production.
- Staging D1 lingo-game-engine-staging-20261107 is recorded with migration 0002 applied and its rate-limit table/schema read back. The staging Worker has a D1 binding but no Firebase project binding.
- PRs #498 and #503 contain staging game-engine and wallet proposals. Their source and isolated local checks do not establish live authenticated backend acceptance. The staging Worker source is recorded as not deployed pending Firebase staging identity and authenticated route tests.
- No client-side balance, reward, eligibility, game outcome, or administrative action should be trusted. These must be server-authoritative, authenticated, authorized, idempotent, and auditable before activation.

## Required acceptance sequence

1. Restore GitHub Actions job creation; verify runner assignment, logs, artifacts, and exact-head checks.
2. Apply and verify GitHub main-branch protection, independent review, and required status checks.
3. Verify Firebase project ownership and actual Web/Android/iOS/macOS app registrations; configure approved Auth providers, domains, App Check, rules, and billing controls.
4. Run Flutter analyze, tests, web build, Android debug build, and required iOS development validation on a real initialized runner.
5. Deploy and test the backend only in isolated staging with Firebase identity, D1, rate limits, idempotency, and negative authorization tests.
6. Verify the Web repository's actual Cloudflare Git build/deploy configuration and exact production hostname ownership. Reconcile the 100% frontend sampling config with the 10% flagship config and confirm intended privacy/cost posture.
7. Complete browser/device, accessibility, security, and authenticated end-to-end tests.
8. Obtain independent release review and a separate explicit production change plan with rollback evidence.

## Review limitations

This truth review used GitHub repository, branch, PR, file, and workflow APIs plus the provider readbacks recorded in PR #504. No Cloudflare or Firebase account-management connector was available for a fresh direct provider read in this review. Consequently, Cloudflare live-state details above are attributed to the checked-in PR evidence, and Firebase account readiness remains explicitly unverified.

**Final status: SOURCE WORK EXISTS; END-TO-END PRODUCTION READINESS NOT PROVEN.**


## Exact-head CI recheck — 2026-11-08T18:30Z

The GitHub connector was used to query workflow runs associated with the current PR #504 head commit `5234d224b427c5c52689468a16b42078ec568b48`. Five PR workflow attempts were returned:

| Workflow | Run ID | Conclusion | Jobs | Artifacts |
|---|---:|---|---:|---:|
| Flutter Firebase Integrity | 42510019917 | startup_failure | 0 | 0 |
| Mobile Native Build Recovery | 42510020885 | startup_failure | 0 | 0 |
| Lingo Legacy Static CI | 42510021732 | startup_failure | 0 | 0 |
| G02 Runner Image Build (no publish) | 42510022834 | startup_failure | 0 | 0 |
| Crimson Smoke UI — static validation | 42510023696 | startup_failure | 0 | 0 |

The Jobs and Artifacts endpoints were queried separately for all five run IDs and independently returned zero jobs and zero artifacts. No checkout, setup, Node test, Flutter analyze/test/build, or deploy command ran in these attempts. This is a workflow startup/execution-platform blocker, not evidence that application tests passed or failed.

The current PR #504 is still open, draft, and mergeable according to GitHub PR metadata. Its base is `main`; its head is `hardening/flutter-firebase-cloudflare-2026-11-08`. The repository metadata grants the connected GitHub identity admin, maintain, pull, push, and triage permissions, but the available connector does not expose branch-protection/ruleset mutation or Actions runner/permissions administration. The repository's `.github/CODEOWNERS` and PR template remain policy files, not enforcement.

No workflow retry was attempted because these runs have zero jobs to rerun. No PR merge, branch-protection change, runner registration, Firebase mutation, Cloudflare mutation, secret change, or deployment was performed by this recheck.
