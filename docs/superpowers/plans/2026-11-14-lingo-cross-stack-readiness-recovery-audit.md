# LINGO Legacy Cross-Stack Readiness and Recovery Audit

**Date:** 2026-11-14  
**Canonical source:** `thelingolegacy-blip/TheLingoLegacy`  
**Security work branch:** `security/two-layer-public-surface-repair-2026-11-14`  
**Related change:** [Draft PR #574](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/574)  
**Release posture:** PROTECTED HOLD — no merge, production deployment, DNS/route change, secret mutation, or runner activation.

## Executive status

The security implementation is present on the working branch, but its CI evidence is blocked before job creation. The current stack also contains several independent readiness issues that should be repaired in separate, reviewable changes rather than bundled into the security PR.

## 1. GitHub Actions recovery

On commit `c28cdc42dabbdd9e203932a1db814931133f81f0`, five PR workflows were observed with `startup_failure`:

- Worker Route Security — run `43578159105`
- Static Publication Policy — run `43578161489`
- Lingo Legacy Static CI — run `43578159892`
- Crimson Smoke UI — run `43578160725`
- G02 Runner Image Build — run `43578162270`

The two new security workflows each returned zero jobs on the prior attempt. This is not evidence of a failed test assertion: no runner job or step was instantiated. The failure affects unrelated workflows as well, so do not assume a defect in either new workflow is the cause.

**Recovery sequence**
1. Inspect repository Actions policy, runner availability, concurrency, billing/quota, and organization-level restrictions using authorized GitHub settings access.
2. Confirm the current GitHub Actions service status and compare against another known-good repository workflow.
3. Retry the two security workflows only after the startup cause is understood; preserve run IDs and attempt numbers.
4. If GitHub-hosted runners remain unavailable, prepare a separate hosted-runner recovery issue. Do not activate the G02 self-hosted runner as a workaround.
5. Require non-empty jobs, instantiated steps, completed test commands, and commit-correlated logs before marking either boundary verified.

## 2. Vercel deployment integration

PR #574 has a failing status context named `Vercel – the-lingo-legacy`. The Vercel bot comments report the project has exceeded the free-plan API deployment allowance (more than 100 deployments per day).

This is a separate deployment-provider issue from GitHub Actions startup failure. The intended architecture is GitHub source control plus Cloudflare production edge. The Hobby and Pro Vercel projects linked to this same repository were both updated to disable preview deployments. The Hobby project has only Vercel-generated preview domains; the Pro project still lists the apex and www custom domains. Cloudflare DNS currently points apex/www through proxied Worker routes, not to Vercel. A project-pause attempt on the Pro project was rejected by Vercel with `invalid_deployment: Active production deployment does not exist`; no pause or deletion was forced. Therefore preview generation has been disabled, but full Vercel retirement is **not complete**: the Pro project remains attached to the apex/www custom domains and its Git integration has not been disconnected. Do not delete or detach those domains until the Cloudflare-first cutover is formally accepted. Do not upgrade a paid plan as an automatic workaround.

## 3. Cloudflare live-state reconciliation (read-only inspection)

The connected Cloudflare account exposes the `thelingolegacyv-5` Worker. Its current routes include `thelingolegacy.com/*`, `www.thelingolegacy.com/*`, and numerous product subdomains. The exact root route `thelingolegacy.com/` is separately assigned to `lingo-flagship-root`.

The Worker version inventory shows:
- Latest uploaded version: **325**, alias `security-two-layer-public-surface-repair-38a0`, uploaded 2026-11-14 08:45 UTC, with preview metadata.
- Active deployment version: **137**, created 2026-10-25 14:04 UTC, currently at 100% in the latest deployment record.

Thus, version 325 is an uploaded preview version, not proof of a production promotion. Keep it that way until tests and release approval are complete.

Repository `wrangler.jsonc` names `thelingolegacyv-5`, matching the live Worker script name. It declares the apex and www routes. Do not change these routes in this recovery phase.

## 4. Firebase Hosting and app configuration risks

The root `firebase.json` declares `hosting.public: "."`. Its Firebase ignore list currently excludes only Firebase config files, hidden files, and node_modules. It does not explicitly exclude non-hidden repository areas such as `docs/`, `config/`, `scripts/`, `ops/`, and `cloudflare/`.

This is a potential source-publication exposure if this configuration is deployed as written. The Cloudflare `.assetsignore` does not control Firebase Hosting. The actual deployed Firebase Hosting state was not verified.

Additional findings:
- `.firebaserc` points to `lingo-legacy-production`.
- `firebase.client.json` contains placeholder API key, app ID, and sender ID values.
- `lib/firebase_options.dart` also contains placeholders.
- `scripts/verify-flutter-firebase.mjs` explicitly fails while those placeholders remain.
- `infrastructure/registry/firebase-projects.json` records the root Firebase deployment target as NOT_VERIFIED and notes no root Firestore rules source is configured.
- Root Flutter dependencies are declared, but no root `pubspec.lock` was found in the inspected main-branch tree.
- The existing `.github/workflows/flutter-firebase-integrity.yml` runs on push/workflow_dispatch, not pull_request. It will run its Firebase placeholder check before dependency resolution/analyze/tests/build.
- No Firebase deploy or project migration was performed.

**Required repair:** verify the real Firebase project and Hosting target, create a dedicated generated public build directory, inventory required public assets, add a strict Firebase Hosting ignore/allowlist policy, and add PR-triggered config validation. Do not switch Hosting to a guessed directory or deploy until the actual build output is verified.

## 5. Flutter and Android release readiness

The root Flutter app declares Firebase Core, Realtime Database, Auth, Storage, Analytics, Provider, HTTP, and related dependencies. Its declared SDK lower bound is broad (`>=3.0.0 <4.0.0`), and the workflow uses the latest stable Flutter channel rather than a pinned SDK version.

The root Android app configuration currently uses `signingConfig signingConfigs.debug` for the release build type. This is not an acceptable production signing arrangement. Replace it in a separate change with environment-backed release signing and a fail-closed build check; never commit keystore files or passwords.

The Oasis client has a separate Flutter package with SDK minimum `3.4.0`; its Firebase Functions package declares Node 20 and dependencies but no package lockfile was found. Pin compatible SDK/toolchain versions and commit deterministic lockfiles after resolving dependencies in a trusted build environment.

No Flutter SDK, Android SDK, Xcode, CocoaPods, or Unity editor installation was performed in this audit. No app builds were claimed.

## 6. Doughboys Oasis backend

The Oasis Firebase Functions package uses Firebase Admin and Functions v2, with callable wallet initialization and idempotent virtual-currency purchase logic. Its Firestore rules deny all client writes and restrict player reads to the authenticated owner. The Oasis Cloudflare Worker has no production route declared, and its backend URL is intentionally omitted.

Keep this service in staging until:
- Node 20 dependencies are locked and reproducible;
- TypeScript build/lint and emulator tests pass;
- callable-function auth, idempotency, wallet/ledger invariants, and abuse controls are tested;
- Firestore rules are tested in the emulator;
- a backend URL and secrets are configured through an approved secret manager;
- non-cash-value virtual currency disclosures and purchase boundaries are reviewed.

## 7. Required stack/toolchain inventory

| Layer | Source of truth / configuration | Readiness |
|---|---|---|
| GitHub | Canonical repository and PR #574 | Connected; Actions startup blocked |
| Cloudflare | `wrangler.jsonc`, live Worker `thelingolegacyv-5` | Connected; preview v325, active v137 |
| Firebase Hosting | `firebase.json`, `.firebaserc` | Target not verified; root directory too broad |
| Flutter | Root `pubspec.yaml`, Oasis Flutter package | Declared; deterministic lock/build verification outstanding |
| Android | `android/app/build.gradle` | Release signing is debug; release blocked |
| Oasis Functions | Node 20 package and TypeScript source | Staging only; lockfile/build/emulator proof outstanding |
| Unity | No Unity project manifest/editor version found in inspected root tree | Not yet established for this repository snapshot |
| Vercel | PR status context and bot comments | Free deployment quota exceeded; retire integration review required |

## 8. Execution waves

### Wave A — Restore test execution
- Resolve GitHub Actions startup failures at the repository/account level.
- Keep the security workflows separate and least-privilege.
- Run tests and capture logs/artifacts tied to the exact PR head SHA.

### Wave B — Close publication exposure
- Verify Firebase Hosting project and deployed target.
- Create and inventory a dedicated public build output.
- Add a Firebase-specific publication boundary and negative tests.
- Do not alter production Hosting configuration before preview validation.

### Wave C — Make app builds reproducible
- Pin Flutter and Node toolchains.
- Resolve and commit Flutter and Functions lockfiles.
- Replace Android debug release signing with secure environment-backed signing.
- Add PR checks for Flutter analyze/tests, web build, and Android debug build.

### Wave D — Reconcile providers and edge
- Review Vercel integration retirement without paid upgrades.
- Keep Cloudflare as production edge and GitHub as source authority.
- Compare Worker preview version 325 with active version 137 using source/build digests and regression tests.
- Require a separately approved promotion plan before production activation.

## Acceptance criteria

- [ ] Both independent security workflows complete actual jobs and test steps.
- [ ] Firebase Hosting public directory is a verified build output, not the repository root.
- [ ] Firebase project IDs, rules, and deploy target are verified.
- [ ] Flutter dependencies resolve from committed lockfiles and CI SDK pins.
- [ ] Android release signing no longer uses debug signing.
- [ ] Oasis Functions build, lint, emulator tests, and security rules tests pass.
- [ ] Vercel deployment integration is reconciled with the Cloudflare-first architecture.
- [ ] Cloudflare active version remains protected until separate release approval.
- [ ] No production deployment, merge, DNS/route change, G02 runner activation, or secret mutation occurs as part of this audit.

**Conclusion:** LINGO's source and edge infrastructure are connected, but the complete multi-stack build/release chain is not yet verified. Prioritize Actions startup recovery and Firebase publication isolation before any production promotion.
