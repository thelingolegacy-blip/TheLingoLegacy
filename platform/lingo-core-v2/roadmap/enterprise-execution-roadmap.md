# LINGO CORE V2 — Enterprise Execution Roadmap

**Program state:** ACTIVE / NON-PRODUCTION  
**Release state:** PROTECTED HOLD  
**Architecture PR:** #594 (draft)  
**Implementation PR:** #596 (draft)  
**Canonical source:** GitHub repository `thelingolegacy-blip/TheLingoLegacy`

## Mission and operating rules

Build an independently engineered, modular enterprise foundation that can connect the LINGO portfolio through governed identity, APIs, events, data contracts, service discovery, observability, and release control.

Run independent workstreams in parallel. Respect hard dependencies. A greenfield build does not authorize deletion, migration, production cutover, payment activation, or replacement of a last-known-good service.

### Non-negotiable controls

- GitHub is the source of truth; Cloudflare remains the intended production edge unless a reviewed architecture decision changes that.
- No production DNS, Cloudflare route, Firebase publication, production identity, payment, or customer-data mutation in this program without a separate approved change.
- No G02 self-hosted runner activation as a workaround for Actions startup failure.
- No merge of draft PRs, no branch-protection bypass, no production deployment, and no last-known-good replacement without evidence and separate release acceptance.
- No paid cloud provisioning or recurring commitment without explicit cost/account/region approval.
- Use synthetic data and isolated development resources until privacy, security, cost, and environment approvals exist.
- Label every capability NOT_STARTED, BUILT, CONNECTED, CERTIFIED, or PRODUCTION. Source files alone mean BUILT at most.

## Program architecture

1. **Experience layer:** Next.js/React/TypeScript web; Flutter iOS/Android clients.
2. **Service layer:** Go modular services and bounded-context APIs.
3. **Connectivity layer:** versioned REST contracts, event schemas, outbox/inbox, adapters, SDKs, service discovery.
4. **Identity and policy:** LINGO ID federation, OIDC, role/attribute authorization, tenant/product boundaries.
5. **Data layer:** PostgreSQL for transactional domains where suitable; object storage, cache, search, and event broker only when justified.
6. **Infrastructure layer:** portable IaC, isolated environments, edge integration, secrets, networking, backups.
7. **Control plane:** service registry, inventory, health, release status, audit, incident and cost views.
8. **Governance layer:** architecture decision records, security reviews, data classification, change/release acceptance.

AWS, Cloudflare, Firebase, and any other provider must have explicit non-overlapping responsibilities. The target is not a provider count; it is one coherent architecture with low operational complexity and reversible decisions.

## Critical dependency chain

A. Restore hosted GitHub Actions job startup  
→ B. Run deterministic source checks and tests  
→ C. Verify API + OIDC + PostgreSQL in isolated development  
→ D. Implement event delivery and client SDKs  
→ E. Integrate Control Plane and product adapters  
→ F. Run portfolio and migration rehearsals  
→ G. Complete security, resilience, operations and cost certification  
→ H. Obtain separate launch/release acceptance.

Parallel work may continue on architecture, contracts, UI prototypes, threat models, documentation, test fixtures, and migration inventory while A is blocked. Do not claim downstream integration is complete until its dependencies pass.

## Waves, phases and sprints

Sprint durations below are planning targets, not promises. Re-estimate from evidence and actual team capacity.

### Wave 0 — Stabilize execution and protect the baseline

**Phase 0.1 — CI recovery (P0)**
- Diagnose repository/org Actions policy, hosted runner capacity, billing/quota, concurrency, workflow configuration, and external service restrictions.
- Restore ordinary GitHub-hosted `ubuntu-latest` job creation.
- Keep protected G02 disabled; do not register duplicate runners.
- Require run → job → step → log → artifact → commit correlation.
- Record exact failure cause and remediation evidence.

**Sprint 0A:** inspect Actions and org/repo settings with read-only access; collect run/job evidence.  
**Sprint 0B:** apply only authorized CI configuration repair; execute a harmless hosted-runner smoke test.  
**Exit:** at least one hosted job is instantiated and completed with logs and commit correlation; then the CORE V2 workflow itself passes.

### Wave 1 — Architecture and engineering standards

**Phase 1.1 — Architecture baseline**
- Approve bounded contexts, service ownership, data classification, trust boundaries, and environment model.
- Write ADRs for cloud/edge responsibilities, data stores, event transport, identity, and deployment strategy.
- Define service naming, API versioning, event compatibility, error envelopes, correlation IDs, idempotency, and deprecation policy.
- Establish repo ownership, branch/review policy proposal, and release evidence template.

**Sprint 1A:** domain map, context map, service inventory, system context and threat boundaries.  
**Sprint 1B:** technology decision records, cost envelopes, deployment topology, standards and templates.  
**Exit:** architecture reviewed; no unresolved duplicate sources of truth or unowned critical services.

### Wave 2 — Core platform vertical slices

**Phase 2.1 — Identity and profile**
- Complete OIDC issuer/audience/signature/expiry/key-rotation tests.
- Define LINGO ID subject mapping and account lifecycle.
- Add authorization policy and cross-product isolation tests.
- Define account recovery and session/token refresh.

**Phase 2.2 — Transactional data**
- Verify schema migration, constraints, transaction rollback, backup and restore.
- Enforce least-privilege DB roles, TLS, connection limits, migration ownership and retention.
- Establish data classification and PII minimization.

**Phase 2.3 — Event foundation**
- Build outbox publisher, idempotent consumer, retry/backoff, dead-letter and replay.
- Define event envelope, schema registry/compatibility rules, delivery guarantees and audit.

**Sprint 2A:** API correctness, input boundaries, unit/fuzz tests.  
**Sprint 2B:** OIDC + PostgreSQL integration and migration tests.  
**Sprint 2C:** outbox publisher, consumer, duplicate/replay/failure tests.  
**Exit:** isolated end-to-end profile flow passes; events are durable and idempotently consumed.

### Wave 3 — Universal connectivity and client platforms

**Phase 3.1 — Integration gateway and SDKs**
- Publish OpenAPI and event contracts.
- Build typed TypeScript and Dart clients from versioned contracts.
- Standardize auth refresh, retry budgets, timeouts, error mapping, tracing and idempotency.
- Add adapter contracts for approved external systems.

**Phase 3.2 — Web**
- Build Next.js shell, sign-in/profile flows, API client, error handling and accessible component foundation.
- Verify browser tests against isolated API environment.

**Phase 3.3 — Mobile**
- Build Flutter app shell, secure token storage, API client, offline-safe retry, device builds and integration tests.
- Keep platform secrets out of source and artifacts.

**Sprint 3A:** API gateway/SDK and contract tests.  
**Sprint 3B:** web client and browser E2E.  
**Sprint 3C:** Flutter client and iOS/Android build verification.  
**Exit:** web and mobile clients authenticate and use the same versioned contracts in isolated environments.

### Wave 4 — Master Control Plane

**Phase 4.1 — Inventory and registry**
- Register repositories, services, environments, owners, contracts, dependencies, data classifications and lifecycle.
- Add schema validation and ownership checks.

**Phase 4.2 — Operations**
- Add health aggregation, deployment inventory, build evidence, incidents, audit and configuration status.
- Add cost/resource views and alerts without allowing unsafe mutations by default.

**Phase 4.3 — Governance**
- Add approval workflows for sensitive changes, release evidence, rollback records and exception expiry.
- Separate visibility from operational authority; avoid a control-plane single point of failure.

**Sprint 4A:** read-only registry and service inventory.  
**Sprint 4B:** observability, deployment and incident views.  
**Sprint 4C:** governed actions, audit and recovery workflows.  
**Exit:** Control Plane accurately reports service state and cannot silently bypass product/release boundaries.

### Wave 5 — LINGO portfolio integration

Onboard products in parallel only after shared identity/API/event standards are stable.

- LINGOlegacy — flagship identity, account, wallet shell and community boundaries.
- LINGOlane — design, promotions, apparel and laundry-cycle boundaries.
- LINGOslots — game services and virtual-currency policy boundaries.
- LINGOarcade — game sessions, progression and game-specific services.
- LINGOlibrary — content/catalog and learning experiences.
- LINGOmedia — media catalog, publishing and rights metadata.
- LINGOworld — shared utility/service products and integrations.
- LegacyXclub — membership, community and access boundaries.

For each product: owner, repository, service, contract, data owner, auth policy, health check, test suite, deployment lifecycle, cost owner, rollback and acceptance evidence.

**Sprint 5A:** flagship LINGOlegacy and shared identity integration.  
**Sprint 5B:** LINGOlane, LINGOlibrary and LINGOmedia adapters.  
**Sprint 5C:** LINGOslots and LINGOarcade adapters; enforce non-cash virtual-currency boundaries.  
**Sprint 5D:** LINGOworld and LegacyXclub adapters.  
**Exit:** every product is registered and its declared integrations pass contract tests; unintegrated products remain explicitly NOT_STARTED.

### Wave 6 — Migration and coexistence

- Inventory existing repositories, services, routes, data, integrations, deployment targets, owners and last-known-good versions.
- Classify each component: retain, wrap, migrate, replace, retire, or investigate.
- Define source-to-target mapping, data reconciliation, identity mapping, rollback and dual-run policy.
- Rehearse with synthetic/sanitized data first.
- Measure record counts, checksums, referential integrity, permissions, latency and functional parity.
- Migrate one bounded product slice at a time after explicit acceptance.

**Sprint 6A:** discovery and dependency map.  
**Sprint 6B:** migration tooling and rehearsal datasets.  
**Sprint 6C:** parallel-run, reconciliation and rollback drills.  
**Exit:** migration rehearsal meets signed data-integrity and rollback criteria; no production cutover implied.

### Wave 7 — Security, reliability and operational certification

- Independent threat model and architecture review.
- SAST, dependency scanning, secret scanning, SBOM and image/IaC scanning.
- Least privilege, TLS, key rotation, audit, PII redaction and retention.
- Rate limits, abuse protection, secure headers, request limits and incident playbooks.
- SLOs, SLIs, error budgets, capacity and load testing.
- Backup/restore, regional/provider failure scenarios, recovery-time and recovery-point objectives.
- Cost forecasts, budget alerts, resource TTL and teardown controls.

**Sprint 7A:** security hardening and independent review.  
**Sprint 7B:** load, resilience, backup/restore and disaster-recovery exercises.  
**Sprint 7C:** cost review, operational readiness and evidence closure.  
**Exit:** all critical findings closed or explicitly risk-accepted by an authorized owner; SLO and recovery evidence approved.

### Wave 8 — Launch readiness and controlled release

- Freeze candidate source and dependency versions.
- Verify all required checks, artifacts, SBOM, provenance, approvals and migration evidence.
- Validate runbooks, support ownership, on-call/incident escalation and rollback.
- Confirm privacy, legal, payment and product-specific acceptance where applicable.
- Run release rehearsal and post-deploy verification plan.
- Obtain explicit production release acceptance separate from engineering implementation.

**Sprint 8A:** release-candidate and full acceptance rehearsal.  
**Sprint 8B:** final go/no-go review and approved bounded release only.  
**Exit:** signed acceptance, deployment evidence, post-deploy health and tested rollback. Otherwise remain HOLD.

## Parallel workstream lanes

| Lane | Can proceed now | Hard dependency |
|---|---|---|
| Architecture / ADRs | Yes | Review |
| CI recovery | Yes, P0 | GitHub hosted job startup |
| API correctness / test fixtures | Yes | Hosted CI for evidence |
| Identity integration | Design and test harness | Isolated issuer configuration |
| Data model / migration | Design and local fixtures | Disposable DB |
| Event platform | Contracts and local harness | Verified database/API |
| Web / Flutter | Contract-first scaffolding | Stable API/identity contracts |
| Control Plane | Registry and read-only prototype | Stable registry schema |
| Portfolio onboarding | Inventory and mapping | Shared contracts |
| Security / SRE | Threat model and controls | Implemented vertical slices |
| Migration | Inventory and rehearsal plan | Target platform certification |
| Launch | Readiness criteria only | All prior exit gates |

## Definition of done

A work item is not complete merely because code or documents exist.

- **DESIGNED:** approved design and decision record.
- **BUILT:** implementation exists and is reviewable.
- **TESTED:** test jobs ran and passed with logs and commit correlation.
- **CONNECTED:** real non-production systems exchanged verified data through documented contracts.
- **CERTIFIED:** security, resilience, operations, data and acceptance evidence passed review.
- **PRODUCTION:** separate release approval, controlled deployment and post-deploy verification.

Each claim must link to source, commit, workflow run, job, logs, artifact, test evidence and reviewer where applicable.

## Current blockers and immediate sequence

1. P0: Actions startup failure. Existing recovery issue #575 remains authoritative; do not duplicate or work around with G02.
2. PR #594 architecture review and PR #596 implementation review remain open and draft.
3. PR #596 has no successful code-test run; the latest six attempts ended in startup_failure before jobs were created.
4. Verify local build/test independently only if a reproducible environment is available; do not label it hosted CI.
5. Do not provision cloud infrastructure until cost, account, region, security and ownership approvals are explicit.

## Program completion criteria

LINGO CORE V2 is ready for a launch decision only when all eight waves have evidence-backed exit acceptance, every portfolio service has a named owner and integration status, migration and rollback have been rehearsed, security and reliability findings are closed or formally accepted, costs are approved, and the release authority has separately approved the target environment.

**Build the foundation. Connect the ecosystem. Verify every connection. Protect the legacy.**
