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

- Current observed PR head: `f779686eec42d10be0fbc8a2ac436304edc86e45`.
- Re-read `ops/dispatch/contract.py`: `ENVELOPE_STATUSES` excludes `COMPLETE`; `validate_job()` rejects terminal/unsupported initial statuses; completion remains reachable only through `transition()` with non-empty evidence references and distinct owner/reviewer ID strings.
- Re-read `ops/dispatch/job-envelope.schema.json`: the initial status enum excludes `COMPLETE`.
- Re-read `ops/dispatch/tests/test_contract.py`: it includes direct-COMPLETE rejection, schema alignment, and cost-bound assertions matching the current exact-zero error.
- Therefore the prior direct-COMPLETE bypass and cost-error assertion mismatch findings are **RESOLVED IN CURRENT SOURCE**. This is source inspection only; Python unit tests and hosted CI have not executed.
- Remaining design limitation: `transition()` validates distinct non-empty ID strings but does not itself authenticate those identities or verify signed completion attestations. The package remains a validator/catalog, not an authenticated scheduler or operational authorization service. Do not treat role labels or string IDs as proof of human identity.

## PR #613 / #614 — Flutter, Firebase and Android

- Current observed heads: #613 `09028483c78da0df9804a27cfcf2c0a44ffd6c32`; #614 `7574ad6308f048547a604bd2ace22cab05dc1ef9`.
- Changed-file inventories confirm 37 exact overlapping paths. Do not merge both candidates wholesale.
- PR #614 contains `android/gradle/wrapper/gradle-wrapper.properties`, but the current branch does not contain `android/gradle/wrapper/gradle-wrapper.jar`; its changed-file inventory also does not include `android/gradlew` or `android/gradlew.bat`. Android wrapper readiness remains **BLOCKED**. Do not fabricate binary wrapper files.
- Preserve #614's generated Firebase publication boundary and empty allowlist. Firebase staging identity/credentials remain unconfigured; Firebase activation and Hosting publication remain blocked.

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
