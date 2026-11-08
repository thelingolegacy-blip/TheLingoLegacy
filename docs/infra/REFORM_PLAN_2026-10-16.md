# LINGOassist Infrastructure Reform Plan
Date: 2026-10-16
Repository: thelingolegacy-blip/TheLingoLegacy
Branch: infra/lingoassist-reformed-infrastructure-2026-10-16

## Purpose

Create a reviewable, isolated reform path for infrastructure verification and recovery. This document is a plan, not production authorization. It does not change runtime code, credentials, DNS, Worker routes, deployments, runner configuration, or the last-known-good (LKG) baseline.

## Non-negotiable operating rules

- Fail closed whenever evidence is missing, stale, contradictory, or unverifiable.
- Keep production promotion, activation, and LKG mutation blocked until all required gates pass and an authorized operator explicitly approves the transition.
- Never print, commit, log, or request secret values. Store secrets only in the approved secret manager; reports must contain names, scopes, timestamps, and redacted identifiers only.
- Do not automatically create, rotate, broaden, or revoke credentials. Generate a proposed least-privilege policy for administrator review; apply it only through an authorized credential-management process.
- Do not run deployment, destructive cleanup, DNS, Worker-route, or production-write operations as part of diagnostics.
- Keep provenance-hardening work on `studio/pr235-provenance-hardening-2026-10-16` isolated.
- Treat a branch being created, a workflow being queued, or a tool returning success as insufficient proof that CI actually executed.

## Current known gates

| Gate | State at checkpoint | Evidence required to advance |
|---|---|---|
| Cloudflare token audit | BLOCKED | Administrator-verified, redacted token policy and scope; explicitly exclude production Worker writes and custom-route changes |
| PR #235 provenance | PENDING | Static review, tests executed on a functioning runner, independently verified logs and artifact provenance |
| G02 runner recovery | BLOCKED | Matching runner assigned; runner ID and name present; steps instantiated; sentinel executed; retrievable logs; independently verified evidence |
| IR-06 attestation | NOT ACCEPTED | Trusted attestation bound to the exact source revision and execution evidence |
| Production promotion | ON HOLD | Every required gate passes and explicit authorization is recorded |
| LKG baseline | PROTECTED | No mutation without acceptance and authorization |

## Parallel workstreams

### A. Evidence intake and integrity
1. Collect the redacted Cloudflare token-policy report from an administrator.
2. Collect `g02-host-telemetry.txt` from `infra/g02-host-telemetry-rebuild-2026-10-10` using the approved collection procedure.
3. Record source branch/commit, collection time, collector, tool/version, and SHA-256 digest for each artifact.
4. Reject reports containing secret material; do not echo detected values. Preserve original evidence separately from derived summaries.
5. Distinguish observed facts, repository declarations, hypotheses, and unknowns in every report.

### B. G02 runner diagnosis
1. Verify repository/org Actions policy, runner-group access, runner labels, and applicable account restrictions.
2. Verify that the self-hosted runner daemon is running and polling on the intended host; do not infer this from an “Online” UI status alone.
3. Correlate a unique sentinel workflow run with job assignment, positive runner ID, populated runner name, instantiated steps, sentinel output, and retrievable logs.
4. If jobs remain queued or fail before step initialization, stop repeated workflow edits and escalate with sanitized run IDs and timestamps to GitHub Support.
5. Mark G02 PASS only when the full conjunctive acceptance predicate is independently satisfied.

### C. Provenance and CI validation
1. Keep PR #235 changes isolated from this reform branch.
2. Review changed-file scope, workflow permissions, dependency/install scripts, secret exposure, artifact origin, and source revision binding.
3. Do not claim tests passed unless a real runner executed them and the logs are retrievable.
4. Record test commands, exact commit SHA, run/job IDs, exit codes, and artifact digests.
5. Treat a missing runner, missing steps, missing logs, or unverifiable artifacts as BLOCKED—not PASS.

### D. Cloudflare token-policy audit
1. Inventory token names/IDs in redacted form, owners, scopes, resource boundaries, creation/expiry metadata if available, and last-use evidence if available.
2. Confirm staging-only scope and absence of production Worker write and custom-route mutation permissions.
3. If current scope cannot be proven, retain BLOCKED and request an administrator-generated policy report.
4. Recommend least-privilege changes in a review artifact; do not generate or rotate live credentials automatically.
5. Never place token values in Git, issues, workflow output, telemetry, or this report.

### E. Safe cleanup and architecture inventory
1. Inventory before proposing deletion: workflow references, package scripts, deployment manifests, runtime entrypoints, bindings, environment variables by name only, and external integrations.
2. Classify each item as active, referenced, duplicated, deprecated, or unknown.
3. Remove nothing until dependency/reference checks and owner approval prove it is unused.
4. Prefer reversible, isolated patches with a file-level rationale, tests, rollback instructions, and evidence links.
5. Do not introduce a second source of truth for Worker routes, DNS, secrets, environment configuration, or release authority.

### F. LINGOassist diagnostic capability
The intended assistant workflow is:

`OBSERVE → CLASSIFY → COLLECT EVIDENCE → PROPOSE PATCH → STATIC VALIDATION → HUMAN REVIEW → AUTHORIZED EXECUTION → VERIFY → RECORD`

LINGOassist may automate read-only inventory, schema checks, redaction checks, evidence hashing, comparison of expected versus observed gates, and draft patch generation. It must not autonomously grant permissions, mint/rotate credentials, mutate production, bypass required reviews, or mark a gate passed from an unverified claim.

## Exit criteria

- [ ] Cloudflare policy report verified and confirmed staging-only.
- [ ] Sanitized G02 host telemetry verified and correlated with a specific commit and run.
- [ ] Runner-dispatch acceptance predicate satisfied with independently retrievable evidence.
- [ ] PR #235 provenance review and tests completed on a functioning runner.
- [ ] IR-06 attestation independently validated and bound to matching execution evidence.
- [ ] Unused infrastructure candidates proven unused before any removal.
- [ ] All proposed patches reviewed, tested, and linked to exact evidence.
- [ ] Explicit release authorization recorded before any production transition.

## Status at creation

This branch contains a governance/reform plan only. No tests have been run by this document, no credentials were created or changed, no infrastructure was cleaned up, no deployment was initiated, and no gate is upgraded by this commit.
