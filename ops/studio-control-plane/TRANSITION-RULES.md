# Transition Rules

## Rule 1 — No inherited establishment

A state at T does not establish the same or any dependent state at T+1.

## Rule 2 — Four independent predicates

```text
ESTABLISHED(T+1)
  ⇔ P(T+1) ∧ E(T+1) ∧ V(T+1) ∧ A(T+1)
```

Each predicate must be independently established.

## Rule 3 — No substitution

```text
P ⇏ E
E ⇏ V
V ⇏ A
A ⇏ P
```

## Rule 4 — Execution is separate

```text
TRANSITION(T→T+1)
  = AUTHORIZATION
  ∧ EXECUTION
  ∧ POST_VALIDATE
```

Execution evidence cannot be manufactured from configuration.

## Rule 5 — Provider readiness is not authorization

A provider may report READY, DEPLOYED, CONNECTED, PASSING, or AVAILABLE without establishing production authorization.

## Rule 6 — Agent authority is bounded

Agents may inspect, modify isolated branches, validate, generate evidence, and recommend transitions.

Agents may not:
- self-approve production;
- convert unverified evidence into verified evidence;
- bypass a failed gate;
- declare a protected LKG replaced;
- promote an unverified state.

## Rule 7 — Contradiction fails closed

If evidence conflicts, is incomplete, stale, unavailable, or cannot be independently correlated:

```text
ACCEPTANCE = NOT ESTABLISHED
NEXT TRANSITION = BLOCKED
```

## Rule 8 — Every transition earns its own state

```text
T → T+1
```

requires a fresh predicate, fresh evidence, fresh verification, and fresh acceptance for T+1.
