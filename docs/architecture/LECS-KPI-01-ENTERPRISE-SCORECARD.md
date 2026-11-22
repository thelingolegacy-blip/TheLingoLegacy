# LECS-KPI-01 — Enterprise control-plane scorecard
**Status:** Proposed measurement contract; baselines and targets require production telemetry  
**Owner:** LINGOlegacy_MASTER; metric stewards to be assigned  
**Review cadence:** Weekly operational review; monthly executive review

## Executive scorecard

The scorecard measures whether LINGO can ship safely, operate reliably and deliver value within its approved cost envelope. It deliberately separates outcome KPIs from diagnostic drivers and safety guardrails.

| KPI | Definition | Calculation | Initial target / interpretation |
|---|---|---|---|
| Release evidence completeness | Share of applicable mandatory gate checks with current, correlated evidence and authorized acceptance | Passed evidence items ÷ applicable required evidence items | 100% for every production release; missing/unknown is not pass |
| Production SLO attainment | Share of production service time meeting each service's approved availability and latency SLOs | SLO-compliant eligible intervals ÷ total eligible intervals | Set per service tier after baseline and load testing; no portfolio-wide claim until measured |
| Cost per successful task | Fully attributed infrastructure + model + data + delivery cost divided by successful user/business outcomes | Attributed cost ÷ verified successful tasks | Establish baseline by workload; improve without breaching quality, privacy or reliability guardrails |

## Diagnostic drivers

| Driver | Definition / calculation | Review use |
|---|---|---|
| CI execution integrity | Required CI workflows with jobs created, jobs completed and retained logs/artifacts ÷ required workflows | Detect startup failures, zero-job runs, missing runner identity and incomplete evidence |
| Security remediation time | Time from validated severity assignment to verified remediation; report median and p90 by severity | Detect exposure duration and prioritize remediation |
| RAG grounded retrieval quality | Precision@k / recall@k on a versioned, representative evaluation set; citation correctness measured separately | Detect retrieval drift, ACL errors and unsupported answers |
| Model task success | Evaluated tasks meeting task-specific quality and safety acceptance ÷ evaluated tasks | Compare providers, versions and routing policies |
| MCP policy compliance | Authorized tool invocations with valid identity, scope, schema and audit record ÷ all tool invocations | Detect policy bypass or incomplete evidence |

## Guardrails

- Unauthorized privileged or cross-tenant actions: target 0.
- Confirmed secret exposure: target 0; any event triggers incident response.
- Critical/high exploitable vulnerabilities at production promotion: 0 unresolved.
- Data-rights, consent, deletion or retention violations: target 0.
- Unapproved paid resource creation: target 0.
- Budget-cap breaches: target 0; safe degradation and owner notification required.
- Model quality or safety regression: release blocked when the agreed evaluation threshold is breached.
- Availability, latency or error-rate degradation: stop rollout when service-specific guardrails are breached.

## Measurement contract

Every metric must have:
- stable metric ID and owner;
- precise numerator, denominator, unit and aggregation grain;
- authoritative source and lineage;
- event time, reporting period and freshness expectation;
- segment dimensions and exclusions;
- missing-data behavior (unknown is never silently converted to zero);
- target rationale and approval history;
- dashboard/report location and alert/runbook mapping.

## Data quality requirements

Before a KPI is used for a release or executive decision, validate:
1. Source authority and lineage.
2. Grain, keys, duplicates and join cardinality.
3. Completeness, validity, consistency and freshness.
4. Consistent units, denominators, periods and timezone.
5. Reproducible calculation and versioned definition.
6. Segment coverage and missingness.
7. No double-counting of retries, duplicate events or failed tasks.

## Target-setting policy

The only hard initial target is release evidence completeness: all applicable mandatory gates must pass. Other numerical service, model, retrieval and cost targets remain provisional until representative production baselines, workload profiles and risk tolerances are approved. Do not fabricate baselines or report a proposed target as achieved.

## Reporting

- Weekly: CI integrity, open critical/high risks, release gate status, SLO trends, budget consumption, model/RAG/MCP quality changes.
- Monthly: cost per successful task, service SLO performance, incident trends, data quality, provider comparison and roadmap decisions.
- Per release: immutable gate evidence bundle, exceptions, approvers, artifact digest, rollout outcome and rollback readiness.
