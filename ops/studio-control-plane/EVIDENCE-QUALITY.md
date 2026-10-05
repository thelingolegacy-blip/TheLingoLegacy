# Evidence Quality Controls

Every transition evidence package must be evaluated against five dimensions:

1. **Authenticity** — the evidence came from the claimed authoritative source.
2. **Integrity** — the evidence was not altered or materially transformed after capture.
3. **Completeness** — all required predicates and observations are present.
4. **Scope** — the evidence applies to the exact target, environment, version, and transition being evaluated.
5. **Correlation** — identifiers, timestamps, versions, request IDs, run IDs, or equivalent data connect the evidence to the claimed transition.

## Invalid evidence patterns

The following do not establish a transition by themselves:

- configuration-only claims;
- screenshots without provenance;
- queued jobs without execution telemetry;
- provider READY/DEPLOYED status without independent acceptance;
- stale evidence from an earlier transition;
- inferred credentials or fabricated configuration;
- downstream health checks used as substitutes for the required upstream predicate;
- an agent's own assertion that its action succeeded.

## Acceptance rule

```text
ANY_REQUIRED_DIMENSION_FALSE_OR_UNKNOWN
        ↓
EVIDENCE_NOT_ACCEPTED
        ↓
STATE_NOT_ESTABLISHED
        ↓
NEXT_TRANSITION_BLOCKED
```

Evidence quality is evaluated for the specific transition. Prior evidence does not automatically carry forward to T+1.
