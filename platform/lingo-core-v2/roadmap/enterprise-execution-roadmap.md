# LINGO CORE V2 — Enterprise Execution Roadmap

**Program state:** ACTIVE / NON-PRODUCTION  
**Release state:** PROTECTED HOLD  
**Architecture PR:** #594 (draft)  
**Implementation PR:** #596 (draft)  
**Master tracker:** #597  
**Canonical source:** `thelingolegacy-blip/TheLingoLegacy`

## Workstream issue map
- Wave 0 / P0 CI recovery: #575 (existing authoritative recovery issue)
- Wave 2 — API, OIDC, PostgreSQL, events: #598
- Wave 3 — contracts, web and Flutter: #599
- Waves 4–5 — Control Plane and portfolio onboarding: #600
- Waves 6–8 — migration, security/SRE and launch readiness: #601

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
1. **Experience:** Next.js/React/TypeScript web; Flutter iOS/Android.
2. **Service:** Go modular services and bounded-context APIs.
3. **Connectivity:** versioned REST contracts, event schemas, outbox/inbox, adapters, SDKs, service discovery.
4. **Identity and policy:** LINGO ID federation, OIDC, role/attribute authorization, tenant/product boundaries.
5. **Data:** PostgreSQL for transactional domains where suitable; object storage, cache, search, and event broker only when justified.
6. **Infrastructure:** portable IaC, isolated environments, edge integration, secrets, networking, backups.
7. **Control Plane:** service registry, inventory, health, release status, audit, incident and cost views.
8. **Governance:** architecture decision records, security reviews, data classification, change/release acceptance.

AWS, Cloudflare, Firebase, and other providers must have explicit non-overlapping responsibilities. Select one coherent architecture with low operational complexity and reversible decisions.

## Critical dependency chain
A. Restore hosted GitHub Actions job startup  
→ B. Run deterministic source checks and tests  
→ C. Verify API + OIDC + PostgreSQL in isolated development  
→ D. Implement event delivery and client SDKs  
→ E. Integrate Control Plane and product adapters  
→ F. Run portfolio and migration rehearsals  
→ G. Complete security, resilience, operations and cost certification  
→ H. Obtain separate launch/release acceptance.

Parallel work may continue on architecture, contracts, UI prototypes, threat models, test fixtures, and migration inventory while A is blocked. Do not claim downstream integration is complete until its dependencies pass.

## Waves, phases and sprints

### Wave 0 — Stabilize execution and protect the baseline (P0)
**Phase 0.1 — CI recovery**
- Diagnose repository/org Actions policy, hosted runner capacity, billing/quota, concurrency, workflow configuration, and external service restrictions.
- Restore ordinary GitHub-hosted `ubuntu-latest` job creation.
- Keep protected G02 disabled; do not register duplicate runners.
- Require run → job → step → log → artifact → commit correlation.
- Record exact failure cause and remediation evidence.

**Sprint 0A:** read-only inspection of Actions/org/repo settings and run/job evidence.  
**Sprint 0B:** authorized CI configuration repair; harmless hosted-runner smoke test.  
**Exit:** at least one hosted job is instantiated and completed with logs and commit correlation; then the CORE V2 workflow itself passes.

### Wave 1 — Architecture and engineering standards
**Phase 1.1:** approve bounded contexts, service ownership, data classification, trust boundaries and environment model; write ADRs for cloud/edge responsibilities, data stores, event transport, identity and deployment; define API/event compatibility, error envelopes, correlation IDs, idempotency and deprecation.
**Sprint 1A:** domain/context maps, service inventory and trust boundaries.  
**Sprint 1B:** technology ADRs, cost envelopes, deployment topology, standards and templates.  
**Exit:** architecture reviewed; no unowned critical service or competing source of truth.

### Wave 2 — Core platform vertical slices
**Phase 2.1 Identity:** OIDC issuer/audience/signature/expiry/key-rotation tests, LINGO ID mapping, authorization, product isolation, recovery/session policy.  
**Phase 2.2 Data:** migration, constraints, rollback, backup/restore, least-privilege roles, TLS, connection limits, retention.  
**Phase 2.3 Events:** outbox publisher, idempotent consumer, retries/backoff, dead-letter/replay, versioned event envelope and compatibility.
**Sprint 2A:** API correctness, input boundaries, unit/fuzz tests.  
**Sprint 2B:** OIDC + PostgreSQL integration and migration tests.  
**Sprint 2C:** outbox publisher, consumer and duplicate/replay/failure tests.  
**Exit:** isolated end-to-end profile flow passes; events are durable and idempotently consumed.

### Wave 3 — Universal connectivity and client platforms
**Phase 3.1:** OpenAPI/event contracts, TypeScript/Dart clients, auth refresh, retries, timeouts, errors, idempotency, tracing, adapters.  
**Phase 3.2 Web:** Next.js shell, sign-in/profile, API client, error handling and browser E2E.  
**Phase 3.3 Mobile:** Flutter shell, secure token storage, API client, offline retry, device builds and integration tests.
**Sprint 3A:** gateway/SDK and contract tests.  
**Sprint 3B:** web client and browser E2E.  
**Sprint 3C:** Flutter client and iOS/Android build verification.  
**Exit:** web and mobile use the same versioned contracts in isolated environments.

### Wave 4 — Master Control Plane
**Phase 4.1:** read-only repository/service/environment inventory, owners, contracts, dependencies and classifications.  
**Phase 4.2:** health aggregation, deployment inventory, build evidence, incidents, audit, configuration and cost views.  
**Phase 4.3:** approval workflows, release evidence, rollback records, exception expiry; separate visibility from authority.
**Sprint 4A:** registry and inventory.  
**Sprint 4B:** observability, deployment and incident views.  
**Sprint 4C:** governed actions, audit and recovery.  
**Exit:** accurate service state without unsafe mutation or single point of failure.

### Wave 5 — LINGO portfolio integration
Onboard bounded product slices after shared identity/API/event standards stabilize:
- LINGOlegacy — flagship identity, account, wallet shell and community.
- LINGOlane — design, promotions, apparel and laundry-cycle.
- LINGOslots — games and virtual-currency policy.
- LINGOarcade — sessions, progression and game services.
- LINGOlibrary — content/catalog and learning.
- LINGOmedia — publishing, media catalog and rights metadata.
- LINGOworld — utility/service products and integrations.
- LegacyXclub — membership, community and access.
For each: owner, repository, service, contract, data owner, auth policy, health check, tests, lifecycle, cost owner, rollback and acceptance.
**Sprint 5A:** LINGOlegacy/shared identity.  
**Sprint 5B:** LINGOlane, LINGOlibrary, LINGOmedia.  
**Sprint 5C:** LINGOslots, LINGOarcade; preserve non-cash virtual currency.  
**Sprint 5D:** LINGOworld, LegacyXclub.  
**Exit:** every product registered with explicit status and passing evidence for each claimed integration.

### Wave 6 — Migration and coexistence
Inventory existing repositories/services/routes/data/integrations/owners/last-known-good; classify retain/wrap/migrate/replace/retire/investigate; define source-target mapping, identity mapping, reconciliation, dual-run and rollback; rehearse with synthetic/sanitized data; validate counts, checksums, referential integrity, permissions, latency and parity; migrate bounded slices only after explicit acceptance.
**Sprint 6A:** discovery and dependency map.  
**Sprint 6B:** migration tooling and rehearsal datasets.  
**Sprint 6C:** parallel-run, reconciliation and rollback drills.  
**Exit:** signed integrity and rollback rehearsal; no implied production cutover.

### Wave 7 — Security, reliability and operational certification
Independent threat/architecture review; SAST, dependency, secret, SBOM, image and IaC scans; least privilege, TLS, key rotation, audit, PII controls; rate limits and incident playbooks; SLO/SLI, error budgets, capacity/load testing; backup/restore, provider failure scenarios, RTO/RPO; cost forecasts, budget alerts, resource TTL and teardown.
**Sprint 7A:** security hardening and independent review.  
**Sprint 7B:** load, resilience, backup/restore and DR.  
**Sprint 7C:** cost and operational readiness evidence.  
**Exit:** critical findings closed or formally risk-accepted; SLO/recovery evidence approved.

### Wave 8 — Launch readiness and controlled release
Freeze candidate source/dependencies; verify checks, artifacts, SBOM, provenance, approvals and migration evidence; validate runbooks, support ownership and rollback; confirm privacy/legal/payment/product acceptance; rehearse release; obtain separate production release acceptance.
**Sprint 8A:** release candidate and acceptance rehearsal.  
**Sprint 8B:** go/no-go and approved bounded release only.  
**Exit:** signed acceptance, deployment evidence, post-deploy health and tested rollback; otherwise remain HOLD.

## Parallel workstream lanes
| Lane | Can proceed now | Hard dependency |
|---|---|---|
| Architecture / ADRs | Yes | Review |
| CI recovery | Yes, P0 | Hosted job startup |
| API correctness / fixtures | Yes | Hosted CI for evidence |
| Identity integration | Design and harness | Isolated issuer |
| Data model / migration | Design and local fixtures | Disposable DB |
| Event platform | Contracts and local harness | Verified database/API |
| Web / Flutter | Contract-first scaffolding | Stable API/identity |
| Control Plane | Registry/read-only prototype | Stable registry schema |
| Portfolio onboarding | Inventory/mapping | Shared contracts |
| Security / SRE | Threat model and controls | Implemented slices |
| Migration | Inventory/rehearsal plan | Target certification |
| Launch | Readiness criteria only | All exit gates |

## Definition of done
- **DESIGNED:** approved design and ADR.
- **BUILT:** implementation exists and is reviewable.
- **TESTED:** test jobs ran and passed with logs and commit correlation.
- **CONNECTED:** real non-production systems exchanged verified data through documented contracts.
- **CERTIFIED:** security, resilience, operations, data and acceptance evidence passed review.
- **PRODUCTION:** separate release approval, controlled deployment and post-deploy verification.

Every claim links to source, commit, workflow run, job, logs, artifact, test evidence and reviewer.

## Current blockers and immediate sequence
1. P0: Actions startup failure; #575 remains authoritative. Do not use G02.
2. PR #594 architecture review and PR #596 implementation review remain draft.
3. Eight workflow attempts for the implementation branch have failed at startup before job creation. Latest two current-head runs: [43706835606](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/43706835606) and [43706830314](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/43706830314).
4. No hosted code test has run; implementation is BUILT / UNVERIFIED.
5. No cloud provisioning until cost, account, region, security and ownership approval.

## Program completion criteria
All eight waves have evidence-backed exit acceptance; each portfolio service has a named owner and explicit integration status; migration/rollback are rehearsed; security/reliability findings are closed or formally accepted; costs are approved; and release authority separately approves the target environment.

**Build the foundation. Connect the ecosystem. Verify every connection. Protect the legacy.**
