# The Lingo Legacy — Production System Certification & Operations Standard

**Status:** Proposed; requires system-owner and independent-reviewer approval.  
**Version:** 1.0-draft  
**Scope:** Website, APIs, games, mobile, identity, data, commerce, analytics, infrastructure, integrations, pipelines and operations.

> This document defines the certification bar. It does not certify the implementation. The system remains NOT CERTIFIED until every mandatory gate has current evidence and independent sign-off.

## 1. Non-negotiable principles

1. Evidence over assertion: PASS requires dated, attributable evidence from the named target environment.
2. One source of truth: record canonical repository, immutable commit, artifact digest, environment and deployment ID together.
3. Fail closed: missing, stale, ambiguous or inaccessible evidence is BLOCKED or UNVERIFIED, never PASS.
4. Separate local, development, test, staging and production identities, data, secrets, endpoints and billing modes.
5. Least privilege for people, bots, agents, services and CI runners.
6. Reversible changes: tested rollback or forward recovery, data compatibility analysis and named decision owner.
7. Privacy by design: minimum data, purpose limitation, retention and deletion controls; synthetic data in demos/tests.
8. No implied capability: a UI, mock, stub, local demo, config, connected account or HTTP 200 does not prove a functioning service.
9. Paid, regulated, payment, cash-out, real-money, AI inference and paid messaging capabilities remain disabled until separately approved.
10. Independent acceptance: authors cannot be the sole approver of high-risk production changes.

## 2. System registry and ownership

Maintain one versioned record for every app surface, service, data store, provider and operational dependency. Required fields:
- Unique service ID, name, business owner, technical owner and on-call owner.
- Canonical repository/path, source authority and immutable version.
- Runtime, environment, region, hostname, route, account/project and deployment target.
- Data classification, system-of-record status, retention, deletion and backup policy.
- Authentication, authorization, service identity and permission model.
- Dependencies, contracts, failure modes, SLOs, alerts, dashboards and runbooks.
- Cost owner, budget ceiling, vendor terms and quota.
- Evidence links, verification timestamp, status, exceptions and next review.

Unknown ownership, environment, data boundary or rollback path means the component is not production-ready.

## 3. Lifecycle certification gates

| Gate | Required evidence | Block condition |
|---|---|---|
| G00 Source authority | Canonical repo, owner, commit provenance | Competing/unknown source |
| G01 Repository hygiene | Branch rules, review, secret/dependency/privacy scans | Exposed secret/data or unreviewed path |
| G02 Build infrastructure | Reproducible runner, pinned tools, isolated credentials | Runner/host identity unknown |
| G03 CI execution | Required jobs on exact commit, logs and artifacts | No jobs, skipped checks, stale SHA |
| G04 Quality | Unit, integration, contract, E2E, accessibility, performance | Critical test absent/failing |
| G05 Release candidate | Immutable artifact, digest, SBOM, provenance | Artifact not tied to source |
| G06 Deployment | Approved change, target, rollout and deployment ID | Unknown target/unapproved mutation |
| G07 Live validation | External and authenticated smoke tests, synthetic journeys | Critical route/auth/transaction fails |
| G08 Synchronization | Web/mobile/API/schema/config compatibility | Version or contract drift |
| G09 Activation | Separate approval for identity, payments, messaging, AI, rewards | Unapproved activation |
| G10 Operations | SLOs, alert delivery, backup/restore, incident owner | No observable operations |
| G11 Acceptance | Independent sign-off, evidence index, risk register | P0/P1 or missing evidence |

PASS requires reviewer, timestamp, environment, exact version and evidence link. A material source, artifact, configuration, provider or environment change invalidates affected evidence.

## 4. Architecture and API rules

- Document every service boundary with OpenAPI or equivalent contract, versioning, auth scopes, schemas, idempotency, timeout, retry, error semantics and rate limits.
- Separate presentation, domain logic, data access and provider adapters.
- Define one authoritative identity provider and one system of record per data domain; prohibit uncontrolled dual writes.
- Use correlation IDs across web/API/worker/queue/provider/database. Never put secrets or personal data in IDs.
- Use queues for retryable long-running work with deduplication, dead-letter handling and controlled replay.
- Every state-changing endpoint requires server-side authorization, bounded body size, validation, output encoding, timeout, abuse protection and idempotency.
- Define graceful degradation and explicit disabled states. Never return fake success for an unimplemented integration.
- Operator/internal endpoints must not be published as public assets or exposed through public navigation.

## 5. Identity, access and secrets

- MFA for human accounts; phishing-resistant MFA for privileged roles where supported.
- Separate customer, staff, CI runner, service and agent identities.
- Verify token signature, issuer, audience, expiry, key rotation and revocation/session policy. Token shape or Bearer header presence is not authentication.
- Enforce server-side authorization on every operation using roles and resource ownership; hiding a button is not authorization.
- Use short-lived credentials and managed secret stores. Never commit credentials, environment files, private keys or service-account JSON.
- Production access is attributable, time-bound, logged and reviewed quarterly. Break-glass access requires post-event review.
- Agents may inspect, draft, test in isolated environments and recommend. Production, permissions, DNS, payment, legal and spend actions require explicit scoped approval.

## 6. Data, privacy and records

- Classify public, internal, confidential, restricted and regulated data.
- Maintain purpose, consent, lawful basis where applicable, retention, deletion, export and processor inventory.
- Use synthetic data in demos, tests, screenshots, seeds and public examples.
- Prohibit personal/minor/family information, credentials, payment data and private correspondence in public source, bundles, logs, analytics and public issue comments.
- Encrypt in transit and at rest; use managed keys and least-privilege access.
- Test database/storage rules for anonymous, authenticated, owner, cross-user and privileged cases; deny by default.
- Analytics must be consent-aware and purpose-limited; do not send raw secrets or sensitive user content.
- Verify backup restore and deletion propagation to replicas, exports and processors.

## 7. Security and supply chain

- Threat-model public entry points, auth boundaries, privileged workflows, payment flows and exports.
- Run SAST, dependency/SCA, secret, IaC, container, DAST and risk-based penetration tests.
- Generate SBOM and artifact provenance for production releases.
- Pin CI actions and critical tools; review workflow permissions and third-party actions.
- Protect main with required independent review/checks; restrict force pushes and bypass.
- Start CSP in report-only, inspect violations and compatibility, then enforce a tested policy. Reduce unsafe inline execution with nonce/hash strategy where feasible.
- Rate limiting must work across instances/isolates using trusted client identity and explicit failure behavior.
- Test security headers, CORS, CSRF, SSRF, uploads, output encoding and session controls.
- P0 security/privacy issues block release; exceptions require named risk owner, compensating controls and expiry.

## 8. Reliability and operations

Each production service must have SLIs/SLOs, error budget, structured logs, metrics, traces, safe correlation IDs, environment/version tags, alert thresholds, tested alert delivery, dashboard, runbook, on-call owner, dependency failure plan and recovery objectives.

Redact tokens, phone/email, payment data, user prompts and sensitive payloads. Test backup restoration on a defined schedule. Load-test expected peak concurrency and document bottlenecks. Dashboards without functioning alert delivery do not satisfy observability.

## 9. Games, rewards and monetization

- Separate demo balances from production wallet, loyalty points, gift cards and payment ledgers.
- Make outcomes, balances, inventory and reward eligibility server-authoritative.
- Use append-only ledger entries, idempotency, reconciliation and immutable audit records.
- Before contests/sweepstakes/prizes: counsel-reviewed rules, eligibility, disclosures, tax and fulfillment process.
- Before regulated/real-money activity: jurisdictional/legal review, age/region controls, fairness/RNG testing, responsible-play safeguards and approved operating model.
- Before payments: approved processor account, test-mode certification, signed webhook verification, idempotent fulfillment, refunds/disputes/tax procedures, PCI scope review and reconciliation.
- Keep billing, cash-out, real-money play, paid messaging and inference disabled until written approval and acceptance.
- Never claim revenue, payments, prizes, wallets or rewards are operational based on UI or test fixtures.

## 10. Web, mobile and game client

Web acceptance includes route inventory, canonical host, TLS, headers, accessibility, browser matrix, asset publication inventory, cache policy and rollback. Mobile acceptance includes reproducible signed builds, signing-key custody, privacy manifest, permission review, crash reporting, device matrix, store compliance and staged rollout. Game acceptance includes deterministic tests, save migration, performance budgets, input/accessibility coverage and anti-abuse model where applicable.

All clients must use versioned API contracts and compatibility tests. Placeholder credentials, sample persistence and local-only lead capture cannot be described as live backend functions.

## 11. Standard change and release procedure

1. Open issue/change record: owner, scope, affected services, risk, dependencies, acceptance criteria and cost/privacy/security/legal impact.
2. Create isolated branch and narrow PR; link issue, commit and service registry entries.
3. Run clean deterministic build, lint, type, unit, integration, contract, E2E and security checks.
4. Review privacy, accessibility, performance, data migration, legal and cost impacts.
5. Produce immutable artifact, digest, SBOM and provenance.
6. Deploy to staging and test migrations, synthetic journeys, auth boundaries, backups and rollback.
7. Obtain independent review and explicit scoped production authorization.
8. Deploy progressively with health checks, abort thresholds and named operator.
9. Verify public and authenticated journeys, APIs, data rules, integrations and monitoring.
10. Monitor the agreed watch window; close only with evidence and release record.

If a workflow fails before jobs instantiate, classify it as CI infrastructure BLOCKED, not test failure and not pass. Never bypass CI by asserting success or weakening required checks.

## 12. Incident and vulnerability procedure

Severity: SEV-1 critical security/data loss/major outage/payment harm; SEV-2 major degradation/high-risk exposure; SEV-3 limited impact; SEV-4 minor. Appoint incident commander, contain impact while preserving evidence, record UTC timeline and affected versions, communicate through approved channels, recover from known-good artifacts, validate journeys/security, and complete a blameless postmortem with owners and due dates. Keep vulnerability details private until coordinated remediation.

## 13. Provider and cost governance

For each provider record account/project, environment, scopes, endpoints, data exchanged, retention, region, contract, price, quota, webhook model, failure modes, owner and last verification. A connected plugin or account does not prove the correct production project is mapped.

Before paid activation require written purpose, budget owner, ceiling, usage alerts, kill switch, data/legal review, test evidence, rollback/disable procedure and explicit approval for the named provider/project/environment/action.

## 14. Go/no-go and exceptions

NO-GO if any mandatory gate is BLOCKED/UNVERIFIED, a P0/P1 is open, a critical journey fails, target identity is unknown, rollback is untested, alert delivery is absent, or paid/regulated capability lacks approval.

GO is scoped to exact commit, artifact digest, environment, provider project, deployment/route/binding, feature set, approval identities and timestamp. Material changes require re-certification.

An exception must state control ID, rationale, risk, impact, compensating controls, owner, approver, expiry and remediation issue. No permanent exception. No exception may conceal a security/privacy incident or waive legal requirements.

## 15. Required evidence pack

- Source commit, branch protection, PR approvals and required check evidence.
- CI run/job URLs, logs, test reports, artifact digest, SBOM and provenance.
- Architecture/service registry and data-flow diagrams.
- Threat model, security scan and penetration test reports.
- Authentication/authorization and data-rule test results.
- Backup/restore and disaster recovery exercise.
- Performance, accessibility, browser/device reports.
- Deployment ID, active routes/bindings/asset manifest and live smoke tests.
- SLO dashboard, alert delivery proof, incident/rollback evidence.
- Provider config verification, payment/legal acceptance where relevant.
- Risk/exception register and independent sign-offs.

Evidence must state environment, date/time, exact version, reviewer and outcome. Screenshots without source context are supporting evidence only.

## 16. Status vocabulary

- PASS: requirement tested in named target with current evidence.
- FAIL: test executed and requirement not met.
- BLOCKED: dependency, access, runner, approval or artifact unavailable.
- UNVERIFIED: no reliable current evidence.
- NOT APPLICABLE: rationale and reviewer approval recorded.
- EXPIRED: evidence no longer matches source/configuration/environment or review window.

Never turn BLOCKED or UNVERIFIED into PASS because a page renders, a config exists, a provider is connected or a workflow was created.

## 17. Initial system posture and approval

At document creation the platform is NOT CERTIFIED. Current audit evidence includes unresolved CI/G02 execution, Cloudflare Access route classification and active deployment provenance, Firebase Hosting publication scope, gateway cryptographic authentication, shared abuse controls, privacy remediation, provider verification, observability/restore evidence and independent acceptance. Re-test target environments before closure.

| Approval role | Required decision | Status |
|---|---|---|
| System/business owner | Scope, risk, budget, launch | Pending |
| Engineering owner | Architecture, source, build, release | Pending |
| Security reviewer | Threat model, identity, data, tests | Pending |
| Privacy/legal reviewer | Data use, promotions, payments, jurisdiction | Pending |
| Operations owner | SLO, alerts, backup, restore, incidents | Pending |
| Independent release approver | Evidence and go/no-go | Pending |

## Appendix A — Operational checklists

### Pre-merge
- [ ] Issue, owner, risk tier and acceptance criteria recorded.
- [ ] Scope isolated; no unrelated changes.
- [ ] Independent review complete.
- [ ] Required checks executed on exact PR head SHA.
- [ ] Security, privacy, dependency and secret scans reviewed.
- [ ] API/schema compatibility and migration plan reviewed.
- [ ] No secrets or sensitive records in diff/artifacts.

### Pre-production
- [ ] All G00–G11 gates have current evidence.
- [ ] Artifact digest matches approved source.
- [ ] Correct account/project/environment confirmed.
- [ ] Backup and restore verified.
- [ ] Rollback/forward recovery rehearsed.
- [ ] Alert delivery and on-call ownership tested.
- [ ] Legal, privacy and cost approvals obtained where applicable.
- [ ] Explicit scoped production approval recorded.

### Post-release
- [ ] External and authenticated smoke tests passed.
- [ ] Error/latency/availability within SLO.
- [ ] No unexpected auth, data, payment or privacy behavior.
- [ ] Deployment and evidence record complete.
- [ ] Watch window completed; follow-up actions assigned.
