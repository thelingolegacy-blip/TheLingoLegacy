# The Lingo Legacy — Readiness Execution Report

**Audit date:** 2026-11-16  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Default branch:** `main`  
**Observed main commit:** [`1a60e2314cb3f9b5e3efe648ade83121080cb7b2`](https://github.com/thelingolegacy-blip/TheLingoLegacy/commit/1a60e2314cb3f9b5e3efe648ade83121080cb7b2)  
**Release posture:** **PROTECTED HOLD**

## Executive disposition

The repository is **not verified operational, production-ready, or launch-ready**. This report records a bounded read-only audit from the GitHub connector, not a full repository or provider certification. No workflow was dispatched, no PR merged, no commit pushed to `main`, and no settings, secrets, provider resources, DNS, Workers, Firebase projects, runners, or production state were changed as part of the audit.

## Status matrix

| Area | Status | Evidence / limitation |
|---|---|---|
| `main` branch protection | **FAIL** | GitHub branch metadata reported `protected: false` for `main`. This does not evaluate possible organization rulesets. |
| Repository / organization rulesets | **UNVERIFIED** | The available API connector did not expose a working ruleset query. |
| ChatGPT/Codex app identity | **VERIFIED** | GitHub issue metadata identifies the acting app as [ChatGPT Codex Connector](https://github.com/apps/chatgpt-codex-connector), App ID `1144995`, on updates to #575 and #597. This proves app identity in that operation, not its installation permission grants. |
| App installation scopes / Administration read-write | **UNVERIFIED / BLOCKED — OWNER ACTION REQUIRED** | Installation permission lookup was unsupported. Repository metadata reported `admin: true` for the authenticated access context; that is not proof of the App installation's Administration scope. |
| Pull-request protections / required checks | **FAIL / NOT CONFIGURED OR NOT VERIFIED** | `main` metadata reports unprotected. Do not select required checks until reliable CI checks have successful evidence. |
| GitHub Actions | **FAIL** | Prior sample of 20 recent runs: 14 `startup_failure`, 6 `failure`; no passing test result established from that sample. See [Actions runs](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions). |
| CI logs / check conclusions | **UNVERIFIED** | A check-run query on the observed `main` SHA returned four check runs with `status: completed`, but no conclusions in the response. A subsequent log lookup returned `Job log not found` for the supplied identifier. This does not prove tests passed or failed. |
| G02 runner | **PROTECTED HOLD** | Workflow source targets the dedicated self-hosted labels. No runner activation or successful G02 execution was verified. |
| Firebase Hosting publication scope | **FAIL — SOURCE CONFIGURATION** | `main/firebase.json` sets `hosting.public` to `.` and has a narrow ignore list. No deployed artifact or live Firebase target was inspected here. |
| Cloudflare static asset scope | **FAIL — SOURCE CONFIGURATION / LIVE STATE UNVERIFIED** | `main/wrangler.jsonc` sets `assets.directory` to `.`. No current deployed asset manifest or production route mutation was performed. |
| Secrets / sensitive-file tracking | **UNVERIFIED** | No secret value was read or reported. A complete current-tree/history scan was not available or run. `.gitignore` excludes `.env*`, allowing `.env.example`, but this is not secret-scan evidence. |
| Workflow security / dependency vulnerability state | **UNVERIFIED** | A lexical source search for Gitleaks, Trivy, CodeQL, or `npm audit` returned no matches; this discovery result does not prove equivalent controls are absent. Full workflow and dependency audits were not run. |
| Cloudflare, Firebase, web/mobile, registry/dispatch, auth, monitoring/backups | **UNVERIFIED** | GitHub source and draft PR descriptions are not evidence of provider-side integration, successful runtime, or restore acceptance. |
| Production release | **PROTECTED HOLD** | No promotion or release authorization was made. |

## Active workstreams preserved

The following PRs were observed open and unmerged in the retrieved records. No PR was merged, closed, retargeted, rebased, or overwritten by this audit.

| Work | Current observed state / dependency |
|---|---|
| [#594](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/594) — provider-neutral architecture | Open draft; targets `main`. |
| [#596](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/596) — Go implementation hardening | Open draft; stacked on #594, targets architecture branch. Hosted tests not verified as executed. |
| [#611](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/611) — dispatch contract | Open draft; targets `main`. |
| [#602](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/602) — product registry | Open draft; stacked on #548. Preserve the base relationship; do not retarget without reconciliation. |
| [#592](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/592) — Actions recovery | Open draft. |
| [#574](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/574) — security remediation | Open draft. |
| [#589](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/589) — G02 quarantine | Open draft; source-level quarantine only, not run evidence. |
| [#575](https://github.com/thelingolegacy-blip/TheLingoLegacy/issues/575) — cross-stack blocker register | Open; tracks Actions, Firebase, app builds and Vercel retirement. |
| [#597](https://github.com/thelingolegacy-blip/TheLingoLegacy/issues/597) — master execution program | Open; explicitly keeps production on hold and CI recovery as P0. |

**Dependencies/conflicts:** #596 depends on #594 as its base. #602 depends on #548 as its base. Preserve both stacks and reconcile their changed paths, commit ancestry, and acceptance evidence before merge decisions. This inspection did not establish a complete conflict/dependency graph for all branches or PRs.

## Findings and blockers

1. **Governance gap:** `main` is reported unprotected; branch protection/rulesets cannot be configured or fully inspected through the available interface. The App's verified identity is ChatGPT Codex Connector (App ID 1144995), but the installation's granted scopes remain unknown.
2. **CI startup and failures:** Actions runs have repeatedly failed before test execution or ended in failure. Current successful stable check names were not established. Do not make speculative CI checks required.
3. **Publication boundary:** checked-in Firebase Hosting and Wrangler asset paths point to repository root. This is a material source configuration risk, but live deployment contents and actual exposure were not verified in this audit. Existing fixes in open PRs/issues need owner/security review, CI evidence, and artifact-scope verification before merge or deploy.
4. **Security scan coverage:** no comprehensive secret/history scan, dependency alert review, SAST, IaC scan, container scan, malware scan, or artifact review was performed. Findings are **UNVERIFIED**, not zero.
5. **External systems:** no current authenticated inspection of Cloudflare, Firebase, mobile build/device, identity provider, observability, or backup/restore systems was completed. Do not infer success from source files, provider connection metadata, or documentation.
6. **Owner approvals:** changing repository settings requires repository/organization owner action through GitHub's supported UI/API. No bypass was attempted.

## Owner remediation steps

### A. Verify app permissions and protect `main`

1. In GitHub account or organization settings, open **Installed GitHub Apps**, identify **ChatGPT Codex Connector** for this repository, and inspect its repository selection and granted permissions.
2. Confirm whether it has **Administration** read/write or the supported equivalent for branch/ruleset management. If absent, the owner must change authorization through GitHub's supported installation flow; do not attempt to bypass it.
3. In repository **Settings → Branches**, inspect classic protection rules for `main`. Also inspect organization rulesets that target this repository/branch.
4. Create or update protection for `main`: require PRs; require at least one approval; require up-to-date branches where appropriate; block force-pushes and deletion; include administrators/no administrator bypass. Do not add required checks yet.
5. Re-read effective settings from GitHub after saving and record screenshots/API evidence. Preserve any recovery controls and avoid replacing unrelated rules.

### B. Restore and validate CI without using G02

1. Repository/org Actions administrators: inspect Actions enablement and allowed-action policy, hosted runner availability/entitlement, quota/billing, concurrency and organization restrictions.
2. Preserve G02 quarantine; do not register or activate a self-hosted runner as a workaround.
3. Rerun a narrow hosted diagnostic only after settings are confirmed. Require a real job ID, runner identity, executed steps, logs, conclusion, and artifacts correlated to the exact commit.
4. Validate each workflow's YAML, permissions, action pinning, triggers/conditions, dependencies and artifacts on a trusted isolated path. Classify pre-job startup failures separately from test failures.
5. Only after repeatable successful runs, select exact stable check names for branch protection.

### C. Repair publication boundaries safely

1. Review the current `main` and active remediation PRs for Firebase Hosting and Cloudflare asset configuration; preserve history and do not deploy the current root-directory configuration.
2. Require an explicit reviewed public-file allowlist or dedicated generated output, tests that reject unapproved paths, and an inspected artifact manifest.
3. Verify Firebase project/site identity and Cloudflare Worker/version/route identity using authorized provider access before any deployment proposal. Keep production resources unchanged absent separate approval.

### D. Complete security and integration acceptance

1. Run approved current-tree and history secret scans, dependency/SBOM/vulnerability scans, and workflow/security reviews. Share only redacted findings; rotate confirmed credentials through owner-approved channels.
2. Obtain authorized platform evidence for Cloudflare routes/deployments, Firebase project/rules, web/mobile builds and device QA, authentication/authorization negative tests, monitoring/alerts, and tested backup/restore.
3. Reconcile all open workstream PR bases/changed paths and obtain appropriate independent reviews. Do not merge without separate authorization.
4. Keep production **PROTECTED HOLD** and payments disabled until all applicable acceptance evidence, rollback/recovery proof, independent review, and explicit release authorization are recorded.

## Work performed and limitations

- Read-only GitHub inspection of repository metadata, the `main` branch protection metadata, selected source files, Actions-run sample, check-run names/statuses, the named PRs, and issues #575/#597.
- Identified the ChatGPT Codex Connector as the GitHub App acting on those issue records; installation scopes were not exposed.
- No code or settings repair was applied because the available tools did not provide verifiable branch/ruleset administration or successful hosted test execution. No result is claimed as a passing test.
- This report is an evidence-backed blocker summary, not a comprehensive repository certification. It should be updated only with newly verified evidence and exact run/commit/provider identifiers.
