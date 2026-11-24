# LINGO Legacy — Original Master Blueprint Implementation Traceability

**Source of authority:** `LINGO_MASTER_BLUEPRINT_SELF_PUBLISHING_V1_0.docx`, Version 1.0, 2026-10-05 (44 pages; sections 00–40).  
**Canonical implementation repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Connected Web repository:** `thelingolegacy-blip/TheLingoLegacy-Web`  
**Companion design source:** [THE LINGO LEGACY — Enterprise Master Design System](https://www.figma.com/design/W5unjzxbrpKazxgiyEO8WG)  
**Revision:** 2026-11-24  
**Status:** Reconciliation register; it does not certify unverified runtime or production behavior.

## Completion law

The original master is the parent blueprint, not a competing replacement. Its 41 numbered sections (00–40), program hierarchy, waves, sprint families, build packages, 12 production gates, and source/evidence/authority law are preserved. Existing historical source files remain intact. Each initiative, phase, wave, sprint, build, release, deployment, and activation earns its own state.

States used here:
- **DEFINED** — present in the original master or current design contract.
- **PRESENT** — source/configuration exists in a repository or design file.
- **IN PROGRESS** — implementation work is recorded but not accepted.
- **BLOCKED** — a named dependency prevents acceptance.
- **VERIFIED** — direct, current provider or executed-test evidence supports the exact claim.
- **COMPLETE** — all required implementation and acceptance evidence is present.
- **SUPERSEDED** — replaced by an explicitly controlled later decision; historical source retained.

## Section-by-section reconciliation (00–40)

| Original section | Required capability | Current reconciliation / acceptance state |
|---|---|---|
| 00 Control Status | Independent state, fail-closed authority | DEFINED; current production hold and gate state remain independently controlled |
| 01 LINGO Self-Publishing Identity | LINGOlibrary brand and icon family | DEFINED; Figma design system exists; full app asset integration not verified |
| 02 Creator Workspace | Author workspace and publishing actions | DEFINED; runtime implementation not verified |
| 03 Book Master Model | Canonical book metadata and source hash | DEFINED; schema/runtime acceptance not verified |
| 04 Manuscript Pipeline | Ingest, normalize, version, QC, author approval | DEFINED; end-to-end runtime not verified |
| 05 AI Publishing Assistance | Editorial assistance with author approval | DEFINED; production workflow and approval enforcement not verified |
| 06 Audiobook / Voice Pipeline | Narration, QC, R2/CDN, web/Flutter playback | DEFINED; media pipeline and device playback not verified |
| 07 Edition Engine | Independently versioned book editions | DEFINED; implementation not verified |
| 08 Cover / Interior Production | Print layout, preflight, export integrity | DEFINED; implementation not verified |
| 09 Rights / IP Registry | Ownership, licenses, contributors, territories | DEFINED; authoritative registry not verified |
| 10 Distribution | Canonical LINGOlibrary and external delivery | DEFINED; connector delivery not verified |
| 11 Sales / Royalty Engine | Separate sales, royalty and payout ledgers | DEFINED; financial execution not verified |
| 12 Author Control | Save, review, approve, publish, unpublish | DEFINED; authorization enforcement not verified |
| 13 Publishing Gate | Defined-to-live-validated publishing lifecycle | DEFINED; no production acceptance inferred |
| 14 LINGO Platform Core | Shared ID, wallet, XP, social, assets, events, registry | DEFINED; shared contracts/runtime reconciliation in progress |
| 15 KOTTONSCODE Media Pipeline | Book-to-audio/video/game/merchandise | DEFINED; asset and distribution execution not verified |
| 16 Loyalty Lane Cycle | Laundry telemetry and rewards boundary | DEFINED; live IoT and ledger authority not verified |
| 17 askLINGO Intelligence Modes | Chat/research/generation/help/training/governance modes | DEFINED; each mode requires product and policy acceptance |
| 18 LINGOassist | Orchestration, agents, bounded workers, evidence | DEFINED; no agent may manufacture runner identity or gate evidence |
| 19 askLINGO Boom | Sonic model and educational/audio visualization | DEFINED; interactive runtime not verified |
| 20 Master Roadmap Hierarchy | Vision-to-operations lifecycle | DEFINED; this traceability register is a companion control artifact |
| 21 Foundation / Program / Phase / Wave | Foundation and roadmap families, including v0.2 W0–W10 | DEFINED; work packages need individual execution evidence |
| 22 Sprint Model | Owner, dependencies, outputs, acceptance, status | DEFINED; sprint IDs are planning labels until execution records exist |
| 23 Build Model | Source SHA, environment, tests, artifact hash, acceptance | DEFINED; no build is accepted by ID or source presence alone |
| 24 Event Fabric / Registry | Ownership, version, dependencies, evidence, provenance | DEFINED; live event coverage and registry enforcement not verified |
| 25 Universal Gate Model | Source through promotion, with independent burdens | DEFINED; fail-closed law retained |
| 26 Production Gates | G00–G11 independently earned | DEFINED; G02 currently FAIL/UNVERIFIED; G03–G11 BLOCKED |
| 27 Current G02 Governance | P1–P9 runner evidence predicates | BLOCKED; scheduled diagnostic is staged but job remains disabled |
| 28 Self-Publishing Delivery Waves | SP-W0–SP-W11 | DEFINED; each wave remains independently unaccepted until evidence exists |
| 29 Self-Publishing Sprint Families | SP-S01–SP-S20 | DEFINED; IDs are planning taxonomy, not completion evidence |
| 30 Self-Publishing Build Packages | BUILD-SP-001–018 | DEFINED; each build needs source, test, artifact, verifier and acceptance |
| 31 File / Folder Master Structure | Governance, platforms, IP, media, games, evidence, archive | DEFINED; GitHub/Core and source archive remain authoritative; no historical source deletion |
| 32 Discovery / App Icon Requirements | LINGOlibrary discovery surfaces | DEFINED; design source exists; channel-by-channel integration not verified |
| 33 Monorepo / Technical Integration Target | Web, Flutter, backend, games, packages, assets | DEFINED as target; current Core and Web remain separate repositories pending contract and migration proof |
| 34 Observability | Traceable publishing and platform events | DEFINED; production event coverage not verified |
| 35 Failure / Recovery | Retry, audit, rollback, version and recovery | DEFINED; per-service drills and restore evidence remain outstanding |
| 36 Source / Evidence / Authority Law | Specification ≠ implementation ≠ execution ≠ acceptance | DEFINED and enforced as reporting rule |
| 37 Master Completion Definition | Structural blueprint completeness | DEFINED at blueprint layer; implementation completion is not inherited |
| 38 Final Master Rule | Each initiative and lifecycle unit earns state | DEFINED; preserve recursive independent acceptance |
| 39 Controlled Source Register | Preserve and cross-reference original source artifacts | DEFINED; this document supplements, not replaces, the source blueprint |
| 40 Final State Statement | Blueprint-level definition vs independent runtime/live state | DEFINED; no runtime, production, or launch completion is asserted |

## Program and delivery hierarchy

Retain the original hierarchy:

`VISION → PORTFOLIO → PRE-BUILD → PROJECT DEFINITION → REQUIREMENTS → ACCEPTANCE CRITERIA → PRIORITIZATION → PROGRAM → PHASE → WAVE → EPIC → WORKSTREAM → SPRINT → WORK PACKAGE → TASK → DESIGN → ARCHITECTURE → BUILD → INTEGRATION → ASSURANCE → RELEASE CANDIDATE → RELEASE ACCEPTANCE → DEPLOYMENT AUTHORIZATION → DEPLOYMENT → LIVE VALIDATION → LAUNCH AUTHORIZATION → LAUNCH → OPERATIONS → OBSERVABILITY → SUPPORT → GROWTH → SCALE → REVALIDATION → CHANGE CONTROL → RECERTIFICATION → RETIREMENT → ARCHIVE`

Preserved program structures:
- Foundation; Wave 1; Wave 2; Wave 3; Phases IV–VI; Waves 7–38.
- v0.2 execution waves V02-W0 through V02-W10.
- Publishing waves SP-W0 through SP-W11.
- Publishing sprint families SP-S01 through SP-S20.
- Publishing build packages BUILD-SP-001 through BUILD-SP-018.

## G02 runner schedule and host dependency contract

The source archive includes a scheduled G02 sentinel design with cron `17 */6 * * *` (UTC): minute 17 every six hours. The current Core branch now records that cadence in `.github/workflows/runner-dispatch-diagnostic.yml`, alongside manual dispatch.

**Runner target**
- Name: `lingo-legacy-g02`
- Labels: `self-hosted`, `linux`, `x64`, `lingo-g02`
- Platform: Linux x86_64
- Expected cadence: every six hours at minute 17 UTC
- Job timeout: 5 minutes

**Host readiness checks staged in the workflow**
- UTC timestamp and epoch capture.
- NTP/time synchronization observation through `timedatectl` or `chronyc` where available; otherwise explicitly records that synchronization could not be observed.
- Required tools: `bash`, `curl`, `git`, `jq`, `sha256sum`.
- Disk and memory snapshots.
- DNS resolution and HTTPS reachability checks for `github.com`.
- Run ID, commit SHA, runner identity, OS and architecture correlation.
- Host baseline is included in the same G02 evidence artifact as the sentinel record.

**Important protection:** the existing G02 job still contains `if: false`. The new cadence is a configured trigger, not proof that a runner executed. No dispatch, host registration, daemon restart, runner-group change, or production mutation was performed. Do not remove the disable guard until the actual host, runner inventory, scope, labels, Actions admission and independent G02 evidence path are ready and separately approved.

## G02 acceptance remains conjunctive

All nine predicates must be evidenced on the same correlated run/job/commit:
1. Matching runner exists in intended scope with exact required labels.
2. `runner_id > 0`.
3. Populated `runner_name` matches `lingo-legacy-g02`.
4. Job assignment to that runner is proven.
5. Workflow steps are instantiated.
6. Sentinel prints `RUNNER_EXECUTION_SENTINEL=PASS` and exits 0.
7. Logs are generated.
8. Logs are retrievable and the correlated artifact passes integrity checks.
9. Independent verifier records PASS for every predicate.

A scheduled trigger, workflow dispatch request, Online/Idle runner status, skipped job, hosted-runner success, empty job list, or source-level check is not G02 PASS.

## Release gate matrix

| Gate | Current state | Exit dependency |
|---|---|---|
| G00 Source authority | Reconfirm on current release candidate | Canonical source and provenance |
| G01 Repository | Reconfirm on current release candidate | Branch, review, policy and integrity |
| G02 Runner dispatch | **FAIL / UNVERIFIED** | All P1–P9 |
| G03 CI execution | **BLOCKED** | Real job/step/test/log evidence |
| G04 Certification | **BLOCKED** | Verified CI, security and compatibility |
| G05 Release candidate | **BLOCKED** | Certified, reproducible artifact |
| G06 Deployment | **BLOCKED** | Explicitly approved release candidate and rollback |
| G07 Live validation | **BLOCKED** | Approved deployment and live probes |
| G08 Synchronization | **BLOCKED** | Verified environment and service consistency |
| G09 Activation | **BLOCKED** | Explicit activation authority |
| G10 Post-activation | **BLOCKED** | Monitoring, incident and rollback checks |
| G11 Acceptance | **BLOCKED** | Independent acceptance record |

## Cross-platform implementation targets

The original source requirements are to be reconciled across:
- LINGO flagship web and PWA.
- Flutter iOS, Android and tablet clients (preserve Android minSdk 21).
- Connected TV / LG webOS with remote-first ten-foot interaction.
- Shared Core contracts and Cloudflare Workers/D1/R2/KV/Durable Objects where justified.
- Firebase only for verified, environment-isolated integrations.
- Games, publishing, media, apparel/commerce, Loyalty Lane Cycle/IoT, askLINGO/voice/agents, telemetry, dispatch/assistance, school/learning, and community domains.
- Product-specific ownership with shared identity, authorization, audit, event, wallet and release contracts.

No product is labeled integrated merely because its name appears in a blueprint, registry, Figma frame, or repository directory. Each product requires an implementation pointer, dependency map, executable test, runtime evidence, security review and acceptance record.

## Immediate acceptance work

1. Restore Actions job admission in Core and Web; determine the provider/control-plane cause using owner-level settings and GitHub Support if necessary.
2. Obtain authorized host evidence for runner daemon/service state, runner version, exact scope/group, labels, last poll, diagnostics, NTP, DNS/HTTPS and resource capacity.
3. Once admission and host readiness are verified, run one controlled G02 sentinel and independently validate P1–P9.
4. Restore real CI execution separately in Core and Web using each repository's declared runtime (Core Node >=20; Web Node >=22/npm >=10).
5. Complete SAAAE server-side enforcement, staging identity isolation, migration dry-runs/backups/rollback and privacy review.
6. Complete Web/Flutter/TV integration and browser/device accessibility testing.
7. Validate each product and publishing/commerce/media/IoT work package independently.
8. Only then progress G03–G11; production hold, LKG and promotion controls remain in force until the exact release candidate passes and authorization is separately recorded.

## Evidence record for this revision

- Core baseline branch: `rebuild/core-baseline-2026-11-24`.
- Previous known head before this revision: `c36bdbb4758aa2854cef4c8367bbb5aa8d9da149`.
- This revision adds a UTC G02 schedule and runner host diagnostics while preserving the disabled job guard.
- Figma master design file: `https://www.figma.com/design/W5unjzxbrpKazxgiyEO8WG`.
- No test run, runner assignment, artifact upload, live production validation, migration, deployment or launch is claimed by this document.


## Live CI admission evidence — 2026-11-24

The following run records are tied to the current open draft PR heads and were re-read from GitHub Actions. Each listed run has `status=completed`, `conclusion=startup_failure`, zero retrievable jobs, and zero artifacts:

| Repository | Workflow | Run ID | Run number | Jobs | Artifacts |
|---|---|---:|---:|---:|---:|
| Core | Crimson Smoke UI — static validation | 45496459516 | 1886 | 0 | 0 |
| Core | Lingo Legacy Static CI | 45496457203 | 3444 | 0 | 0 |
| Core | G02 Runner Image Build (no publish) | 45496454593 | 1942 | 0 | 0 |
| Web | Staging verification workflow | 45496329649 | 770 | 0 | 0 |

**Interpretation:** this is direct evidence of pre-job startup failure for the listed runs. It is not evidence of a failing test, failing build step, runner-host fault, or a specific billing/policy root cause. The current evidence does not identify which organization/account/repository admission control is responsible.

**Do not conflate the G02 sentinel with the other workflows:** `.github/workflows/runner-dispatch-diagnostic.yml` intentionally retains job-level `if: false`. Its scheduled/manual trigger is configured but its runner job is deliberately disabled under protection. The separate Core Static CI, Crimson Smoke UI and G02 Runner Image Build records above are the evidence that still needs provider-side admission diagnosis. The disabled sentinel itself cannot produce G02 host evidence.

### Admission investigation checklist
1. Confirm organization/account Actions billing state and included/paid usage availability without raising spend limits.
2. Inspect organization Actions policies, allowed actions, runner group access and repository restrictions.
3. Inspect repository Actions permissions and workflow policy for both Core and Web.
4. Verify hosted runner availability/eligibility and any account-level enforcement or suspension notices.
5. If all controls are clear, submit these run IDs and repository identifiers to GitHub Support for an admission-layer investigation.
6. Re-run one minimal, least-privilege workflow. Acceptance requires a real job ID, populated runner identity, instantiated steps, retrievable logs and a correlated artifact.

No configuration mutation, billing change, policy relaxation, runner registration, guard removal or production action is implied by this checklist.


## G04 security review findings — wallet authority boundary

A pre-existing remediation specification in `docs/architecture/ezca/wave-00-2-wallet-ledger-remediation.md` records an inspected Firestore rules finding: an authenticated profile owner could update client-supplied wallet/progression fields including `chips`, `sweepstakesTickets`, `level`, `xp` and `streakDays`. The remediation specification is explicitly marked **SPECIFICATION ONLY — NOT DEPLOYED**. The finding is a security acceptance blocker until the owning Spades product repository's current rules are inspected and a deny-by-default correction is implemented, emulator-tested, independently reviewed and verified against the deployed ruleset.

Required G04 evidence for this boundary:
- Current source and deployed ruleset SHA/version from the owning product repository/provider.
- Denial tests for unauthenticated, wrong-owner and direct client writes to balance, ticket, progression-authority and ledger fields.
- Allowlist tests for permitted cosmetic/profile fields; default-deny catch-all.
- Server-authoritative ledger tests for idempotency, concurrency/overspend, atomic commit, rollback, replay and bounds.
- Evidence that the client cannot create, update or delete ledger entries or authoritative balance snapshots.
- Independent security review and release-owner acceptance.

**Current disposition:** G04 remains BLOCKED. The remediation document is a target specification, not proof that the source rules have been changed or deployed. The separate product rules file was not available at the expected path in the Core repository during this pass; no rule change is claimed. Keep all real-value, prize, redemption and wallet authority paths disabled until the owning repository is identified and independently verified.


## Follow-up admission recheck — latest draft heads

After the source/documentation updates, the current Core PR #664 head `c19fd0df23a2be147261cd6ebab89a9efd184704` produced three more pre-job failures:
- Crimson Smoke UI: run `45496912921`, run #1891.
- Lingo Legacy Static CI: run `45496910535`, run #3449.
- G02 Runner Image Build (no publish): run `45496906994`, run #1947.

The current Web PR #44 head `73b6963cde03508f0ea230233aecc93843de5cbb` produced run `45496807012`, run #772, also `startup_failure`.

All four runs were re-queried: zero jobs and zero artifacts each. The evidence therefore persists across the latest source/documentation commits; no test steps ran. This does not isolate the provider-side cause. Owner/admin billing and Actions-policy checks plus GitHub Support remain required.


## Minimal hosted-runner diagnostic available — 2026-11-24

The recovery branch contains `.github/workflows/isolated-hosted-runner-probe.yml` (blob `1152665c13e47749c18806fba281959d16b8af34`). It is a manual `workflow_dispatch` probe on `ubuntu-latest`, with `contents: none`, no checkout, no third-party actions, no secrets, no network calls, no artifacts, and no production access. It emits runner name, OS/architecture, run/commit correlation, UTC time, OS, Node/npm/Git versions, disk and memory details, and a step summary.

This is the safest next admission diagnostic because it isolates hosted-runner job creation from application build/test dependencies. The connected GitHub action set exposes run inspection and rerun operations but not workflow dispatch, so this pass could verify the workflow source but could not trigger it. A repository maintainer with Actions write permission can select the recovery branch and manually run **Isolated Hosted Runner Probe** from the Actions tab. Acceptance requires a real job ID, runner identity and instantiated steps—not merely a workflow run record.
