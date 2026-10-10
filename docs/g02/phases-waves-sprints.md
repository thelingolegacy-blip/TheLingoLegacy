# G02 Recovery — Phases, Waves, Sprints, and Release Gates

**Control mode:** fail-closed; production protected; no merge or activation by this plan.
**Baseline:** 2026-10-10. This is an execution plan, not evidence that a phase has passed.

## Phase 0 — Protected hold (current)
- Keep production, LKG, DNS, Workers, credentials, and deployment controls unchanged.
- Keep recovery work isolated on `infra/g02-evidence-architecture-2026-10-10`.
- Keep PR #263 draft and unmerged pending review.
- Exit: branch and PR inventory captured; no unintended production changes.

## Wave 1 — Architecture and evidence contract
- Sprint 1: Packet A/Packet B schema and architecture.
- Sprint 2: runner state machine, trigger policy, sentinel contract, correlation rules.
- Sprint 3: validator negative tests and schema consistency review.
- Exit: files fetched back, static checks pass, negative tests run in an isolated test environment, review findings resolved.

## Wave 2 — Authorized-host collection
- Sprint 4: operator runs the reviewed read-only host collector on the authorized Linux host.
- Sprint 5: redact sensitive values, preserve raw non-secret output, hash evidence files, record collector identity and UTC timestamp.
- Exit: Packet A is populated from actual host output; runner daemon/service and registration state are verified, not inferred.

## Wave 3 — Controlled sentinel execution
- Sprint 6: confirm runner name/labels and authorized repository scope independently.
- Sprint 7: only after review and explicit run approval, dispatch the existing sentinel through the approved path.
- Sprint 8: collect run, attempt, job, runner ID/name, instantiated steps, sentinel exit code, raw logs, artifacts, and commit SHA.
- Exit: Packet B represents a real run with runner_id > 0, assigned job, instantiated steps, exit code 0, and retrievable evidence.

## Wave 4 — Correlation and acceptance
- Sprint 9: correlate Packet A and Packet B across runner identity, repository, commit, run/attempt/job, and UTC timestamps.
- Sprint 10: independently retrieve source evidence, verify hashes/redaction, and evaluate P1–P9 conjunctively.
- Exit: every P1–P9 is TRUE; no UNKNOWN; independent reviewer accepts both packets.

## Wave 5 — Review and synchronization
- Sprint 11: review PR #263 and all related recovery PRs/MRs for conflicts, overlapping files, trigger safety, and policy consistency.
- Sprint 12: synchronize only approved recovery branches using normal review/branch protection; preserve exact source SHAs and a merge audit record.
- Exit: required approvals and CI pass; merge authorization is separately recorded. This plan does not itself authorize a merge.

## Wave 6 — Post-merge verification (conditional)
- Sprint 13: verify merged commit, required checks, and source-to-commit traceability.
- Sprint 14: re-run approved non-production validation and re-collect evidence if the merge changes the tested content.
- Exit: post-merge checks pass and evidence remains correlated to the exact deployed candidate SHA.

## Wave 7 — Promotion decision (separate authorization)
- Sprint 15: independent production-readiness review, rollback/LKG review, security review, and change approval.
- Sprint 16: promotion only after every required gate is accepted and explicit production authorization is documented.
- Exit: separate signed/recorded decision. No automatic deployment or activation follows G02.

## Hard stop conditions
Stop and remain BLOCKED if runner_id is zero, runner name is empty/mismatched, job is unassigned, steps are absent, sentinel fails, logs/artifacts are unavailable, hashes mismatch, evidence is unredacted, timestamps conflict, or any predicate is UNKNOWN. Do not bypass branch protection or merge to make the workflow appear green.
