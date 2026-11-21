# LINGO Legacy — Runner, CI, Production, Activation Assignments

Date: 2026-10-10
Mode: FAIL-CLOSED / PRODUCTION PROTECTED

This matrix assigns responsibilities by role. No individual owner is inferred or invented. Named owners must be recorded by an authorized project administrator before execution.

| Workstream | Responsible role | Required action | Acceptance evidence | Current state | Gate |
|---|---|---|---|---|---|
| Runner assignment | Authorized Linux host operator + GitHub repository administrator | Provision/identify Ubuntu 24.04 x86_64 host; register `lingo-legacy-g02` with labels `self-hosted,linux,x64,lingo-g02`; verify active daemon and repository runner inventory | Host identity and OS; runner inventory entry; populated runner ID/name; last check-in; service logs | NOT PROVISIONED / UNVERIFIED | G02 FAIL |
| CI execution | Repository maintainer + CI/evidence verifier | Dispatch the authorized G02 sentinel only after runner and Actions policy checks; correlate run, attempt, job, commit, assigned runner, steps, logs, and artifact | runner_id > 0; runner_name populated; steps instantiated; sentinel exit 0; retrievable logs/artifact; SHA256; independent verification | BLOCKED; recent jobs fail before steps initialize | G03 BLOCKED |
| Production readiness | Release engineer + independent verifier | Validate build/test/security/telemetry and deployment prerequisites on isolated candidate; preserve current LKG; do not promote on missing evidence | Passing required checks on identified commit; security review; build provenance; smoke/E2E; live reachability and rollback evidence | NOT ELIGIBLE | G04–G08 BLOCKED |
| Activation | Explicit release approver + operations owner | Authorize promotion only after certification and production-readiness acceptance; execute staged activation and post-activation checks only after separate approval | Recorded approval; immutable candidate SHA; gate matrix passed; activation logs; health checks; rollback proof | DISABLED / NOT AUTHORIZED | G09–G11 BLOCKED |

## Ordered handoff

1. **Runner owner:** supply host/provider identity, OS/architecture, runner inventory, service state, and last check-in. Do not paste registration tokens.
2. **CI owner:** after runner inventory and Actions policy are independently verified, request authorization for one manual sentinel. Keep `LINGO_G02_SENTINEL_ENABLED` unset/false until that checkpoint is accepted.
3. **Evidence verifier:** independently validate all G02 predicates. A queued job, online/idle label, hosted diagnostic, or missing logs cannot pass G02.
4. **Release engineer:** only after G02/G03 pass, run the candidate build, tests, security checks, telemetry, E2E, and reachability checks on a fixed commit. Do not touch production during validation.
5. **Release approver:** review the full evidence chain and explicitly authorize promotion. Production activation is a separate decision after certification.
6. **Operations owner:** after authorized activation only, perform post-activation checks and preserve rollback/LKG.

## Non-negotiable controls

- No direct push, auto-merge, automatic deployment, or automatic activation.
- No production secrets on the self-hosted runner.
- No untrusted pull-request/fork code on the self-hosted runner.
- No bypass of failed or unverified gates.
- No DNS/Worker mutation, production write, promotion, or activation while the deployment mutex is locked.
- The current LKG remains protected.
- Each role must record actual evidence; role assignment is not proof of completion.

## Current gate matrix

- G00 source authority: PASS (existing record)
- G01 repository: PASS (existing record)
- G02 runner assignment: FAIL / UNVERIFIED
- G03 CI execution: BLOCKED
- G04 certification: BLOCKED
- G05 release candidate: BLOCKED
- G06 deployment: BLOCKED
- G07 live validation: BLOCKED
- G08 synchronization: BLOCKED
- G09 activation: BLOCKED
- G10 post-activation: BLOCKED
- G11 acceptance: BLOCKED
