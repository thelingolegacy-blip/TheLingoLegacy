# LINGO Troubleshooting Center

**Status:** foundation proposal on an isolated recovery branch; not production-authoritative or deployed.
**Operating posture:** read-only diagnostics by default; fail closed when evidence, access, or authorization is missing.

## Mission
Provide one repeatable, auditable method to detect, diagnose, repair, verify, and prevent failures across LINGO infrastructure without duplicating existing control planes or bypassing release gates.

## Existing foundations to integrate
- `lingoassister/`: incident lifecycle, evidence records, finding classes, duplicate-diagnostic suppression, authorization gates, acceptance evaluation.
- `docs/architecture/lingo-assistant-recovery-framework.md`: assistant responsibilities, evidence envelope, independent verification, release gates.
- `ops/recovery/`: recovery evaluators and evidence schemas.
Do not create a second source of truth. Review and integrate these foundations before implementation expansion.

## Standard incident lifecycle
`DETECTED → TRIAGED → INVESTIGATING → DIAGNOSED → PLANNED → AWAITING_AUTHORIZATION → EXECUTING → TESTING → VERIFYING → VERIFIED`
Any stage may become `BLOCKED` or `FAILED`. Reopen investigation only when new evidence or a changed condition exists. A successful diagnostic is not release acceptance.

## Required method
1. Detect and timestamp the symptom.
2. Preserve a read-only baseline and identify affected scope.
3. Form multiple falsifiable hypotheses; label each CONFIRMED, LIKELY, UNKNOWN, or EXTERNAL_BLOCKER.
4. Build a fault tree and assess impact, blast radius, dependencies, and risk.
5. Run the smallest discriminating, non-mutating test.
6. Record the cause only when direct evidence supports it; otherwise retain UNKNOWN.
7. Propose the smallest reversible correction, expected outcome, rollback, and required approval.
8. Execute only within approved scope and environment.
9. Run acceptance, regression, security, and integration checks appropriate to the change.
10. Have an independent verifier validate source, timestamps, correlation, integrity, and results.
11. Monitor after repair and record recurrence or residual risk.
12. Close only when acceptance criteria are satisfied and evidence is retained.

## Required methodologies
- Root-cause analysis and Five Whys
- Fault Tree Analysis
- Hypothesis testing / controlled experiments
- Failure Mode and Effects Analysis (FMEA)
- Differential diagnosis
- Regression and integration testing
- Reliability monitoring and trend analysis
- Chaos/resilience testing only in isolated, explicitly approved environments

## Incident record minimum
Incident ID; system/service; environment; severity; impact; detected_at; reporter/source; affected commit/config version; symptom; baseline; hypotheses; evidence references and digests; confirmed cause or UNKNOWN; risk assessment; proposed change; authorization reference; rollback; test plan/results; independent verifier; residual risks; monitoring window; disposition.

## Evidence rules
- Preserve raw source references, timestamps, run/attempt/job/commit IDs, and content digests.
- Distinguish absent evidence from negative evidence.
- Do not infer execution from dispatch acceptance or workflow conclusion alone.
- Do not treat local tests, preview success, or unrelated hosted jobs as canonical runner acceptance.
- Never place secrets, tokens, private keys, or unnecessary personal data in incident evidence.
- Independent verification must use a distinct identity where independence is required.

## Severity and response
- SEV-1: confirmed broad production outage, active compromise, or material data-integrity risk; immediate escalation and containment plan.
- SEV-2: major user-facing degradation or critical subsystem unavailable.
- SEV-3: limited functionality degradation with workaround.
- SEV-4: low-impact defect, maintenance, or improvement.
Severity is based on observed impact, not speculation.

## Safety and release boundary
Read-only observation is the default. Any repair with side effects requires scoped authorization. Merges, production deployments, DNS/Worker changes, secret rotation, data migration, deletion, runner registration, and production-hold changes remain subject to their separate controls and approvals. This document grants no such authority.

## Implementation gates
- TSC-01: review this operating contract and reconcile with existing LINGOassister contracts.
- TSC-02: validate incident/evidence schemas and add deterministic unit tests.
- TSC-03: implement read-only GitHub run/job/step/log/artifact adapter.
- TSC-04: implement read-only Cloudflare/Firebase/service health adapters with least privilege.
- TSC-05: persist append-only incident and evidence events with retention and access controls.
- TSC-06: implement authorization-enforced repair planner; plan-only by default.
- TSC-07: independent verifier and evidence-integrity checks.
- TSC-08: phone-first Command Center view over the canonical incident store.
- TSC-09: staging acceptance, security review, rollback exercise, and operational handoff.

No gate is complete merely because a document or interface exists. Each requires testable acceptance evidence.
