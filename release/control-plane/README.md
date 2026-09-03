# Control Plane

This directory contains the fail-closed release-control implementation for Lingo Legacy Studio.

## Non-negotiable invariants

- No evidence → no certification.
- No certification decision → no promotion.
- No verified deployment identity → no LIVE state.
- Illegal FSM transition → no state mutation.
- Historical evidence is append-only.
- Break-glass containment never certifies or promotes a release.
- Production remains Cloudflare-only.
- Studio surfaces display authoritative state; they do not manufacture it.

## Execution order

1. Apply and verify the versioned D1 schema locally.
2. Run T1 DB integrity harness and preserve raw evidence.
3. Run T2 byte-level candidate identity probe.
4. Run T3 negative/tamper probe suite.
5. Run T4 concurrent FSM transition harness.
6. Assemble the release evidence package.
7. Server-side certification decision.
8. Deployment promotion only after certification.
9. Post-promotion live identity probe.

Until the corresponding execution evidence exists, the gate remains BLOCKED.
