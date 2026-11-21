# Current-head source-review delta — 2026-11-20

**Purpose:** Correct stale source-review findings in `02-source-review-findings.md` against the current PR heads observed during the follow-up audit. This addendum does not claim tests, builds, hosted workflows, or runtime acceptance.

## PR #596 — CORE V2 Go API

- Current observed PR head: `9dd256532c056f4aa5985aa68fd3975e5f7d4d9a`.
- Re-read `platform/lingo-core-v2/services/api/internal/httpapi/server_test.go`. The 5,000-character body test now uses a valid Go string literal:
  `body := "{\\\"display_name\\\":\\\"" + strings.Repeat("x", 5000) + "\\\"}"`.
- Therefore the compile-blocking malformed-string finding recorded against the earlier inspected head is **RESOLVED IN CURRENT SOURCE**. This is source inspection only; `gofmt`, `go test ./...`, race, vet and build have not been run.
- `platform/lingo-core-v2/services/api/go.mod` still requires `github.com/coreos/go-oidc/v3 v3.12.0` and `github.com/jackc/pgx/v5 v5.7.2`. A read of `go.sum` at this current branch returned NOT_FOUND. Dependency checksum generation and validation remain **BLOCKED / NOT VERIFIED**.
- PR #596 remains a draft stacked on PR #594. Reconcile current parent ancestry before accepting or integrating it.

## PR #611 — LLG Dispatch contract

- Current observed PR head: `f246d69053e1aa0e80a30b7c9763c17e91eea75e` (read back 2026-11-21).
- Re-read `ops/dispatch/contract.py`: `ENVELOPE_STATUSES` excludes `COMPLETE`; `validate_job()` rejects terminal/unsupported initial statuses; completion remains reachable only through `transition()` with non-empty evidence references and distinct owner/reviewer ID strings.
- Re-read `ops/dispatch/job-envelope.schema.json`: the initial status enum excludes `COMPLETE`.
- Re-read `ops/dispatch/tests/test_contract.py`: it includes direct-COMPLETE rejection, schema alignment, and cost-bound assertions matching the current exact-zero error.
- Therefore the prior direct-COMPLETE bypass and cost-error assertion mismatch findings are **RESOLVED IN CURRENT SOURCE**. This is source inspection only; Python unit tests and hosted CI have not executed.
- Remaining design limitation: `transition()` validates distinct non-empty ID strings but does not itself authenticate those identities or verify signed completion attestations. The package remains a validator/catalog, not an authenticated scheduler or operational authorization service. Do not treat role labels or string IDs as proof of human identity.

## PR #613 / #614 — Flutter, Firebase and Android

- Current observed heads: #613 `09028483c78da0df9804a27cfcf2c0a44ffd6c32`; #614 `a3a43df71d0af491b5991982984844a558beb0a7` (read back 2026-11-21).
- Current changed-file inventories: #613 = 43 paths; #614 = 44 paths; exact intersection = 37; #613-only = 6; #614-only = 7. Do not merge both candidates wholesale.
- Both branches contain the Kotlin DSL Android project files at `android/settings.gradle.kts`, `android/build.gradle.kts`, and `android/app/build.gradle.kts`. The earlier check for Groovy filenames (`.gradle`) returned 404 and did not establish that the Kotlin DSL scaffold was absent. This corrects the prior inaccurate statement in this evidence record.
- #613 does not contain `android/gradlew`, `android/gradlew.bat`, or `android/gradle/wrapper/gradle-wrapper.jar` at the observed head.
- #614 contains all three wrapper paths. The wrapper JAR's Git blob SHA is `9fa581f7838ae3322a75b33868832aa9e14124fd` (not a SHA-256 digest). A PR comment on the exact current head reports a 47,250-byte JAR with SHA-256 `6ea8ab3ed93d661ee701ff35e50df349320803eef7b2bcd7a149e9d95d4db3d4`. This reported digest does **not** match Gradle's official 9.5.0 wrapper-JAR checksum `497c8c2a7e5031f6aa847f88104aa80a93532ec32ee17bdb8d1d2f67a194a9c7`; therefore the tracked JAR remains untrusted and must not be executed. The provenance of the reported JAR must be reconciled or the binary replaced from a trusted official Gradle distribution and verified independently.
- #614's `gradle-wrapper.properties` selects `https://services.gradle.org/distributions/gradle-9.5.0-all.zip`. On 2026-11-21, a source-only update added the official Gradle 9.5.0 complete-distribution checksum as `distributionSha256Sum=a3c4ba4aca8f0075688b9c5b18939fd28e8cb4357c227da5c1d9f38343791439` (commit `54e2cb8171a8cb1a3135838056c92f99df4fbaf1`). This pins the downloaded distribution but does not authenticate the mismatched wrapper JAR.
- The PR #614 diff includes a test fixture that deliberately writes a synthetic ZIP-like wrapper JAR and minimal wrapper scripts into a temporary test project. This is fixture data, not proof that the tracked binary JAR is synthetic or authentic; keep the tracked binary's provenance check separate from fixture review.
- Both `pubspec.yaml` files use `material_ui: ^1.11.1` and import `package:material_ui/material_ui.dart`. The SDK floors differ: #613 `>=3.6.0`; #614 `>=3.12.0`. Flutter 3.50.0's actual bundled Dart version and all dependency constraints still need locked resolution evidence.
- Both candidates remove the earlier asset/font declarations. A full reference/file inventory for `Image.asset`, `AssetImage`, font families and asset paths remains outstanding. Do not restore or delete assets blindly.
- #614's active-platform Firebase options validation and empty/quarantined generated Hosting allowlist remain the safer candidate boundaries, subject to actual tests and independent review. Firebase staging identity/credentials remain unconfigured; publication remains blocked.

### Updated reconciliation disposition
1. Correct the stale scaffold finding: Kotlin DSL Android project files are present on both branches; wrapper files are present only on #614.
2. Keep #614 as the candidate security/publication baseline, not as an accepted bundle. The distribution checksum is now pinned; the wrapper JAR digest reported in the PR does not match Gradle's official 9.5.0 JAR checksum, so do not execute it. Resolve provenance or replace it from a trusted official source and independently verify.
3. Preserve #613's dedicated read-only hosted Actions probe separately; keep mutable action references out of the accepted build workflow.
4. Resolve the Dart SDK floor with actual Flutter 3.50.0 and lockfile evidence; inventory assets/fonts before accepting pubspec changes.
5. Run dependency resolution, analyzer, unit tests, Android readiness and debug APK build only in an isolated unprivileged environment after binary provenance checks. Hosted Actions evidence remains unavailable.

## PR #615 — one-time restoration orchestrator

- Current observed PR head: `272bff018c17f358a95d26bd847ab4e6306aa627`.
- Source readback confirms mandatory exact source SHA, clean worktree, stable pre/post-copy SHA-256 manifests, symlink rejection, restricted child environment, and required disposable unprivileged host acknowledgement.
- The script explicitly states that the acknowledgement flag does not enforce isolation or child-process egress restrictions. Do not execute it on a normal developer workstation or credentialed host. A disposable unprivileged VM/container with no provider credentials, host mounts or privileged sockets and host-enforced deny-by-default egress is a prerequisite.
- The orchestrator has not been Python-compiled or executed in the current audit. Its source and unit tests are not runtime acceptance.

## Overall disposition

- This addendum corrects source findings only. It does not convert any workstream to PASS or ACCEPTED.
- GitHub Actions admission remains owner/admin dependent; observed startup failures and empty step/artifact evidence remain blockers.
- G02 remains FAIL / UNVERIFIED. G03–G11 remain blocked pending their own evidence.
- Production remains PROTECTED HOLD. No merge, workflow dispatch, runner activation, provider mutation, deployment, DNS/Worker change, payment activation, or production promotion was performed.
