# Troubleshooting Evidence and Acceptance Matrix

| Gate | Required proof | PASS condition | BLOCKED / FAIL handling |
|---|---|---|---|
| E0 Scope | System, environment, owner, impact | Scope is explicit and current | Missing scope = BLOCKED |
| E1 Baseline | Timestamped status/config/telemetry | Baseline reproducible | Missing baseline = BLOCKED |
| E2 Diagnosis | Competing hypotheses and evidence | Cause directly supported | Unknown cause remains UNKNOWN |
| E3 Plan | Change, expected outcome, risk, rollback | Minimal reversible plan reviewed | No safe plan = BLOCKED |
| E4 Authorization | Approval identity, scope, expiry, action | Exact action and target covered | Missing/mismatched approval = BLOCKED |
| E5 Execution | Change record and exact version | Authorized change applied | No execution evidence = BLOCKED |
| E6 Functional tests | Relevant unit/integration/acceptance tests | Required assertions pass | Failed assertion = FAIL |
| E7 Regression/security | Impacted regression and security checks | Required checks pass | Missing checks = BLOCKED |
| E8 Evidence integrity | Source, timestamps, correlation, digest | Evidence authentic and consistent | Unverifiable evidence = BLOCKED |
| E9 Independent review | Distinct verifier and review record | Findings independently confirmed | No independent review = BLOCKED |
| E10 Monitoring | Post-fix telemetry and observation window | SLO/health criteria sustained | Insufficient window = BLOCKED |
| E11 Closure | Residual risk, owner, disposition | All required gates pass | Any required gate open = NOT VERIFIED |

## Finding labels
- CONFIRMED: direct, attributable evidence establishes the finding.
- LIKELY: evidence favors the hypothesis but does not prove it.
- UNKNOWN: evidence is insufficient or conflicting.
- EXTERNAL_BLOCKER: progress depends on a provider, owner/admin, or unavailable capability.

## Metrics to capture where applicable
Availability; error rate; latency percentiles; saturation; queue depth and age; job creation rate; runner assignment rate; step-start delay; execution duration; retry rate; artifact retrieval success; deployment health; rollback duration; incident recurrence.

Do not invent target thresholds. Use approved service objectives or establish and approve them before using them as acceptance criteria.

## Evidence record
Every item should include evidence_id, incident_id, source system, source URL/API reference, captured_at UTC, observed_at when available, repository/commit/run/attempt/job correlation where relevant, raw payload digest, retrieval status, collector identity, and verifier status. Store only necessary data and never credentials.

## Decision semantics
PASS means the stated predicate is evidenced and verified. FAIL means an observed predicate is unmet. BLOCKED means required information, capability, approval, or independent verification is unavailable. Missing data is never silently converted to PASS.
