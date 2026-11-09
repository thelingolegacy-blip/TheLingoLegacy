# The Lingo Legacy — Production Control Matrix

**Status:** Proposed control artifact. It is not a test report, certification, or authorization to change production.
**Companion:** Production certification standard and operations procedures.

## 1. Purpose and control model

This matrix converts certification gates into an execution ledger. Each control must point to an immutable source revision, named environment, evidence artifact, accountable owner, independent reviewer, and expiry/retest condition. A control cannot be marked PASS from source-code presence, a provider connection, a UI indicator, or an uninstantiated workflow.

Statuses:
- **PASS** — required test ran against the named target and current evidence is attached.
- **FAIL** — test ran and did not meet acceptance criteria.
- **BLOCKED** — required access, dependency, runner, approval, or environment is unavailable.
- **UNVERIFIED** — no reliable evidence exists.
- **EXPIRED** — evidence no longer matches target revision, configuration, or review window.
- **N/A** — reason and independent reviewer are recorded.

Initial state for controls below is **UNVERIFIED** unless dated evidence proves otherwise. Known blockers are separately called out; this document does not convert them into passes.

## 2. Accountability and separation of duties

| Role | Accountable decisions | Cannot self-certify |
|---|---|---|
| Business/system owner | Product scope, risk appetite, budget ceiling, launch intent | Security, privacy/legal, independent release acceptance |
| Engineering owner | Architecture, implementation, source integrity, build and rollback | Their own independent review of high-risk changes |
| Service owner | Runtime contract, SLO, runbook, dependency and data ownership | Provider state not directly inspected |
| Security reviewer | Threat model, identity, vulnerability and security-test acceptance | Legal interpretation or business budget |
| Privacy/legal reviewer | Data purpose, consent, retention, promotions, payments and jurisdiction | Technical runtime correctness |
| Operations/reliability owner | Monitoring, alert delivery, backup/restore, incident readiness | Business/legal launch approval |
| Independent release approver | Evidence completeness and scoped GO/NO-GO | Waiving legal obligations or undocumented risks |

For a small team, one person may hold multiple operational roles, but the independent reviewer must be a distinct review step and must not approve their own high-risk implementation.

## 3. Control execution matrix

| ID | Control / acceptance test | Required evidence | Default status |
|---|---|---|---|
| G00 | Canonical source, ownership and service inventory | Repository, default branch, service registry, owners, dependency graph, exact commit | UNVERIFIED |
| G01 | Architecture and contracts | Context/container/data-flow diagrams, versioned API schemas, compatibility tests | UNVERIFIED |
| G02 | Reproducible build and CI | Successful jobs on exact PR SHA, pinned toolchains, lockfiles, test reports | BLOCKED pending job-instantiation recovery |
| G03 | Supply-chain integrity | Secret scan, SAST, dependency and container scans, SBOM, artifact digest and provenance | UNVERIFIED |
| G04 | Identity and authorization | Verified issuer/audience/signature/expiry, role matrix, cross-user and privileged-route tests | BLOCKED pending verifier and target-project acceptance |
| G05 | Data protection and privacy | Classification, data-flow inventory, rules tests, retention/deletion, public-bundle review | BLOCKED pending privacy remediation and Firebase scope/rules verification |
| G06 | Infrastructure and edge | Active deployment IDs, route/binding/asset manifest, Access policy and TLS/header probes | BLOCKED pending Cloudflare active-state evidence |
| G07 | API and abuse resistance | Endpoint inventory, schema/size limits, shared rate-limit tests, idempotency and abuse telemetry | UNVERIFIED; isolate-local controls are not global enforcement |
| G08 | Product/game integrity and monetization | Server-authoritative state, deterministic tests, wallet ledger invariants, payment test evidence, legal approval | BLOCKED; paid/redeemable features remain disabled |
| G09 | Client and mobile release | Browser/device/accessibility/performance tests, signed reproducible mobile artifact, store/privacy review | UNVERIFIED |
| G10 | Operations and resilience | SLO dashboards, tested alert delivery, backup restore, DR and rollback exercise, incident roster | UNVERIFIED |
| G11 | Independent release acceptance | Complete evidence pack, risk/exception register, scoped approvals, exact artifact/environment/deployment mapping | BLOCKED until G00–G10 pass |

## 4. Mandatory service registry fields

Every deployable surface or backend service must have:
- Stable service ID, display name, business capability, accountable owner and backup owner.
- Repository/path, source-of-truth branch, build workflow, artifact type and immutable artifact digest.
- Environment, provider account/project ID, region, hostname, route, runtime version and deployment ID.
- API/event contracts, upstream/downstream dependencies, data stores and data classifications.
- Authentication issuer/audience, authorization policy, service identities and secret references (never secret values).
- SLO/SLI, dashboards, alert rules, alert destination, runbook and escalation owner.
- Backup scope, restore objective, recovery point/time objectives, tested restore date.
- Cost owner, budget ceiling, quota/usage alerts, kill switch and vendor/subprocessor details.
- Last verification timestamp, evidence links, status, reviewer and next expiry/retest date.

Unknown fields remain explicitly UNKNOWN; do not fill them with inferred values.

## 5. Environment promotion contract

| Environment | Permitted purpose | Data | Promotion rule |
|---|---|---|---|
| Development | Local feature work | Synthetic or approved test data | No production secrets |
| Test/CI | Deterministic automated checks | Synthetic fixtures | Ephemeral credentials and isolated resources |
| Staging | End-to-end rehearsal | Synthetic or irreversibly anonymized data | Match production topology where practical |
| Production | Customer-facing operation | Approved live data | Exact artifact, approvals, rollback and release evidence required |

Promotion is one-way through reviewed artifacts: source revision → CI artifact → staging acceptance → scoped production approval. Rebuilds must be traceable; do not silently rebuild different bits during promotion.

## 6. Service-level objectives and launch thresholds

Each service owner must propose and approve service-specific SLOs before launch. Do not invent a single platform-wide availability promise. At minimum define:
- Availability and successful critical-journey rate.
- API latency percentiles and error rate.
- Authentication success/failure and token-verification health.
- Queue/job age and processing completion where asynchronous work exists.
- Data integrity/reconciliation failures for wallets, rewards, orders and entitlements.
- Client crash-free sessions and key web performance measures.
- Alert delivery time, backup completion, restore success and recovery objectives.

Every SLO must state measurement query, environment, window, exclusions, owner, alert threshold and error-budget response. A dashboard without verified telemetry and alert delivery is not acceptance evidence.

## 7. Evidence record schema

Create one record per control/test with these fields:

| Field | Required value |
|---|---|
| Evidence ID | Stable unique identifier |
| Control ID | G00–G11 plus sub-control |
| Result | PASS / FAIL / BLOCKED / UNVERIFIED / EXPIRED / N/A |
| Target | Exact environment, provider project and service ID |
| Source | Repository, branch and full commit SHA |
| Artifact | Digest, build/run ID and immutable artifact reference |
| Test | Command or procedure, version and test scope |
| Result detail | Counts, outcome, relevant sanitized log excerpt |
| Time | UTC start and completion timestamps |
| Operator | Person/service identity that executed it |
| Reviewer | Independent reviewer and decision |
| Validity | Expiry or event that invalidates the evidence |
| Follow-up | Issue URL, owner, due date and rollback/containment |

Never include credentials, tokens, private customer data, or sensitive personal details in the evidence record.

## 8. Risk and exception rules

- P0/P1 security, privacy, data-integrity, payment or critical availability findings block release.
- Unknown production target, identity issuer, data store, route ownership or artifact provenance blocks release.
- Missing job records, skipped required jobs, stale checks, or workflow startup failure block release.
- Exceptions must include control ID, scope, rationale, impact, compensating controls, accountable owner, independent approver, expiry and remediation issue.
- No exception can waive law, consent, privacy rights, payment obligations, or the requirement to contain a confirmed security incident.
- Expired evidence is retested; it is not renewed by copying the previous result.

## 9. Current known execution queue

1. **CI/G02:** obtain GitHub Actions startup diagnostics and recover job instantiation without weakening checks; then run the required matrix against exact SHAs.
2. **Cloudflare:** obtain authorized read-only active Worker/deployment/asset/route/binding and Access-policy evidence; map every production hostname and route to its owner and artifact.
3. **Firebase:** establish intended project/environment and actual web build output; inspect publication scope and rules before any config edit or deploy.
4. **Identity/API:** select and verify authoritative issuer/audience per environment; implement cryptographic validation only after project and token contract are proven; test anonymous, user, cross-user and operator boundaries.
5. **Privacy:** privately inspect affected public assets/source and remove or replace sensitive data through reviewed remediation; do not reproduce sensitive content in public issues.
6. **Abuse controls:** inventory every public endpoint; define consistent distributed limits, idempotency, replay handling and observability; test from multiple isolates/regions.
7. **Operations:** provision approved telemetry, verify alert delivery, execute backup/restore and rollback drills, and record SLO baselines.
8. **Independent acceptance:** complete the evidence pack and secure distinct engineering, security, privacy/legal, operations and release decisions.

No production mutation is authorized by this queue. Provider changes, migrations, secret rotation, paid services, deployment and feature activation require a separate scoped change record and explicit approval.

## 10. Certification decision record

**Decision:** NOT CERTIFIED  
**Scope:** The Lingo Legacy ecosystem; exact service/environment scope must be enumerated before any later certification.  
**Basis:** Mandatory evidence gates are not all proven.  
**Approver:** Pending independent assignment.  
**Decision timestamp:** Pending.  
**Approved source/artifact/deployment:** Pending.  
**Exceptions:** None approved by this document.  
**Next review:** After blocking evidence is available and the exact target is revalidated.
