# Agent & Bot Training Curriculum

Status: training plan and evaluation specification. It does not train, fine-tune, or deploy a model.

## Training objectives

Teach each agent to perform a narrow role, use approved tools correctly, provide verifiable outputs, ask for missing authorization, and fail safely when evidence is incomplete. “Training” here includes instructions, examples, tool schemas, simulations, evaluation, and monitored iteration; model fine-tuning is a separate reviewed project.

## Role tracks

| Track | Responsibilities | Prohibited without separate authorization |
|---|---|---|
| Studio Orchestrator | Classify requests, split bounded tasks, assign owners/dependencies, consolidate evidence | Merging, deploying, changing secrets or granting permissions |
| Build & QA Analyst | Run approved checks, report failures with logs and reproduction steps | Suppressing failures or claiming unexecuted tests passed |
| Release Gatekeeper | Evaluate gate predicates and evidence freshness/integrity | Self-approving a release or bypassing a failed gate |
| Brand & Content Steward | Apply canonical naming, voice, and design constraints | Publishing externally without approval |
| Integration Operator | Validate connector schemas and scoped permissions | Expanding scopes or exporting sensitive data |
| Incident Analyst | Correlate event signals, classify impact, propose containment | Destructive remediation without an approved runbook |

## Curriculum modules

1. **Identity and scope:** role, objective, non-goals, allowed data, permitted tools, escalation owner.
2. **Instruction hierarchy:** system safety, platform policy, repository policy, task specification, untrusted external content.
3. **Tool competence:** input schema, least privilege, preconditions, expected output, error handling, idempotency, audit trail.
4. **Job design:** atomic tasks, deterministic acceptance criteria, dependencies, timeout, retry classification, cancellation.
5. **Evidence discipline:** distinguish source inspection, test execution, preview deployment, browser acceptance, and production verification.
6. **Security:** secret redaction, prompt-injection resistance, dependency trust, sandboxing, network allowlists, data minimization.
7. **Human approval:** approval boundaries for external messages, financial actions, publishing, destructive changes, and release promotion.
8. **Failure recovery:** report uncertainty, preserve logs, avoid duplicate side effects, escalate with a minimal diagnostic bundle.
9. **Quality and accessibility:** test navigation, keyboard flow, responsive layout, contrast, reduced motion, and error states.
10. **Operations:** telemetry, incident severity, cost/latency budgets, rollback, and decommissioning.

## Training data and examples

Use synthetic or approved, minimized examples. Store each case with case ID, task, expected behavior, disallowed behavior, tool permissions, expected structured output, evaluator rubric, and version. Remove secrets and personal data. Do not ingest production logs into training sets without data-owner approval and retention review.

## Evaluation suite

For each agent version, evaluate:
- task success and schema validity;
- evidence accuracy and provenance;
- correct tool choice and permission boundaries;
- refusal/escalation on unauthorized actions;
- prompt-injection resistance;
- secret leakage and sensitive-data handling;
- reproducibility, latency, and cost;
- regression against prior release cases.

Include positive cases, ambiguous cases, adversarial/untrusted inputs, tool errors, stale evidence, missing credentials, timeouts, and rollback scenarios. Use fixed test sets plus a held-out set. Report numerator, denominator, version, environment, evaluator, and timestamp; never report only a percentage.

## Promotion criteria

A candidate agent may progress from `SANDBOX` to `EVALUATION` to `SHADOW` to `LIMITED_PREVIEW` only when the owner-defined score thresholds, security tests, tool-boundary tests, and human review pass. Production use requires a separate approval and a monitored rollback plan. Agents cannot approve their own promotion.

## Feedback loop

Collect reviewed failures → redact/minimize → label root cause → add regression case → revise instructions/tool schemas or implementation → rerun full evaluation → independent review → version and publish evaluation report. Fine-tuning is optional and must have a separate dataset, privacy, legal, security, and rollback review.

## Required agent card

Every deployed agent must publish:
- name, version, owner, purpose, and risk classification;
- system instruction version and model/runtime;
- tool allowlist and permission scopes;
- input/output JSON schemas;
- data retention and logging policy;
- timeout, retry, and budget limits;
- evaluation report and known limitations;
- human approval points, escalation path, and rollback procedure.
