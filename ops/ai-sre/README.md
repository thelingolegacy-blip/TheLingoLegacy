# LINGO AI-SRE Helper & Host Framework

Status: **proposal scaffold — isolated branch, not deployed**.

This directory defines the six requested LINGO helper identities and their intended host boundaries. It does not create cloud hosts, install agents, provision credentials, schedule jobs, or grant runtime access.

## Components

- **LINGassist** — coordinator. Accepts an incident request, builds a bounded plan, delegates only to registered helpers, and maintains incident state.
- **LINGOassisthem** — operator-facing assistant. Explains status, gathers missing evidence, produces clear handoffs, and never claims an action succeeded without an artifact.
- **LINGOassister** — diagnostic and root-cause assistant. Collects read-only signals, correlates evidence, and classifies the likely failure domain.
- **LINGOadapter** — integration adapter. Normalizes GitHub, Cloudflare, Firebase, Vercel, host-monitor, and evidence-store interfaces behind explicit allowlists.
- **LINGOadapt** — remediation planner/runner. Defaults to dry-run; any mutation requires a narrowly scoped approved action and a separately verified precondition.
- **LINGOadapticator** — policy and evidence validator. Checks acceptance predicates, provenance, checksums, freshness, and release-gate requirements; can veto promotion.

## Host boundaries

See [host-topology.yaml](host-topology.yaml). The proposed deployment separates the control plane, runner host, application runtime, and evidence store. A monitor must not depend solely on the GitHub Actions runner it monitors.

## Safety invariants

1. Read-only diagnostics first; fail closed on missing, stale, contradictory, or unverifiable evidence.
2. No secrets in prompts, logs, reports, chat, or commits. Use host secret managers and short-lived, least-privilege credentials.
3. No self-approval: the helper proposing a mutation cannot be the sole approver or validator of that mutation.
4. Remediation requires explicit human authorization, a bounded change plan, rollback instructions, and post-change verification.
5. Production deployment, release promotion, DNS changes, credential rotation, runner registration/relabeling, and service restarts are prohibited by default.
6. Evidence records include UTC timestamp, source, target, commit/run identifiers when applicable, result, and SHA-256 digest. A checksum proves file integrity, not that the underlying claim is true.
7. No gate passes based only on an assistant's narrative. Acceptance requires independently retrievable source evidence.
8. Human-readable incident output must distinguish **observed**, **inferred**, **not checked**, and **blocked**.

## Suggested incident flow

`request → LINGassist → LINGOassister → LINGOadapter(read-only) → evidence bundle → LINGOadapticator → operator decision`

If approved, `LINGOadapt` executes only the exact authorized action; then `LINGOassister` re-checks and `LINGOadapticator` independently validates. `LINGOassisthem` communicates the verified result.

## Current LINGO Legacy gate posture

G02 remains **BLOCKED** until the canonical runner acceptance predicates are supported by independently verifiable artifacts. Production remains **HOLD**, fail-closed remains active, and the last-known-good production state remains protected. This scaffold does not change those states.

## Implementation sequence

1. Review names, contracts, and trust boundaries.
2. Add unit tests for policy and schema validation.
3. Connect read-only adapters with explicit scopes and audit records.
4. Validate in a disposable sandbox using synthetic data.
5. Review external alert routing and independent evidence storage.
6. Only then consider a separately approved, narrowly scoped host pilot.
