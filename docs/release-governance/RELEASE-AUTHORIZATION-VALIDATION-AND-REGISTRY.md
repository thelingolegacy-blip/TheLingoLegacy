# Release Authorization Validation and Surface Registry

**Status:** Draft implementation; not release authorization.  
**Effective release posture:** Production HOLD; G02 BLOCKED; last-known-good PROTECTED.

## Scope

This increment adds:
- Draft 2020-12 JSON Schemas for the release policy and Surface Matrix registry.
- A Surface Matrix inventory covering the current cross-stack taxonomy.
- A deterministic fail-closed decision evaluator.
- Regression tests for missing gates, unbound evidence, G02 execution failures, missing approval, and exact-scope approval.
- A GitHub Actions workflow to validate both JSON documents and run the Node.js tests.

## Registry integrity

The registry is intentionally marked `DRAFT_UNRECONCILED`. Its rows are inventory candidates based on the approved design taxonomy, not verified claims that each listed surface is deployed. Owners, environments, dependencies, and deployment targets remain `UNKNOWN` until independently reconciled with authoritative repository, platform, and production evidence.

A registry must not be changed to `ACCEPTED` merely to make a test or release pass. Acceptance requires review and evidence.

## Decision behavior

The evaluator returns:
- `BLOCKED` when required evidence, gates, surface reconciliation, exact-scope bindings, or G02 execution evidence is missing or invalid.
- `ELIGIBLE_FOR_APPROVAL` only when technical evidence is complete but the required approval has not been supplied.
- `AUTHORIZED` only when the policy is active for production and an explicit, independent, exact-scope human approval is recorded.

The checked-in policy remains `DESIGN_NOT_ACTIVE_AUTHORIZATION` and explicitly disables production promotion. The checked-in registry remains unreconciled. Therefore, the current repository state cannot authorize production.

## G02 evidence contract

G02 requires a positive runner ID, populated runner name, assigned job, instantiated steps, executed sentinel, retrievable logs, run and attempt identity, and correlation to the exact commit and artifact digest. A runner heartbeat, empty jobs, or empty artifacts cannot satisfy the gate.

## Validation

The workflow is intended to execute JSON Schema validation and the Node.js regression suite on GitHub Actions. Until an actual run produces assigned runner metadata, executed steps, retrievable logs, and correlated artifacts, its status is not evidence of a passing CI run. This increment does not resolve the pre-existing G02 runner-dispatch blocker, merge the governing design PR, or authorize deployment.
