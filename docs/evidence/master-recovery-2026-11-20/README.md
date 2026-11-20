# Master recovery evidence — 2026-11-20

**Disposition:** PROTECTED HOLD. This is a read-only source/inventory reconciliation record committed only to an isolated recovery branch. It is not a release certificate, CI result, security certification, or authorization to merge or promote.

## Source identity

- Canonical repository: `thelingolegacy-blip/TheLingoLegacy`
- Main baseline observed in the active recovery PRs: `1a60e2314cb3f9b5e3efe648ade83121080cb7b2`
- Evidence branch: `recovery/master-recovery-evidence-2026-11-20`
- Governing work order: [Issue #612](https://github.com/thelingolegacy-blip/TheLingoLegacy/issues/612)
- Last-known-good, production, DNS, Workers, Firebase production, payments, cashout, and G02 remain protected.

## Recovery PR inventory

| PR | Head branch | Head SHA | State | Files |
|---|---|---|---|---:|
| [#574](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/574) | `security/two-layer-public-surface-repair-2026-11-14` | `604a1b32e975a39800ce4ab8fd4bb88e46712b5f` | Open / draft / unmerged | 12 |
| [#589](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/589) | `safety/2026-11-14-g02-push-trigger-quarantine` | `940695bb39cdf7802617e13dd1626e8fac8ff110` | Open / draft / unmerged | 12 |
| [#596](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/596) | `implementation/lingo-core-v2-foundation` | `9dd256532c056f4aa5985aa68fd3975e5f7d4d9a` | Open / draft / unmerged | 29 |
| [#611](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/611) | `feat/dispatch-contract-v1-2026-11-16` | `f779686eec42d10be0fbc8a2ac436304edc86e45` | Open / draft / unmerged | 4 |
| [#613](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/613) | `recovery/actions-startup-probe-2026-11-16` | `09028483c78da0df9804a27cfcf2c0a44ffd6c32` | Open / draft / unmerged | 43 |
| [#614](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/614) | `recovery/firebase-hosting-quarantine-boundary` | `7574ad6308f048547a604bd2ace22cab05dc1ef9` | Open / draft / unmerged | 41 |
| [#615](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/615) | `audit/reconciled-v1-1-live-inventory-2026-11-19` | `b266d375e70a048899f32d4681fa0f920feee349` | Open / draft / unmerged | 10 |
| [#618](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/618) | `recovery/hosted-canary-zero-uses-2026-11-20` | `0340b1f3cfae66ac11ad7a1da85bcb92a56ce85a` | Open / draft / unmerged | 1 |
| [#619](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/619) | `recovery/master-recovery-evidence-2026-11-20` | `6c4cbad70ba86f446d5df3e3bb420aa03efcbe4b` | Open / draft / unmerged | 14 |

All four PRs target the same observed main baseline. No merge was performed.

## PR #613 / #614 reconciliation

- The two PRs overlap on **37 exact file paths** (out of 43 and 41 respectively). They are competing implementations of the same Flutter/Firebase/Android scaffold and must not be merged independently.
- Shared paths include the Firebase project/config files, Flutter workflow, Android Gradle/Kotlin scaffold and manifests, root `pubspec.yaml` and `pubspec.lock`, Firebase public-output builder and tests, API-21 validators/tests, Oasis Flutter app/test files, and widget tests.
- The root lockfiles are independently generated on different candidate histories. Treat them as conflicting build inputs; regenerate/verify from the selected dependency manifest and pinned Flutter/Dart SDK rather than choosing by timestamp or copying both.
- PR #614 is the stronger baseline for the **Firebase Hosting safety boundary**: generated `build/firebase-public` output, empty quarantined allowlist, explicit non-production Firebase placeholder, and stricter non-placeholder `projectId` startup guard. Its branch also adds a preview-build harness and Oasis lockfile capture.
- PR #613 contains useful additional work not equivalent to the #614 hosting boundary: the inline hosted Actions probe and additional preview/build documentation. Its PR description reports earlier successful preview/build checks, but those do not prove current-head acceptance; Android APK/AAB and device tests are explicitly not claimed.
- Recommended consolidation (not executed): preserve #614's Firebase/publication boundary as the candidate source of truth; selectively port only independently reviewed #613-only changes that remain needed; regenerate and verify the root lockfile; then run the consolidated candidate at one exact SHA. Do not merge either draft until actual current-head CI and independent review pass.

## Actions admission and canary disposition

- PR #613's startup probe uses `actions/upload-artifact@v4`; this still depends on the repository Actions policy admitting that action.
- PR #618 is the smallest zero-third-party-action `ubuntu-latest` canary. It intentionally has no checkout, artifact upload, deployment, secrets, or G02 dependency. It can establish job admission/step execution if Actions admission permits it, but cannot alone satisfy the full artifact-evidence acceptance criteria in #612.
- Latest observed Actions run `44817603252` ended `startup_failure`; its jobs endpoint returned no jobs. This is a pre-job admission/startup failure, not a test failure. The connector cannot inspect repository/organization Actions settings, hosted-runner entitlement/quota, or runner-group policy.
- Owner/admin action remains required to inspect repository Actions enablement/allowed-actions and organization policy, hosted-runner entitlement/quota/concurrency, and provider status. Do not repeatedly dispatch workflows until that gate is resolved.

## PR #615 orchestrator source review

- The orchestrator was fetched from the PR #615 branch at file blob `f01c7e7037a0ba068f9a288814a67d8efed3c1a6`; the fetched source is **953 lines**. Its companion test file is 118 lines and contains 11 unit tests.
- It requires exact current PR head SHA values for external candidate worktrees, clean Git checkouts, and required test/module files. Current candidate heads to correlate are #614 `66be1f6369f9a8bf3fd8b6c7aeca1a0ce768a666` and #596 must be freshly re-read before any execution. Missing expected SHA is BLOCKED; mismatched or dirty candidates FAIL.
- It defines dependency-ordered Wave 0–3 gates. A non-PASS wave blocks later waves. It records external blockers for Actions admission, Cloudflare deployment provenance, Firebase live connectivity, identity/wallet integration, backup/DR, independent security certification, and production activation.
- It does not deploy, merge, mutate DNS/Cloudflare/Firebase, provision services, enable payments, start runners, or delete backups.
- **Execution was not attempted.** The README explicitly requires a disposable unprivileged VM/container, no provider credentials, no SSH agent, no host mounts or privileged sockets, and host-enforced deny-by-default egress. The `--isolated-host-confirmed` option is only an operator attestation and does not enforce isolation. Network-enabled mode limits the orchestrator's own probes but does not sandbox child-process egress. This environment has not established those host controls or clean local checkouts, so running the orchestrator here would be unsafe and would not create valid acceptance evidence.
- The script's local secret scan is BLOCKED when `gitleaks` is absent; it deliberately does not download/install a scanner. A local scan would not substitute for independent SAST/SCA, SBOM/provenance, threat-model, and security review.

## Verified versus unverified

**Verified from GitHub source/API inspection:** PR states, branch/head SHAs, changed-file counts, 37-path overlap, orchestrator/test source contents, and the existence of the separate zero-uses canary.

**Not verified by this record:** current-head CI, local Flutter/Android/Go builds, orchestrator runtime, artifact checksums, Firebase staging connectivity, Cloudflare production provenance/health, backup restore, security certification, product journey/device QA, or any production readiness.

## Required next actions

1. Repository/organization owner resolves and evidences Actions admission and hosted-runner entitlement/policy.
2. Reconcile #613/#614 on an isolated integration branch; retain #614's safe Hosting boundary and selectively port reviewed #613-only work.
3. Re-read #596 and #614 current head SHAs immediately before preparing clean local candidate worktrees.
4. Execute #615 orchestrator only in a verified disposable, uncredentialed, unprivileged VM/container with enforced egress controls; archive full logs and generated checksums without fabricating missing evidence.
5. After Actions admission is restored, run the zero-uses canary first, then the artifact-bearing evidence workflow, then restore CI incrementally.
6. Continue Phases 2–9 of #612 with phase-specific evidence and independent review. Production remains HOLD pending separate explicit authorization.

## Evidence index

- `01-dependency-and-safety-reconciliation.md`
- `02-source-review-findings.md`
- `03-portfolio-and-contract-review.md`
- `04-actions-run-evidence.md`
- `05-current-main-public-surface.md`
- `06-website-branch-ancestry.md`
- `07-isolated-source-repairs.md`
- `08-flutter-firebase-candidate-reconciliation.md`
- `09-flutter-ci-coverage-repair.md`
- `10-post-repair-actions-admission.md`
- `11-g02-workflow-quarantine-review.md`
- `12-worker-first-static-routing.md`
- `13-static-asset-root-inventory.md`

## Change log

- 2026-11-20: added current PR heads, #574/#589 quarantine inventory, G02 workflow quarantine review, Worker-first static routing correction, and a measured top-level static-asset inventory.
- 2026-11-20: created this evidence record on isolated branch `recovery/master-recovery-evidence-2026-11-20`. No main-branch change, PR merge, workflow dispatch, runner action, provider mutation, deployment, payment activation, or production operation was performed.
