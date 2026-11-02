# LINGOlegacy Parallel Recovery, Repair and Release-Control Dossier

**Record date:** 2026-11-01  
**Repository:** thelingolegacy-blip/TheLingoLegacy  
**Document class:** Non-production recovery plan, evidence register and acceptance checklist  
**Status:** Prepared for review; NOT an execution certificate, acceptance, release approval or production authorization.

## 1. Executive disposition

This dossier establishes parallel recovery lanes so application validation is not dependent on the G02 self-hosted runner. It does not declare the platform repaired or restored. Evidence available at preparation time shows repeated workflow startup failures before usable job execution, including sampled runs with no instantiated jobs. With no job object, runner ID, runner name, steps, job logs or artifacts, the underlying cause cannot be narrowed to a host, runner label, workflow parser, GitHub Actions service or repository policy.

Current disposition:
- G02 canonical execution: BLOCKED / NOT VERIFIED.
- Independent GitHub-hosted validation: DESIGN READY; EXECUTION NOT VERIFIED.
- Application and mobile builds: NOT ACCEPTED until actual build/test outputs are attached.
- Staging: NOT ACCEPTED until isolated environment, configuration and test evidence are verified.
- Production: PROTECTED; NO PROMOTION AUTHORIZATION.
- Finance, billing and paid infrastructure: NO ACTION AUTHORIZED.
- PRs, merges, runner registration, dispatch, service restarts, deployments, DNS/routes and secret changes remain subject to the existing hold and separate explicit approval.

## 2. Non-negotiable control model

All lanes follow:

SOURCE → ACTUAL EXECUTION → RETRIEVABLE EVIDENCE → INDEPENDENT VERIFICATION → ACCEPTANCE → AUTHORIZATION → PROMOTION

A green UI badge, queued workflow, draft PR, source patch, syntax check, successful hosted diagnostic, or artifact without provenance is not acceptance.

### Change classes

| Class | Examples | Allowed under current hold |
|---|---|---|
| Read-only inspection | Repository/workflow/PR/run/branch/config inventory; logs and artifact metadata | Yes |
| Documentation | Runbooks, checklists, evidence schemas, support packet drafts | Yes |
| Non-production source proposal | Isolated branch/PR with reviewable code or config changes | Only within previously permitted source-remediation scope; do not merge |
| Staging mutation | Provisioning, secrets, database migration, Worker deployment, app deployment | Not authorized without specific approval |
| Runner operations | Register, replace, restart, dispatch, host provisioning | Not authorized |
| Production operations | Merge-to-release, deploy, DNS/routes, secrets, data migration, promotion | Prohibited |
| Financial operations | Paid runner, cloud resource, subscription, billing/payment changes | Not authorized |

Never request or paste passwords, private keys, tokens, or secret values into chat or documentation. Use approved secret-management only after authorization.

## 3. Parallel recovery lanes

### Lane A — GitHub Actions startup and control-plane diagnosis

Objective: determine whether a workflow is accepted, a run is created, a job is instantiated, and a runner is assigned.

1. Inventory workflow files, triggers, path filters, branch filters, permissions, concurrency, environments, conditions, dependencies, matrices and reusable workflow references.
2. For every failure, capture workflow ID/name, run ID, attempt, event, ref, head SHA, creation/start/completion timestamps and conclusion.
3. Query the run jobs endpoint. Preserve an explicit empty array as evidence; do not infer a runner failure from it.
4. If a job exists, capture job ID, status/conclusion, runner ID/name, labels, steps, runner group, logs URL and artifacts.
5. If no job exists, classify the incident as pre-job / startup boundary and escalate with run ID, workflow file, commit SHA, event and UTC timestamps.
6. Compare a minimal, isolated, non-production diagnostic workflow with an existing known-good hosted workflow. Do not dispatch or rerun under the current hold.
7. Inspect repository Actions settings and policy only through an authorized administrator; connector limitations may prevent reading all organization/repository settings.

Exit criteria: at least one new run has a job object, positive runner ID, runner name, non-null steps, retrievable logs and a provenance-linked artifact. For G02, the assigned runner must match the canonical name and labels. A hosted diagnostic is not proof of G02.

### Lane B — G02 canonical runner recovery

Canonical contract:
- Name: lingo-legacy-g02
- Labels: self-hosted, linux, x64, lingo-g02
- Expected root: /opt/actions-runner
- Expected service: actions.runner.lingo-legacy-g02.service

Host-side checks, performed only by an authorized host administrator:
1. Confirm cloud/account/project, region, VM/instance identity, owner, OS image, architecture and lifecycle.
2. Confirm runner service unit, service state, service logs, listener/worker processes, runner root, .runner registration file and _diag logs.
3. Confirm outbound connectivity to GitHub Actions endpoints, system clock, DNS resolution, disk capacity, memory, CPU and required toolchain.
4. Check runner version compatibility and supported OS; update only under an approved maintenance plan.
5. Inspect registration scope, labels, group and repository association without exposing registration tokens.
6. Confirm only one intended registration exists; do not blindly re-register or use auto-replace.
7. After separately authorized repair, run one controlled assignment probe; capture runner ID/name, labels, host telemetry, service state, listener process, steps, logs and artifact.
8. Independently verify evidence and preserve rollback/recovery notes.

Hard blocker: no authorized G02 host shell/SSH session or confirmed host provider is currently established. The repository collector cannot create a host, fix provider capacity, register a runner, or collect evidence from a job that never starts.

### Lane C — Independent hosted CI

Objective: validate source and application logic without G02 dependency.

- Use GitHub-hosted ubuntu-latest for safe static checks, unit tests and build validation where compatible.
- Keep the lane read-only with respect to production resources.
- Avoid secrets-dependent integration tests unless test credentials and isolated targets are explicitly approved.
- Pin third-party actions to reviewed immutable SHAs before release use; document action version and permission scope.
- Apply least-privilege permissions, explicit timeouts, concurrency controls and artifact retention.
- Distinguish successful hosted execution from G02 acceptance.

Exit criteria: a run is actually created; jobs execute; tests/builds return exit codes; logs and artifacts are retrievable; commit SHA matches reviewed source; independent reviewer signs the result.

### Lane D — Workflow and repository integrity repair

Audit and propose isolated patches for:
- Invalid YAML/expressions, malformed indentation and duplicate keys.
- Incorrect triggers/path filters or branch mismatch.
- Missing/overbroad permissions and environment protections.
- Incorrect job dependencies, conditions, matrix expansion and continue-on-error.
- Unpinned or deprecated actions and incompatible tool versions.
- Missing cache keys, lockfiles, deterministic dependency install and build output paths.
- Artifact upload/download conditions, names, retention and checksums.
- Secrets referenced by a workflow but absent from the authorized environment.
- Concurrency cancellation or timeouts that could terminate evidence collection.

Do not label any suspected item a root cause until a reproducible run demonstrates it. Do not weaken security controls to make a workflow green.

### Lane E — Web / Studio application validation

For Studio Hub, Universe Gateway, web surfaces and shared UI:
1. Inventory app entry points, routes, build scripts, runtime configuration, environment variable names, dependencies and output directories.
2. Run formatting/lint, static type checks where applicable, unit tests, accessibility checks and production-build compilation in isolated CI.
3. Test responsive widths, keyboard navigation, focus states, semantic headings, forms, error/empty/loading states and reduced motion.
4. Verify internal navigation, deep links, 404 handling, metadata, canonical URLs and asset paths.
5. Check browser console/network errors and content-security/CORS behavior against a staging endpoint only.
6. Confirm no accidental production endpoint, secret, payment, analytics or AI activation is introduced.

Acceptance evidence: commit-pinned build log, test report, accessibility report, screenshots or browser trace, artifact checksum and independent QA sign-off.

### Lane F — Flutter / Firebase / mobile build validation

1. Confirm Flutter SDK and Dart versions from project constraints and lockfiles.
2. Validate pubspec.yaml, pubspec.lock, platform directories and generated files.
3. Validate Firebase project identifiers and platform app registrations without printing credentials or secret values.
4. Ensure .firebaserc and firebase_options.dart refer to the intended non-production project for staging tests.
5. Run dependency resolution, flutter analyze, unit/widget tests, web build and Android build in isolated hosted CI.
6. Treat iOS build/signing as a separate macOS/signing prerequisite; do not claim iOS readiness from Android/web success.
7. Test mobile layout, touch targets, safe areas, orientation, navigation, offline/error states and accessibility.
8. Do not deploy Firebase rules, migrate data, activate paid services or alter production Firebase configuration under this hold.

Acceptance evidence: SDK versions, dependency lock hash, analyzer/test output, per-platform build outputs, Firebase project identity (non-secret), test matrix and reviewer sign-off.

### Lane G — Cloudflare staging and production boundary

- Keep the approved production architecture on Cloudflare; do not silently substitute Vercel.
- Inspect Worker source, Wrangler configuration, bindings, routes, compatibility date, build output and environment separation.
- Use a dedicated staging Worker, staging hostname, staging D1/database/storage and test-only credentials only after explicit staging authorization.
- Validate health endpoints, authentication/authorization, CORS, rate limiting, input validation, error handling, observability and rollback.
- Verify production route bindings and DNS remain unchanged during staging work.
- Do not use placeholder IPs, temporary routes or staging bindings as production-ready configuration.
- Do not deploy, change routes/DNS, write secrets, migrate production data or alter account security settings without separate authorization.

Acceptance evidence: staged deployment ID, source SHA, environment/binding inventory with secret values redacted, smoke-test output, security review, rollback target and independent approval.

### Lane H — AI / askLINGO and external integrations

- Separate UI readiness from model/provider connectivity.
- Inventory providers, API adapters, feature flags, data flows, retention, moderation, rate limits and cost controls.
- Keep AI integrations disabled unless separately approved and configured in a test environment.
- Use mocked adapters for deterministic unit tests.
- Verify authorization, prompt/data boundaries, output handling, abuse controls, failure fallbacks and observability.
- Never expose provider keys in client bundles, logs or artifacts.
- Do not enable billable AI features or change model settings under this hold.

### Lane I — Asset, media and game build pipeline

- Track each asset by stable ID, source reference, SHA-256, license/rights evidence, creator/owner, version, approval state and target product.
- Separate source files from generated derivatives; retain provenance and immutable version history.
- Validate image/audio/video dimensions, codecs, duration, file size, alpha/transparency, naming and platform compatibility.
- For game builds, record engine/runtime version, platform target, build configuration, asset manifest, test results and package checksum.
- Keep real-money wagering/payment functionality disabled unless separate legal, regulatory, security and financial authorization exists.
- Do not infer rights ownership from a file's presence in the repository.

### Lane J — Security and privacy review

- Scan dependencies and lockfiles; review known vulnerabilities and unsupported runtimes.
- Review authentication, session handling, role checks, authorization boundaries, input validation, output encoding and CSRF/CORS policies.
- Review secrets exposure, public artifacts, source maps, debug endpoints, logging of personal data and least privilege.
- Review data minimization, retention, deletion, backups and access logging.
- Validate admin MFA and recovery procedures without changing account-level enforcement under the current hold.
- Record findings by severity, exploitability, affected component, evidence and remediation owner.
- No security finding is closed by a proposed patch alone; require a retest.

### Lane K — AppDeploy and deployed-surface inventory

- Reconcile every known AppDeploy app ID against repository, owner, source SHA, deployment target, last deployment, domain, environment and QA status.
- A platform label of deployed is not independent functional acceptance.
- Identify duplicate, orphaned, stale or misrouted surfaces.
- Verify that Studio Hub / Universe Gateway is the intended gateway and that product-specific pages are not unintentionally promoted as the default entry point.
- Do not change app ownership, domains, deployment targets or production state without authorization.

### Lane L — Documentation, support escalation and governance

Maintain:
- Incident timeline with UTC timestamps.
- Failure register separating facts, hypotheses and unknowns.
- System/component inventory and architecture diagram.
- Workflow/run/job/artifact correlation register.
- Host inventory and runner acceptance record.
- Web/mobile build matrix.
- Security and privacy findings register.
- Staging change record and rollback plan.
- GitHub Support packet for pre-job startup failures.
- Independent acceptance report and explicit release authorization record.

## 4. Failure register — evidence-based diagnosis

| Failure class | What is confirmed | What remains unknown | Required proof |
|---|---|---|---|
| Pre-job startup failure | Sampled runs ended before usable job execution; some runs returned zero jobs | Exact GitHub-side or repository-side trigger | Run metadata, GitHub support diagnostics, reproducible comparison |
| Runner assignment | No positive runner ID/name in sampled pre-job failures | Whether a runner was ever eligible/available | Job object with runner ID/name and labels |
| G02 host | No verified host access or host telemetry | Provider, VM identity, service health, registration state | Authorized host inventory and telemetry |
| Workflow logic | Source contains hosted diagnostic and optional G02 assignment probe | Whether the relevant workflow path was invoked and evaluated | Run event/ref/SHA and job-level logs |
| Flutter/Firebase | Workflow source has checks and build steps | Actual SDK, project config, secrets and build outcome | Executed analyzer/test/build evidence |
| Studio/web | Validation workflow source exists | Runtime/build correctness and browser QA | Hosted logs, artifact, browser QA |
| Cloudflare | Architecture target is Cloudflare | Current bindings, staging isolation and deployment correctness | Read-only config inventory and staging verification |
| Evidence collection | Some historical logs/artifacts were unavailable; zero-job runs have no job logs | Whether an artifact upload stage ever executed | Artifact metadata, download, checksum |
| Release acceptance | No independent acceptance certificate established | Whether all acceptance criteria are satisfied | Signed evidence review |
| Production authorization | Production protected; no promotion authorization | Approval is absent | Explicit release authorization, separately recorded |

Root-cause rule: a zero-job run is evidence of failure before job initialization. It is not sufficient to assign blame to a self-hosted host, a label mismatch, Firebase, application code, or a specific GitHub service.

## 5. Required evidence record

Every run/build record must include:
- Repository, branch/ref, commit SHA and source file paths.
- Workflow name/ID, event, run ID, attempt and UTC timestamps.
- Job ID/name, status/conclusion, runner ID/name/labels, step results.
- Log URL and retrievable log content (or exact retrieval error).
- Artifact ID/name/size/retention/download status.
- SHA-256 of downloaded artifact and source manifest.
- Environment classification: local / hosted CI / isolated staging / production.
- Test commands, tool versions, exit codes and summarized results.
- Independent verifier, review date, acceptance decision and exceptions.

Missing fields must be recorded as UNKNOWN / NOT RETURNED, not guessed or silently treated as zero.

## 6. Sequenced recovery and exit gates

| Gate | Required completion | Stop condition |
|---|---|---|
| G0 — Freeze and inventory | Preserve production; inventory PRs, branches, workflows, environments and known app surfaces | Any unapproved production mutation |
| G1 — Pre-job diagnosis | Correlate run metadata and job existence; produce support packet | No run/job evidence |
| G2 — Independent hosted CI | Execute authorized safe static/unit/build checks on hosted runner | No job, no logs or wrong SHA |
| G3 — Application validation | Complete web, Flutter, Firebase, mobile and integration matrices | Any failing/unexecuted required test |
| G4 — Staging readiness | Approve isolated staging resources and verify boundaries | Shared production resources or secrets |
| G5 — G02 canonical acceptance | Host verified, assignment confirmed, sentinel and evidence artifact independently reviewed | Wrong runner ID/name/labels or missing evidence |
| G6 — Security and quality | All critical/high findings addressed and retested; accessibility and privacy reviewed | Unmitigated critical/high finding |
| G7 — Release review | Complete traceability, rollback, support and acceptance paperwork | Missing independent acceptance |
| G8 — Authorization | Named authorized owner approves exact release scope and target | No explicit authorization |
| G9 — Promotion | Controlled release with monitoring and rollback | Any integrity or health regression |

Passing a later gate does not waive an earlier one. G02 may remain blocked while independent hosted CI validates application source, but G02 acceptance cannot be inferred from hosted CI.

## 7. GitHub Support escalation packet

Subject: GitHub Actions workflow startup failures before job initialization — repeated zero-job runs

Description:
We are investigating repeated workflow startup failures in thelingolegacy-blip/TheLingoLegacy. Sampled runs terminate before usable job execution. Several run-job queries return an empty jobs array; related historical records have no runner ID/name, no steps, no logs URL and no artifacts. The failure boundary is therefore before job initialization. Repository-side evidence does not determine whether this is caused by workflow processing, repository Actions policy, runner allocation, service-side capacity or another upstream condition.

Please investigate the workflow startup/control-plane events for the supplied run IDs and UTC timestamps, including whether GitHub accepted the workflow run, attempted to instantiate jobs, evaluated eligible runner groups/labels, and recorded an upstream startup failure. Please identify the relevant server-side diagnostic event and recommended remediation.

Attach per incident: run URL, run ID, attempt, workflow file, event, branch, head SHA, UTC timestamp, jobs API response, repository Actions policy snapshot (if available), and exact UI error text. Do not attach secrets or registration tokens.

## 8. Independent acceptance checklist

- [ ] Source SHA is fixed and traceable.
- [ ] Workflow event/ref/path filters are verified.
- [ ] Run and job objects exist.
- [ ] Correct runner identity and labels are recorded.
- [ ] All required steps have completed with explicit conclusions.
- [ ] Logs are retrievable.
- [ ] Artifacts are retrievable and checksummed.
- [ ] Web and mobile tests are complete for claimed platforms.
- [ ] Firebase and Cloudflare environments are confirmed non-production for staging tests.
- [ ] Security, privacy, accessibility and rights checks are complete.
- [ ] Rollback procedure is documented and tested where authorized.
- [ ] Independent reviewer has recorded acceptance.
- [ ] Authorized owner has approved exact scope and target.
- [ ] Promotion evidence is retained.

## 9. Final statement

This document is the consolidated recovery procedure and evidence framework. It does not perform or certify runner registration, host repair, service restart, workflow dispatch, application build execution, staging provisioning, deployment, merge, financial transaction or production promotion. Those actions remain subject to the current authorization boundary.

Final status at document creation: recovery plan and paperwork prepared; technical restoration and acceptance remain open. Production remains protected.


## 10. Source-maintenance reconciliation — 2026-11-01

This section records a source-only maintenance pass. It is an inventory of draft ownership and blockers, not a release decision.

### Retained owners

| Area | PR | Ownership / dependency |
|---|---:|---|
| Studio and LINGOslots world/game surface | #414 | Main-based studio/game implementation; draft, mergeable, remote CI still fails before jobs |
| Flutter world directory and Firebase runtime contract | #415 | Includes the Firebase Hosting `build/web` publication boundary and verifier; draft, mergeable |
| askLINGO and multi-platform foundations | #416 | Stacked on #414; overlaps #415 on Flutter app/preview files; base is one commit behind and PR is non-mergeable pending controlled rebase |
| Runner container hardening | #421 | Authoritative `ops/github-runner/Dockerfile` and compose baseline, including archive checksum validation and hardened container defaults |
| G02 telemetry and fail-closed sentinel semantics | #424 | Consolidates prior #417/#418 source work; main-based, draft, mergeable |
| G02 startup restoration lanes | #425 | Retained hosted diagnostic plus explicitly opt-in canonical G02 assignment/host probe and final evidence correlation |
| G02 offline execution-boundary classifier | #431 | Distinguishes pre-job/no-jobs, job/unassigned and runner-assigned without guessing root cause |
| Asset Registry | #428 | Separate governed staging proposal; no production activation |
| Ecosystem recovery dossier | #430 | Canonical cross-stack recovery and acceptance documentation |

### Superseded duplicate proposals

The following open proposals were closed without merging; their branches remain preserved:
- #417 and #418 — overlapping G02 telemetry, runner-context and release-consistency repairs, consolidated into #424.
- #247, #251, #274, #288 and #373 — older dispatch, hosted/self-hosted bridge, smoke and canary workflows superseded by #425 and #431.
- #353 — competing canonical sentinel naming and overlapping control-watch/release-consistency changes superseded by #424/#425 and the current recovery dossier.
- #427 — Firebase Hosting publication-boundary change incorporated into #415.

No branch was deleted. No PR was merged.

### Remaining overlap requiring controlled reconciliation

- #267 and #421 both modify `ops/github-runner/Dockerfile` and `ops/github-runner/docker-compose.yml`. #421 owns the hardened container baseline; #267's unique heartbeat/handshake and host-telemetry work must be rebased onto that baseline before acceptance.
- #416 remains dependent on #414 and is now ancestry-synchronized with that base. It overlaps #415 on `lib/main.dart` and `.github/workflows/flutter-preview-matrix.yml`; the shared askLINGO widget is identical. Reconcile the shared Flutter entry point and workflow before accepting either stack.
- Older host, dispatch-rule, evidence-architecture and control-plane proposals (#261–#286 and related branches) remain separate staged work; they are not certified or promoted by this pass.

### Validation and execution status

- The latest sampled GitHub Actions runs for PRs #414, #415, #424, #425 and #431 ended in `startup_failure`. Direct Jobs API and artifact inventory checks for representative runs returned zero jobs and zero artifacts.
- Non-GitHub status contexts are not GitHub Actions execution evidence, Cloudflare validation, or production acceptance; production architecture remains Cloudflare.
- The new #424 regression tests and #415 Hosting verifier were committed to their existing branches but were not executed in a full repository checkout or successful hosted CI.
- No workflow was manually dispatched; no runner was registered, restarted or reconfigured; no host was provisioned. Source pushes did trigger automated checks, but they failed before job initialization.
- No production Worker, DNS, route, secret, billing, payment, Firebase project or release setting was changed.
- A repository-wide open-PR search returned its 100-result limit, so this is a targeted reconciliation of the active maintenance workstreams, not a claim that every historical open PR has been audited.

**Current decision:** source maintenance is in progress; independent runtime acceptance remains pending. G02 remains BLOCKED. Production/LKG remains PROTECTED. No merge, deployment, release authorization or promotion is implied.


### Latest G02 source and CI refresh — 2026-11-01
The consolidated #424 branch now emits `G02_RUNNER_ID_CAPTURE=NOT_PERFORMED` and `G02_RUNNER_ID_VERIFICATION=INDEPENDENT_JOBS_API_REQUIRED` from both the sentinel and auto-repair runner-context gate. It no longer labels the Jobs API as a source queried by those workflow steps. Static checks also reject undocumented `runner.id` access, false independent-assignment claims, and missing deployment dependencies.

The latest Actions runs associated with the corrected #424 head were:
- Crimson Smoke UI — static validation: run 41378552451
- G02 Runner Image Build (no publish): run 41378553345
- Lingo Legacy Static CI: run 41378551574

All three concluded `startup_failure`; direct Jobs API and artifact inventory checks returned zero jobs and zero artifacts for each. The unrelated Vercel status context was successful but is not GitHub Actions execution or Cloudflare production evidence. The new regression tests have not executed because the Actions jobs never initialized.


Latest corrected #424 head `17b3e33d22dfb412eee1316b3869840587d55be` produced three more pre-job failures: Lingo Legacy Static CI run `41378785199`, Crimson Smoke UI run `41378784478`, and G02 Runner Image Build run `41378783600`. Each had `startup_failure`, zero jobs, and zero artifacts. The regression suite now contains nine cases, but none ran because no job initialized.

## 11. Cross-platform deep-dive snapshot — 2026-11-01

**Evidence class:** read-only provider inventory plus source inspection. No customer rows, message bodies, secret values, private keys or token values were retrieved or included. Source patches listed below remain draft and unexecuted.

### 11.1 Platform and operating-system matrix

| Surface / OS | Source present | Actual execution evidence | Current disposition |
|---|---|---|---|
| Desktop web | Yes — Cloudflare Worker/Pages and Studio sources | Production Worker allocation exists; browser QA not independently accepted | Live surface, release acceptance incomplete |
| Mobile web / PWA | Yes — root and Studio service workers, manifests and responsive UI | No device/browser test artifact | Source hardening prepared; offline and cache behavior unverified |
| Android | Flutter source and debug preview workflow | No build job initialized | Debug preview only; no release signing or store acceptance |
| iOS / iPadOS | Flutter shared source | No macOS build/signing job evidence | Not release-ready |
| macOS desktop | No signed native build evidence | None | Not verified |
| Windows / Linux desktop | No signed native build evidence | None | Not verified |
| Tizen | Platform metadata/config scaffold | No SDK package or device test | Metadata only |
| webOS | App metadata scaffold | No SDK package or device test | Metadata only |
| LG ThinQ / connected devices | No verified device connector or test | None | Not integrated |
| Smart-TV browser surfaces | Responsive/navigation source exists | No device matrix or remote-control test | Not accepted |
| Game / arcade surfaces | Registry and browser game source proposals | No reproducible package/build artifact | Preview/source only |

Color tokens and component shapes can be inspected in source, including the Industrial Noir/Crimson Shadow Studio direction and the separate bright KottonsCode direction. This is not a visual acceptance result: WCAG contrast, text scaling, touch targets, keyboard focus, screen-reader semantics, reduced motion and actual device rendering still require executed tests and screenshots.

### 11.2 GitHub / G02 execution evidence

Latest sampled source heads and run results:
- PR #416 head `bf5d946a87bb9bac293e64791a6bbe5f05277b11`: Studio Static Validation run `41380187208`, Flutter Cross-Platform Preview Matrix `41380185931`, Studio Preview Package `41380185074`.
- PR #424 head `17b3e33d22dfb412eee1316b3869840587d55be4`: Static CI run `41378785199`, Crimson Smoke UI run `41378784478`, Runner Image Build run `41378783600`.
- PR #415 head `7b04985f4c6dbb0e70f5d3450356776f733b75be`: Flutter Cross-Platform Preview Matrix run `41377436805` and Flutter Firebase Integrity run `41377435943`.
- PR #431 head `e2923641b720a7b3d3f388b7942989d66d808a02`: Static CI run `41371470701`.
- PR #425 head `bec03e42a6f8404abb1d7d63a271366073031450`: Static CI run `41263611673`.

Each sampled run concluded `startup_failure`; direct job and artifact queries returned empty arrays. No test, build, sentinel step, runner assignment, log artifact or acceptance result was produced. This remains a pre-job boundary, not proof of a specific runner-host root cause.

### 11.3 GitLab mirror status

- Two private legacy `FameMoneyFortune` projects are visible: the owner project and a fork/mirror. The owner project's `master` head is `f7672ce79bcfa5e7c5b9d27c6e80789f5a6bbc9f` (2026-10-08); the fork's `master` head is `dc6f1e077095cb53776a385341446c349e593d99` (2025-10-06). Neither is the canonical GitHub `TheLingoLegacy` repository.
- The owner project has two open draft MRs (#1 G02 evidence artifacts, #2 TML source validation/upgrade contract). The fork's duplicate G02 MR #1 had the same source SHA as owner MR #1 and was closed as a duplicate; its branch and commits were retained.
- Sampled latest GitLab pipelines are failed and their job lists are empty. The fork pipeline is archived.
- GitLab account 2FA is disabled. A legacy project runner-registration credential was returned in project metadata during inspection; its value is intentionally omitted. Rotate it before any runner registration or reuse. No runner was registered or restarted.

### 11.4 Cloudflare account, edge and access boundary

Observed zone controls:
- SSL mode `strict`; minimum TLS `1.3`; Always Use HTTPS and Automatic HTTPS Rewrites enabled; Brotli enabled; security level `medium`.
- Managed Free WAF rules and L7 DDoS rulesets are present.
- The custom request-firewall phase has two overlapping managed-challenge rules for `POST /admin` followed by a block rule for the same method/path. That path is therefore intentionally or effectively unavailable; confirm the intended admin workflow before changing it.
- The HTTP rate-limit phase has an entrypoint but no rules.
- The dynamic redirect canonicalizes `www.thelingolegacy.com` to the apex and preserves the query string.
- The Cloudflare account has 2FA enforcement disabled.

Access-policy risk:
- The Cloudflare Access application named `All Workers` targets all Workers and includes a `bypass` policy for everyone. Several individual Worker/preview applications also include a public-bypass policy. This may be intentional for public surfaces, but it is too broad to assume internal preview, diagnostics or admin endpoints are protected. Do not attach sensitive control-plane endpoints to this policy; split public and private Access applications and require MFA for private administration.
- The Asset Registry has no verified dedicated Access application or protected staging deployment. Its own README correctly requires both edge Access protection and Worker-side JWT/role verification.

Worker and storage inventory:
- The active production Worker allocations were not modified. The production script settings inspected expose asset/public-text bindings but no D1, KV, R2, AI, Stripe or Beacon delivery/consent bindings. The root Worker likewise has no production integration bindings.
- The production D1 database contains 17 application tables. Schema names/columns include user identities, session records, GPS coordinates, AI conversations, game activity and submissions. The `sessions.token` column is plaintext in the observed schema. No data rows were read. This needs a data-owner review, token hashing/rotation plan, access controls, retention policy and backup/restore evidence before any integration is reactivated.
- The separate world-engine D1 database has no application tables. R2 is not enabled.
- Candidate Worker versions have been uploaded to the production Worker namespace in prior source/preview activity, but the active traffic allocations remain unchanged. Uploading a candidate version is not a deployment or acceptance signal.
- The Pages inventory includes a production `my-flutter-app` project on branch `main`; its latest deployment status is successful but the returned deployment record did not provide a source SHA. The integration-test and static-backup Pages projects have production deployments disabled.

### 11.5 Application and integration inventory

- AppDeploy returned 15 known application surfaces with platform state `deployed/ready`. That label is not functional acceptance. Historical error records exist for Jersey Shore, KottonsCode, Sonic Boom and LINGOtravel; current runtime/device QA is not independently evidenced.
- The That’s My Lingo AppDeploy backend is demo-coin only: no real-money cashout or live checkout was verified. Its askLINGO client uses a local guided-answer stub rather than a verified production AI provider. Wallet/spin/profile updates are separate writes and need transaction/idempotency protection before any value-bearing economy is enabled.
- The AppDeploy runtime's production-contract endpoint reports a `secretsInUrls` value that conflicts with the live endpoint's security metadata. Treat the production-contract response as inaccurate until reconciled.
- PR #415 keeps Firebase Hosting pointed at `build/web` and adds a publication-boundary verifier. The Firebase options secret/project runtime and Firebase Hosting deployment were not verified; no Firebase deploy occurred.
- PR #428 is a metadata-only Asset Registry proposal. It requires a separate staging D1 and Access application; R2 is unavailable. Its publication event records registry approval, not binary upload or actual public asset delivery.

### 11.6 Source hardening prepared on existing draft branches

- PR #424: repaired the malformed consistency verifier and restored the auto-repair/sentinel test fixture. Still no CI job execution.
- PR #416: added per-location Cloudflare Rate Limiting bindings with cross-isolate tests; made missing bindings fail closed; added same-origin checkout/SMS checks; explicitly disabled checkout, SMS and AI; required a server-side consent verifier before SMS; isolated Wrangler to `thelingolegacyv-5-preview` with workers.dev and no production routes; hardened PWA cache policy to avoid no-store/private responses and bypass API requests.
- PR #415: Firebase Hosting output restricted to `build/web`; no Firebase deployment.
- PR #419: static asset exclusion is a prerequisite before deploying a Worker whose assets directory is the repository root.
- PR #431 and #425 remain distinct G02 classifier and startup-restoration proposals.

These are source proposals only. The latest GitHub Actions runs above all failed before job initialization, so the new tests have not been executed.

### 11.7 Launch decision and sequence

The user has explicitly requested production activation. Technical acceptance is still absent, so no production promotion was performed. Required sequence:
1. Rotate the exposed GitLab runner-registration credential; enforce MFA on GitLab and Cloudflare; review Cloudflare Access bypass policies.
2. Resolve GitHub/GitLab CI startup failures and obtain actual hosted execution evidence; then prove G02 separately.
3. Review the D1 plaintext-session-token schema and data retention/backup controls before binding or exposing the database.
4. Reconcile PR #415/#416 shared Flutter entrypoint/workflow, and require PR #419 asset exclusion before any preview Worker deployment.
5. Execute web/PWA, Flutter, Android, iOS and smart-TV test matrices on the actual target platforms.
6. Complete security/privacy/accessibility review and independently verify every source SHA, test result, artifact and environment boundary.
7. Keep checkout, real-money value, SMS delivery and AI inference disabled until their own consent, security, cost and operational gates pass.
8. Only then consider a separately scoped Cloudflare production promotion with rollback evidence.

**No billing bypass is implemented or recommended.** Paid capabilities remain disabled; free-tier limits and provider terms still apply. No production routes, DNS, Worker allocations, secrets, databases, billing settings or release state were changed during this audit.


## 12. Latest connected-account and source reconciliation — 2026-11-01

### AppDeploy and domains
- The connected AppDeploy account lists 15 existing apps; all 15 report deployed/ready. Status checks returned no backend errors. Historical frontend error entries remain on Jersey Shore: The Undead (CSS asset URL), Kotton's Code (script error), LINGO AI Sonic Boom (script error) and LINGO Travel (two script errors). Reproduce against the current stored snapshot before treating a historical error as current.
- The Studio Hub domain instructions report that custom-domain serving requires AppDeploy Plus. The Master Project Plan already has seven domain registrations (apex, www, casino, crazyweasels, kottonscode, sonicboom, travel), all pending_dns. The AppDeploy proxy target is proxy-v2.appdeploy.ai. Existing Cloudflare production routes remain authoritative and untouched; do not point those hostnames to AppDeploy without a planned route migration and rollback.
- No App Store Connect or Google Play Console integration was found in the searched plugin results. Store account access, developer registration, signing and publication remain external prerequisites.

### Firebase and D1
- .firebaserc currently names lingo-legacy-production; lib/firebase_options.dart contains placeholder platform app IDs/API keys. The existing Flutter verifier fails closed on those placeholders. Do not replace them with guessed values or commit private credentials.
- The separate world-engine-db D1 database has no application tables. PR #416 now contains a local-first migration for world registry, immutable versions, rights-aware assets, internal KB source/document/chunk metadata, ingestion jobs, feature flags, idempotency, world events and append-only audit events. Publication triggers require cleared rights and an approver. This migration has not been applied to any remote D1 database.
- PR #416 repairs the fconst syntax error in scripts/verify-platform-registries.mjs and adds a regression test rejecting premature world activation. The test has not executed.

### Current PR ownership and overlaps
- #414 owns the main-based Studio / LINGOslots world/game layer.
- #415 owns the main-based Flutter world directory and Firebase Hosting/identity boundary.
- #416 is explicitly stacked on #414. It overlaps #415 on Flutter entrypoint, preview workflow and askLINGO widget integration. Keep #416 stacked until the shared Flutter entrypoint/workflow is reconciled; do not merge #415 and #416 independently without conflict and behavior review.
- #423 owns the Studio Operations Command Center UI/prototype. The new #416 operations matrix is a documentation/control-plane companion, not a replacement UI. Consolidate duplicated control requirements before implementation.
- #428 owns the separate Asset Registry proposal; use its rights/provenance model rather than creating a second asset registry.
- #424/#425/#431 remain the distinct G02 sentinel semantics, startup restoration and pre-job classifier lanes. Do not duplicate them in another repair branch.
- #430 remains the canonical cross-stack recovery dossier.

### Latest execution check
PR #416 head e62d86a76684a1cbe71cfbfa30f632d8cf62c779 generated three GitHub Actions runs: Studio Preview Package 41380702848, Flutter Cross-Platform Preview Matrix 41380700496, and Studio Static Validation 41380701684. All three concluded startup_failure. Direct Jobs API and artifact queries returned empty arrays for all three. Therefore the migration, verifier repair, rate-limit tests, Flutter build and PWA tests have not been executed.

### Current operational boundary
No PR was merged; no remote D1 migration was applied; no AppDeploy app was redeployed; no App Store/Google Play account was connected; no DNS record, Cloudflare route, secret, payment, billing or production release setting was changed. The operations matrix and D1 migration are draft source artifacts only.


### Post-maintenance source-head execution refresh — 2026-11-01

After the latest PR #416 source commits, the current head was `c1eb5abb3d92ea62f9e9f3e950753597a5fd02fb`. Its three new runs were Flutter Cross-Platform Preview Matrix `41381156485`, Studio Static Validation `41381154357`, and Studio Preview Package `41381155375`. All concluded `startup_failure`; each Jobs API response contained zero jobs and each artifact inventory contained zero artifacts.

After the latest PR #430 documentation commits, head `2c3f66f644725cce0cf8c3f8bb27c9a11ee3cb38` produced G02 Runner Image Build `41380883591`, Lingo Legacy Static CI `41380884471`, and Crimson Smoke UI static validation `41380882701`. All concluded `startup_failure`; each had zero jobs and zero artifacts.

These results establish that the new source and documentation checks remain unexecuted. They do not identify a root cause. The verifier syntax repair, D1 migration, PWA cache changes, shared rate-limit tests, Flutter build and registry tests remain pending executable validation. Production remains protected.
