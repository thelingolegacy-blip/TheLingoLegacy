# Studio Acceptance Checklist

## P(T+1) — Own Predicate
- [ ] State predicate is explicit.
- [ ] Scope and target are identified.
- [ ] Required inputs and invariants are enumerated.

## E(T+1) — Own Evidence
- [ ] Current evidence is produced by the transition.
- [ ] Evidence is inspectable.
- [ ] Provenance/correlation identifiers are recorded.
- [ ] Evidence is not inferred from configuration.

## V(T+1) — Own Verification
- [ ] Evidence authenticity checked.
- [ ] Evidence integrity checked.
- [ ] Evidence completeness checked.
- [ ] Evidence scope checked.
- [ ] Evidence correlation checked.
- [ ] Independent verification recorded.

## A(T+1) — Own Acceptance
- [ ] Acceptance is explicit.
- [ ] Acceptance is based on verified current evidence.
- [ ] Acceptance is not inherited from T.
- [ ] Acceptance does not imply authorization for another transition.

## Transition
- [ ] Authorization exists for T → T+1.
- [ ] Execution occurred.
- [ ] Post-transition validation occurred.
- [ ] T+1 is independently established.

## Fail Closed
If any required item is false, unknown, contradictory, or unverifiable:

ESTABLISHED(T+1) = NOT ESTABLISHED

NEXT TRANSITION = BLOCKED
