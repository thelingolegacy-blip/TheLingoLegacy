# LINGO Workforce, Host & Agent Academy

**Version:** 1.0.0 · **Date:** 2026-10-31 · **Status:** Operating standard for implementation and training.

## 1. People model

Create role-based learning paths for:
- Executive owner / product owner
- Department and studio leads
- Employees and contractors
- Customer/community support
- Retail and field operations
- Drivers, dispatchers and warehouse staff
- Moderators and trust & safety reviewers
- Finance and reconciliation staff
- IT, security and platform operators
- QA, release and incident commanders

Every role receives a written job scope, decision rights, escalation route, data access profile, training checklist and backup coverage. Do not grant access based on job title alone.

## 2. Required onboarding

1. Mission, values, brand canon and customer promise.
2. Code of conduct, anti-harassment, safeguarding and workplace safety.
3. Privacy, confidentiality, data handling and phishing awareness.
4. Product and service training for assigned role.
5. Tools, device security, password manager and MFA.
6. Incident reporting, emergency contacts and escalation.
7. Customer communication and accessibility.
8. Role-specific supervised practice.
9. Knowledge check and supervisor sign-off.
10. Refresher training after material process or security changes.

Training records contain employee ID, course/version, completion time, assessment result and approving supervisor. Keep personnel data in an appropriately restricted HR system; do not store sensitive HR records in public product databases.

## 3. Hosts and infrastructure

Each host/service record must include owner, environment, provider, region, operating system/runtime, resource sizing, network exposure, patch level, monitoring, backup policy, restore test, dependencies, support contact and retirement plan.

Baseline:
- Unique identities; no shared admin logins.
- MFA and short-lived credentials where supported.
- Minimal inbound network exposure; explicit egress policy.
- OS/runtime patch cadence and vulnerability response.
- Centralized, redacted logs and alerting.
- Capacity thresholds for CPU, memory, disk, queue depth and error rate.
- Tested backup restore and documented recovery objectives.
- Change windows, rollback and emergency access audit.

G02 remains a separately governed runner acceptance gate. A host is not accepted because it exists or appears online; actual runner assignment, execution, logs, artifacts and independent verification are required.

## 4. Bots and AI agents

Every bot/agent must have:
- Named business owner and technical owner.
- Unique service identity and environment separation.
- Explicit allowed tools, data scopes and action limits.
- Read-only default; write permissions granted per task.
- Human approval for money movement, account changes, public communications, moderation bans, prize selection, deployments, access changes and deletion.
- Rate limits, spend limits, quotas and emergency kill switch.
- Prompt/tool injection defenses and untrusted-input boundaries.
- Structured logs with correlation IDs and no secrets.
- Evaluation set, regression tests, monitoring and fallback to human support.
- Versioned model, prompt, tools and policy configuration.

Agents may draft, summarize, route, classify and recommend. They must not impersonate staff, fabricate completion, approve their own work, bypass legal/security gates, or execute consequential actions outside their assigned scope.

## 5. Performance and quality

Use role-specific measures rather than a single productivity score:
- Safety and policy adherence.
- First-contact resolution and customer satisfaction.
- Quality review and rework rate.
- On-time delivery and service reliability.
- Training currency and competency.
- Inventory/financial reconciliation accuracy.
- Incident response time and corrective-action closure.

Never use opaque automated scoring as the sole basis for discipline, termination, scheduling or compensation.

## 6. Incident and escalation protocol

`DETECT → PROTECT PEOPLE/DATA → TRIAGE → ASSIGN INCIDENT LEAD → CONTAIN → PRESERVE EVIDENCE → RESTORE → COMMUNICATE → REVIEW`

Severity levels:
- **SEV-1:** safety risk, confirmed data breach, major service outage, financial integrity failure. Immediate incident command and executive/legal/security notification.
- **SEV-2:** significant service degradation, suspected compromise, repeated failed transactions or material customer impact.
- **SEV-3:** limited defect with workaround.
- **SEV-4:** routine request or improvement.

Document timeline, impact, scope, decisions, evidence, customer notice, recovery, owner and corrective action. Preserve evidence; do not delete logs or conceal incidents.
