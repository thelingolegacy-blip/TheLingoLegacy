# LINGOlegacy_MASTER — Unified Build, Acceleration & Publisher Release Readiness

**Assessment:** 2026-11-14  
**Canonical source:** `thelingolegacy-blip/TheLingoLegacy` / `main`  
**Change branch:** `recovery/build-release-acceleration-2026-11-14`  
**Disposition:** PROTECTED HOLD — documentation and non-production CI readiness only.

## Executive status

This work package adds a parallel hosted build/readiness workflow, a machine-readable platform matrix, publisher connection register, signing policy, release manifest template, and a deterministic readiness validator. It does not claim publisher accounts are connected, credentials exist, signed builds were produced, store submissions were made, or approvals were granted.

### Evidence-backed findings

| Area | Observed state | Gate |
|---|---|---|
| GitHub repository | Connected account has admin/maintain/push access to canonical repository; default branch is `main` | Access verified |
| GitHub Actions | Latest PR checks on 2026-11-14 (including new readiness run 43582618910) concluded `startup_failure`; new readiness run returned zero jobs and zero artifacts | BLOCKED — startup / runner dispatch recovery |
| Branch protection | Read endpoint returned 403 `Resource not accessible by integration` | UNVERIFIED — do not infer protection state |
| G02 | Self-hosted G02 workflow is present; no runner execution evidence; preserve inactive | HOLD — do not activate |
| Flutter/Firebase | `lib/firebase_options.dart` contains placeholder API keys/app IDs; `scripts/verify-flutter-firebase.mjs` correctly rejects them | BLOCKED — project credentials/app registration not verified |
| Firebase Hosting | `firebase.json` publishes `.`; `.firebaserc` names `lingo-legacy-production` | BLOCKED — output scope and live project identity must be confirmed before deploy |
| Android | `applicationId=com.thelingolegacy.app`; release build currently uses `signingConfigs.debug`; target SDK 34 | BLOCKED — owner-controlled upload signing and current Play target-policy check |
| iOS | Xcode project file is a stub; no real archive demonstrated | BLOCKED — generate native project and verify on macOS |
| Cloudflare | Authenticated identity, active `thelingolegacy.com` zone, seven Worker scripts and 21 Worker routes read successfully; `/healthz` returned `ok` | BLOCKED — active Worker versions lag latest uploads: `thelingolegacyv-5` active v137 vs latest uploaded v327; `lingo-flagship-root` active v1 vs latest uploaded v3; staging Worker is active at v7 |
| Publisher portals | No Apple, Google Play, Amazon, Samsung, LG, Roku, PlayStation, Xbox or Nintendo account connection evidenced | OUTSTANDING |
| Signing/submission | No protected signing identity, signed release artifact, submission receipt, publisher approval or internal certificate evidenced | OUTSTANDING |

## Cloudflare version reconciliation evidence\n\nRead-only Cloudflare API inspection on 2026-11-14 found: apex and www route to `thelingolegacyv-5`, while the exact-root route `thelingolegacy.com/` routes separately to `lingo-flagship-root`. The latest active deployment for `thelingolegacyv-5` is version 137 (created 2026-10-25), while the latest uploaded version is 327 (created 2026-11-14). The root Worker is active at version 1 while latest uploaded is version 3. The Studio Control Center staging Worker is active at version 7, which matches its latest uploaded version. `/healthz` returned `ok`; the runtime and manifest endpoints could not be fetched by the available public-page reader. These observations are recorded as drift, not as authorization to deploy a newer version. Preserve the current active versions until source-to-version mapping, route ownership, health probes, rollback and acceptance are reconciled.\n\n## Parallel build architecture

The new workflow `.github/workflows/lingo-parallel-build-readiness.yml` uses GitHub-hosted `ubuntu-latest` runners only. It never targets G02, deploys, signs, accesses production secrets, changes DNS, or submits packages.

Independent jobs:
1. **Foundation contract** — validates JSON registries and repository release invariants; emits a status report.
2. **Flutter build matrix** — runs independent Web Release and Android Debug build lanes in parallel; each uploads a checksummed artifact.
3. **Evidence collection** — retains logs, source SHA, run ID, toolchain context, and artifact digest.

Acceleration controls:
- matrix fan-out only for independent targets;
- immutable dependency cache keys based on lockfiles/toolchain;
- concurrency group prevents duplicate runs on the same ref;
- bounded parallelism;
- no cache may bypass tests or policy checks;
- no signing secrets available to build jobs;
- no deploy or submission stage in this workflow.

## Product and platform routing

See `release/platform-matrix.json`. Portfolio/product names are catalog entries, not claims that every title already has a platform build. Every product needs an explicit product owner, exact public title, bundle/package ID, engine, supported target, privacy/content classification, publisher account, and release channel before packaging.

### Current target posture

- **Web:** candidate build lane; Cloudflare is intended production edge; no deployment authorization.
- **Android:** debug build can be tested; release signing remains blocked.
- **iOS:** blocked until a real Xcode project and macOS archive exist.
- **Android TV / Google TV, Fire TV, tvOS, Tizen, webOS, Roku:** separate UI, packaging, device QA and publisher certification required.
- **PlayStation, Xbox, Nintendo Switch:** platform enrollment and SDK approval are prerequisites; no proprietary SDK access is evidenced.
- **Unity game builds:** product-by-product engine/platform decisions remain required; do not infer a Unity player exists from game IP inventory.

## Publisher connections

See `release/publisher-connection-register.json`. Each publisher adapter must have an owner-approved account, app identity, least-privilege credentials stored outside Git, a successful authenticated read/test, and an audit record. Portal enrollment, legal agreements, identity verification, tax/payout details, and fees are account-owner actions. Chat authorization does not create those accounts or supply those credentials.

## Protected signing

See `release/signing-policy.json`. Build workers must produce unsigned candidates. Signing must occur in a separate protected job after validation, using a managed signing service or protected secret store and short-lived authorization. The exact validated artifact digest must be signed; the signature and certificate chain must then be verified. Private keys, keystores, provisioning profiles, API keys, service-account JSON, and passwords must never be committed or pasted into chat.

- Android: create owner-controlled upload key and enable Play App Signing in Play Console.
- Apple: verify developer team, bundle ID, distribution certificate, provisioning profile, App Store Connect API issuer/key IDs and access roles.
- Games/TV/console: use each publisher's approved signing and package process.

No signing credentials are currently provisioned by this change.

## Submission and approval states

`NOT_CONNECTED → CONNECTED_VERIFIED → PACKAGE_READY → SIGNED_VERIFIED → SUBMITTED → IN_REVIEW → APPROVED / CHANGES_REQUESTED → INTERNAL_ACCEPTANCE → RELEASE_AUTHORIZED`

Each state requires a timestamp, actor, exact artifact SHA-256, portal receipt/review reference, and evidence location. Submission, publisher approval, internal acceptance, and production promotion are separate decisions.

## Implementation sequence

1. Restore GitHub Actions startup and prove hosted job execution, non-empty job/step records, logs, and artifacts.
2. Run the new hosted readiness workflow; diagnose startup failure at repository/org Actions configuration level through an authorized admin surface.
3. Complete Firebase project/app registration and replace placeholders through protected CI secrets/config management; verify Auth, database/storage rules, App Check, backups, and non-production integration tests.
4. Verify Cloudflare Worker deployment/version mappings, exact route precedence, origin/asset behavior, health probes, observability, and rollback in a non-production environment.
5. Generate real Android/iOS native projects; resolve Android release signing and iOS archive readiness.
6. Complete publisher account enrollment and app identity mapping for each intended platform.
7. Configure protected signing, create signed artifacts, verify signatures and provenance.
8. Generate store metadata, privacy declarations, age/content ratings, screenshots, support/legal URLs, SBOM, and QA reports.
9. Submit through first-party portals; capture receipts and reviewer decisions.
10. Obtain independent security, product-owner and release-manager acceptance; rehearse rollback; separately authorize staged promotion.

## Acceptance standard

A lane is not release-ready until the canonical source commit, successful hosted job execution, completed steps, test/security reports, immutable artifact digest, provenance, verified signature, authenticated publisher connection, submission receipt, publisher approval, internal acceptance, rollback evidence, and explicit promotion authorization are all recorded.

**No evidence = no certification = no production promotion.**
