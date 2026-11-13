# LINGO Enterprise Control System (LECS)
## Enterprise architecture, governance and operating standard
**Status:** Proposed architecture baseline — review required  
**Effective date:** 2026-11-13  
**Authority:** LINGOlegacy_MASTER governance; GitHub canonical source of truth  
**Production disposition:** PROTECTED HOLD until every applicable release gate is evidenced and accepted

## 1. Purpose and governing principles

LECS is the common control plane for all LINGO products, services, AI systems, data assets, applications, infrastructure and production releases. It defines how work is authorized, built, secured, measured, operated and retired. It is a governance and architecture standard, not a claim that every described service has already been implemented.

Principles:
1. One canonical owner and source of truth per asset; GitHub is the engineering record.
2. Least privilege, deny by default, separation of duties and explicit authorization.
3. Evidence before status: planned, implemented, tested, deployed and accepted are different states.
4. No silent production changes, hidden spending, credential exposure or destructive cleanup.
5. Model/provider portability through adapters; no provider receives blanket trust.
6. Data provenance, purpose limitation, quality and retention are first-class requirements.
7. Security controls cannot be overridden by a product, model, agent, administrator convenience or emergency flag.
8. Free-tier-first and cost-aware operation, without weakening security or reliability.
9. Fail safely, preserve last-known-good, and make rollback rehearsable.
10. Every requirement, control, test, owner and release decision is traceable.

## 2. Enterprise system map

`LINGOlegacy_MASTER` owns governance, policy, architecture, security, brand standards, product registry, release authority and enterprise evidence.

Product and platform domains remain independently deployable:
- `LINGOlegacy`: identity, account, wallet and community foundations.
- `LINGOlane`: Loyalty Lane designs, promotions, apparel and laundry-cycle experiences.
- `LINGOslots`: That’s My Lingo, Spades Is My Lingo, Uhno Lingo U-No, Lingo Lions Eruptions and Cashman Lingo Mania.
- `LINGOarcade`: Doughboys Oasis and other arcade/game experiences.
- `LINGOlibrary`: Kotton’s Code and other publishing/catalog properties.
- `LINGOmedia`: Rise of Zavione and media properties.
- `LINGOworld`: LINGOai, askLINGO, LINGOboom, LINGOtravel, LINGOcampus, LINGOsupport, LINGOwifi, LINGOvoice, LINGOshield, LINGOlounge and LINGOdonations.
- `LegacyXclub`: membership/community experiences.

Shared platform capabilities are centrally governed but separately permissioned: identity and access, model gateway, MCP tool gateway, retrieval/data services, observability, billing/cost allocation, deployment pipelines, secrets, policy-as-code and release evidence.

Do not merge product repositories simply to achieve central governance. Federate implementation while standardizing contracts, identity, telemetry, policy and release evidence.

## 3. Control-plane components

| Component | Responsibility | Required interface / evidence |
|---|---|---|
| Policy & requirements registry | Requirements, owners, risk, exceptions and control mapping | Versioned requirements with IDs and approval history |
| Identity & access plane | Human, service, agent and workload identities | SSO/OIDC where available, MFA for privileged actions, short-lived credentials, scoped roles |
| Security policy engine | Authorization, data classification, tool and network policy | Default-deny decisions, policy version and decision logs |
| Override / break-glass broker | Time-limited emergency exception workflow | Incident ID, two-person approval, scope, expiry, reason and audit receipt |
| LLM gateway | Provider adapters, routing, quotas, safety and model evaluation | Model/version, policy, latency, token and cost telemetry |
| MCP gateway | Tool discovery, authentication, authorization and invocation | Registered server/tool, schema, scopes, approval and execution audit |
| RAG & data plane | Ingestion, catalog, lineage, retrieval, quality and deletion | Dataset/document ID, provenance, ACL, freshness and retention |
| Training & evaluation plane | Dataset governance, fine-tuning, evaluation and model registry | Consent/licence, dataset manifest, run lineage, evaluation and approval |
| Compute & cloud plane | Runtime, networking, storage, queues and deployment | IaC, environment boundaries, quotas, health and cost tags |
| Observability plane | Logs, metrics, traces, security events and SLOs | Correlated trace/request IDs, redaction, retention and alert ownership |
| Release control plane | Build, test, security, data/model, cost, deployment and rollback gates | Signed/immutable evidence bundle and named acceptance |

## 4. Override and emergency-control system

### 4.1 No universal bypass
There is no root override that disables authentication, authorization, encryption, tenant isolation, data-use restrictions, legal obligations, safety policy, audit logging or required release evidence. An override may change a narrowly scoped operational setting only when the governing policy explicitly permits it.

### 4.2 Override classes
- **Operational exception:** bounded temporary adjustment to a non-security operational threshold, with owner and expiry.
- **Release exception:** acceptance of a documented non-critical deviation; cannot waive a critical gate, unresolved critical vulnerability, failed data integrity check or absent rollback.
- **Incident break-glass:** emergency access to restore service or contain harm. It is not a shortcut for feature delivery, convenience or release promotion.
- **Policy change:** normal reviewed change to the control itself; never disguised as an emergency override.

### 4.3 Mandatory controls
1. Authenticate the requesting human and workload; require MFA for privileged human access.
2. Require an incident/ticket ID, concrete reason, affected assets, data classes and requested action.
3. Require two-person approval: requester plus an independent authorized approver. A requester cannot approve their own exception.
4. Bind approval to exact resource, operation, environment, policy version and maximum duration.
5. Default maximum break-glass grant: 30 minutes; extensions require fresh approval. Shorter is preferred.
6. Deny wildcard scope, privilege escalation, disabling audit, credential export and blanket access.
7. Log request, approval, policy decision, every action, result and revocation to a protected append-only audit destination.
8. Automatically expire and revoke; verify revocation.
9. Run post-incident review within one business day and attach remediation tasks.
10. Any uncertainty, unavailable audit sink or missing approver means deny.

### 4.4 Non-overridable invariants
- No unauthenticated privileged action.
- No cross-tenant access without an explicit, tested authorization rule.
- No plaintext secret in source, logs, prompts, RAG indexes or client bundles.
- No model/agent can grant itself permissions or approve its own tool call.
- No unreviewed production deployment, payment activation or irreversible data migration.
- No bypass of data consent, licence, retention, deletion or privacy constraints.
- No suppression of security alerts or audit evidence to achieve a green status.

## 5. Security system

### 5.1 Identity and trust
Use unique identities for people, services, workloads and agents. Apply least privilege, short-lived tokens, audience-bound credentials, MFA for privileged accounts, periodic access review and immediate revocation on role change or incident. Do not share human credentials with automation.

### 5.2 Secure development lifecycle
- Threat model at design time; identify assets, trust boundaries, abuse cases and mitigations.
- Protect branches and require independent review for privileged or production-sensitive changes.
- Run secret scanning, dependency/SBOM and licence checks, static analysis, infrastructure policy checks and container/image scanning where applicable.
- Pin dependencies and actions to reviewed immutable versions where practical.
- Produce provenance for builds and artifacts; sign release artifacts when supported.
- Separate development, staging and production credentials, networks, data and service accounts.
- Treat all external content, retrieved documents, model output and tool responses as untrusted input.

### 5.3 Application and API security
Require server-side authorization on every protected operation, schema validation, safe output encoding, CSRF protection where applicable, rate limits, abuse controls, secure session handling, idempotency for financial or destructive actions, and explicit tenant scoping. Client-side hiding is not authorization.

### 5.4 Data and privacy
Classify data (Public, Internal, Confidential, Restricted). Minimize collection, define purpose and lawful basis, encrypt in transit and at rest, redact telemetry, set retention/deletion schedules, and record access. Production personal data must not be copied into development or model training without approved safeguards and purpose authorization.

### 5.5 AI-specific threat controls
Defend against prompt injection, indirect prompt injection, data exfiltration, tool misuse, insecure output handling, model denial-of-service, supply-chain compromise and retrieval poisoning. Treat retrieved text as evidence, never as executable policy. Separate system policy from user and retrieved content. Apply input/output screening and human confirmation for consequential actions.

## 6. LLM platform and model governance

### 6.1 Provider-neutral architecture
All model traffic flows through an LLG-owned gateway and provider adapters. Candidate providers include OpenAI, Anthropic, Google and xAI, but integration is not implied until credentials, legal terms, network access, evaluations and cost controls are verified.

Gateway functions:
- Model registry: provider, model ID, version, capabilities, context limit, data handling, region, deprecation and evaluation status.
- Routing: task class, quality tier, latency objective, data classification, region and budget.
- Policy: approved prompt templates, safety controls, tool permissions and data redaction.
- Resilience: bounded retries, timeout, circuit breaker, fallback only to an approved model with compatible data policy.
- Observability: request ID, model/version, latency, token counts, cost estimate/actual, refusal/error, evaluation cohort and user feedback; do not log raw sensitive prompts by default.
- Quotas: per-user, product, tenant, provider and environment budgets.

### 6.2 Model selection and evaluation
Evaluate each candidate on task quality, factuality, groundedness, instruction following, tool-call correctness, safety, privacy, bias/fairness where relevant, latency, availability and total cost. Use representative, licensed and privacy-reviewed test sets. Record model and prompt versions. Re-evaluate after provider/model/prompt/retrieval/tool changes.

### 6.3 Routing tiers
- Small/low-cost: classification, extraction and simple transformations when evaluation supports it.
- General: ordinary assistant and product workflows.
- High-capability: complex reasoning or high-value tasks where quality gains justify cost.
- Specialized: embeddings, reranking, speech, vision or code models with explicit evaluation.
Never route Restricted data to a provider without an approved contractual and technical data-handling path.

### 6.4 Agent boundaries
Agents receive only the tools and scopes needed for one task. Separate read and write tools. Require confirmation for money movement, public publishing, account/security changes, deletion, production deploys and other consequential actions. Enforce step limits, timeouts, budgets, idempotency and a kill switch that stops execution without erasing audit evidence.

## 7. MCP (Model Context Protocol) control plane

Every MCP server is registered before use:
- owner, purpose, repository/vendor, environment and support contact;
- server identity, transport, endpoint, version and deployment provenance;
- tool/resource/prompt inventory and JSON schema;
- scopes, data classes, read/write/destructive classification;
- authentication method, credential rotation and network allowlist;
- rate limits, timeout, payload limits, logging and retention;
- threat model, test evidence, approval state and review date.

Controls:
1. Only allowlisted servers and tools may be discovered by production agents.
2. Authenticate server-to-gateway and gateway-to-server; use scoped, short-lived credentials.
3. Validate tool schemas and arguments before invocation; validate results before use.
4. Treat tool output as untrusted data; prevent it from changing system instructions or permissions.
5. Default tools to read-only. Write, destructive, financial and public-facing tools require separate scopes and policy checks.
6. Require explicit human approval for high-impact actions and provide a clear action preview.
7. Apply per-tool quotas, timeouts, concurrency limits and circuit breakers.
8. Record caller, agent, user, tool, server version, arguments (redacted), approval, result and trace ID.
9. Revoke a server immediately on compromise, schema drift or policy violation.
10. No MCP server may supply its own authorization decision as the sole authority.

## 8. RAG + Data architecture

### 8.1 Pipeline
Sources → source identity/permissions → ingestion queue → malware/content checks → parsing/OCR → classification/PII handling → canonical metadata → chunking → embeddings → vector + keyword index → ACL-aware retrieval → reranking → grounded context assembly → answer/tool policy → citations/provenance → feedback and quality evaluation.

### 8.2 Data contracts
Every source has an owner, system of record, purpose, classification, schema, grain, primary key, freshness expectation, lineage, retention, deletion behavior and access policy. Every index item retains source ID, version, location, ACL, ingestion timestamp, parser/chunker/embedding version and deletion marker.

### 8.3 Retrieval security
- Apply source ACLs before retrieval, not after generation.
- Enforce tenant and user permissions at query time; test for cross-tenant leakage.
- Preserve citations to source fragments and document versions.
- Detect stale, duplicate, poisoned, malformed and revoked sources.
- Exclude restricted or expired material; propagate deletion to raw stores, caches, embeddings and indexes.
- Use hybrid lexical/vector retrieval and reranking only where evaluation demonstrates benefit.
- Do not treat retrieval similarity as factual truth or authorization.

### 8.4 @Data integration
Data is the governed analytics and measurement layer for LECS:
- canonical metric definitions and semantic layer;
- source freshness, grain, completeness, uniqueness and lineage checks;
- KPI scorecards for quality, adoption, reliability, model quality, cost and release health;
- evidence-backed operational reports and decision dashboards;
- data-quality tests and alerts with owners and remediation links.

Analytics results are read-only evidence unless a separately authorized workflow explicitly permits a write. Metrics must carry definition, source, period, unit, denominator, exclusions and freshness. Never infer missing values as zero.

## 9. Training, fine-tuning and evaluation

Separate inference, evaluation and training environments. Training is opt-in and purpose-bound:
- Confirm rights, consent, licence, lawful purpose and contractual restrictions for every dataset.
- Maintain immutable dataset manifests, provenance, inclusion/exclusion rules, preprocessing code and version hashes.
- Minimize and de-identify personal data; exclude secrets and restricted records.
- Split train/validation/test by entity/time to prevent leakage; keep a protected holdout set.
- Document model base version, hyperparameters, compute, random seeds, run owner and artifact hashes.
- Evaluate capability, regression, memorization/privacy leakage, safety, robustness and bias.
- Require model card, dataset card, approval and rollback/deprecation plan before registry promotion.
- Support deletion/unlearning obligations where technically and contractually applicable; do not promise that deleting source data automatically removes model influence.
- No user conversations, production records or connected-account data are used for training by default.

## 10. Compute and cloud architecture

### 10.1 Environment separation
Separate local development, CI, preview, staging and production. Use isolated identities, secrets, data stores and network policies. Production data and credentials must not flow into preview by default.

### 10.2 Infrastructure as code
Declare cloud resources, permissions, network boundaries, retention, encryption, budgets and scaling policies in versioned IaC. Require plan review and policy checks before apply. Detect drift; changes made outside IaC must be reconciled, not silently overwritten.

### 10.3 Runtime patterns
Use stateless services where practical; managed queues for asynchronous work; durable storage for authoritative state; caches only for reconstructible data; backups with tested restoration; health/readiness probes; bounded autoscaling; graceful shutdown; and region-aware recovery plans.

### 10.4 Provider roles
- GitHub: source, change review, CI/CD orchestration and evidence record.
- Cloudflare: authoritative DNS/edge and protected Worker/API routes, subject to verified configuration.
- Firebase: identity/data services where project, rules, indexes, backup and environment configuration are verified.
- Flutter: cross-platform mobile client.
- React/Next: web applications and portals where selected.
- Unity: game runtime where selected per product.
Provider names are architectural intent, not evidence of a live or correctly configured integration.

## 11. Cost governance

Every workload has an owner, environment, product tag, budget, quota, unit-cost metric and shutdown policy.

Required controls:
- budget alerts at 50%, 75%, 90% and 100%;
- hard caps for discretionary model inference, build minutes, storage growth and non-production compute where supported;
- no paid resource creation without explicit approval and a cost estimate;
- free-tier-first selection with documented exit criteria;
- token, embedding, storage, egress, compute, CI and observability cost attribution;
- caching and batching where quality and privacy allow;
- TTL and lifecycle policies for temporary environments and artifacts;
- monthly cost-to-value review and anomaly alerts.

Cost controls must not silently disable security, backup, audit or essential availability safeguards. At budget cap, degrade non-critical workloads safely and notify the owner.

## 12. Performance and reliability engineering

Define service-level indicators (SLIs), service-level objectives (SLOs), error budgets and operational owners for each production service.

Initial proposed targets (not measured baselines; ratify after load tests):
- API availability: 99.9% monthly for designated critical services.
- Standard interactive API latency: p95 ≤ 500 ms, excluding model-provider generation and explicitly documented long-running operations.
- Gateway overhead: p95 ≤ 100 ms excluding upstream provider latency.
- Retrieval latency: p95 ≤ 1.0 s for the agreed corpus and load profile.
- Critical security-event alerting: ≤ 5 minutes from detection where telemetry supports it.
- Recovery objectives (RTO/RPO): set per data class and service tier; test restore evidence before production.

Measure p50/p95/p99, throughput, saturation, error rate, queue age, cache hit rate, cold start, token throughput, retrieval recall/precision, model quality and cost per successful task. Run load, soak, spike, failure-injection and recovery tests. Do not publish an SLO as achieved until measured.

## 13. Production operations

Production requires:
- named service owner and on-call/incident path;
- approved architecture and threat model;
- secure build and artifact provenance;
- passing automated and manual tests;
- validated configuration and secret references;
- dashboards, logs, traces, alerts and runbooks;
- backups and a demonstrated restore;
- capacity and cost budgets;
- staged rollout, health checks and rollback;
- user support, privacy, retention and incident response;
- signed release acceptance and post-release observation.

Use progressive delivery (preview/canary/limited cohort/production) where supported. Stop rollout automatically on breached critical health, security or cost guardrails. Preserve last-known-good and avoid destructive migrations without tested rollback or forward-fix strategy.

## 14. Operating roles and separation of duties

Roles are logical; assign actual people/teams in the repository before production:
- Product Owner: product intent, acceptance criteria and user impact.
- Architecture Owner: design coherence, interfaces and standards.
- Security Owner: threat model, security controls and risk acceptance.
- Data Owner/Steward: source authority, quality, purpose and retention.
- AI/Model Owner: provider/model evaluation, prompt/agent safety and model lifecycle.
- Platform/SRE Owner: compute, cloud, reliability, cost and incident response.
- Release Manager: evidence completeness, rollout and rollback coordination.
- Independent Approver: acceptance of high-risk exceptions and production release.

One person may hold multiple non-conflicting roles in a small team, but may not self-approve their own privileged exception or sole-owner production release.

## 15. Evidence and lifecycle states

Use these explicit states in dashboards and release records:
- PROPOSED: design or requirement exists.
- IMPLEMENTED: code/config exists in a reviewed branch.
- TESTED: named tests ran and results are retained.
- VERIFIED: independent evidence confirms expected behavior in the target environment.
- DEPLOYED: deployment record confirms target and artifact.
- ACCEPTED: authorized owner accepts operational and business readiness.

Never infer a later state from an earlier one. A source file, green local test, PR mergeability, deployment intent or permission grant is not proof of production readiness.

## 16. Rollout plan

**Wave 0 — Governance and inventory:** approve LECS owner, classify assets, map authoritative repositories, identify existing controls, freeze destructive cleanup.

**Wave 1 — CI and release evidence:** restore GitHub Actions job creation; verify runner identity and jobs; establish artifact/test evidence; preserve G02 protected hold until its acceptance criteria pass.

**Wave 2 — Identity and security:** inventory secrets and identities; implement least privilege, environment separation, audit and Cloudflare Access for internal control surfaces.

**Wave 3 — LLM/MCP:** build provider-neutral gateway and MCP registry, scopes, approval, policy and evaluation harness.

**Wave 4 — RAG and @Data:** implement data contracts, ACL-aware retrieval, lineage, quality checks, semantic metrics and scorecards.

**Wave 5 — Compute/cost/performance:** codify infrastructure, quotas, budgets, SLOs, load tests, backup and recovery.

**Wave 6 — Production qualification:** complete product-specific gates, staged release, operational acceptance and rollback rehearsal.

Parallel work is allowed when workstreams have independent owners and interfaces. Shared contracts, secrets, production environments and canonical files require coordinated changes.

## 17. Non-goals and explicit limitations

This charter does not create cloud resources, accounts, credentials, model subscriptions, training jobs, MCP servers, data indexes, budgets, dashboards or production deployments. It does not certify any provider integration or measured SLO. Those require implementation, account access, source evidence, security review and applicable approval.

The first implementation must begin with a read-only inventory and policy checks. Do not create paid compute, send data to a model provider, ingest private data, run training, expose control-plane routes or deploy production components until their individual requirements and gates are met.
