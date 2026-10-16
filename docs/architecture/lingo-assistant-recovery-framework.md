# LINGO Assistant Recovery and Infrastructure Framework

**Status:** proposed contract; isolated branch; not production-authoritative until reviewed and accepted.  
**Release posture:** fail-closed. G02 remains blocked until actual runner execution and correlated evidence are independently verified.

## Purpose

Unify askLINGO, LINGOai, LINGOassist, LINGOassister, and LINGOassisthem under one evidence and authorization contract without collapsing their responsibilities or granting any assistant implicit release authority.

## Responsibilities

- **askLINGO:** conversational intake, explain findings, collect operator intent, and present proposed actions. It does not authenticate evidence or authorize its own actions.
- **LINGOai:** model orchestration behind an authenticated server-side gateway. It must not receive deployment credentials or bypass policy gates.
- **LINGOassist:** policy/control plane; tracks dependencies, gate states, approval requirements, and action scope.
- **LINGOassister:** read-only collection and correlation by default; may prepare isolated, reviewable changes only within explicit authorization.
- **LINGOassisthem:** independent challenge/review for security, regression, privacy, accessibility, evidence integrity, and unsupported claims. It must not be the same execution identity as the producer where independence is required.

## Runner contracts are separate

1. **Hosted-runner diagnostic contract:** records what GitHub reports for a GitHub-hosted runner and helps characterize dispatch failures. It cannot satisfy the canonical self-hosted runner requirement.
2. **Canonical self-hosted contract:** requires the approved runner name and labels, a real runner assignment, initialized and executed steps, retrievable logs, and run/attempt/commit-correlated artifacts.
3. **Isolated staging contract:** uses a distinct staging host, runner registration, labels, repository scope, and credentials. Staging success is not proof of canonical G02 acceptance.

Never silently translate evidence between these contracts.

## Canonical evidence envelope

The canonical envelope is defined in [lingo-evidence-v1.schema.json](../../ops/recovery/schema/lingo-evidence-v1.schema.json). Source-specific collectors (GitHub API, host telemetry, artifact inspection, and public probes) remain adapters. Adapters must preserve source references, capture timestamps, exact identities, and raw observation digests. Normalization does not make an observation authentic by itself.

The evaluator in `ops/recovery/unified_gate.py` produces separate results for source identity, dispatch, execution, evidence integrity, independent verification, public reachability, and authorization. Each result is PASS, FAIL, or BLOCKED with a reason. Unknown or missing data blocks acceptance. FAIL describes an observed unmet predicate; BLOCKED describes unavailable, incomplete, or unverified evidence.

## Gate contract

- **C0 Source identity:** repository, branch, full commit SHA, run ID, attempt, and job ID are present and mutually consistent.
- **C1 Dispatch:** a real runner is assigned and matches the explicitly selected runner contract.
- **C2 Execution:** required steps and sentinel are observed with a successful exit result.
- **C3 Evidence:** logs and artifacts are retrievable; artifact identity, run, attempt, commit, and SHA-256 are correlated.
- **C4 Independent verification:** a distinct verifier records a timestamped verification result and evidence references.
- **C5 Public reachability:** independent probes meet the release-specific status and redirect policy. This is independent of runner acceptance.
- **C6 Authorization:** a separate, explicit approval reference covers the exact source SHA and intended action.

The overall release decision is PASS only when every required gate passes and authorization is valid for the requested action. No assistant may override the evaluator or authorize itself.

## Security and mutation policy

- Read-only observation is the default.
- Never place tokens, private keys, service-account files, or unnecessary personal data in evidence records.
- Repair changes must be scoped to an isolated branch or staging environment and must include rollback guidance.
- Merging, deploying, DNS/Worker changes, activation, and promotion require separately recorded human authorization after acceptance.
- The existing production lock and last-known-good protections remain authoritative. This document grants no production permission.

## Verification status

This is a proposed architecture contract. It has not been certified by GitHub Actions while G02 remains blocked. Local or unrelated CI results cannot be represented as G02 acceptance.
