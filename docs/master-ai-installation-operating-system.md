# LINGO LEGACY — Master AI Installation & Operating System
**Status:** Draft for review  
**Authority:** LINGOlegacy_MASTER governance; this document does not override production change controls.  
**Scope:** Portfolio-wide AI, software, infrastructure, facilities, equipment, materials, documentation, workforce enablement, operations and release engineering.

## 1. Purpose

Create one coherent, secure, maintainable operating environment in which every authorized person and AI agent can understand the work, find the correct source, use approved tools, execute repeatable procedures, produce verifiable evidence and hand work to another person without losing context.

This is an installation and operating blueprint, not a claim that every system, facility, device, vendor, integration or production deployment is already installed. Each capability must move through: **inventory → design → authorization → procurement/configuration → implementation → test → evidence → acceptance → controlled release → operations**.

## 2. Governing rules

1. Preserve existing intellectual property, repositories, data, working deployments and last-known-good configurations.
2. GitHub is the code source of truth; the canonical Core, Web, Enterprise and exact Creator Studio sources remain separate until an approved consolidation proves otherwise.
3. Never rebuild over an existing asset until its owner, location, dependencies, current state, backup and migration path are recorded.
4. Default deny for identity, access, network paths, APIs, data and AI tool execution.
5. Least privilege, short-lived credentials, run-scoped secret injection and environment separation are mandatory.
6. AI proposes and assists; authorized humans approve high-impact, irreversible, regulated, financial, privacy-sensitive and production actions.
7. No fabricated tests, logs, deployments, approvals, inventory, procurement or completion evidence.
8. Every product has its own acceptance certificate. Passing one stack does not certify another.
9. Production DNS, secrets rotation, destructive data migrations, deletion, protected-hold changes and core production deployments require explicit approval under the governing release process.
10. Accessibility, security, observability, documentation, backup and recovery are part of the product—not optional follow-up work.

## 3. Portfolio and system boundaries

Maintain a single machine-readable portfolio registry with, at minimum:
- portfolio entity and canonical display name;
- owner and accountable product lead;
- IP and licensing record;
- product purpose, users and supported markets;
- canonical repository and default branch;
- runtime, framework, dependencies and supported devices;
- development, test, staging and production environments;
- domains, DNS, hosting, data stores and external providers;
- identity, authorization and data classifications;
- build, test, deploy and rollback procedures;
- current release, last-known-good release and evidence links;
- status: proposed, specified, building, test, staging, production, paused, retired.

Known portfolio families to reconcile against—not duplicate—include LINGOlegacy; LINGOlane; LINGOslots; LINGOarcade; LINGOlibrary; LINGOmedia; LINGOworld; LegacyXclub; LINGO ID; Universal Legacy Wallet/Lingo Coins; LINGO Nexus; LINGO Studios; LINGO Towers; Bridged Gap; LINGOvox; askLINGO; and TRADE/TRDÉ. Each brand and product must have its own ownership, legal clearance and release status.

## 4. Reference architecture

### 4.1 Experience layer
- Responsive web applications and progressive web apps.
- iOS and Android applications.
- Tablet and desktop experiences.
- LG webOS/smart-TV applications where supported by the product.
- Accessible public websites, staff consoles and creator workspaces.
- Voice, media, gaming and future wearable interfaces behind explicit device and privacy reviews.

### 4.2 Application and service layer
- Product-specific frontends and APIs.
- Shared identity and account services.
- Central authorization and policy decision/enforcement points.
- Product-specific business services and domain boundaries.
- Event and job processing with retries, dead-letter handling and idempotency.
- API contracts, versioning, rate limits and service ownership.
- No direct cross-product database access; use reviewed APIs/events.

### 4.3 Data layer
- Separate databases and storage by product, environment and data classification.
- Schema migrations tracked in source control.
- Encryption in transit and at rest where supported.
- Data minimization, retention, deletion and export processes.
- Backups with documented recovery point objective (RPO) and recovery time objective (RTO).
- Restore drills, integrity checks and audit trails.
- No production customer data in development or AI prompts unless specifically authorized and appropriately protected.

### 4.4 Infrastructure layer
- Cloudflare for approved DNS, edge, Workers, Pages, D1 and Access workloads.
- Firebase projects explicitly separated for staging and production where used.
- GitHub repositories, Actions, protected branches and signed/reproducible artifacts.
- Other providers (including Render or app builders) only where a registered architecture decision approves their role.
- Infrastructure as code, configuration inventory and drift detection.
- No undocumented manual infrastructure as the only source of truth.

### 4.5 AI layer
- Model/provider abstraction with approved model catalog and fallback policy.
- Retrieval over permission-filtered, versioned knowledge sources.
- Tool registry with schemas, owner, scope, risk tier and audit requirements.
- Agent orchestration with bounded tasks, budgets, timeouts, retries and human handoff.
- Evaluation datasets, prompt/model versioning, regression tests and quality monitoring.
- Safety filters, privacy controls, provenance, citation and untrusted-content handling.
- AI agents receive distinct workload identities; never share human credentials or broad owner tokens.

## 5. AI installation and governance standard

For each AI capability, document:
1. Business purpose and accountable owner.
2. User groups and permitted use cases.
3. Model/provider, region, data handling and retention terms.
4. Knowledge sources, permissions, freshness and provenance.
5. Tools/actions available and risk classification.
6. Human approval checkpoints and prohibited autonomous actions.
7. Evaluation plan: accuracy, groundedness, refusal, privacy, bias, latency and cost.
8. Logging and monitoring without unnecessary sensitive content.
9. Fallback, incident response, model rollback and service shutdown.
10. User disclosure and feedback mechanisms.

### AI action tiers
- **Tier 0 — Read-only:** search, summarize and explain approved data.
- **Tier 1 — Draft:** prepare code, documents, plans and proposed changes; no external write.
- **Tier 2 — Reversible sandbox write:** isolated development/staging changes with scoped identity and audit.
- **Tier 3 — Controlled operational write:** only after explicit policy approval, owner authorization, change ticket and evidence.
- **Tier 4 — Restricted:** production secrets, financial transfers, legal commitments, identity/security policy changes, destructive migrations, deletion, production DNS and release promotion. Require designated human authorization and dual control where applicable. AI may prepare and verify but must not self-authorize.

## 6. Security baseline — SAAAE

Apply server-side default-deny authorization consistently across all products:
- Identity proofing/authentication and session lifecycle.
- RBAC roles plus ABAC attributes, resource, environment, action and context.
- Policy enforcement at API/service boundaries; UI hiding is not authorization.
- Separate requester, approver and executor identities.
- Approval records tied to exact action, target, version, expiry and evidence.
- Append-only audit trail with integrity verification.
- Idempotency keys and replay prevention for state-changing operations.
- Rate limits, abuse detection and workload quotas.
- Secrets from approved stores only, injected at runtime and scoped to a single workload/run/environment.
- No secrets in source, issue comments, prompts, artifacts, logs or client bundles.
- Rotation, revocation, access review and emergency containment procedures.
- Security tests for allow/deny paths, privilege escalation, cross-tenant access and policy bypass.

## 7. Engineering and release pipeline

Every repository must publish its own verified pipeline:
1. Source checkout at immutable commit SHA.
2. Dependency install from committed lockfile.
3. Formatting, lint, type checks and unit tests.
4. Integration and API contract tests.
5. Security scans: secret scanning, SAST, dependency/SCA and container/IaC scans as applicable.
6. Build and artifact checksum/provenance.
7. SBOM generation and retention.
8. Isolated staging deployment.
9. Smoke, end-to-end, accessibility, performance and security verification.
10. Independent review and product acceptance.
11. Explicit release authorization.
12. Controlled production promotion, health checks and rollback readiness.
13. Post-release monitoring and signed evidence record.

A GitHub Actions run with zero jobs, startup failure, no steps or no required artifacts is **not** a test pass. Local success does not prove hosted CI success. Preview success does not prove production success. An uploaded Worker version does not prove it is deployed or routed.

### G02 and hosted CI
- Recover hosted GitHub Actions execution first using a minimal, read-only canary.
- Run the full repository test inventory, including all 14 Node regression suites proposed in PR #673, only after jobs instantiate.
- Record job IDs, step outcomes, logs, artifacts and commit SHA.
- Diagnose runner registration/labels/permissions separately from application test failures.
- Do not treat a hosted-runner canary as proof that a self-hosted G02 runner is accepted.
- Preserve runner isolation and do not expose production secrets to diagnostic workflows.

## 8. Product-specific acceptance

### Flagship and shared identity
- Registration, login, recovery, session revocation, profile, consent and account deletion/export.
- Tenant boundaries, account permissions and auditability.
- Cross-product navigation and identity federation tests.

### That's My Lingo
- Preserve the specified 5×3 presentation and 20 paylines.
- Keep Option 2 accounting: total spin stake represented by integer/fixed-point wagerUnits and divided equally across 20 paylines.
- Keep preview Vegas Studio Mode virtual-credit only; no wagering, cash-out or prize redemption.
- Treat local demo wallet and client random generation as non-authoritative.
- Test deterministic math, ledger consistency, replay, session boundaries and server-authoritative behavior before any production claim.

### LINGOlane and commerce
- Catalog, inventory, pricing, tax, payment provider, refunds, fulfillment, returns, customer support and reconciliation.
- Laundry-Cycle physical sites require feasibility, zoning, lease, utility, equipment, staffing, insurance, safety and funding approvals before commitments.

### LINGOarcade
- Product-specific game design, asset register, progression, save-state, device QA, accessibility, rights and content review.
- No cross-game release acceptance by assumption.

### LINGOlibrary and Kotton's Code
- Manuscript and asset versioning, rights, metadata, ISBN/distribution where applicable, audio, sales and royalty reconciliation.
- Preserve original character/story IP and continuity; separate source manuscripts from derivative adaptations.

### LINGOmedia / Creator Studio
- Preserve exact canonical Creator Studio source and history.
- Media library, edit/export, audio/video processing, rights, publishing, storage lifecycle, usage quotas and secure sharing.
- Never replace it with a different LINGO app or duplicate project.

### askLINGO / LINGOai / LINGOworld
- Permission-filtered retrieval, tool allowlists, agent identity, budget controls, audit, evaluation, fallback and human escalation.
- Each proposed service (mail, phone, Wi-Fi, travel, campus, support, voice, shield, lounge, donations, wearables and infrastructure domains) requires a distinct service owner, regulatory review and deployment plan.

## 9. Physical facilities, equipment and materials

Do not buy or install equipment until a site survey, use case, safety assessment, compatibility check, bill of materials and approved budget exist.

### Standard technology equipment categories
- Developer workstations/laptops, monitors, docks, keyboards, pointing devices and headsets.
- Test phones/tablets across supported iOS and Android versions.
- Smart-TV/webOS test devices and remotes for relevant products.
- Network router/firewall, managed switches, Wi-Fi access points, structured cabling, patch panels and labeled racks.
- UPS, surge protection, safe power distribution, cooling and environmental monitoring.
- NAS/backup appliances only with encryption, access control and tested recovery.
- Test devices, microphones, cameras, lighting, capture cards and audio interfaces for media production.
- Accessibility test tools, screen readers, input devices and captioning workflows.
- Secure storage, asset tags, device management and approved disposal/recycling.

### Physical site and building requirements
- Site survey, floor plans, occupancy and accessibility assessment.
- Electrical load, circuits, grounding, HVAC, ventilation, fire/life-safety and emergency egress review by qualified professionals.
- Network demarcation, cable pathways, Wi-Fi coverage and physical security.
- Workstations, meeting/training rooms, secure equipment storage and accessible facilities.
- Permits, insurance, landlord approvals, inspections and contractor qualification.
- Maintenance schedules, warranties, spare parts and service contracts.

### Materials and consumables
- Approved cable types, patch leads, labels, mounts, fasteners, racks and cable management.
- Power protection and manufacturer-approved replacement parts.
- Cleaning supplies suitable for electronics, ESD-safe work mats/wrist straps where needed.
- Printer labels, documentation binders, asset tags and shipping/packing materials.
- Site-specific construction or laundry equipment materials only from engineered, code-compliant bills of materials.

Every item needs quantity, purpose, compatible model/specification, supplier, warranty, owner, location, cost, replacement interval and disposal method. No invented supplier quotations or procurement commitments.

## 10. Documentation system

Create and maintain these version-controlled documents:
- Portfolio registry and org/service ownership map.
- Architecture overview, context/container/deployment diagrams.
- ADRs (architecture decision records) with rationale and alternatives.
- Repository map, build instructions and local development quickstart.
- Environment/configuration matrix.
- API catalog and data dictionary.
- Threat model, data-flow map and privacy impact assessments.
- SAAAE policy matrix and access review register.
- Secrets inventory metadata (never secret values).
- CI/CD runbooks and workflow troubleshooting.
- Infrastructure inventory and change history.
- Device/equipment register and approved bill of materials.
- Site plans, inspection records and maintenance logs.
- Product requirements, test plans and acceptance certificates.
- Incident response, backup/restore, disaster recovery and business continuity.
- Vendor, license, contract and IP register.
- Onboarding, role-specific training and offboarding checklists.

Each document has an owner, version, review date, source links and change history. Retire duplicates only after reconciliation and archival.

## 11. Team operating model

Create one accountable owner for each domain:
- Executive sponsor / portfolio authority.
- Portfolio program manager.
- Product owner per product.
- Enterprise architect.
- Engineering lead per repository.
- Platform/SRE and infrastructure owner.
- Security and privacy owner.
- AI governance/model operations owner.
- QA and release manager.
- Design/accessibility lead.
- Data owner.
- Legal/compliance liaison.
- Facilities/procurement lead.
- Customer support/operations lead.

Every task must have: owner, outcome, source location, dependency, acceptance criteria, risk, due date, status and evidence link. Use a single work item per deliverable; cross-link rather than duplicate. Handoffs must include current state, exact commit/config version, steps performed, results, blockers, next action and rollback.

### Contributor onboarding
1. Read project charter, security rules and product scope.
2. Obtain named identity and least-privilege access.
3. Set up approved workstation and MFA.
4. Clone only canonical repositories.
5. Follow exact versioned quickstart.
6. Run safe local checks.
7. Learn branch, PR, review and release process.
8. Complete privacy/security training relevant to role.
9. Record equipment/assets assigned.
10. Confirm escalation contacts and offboarding procedure.

## 12. Observability and operations

- Centralized structured logs with redaction and access controls.
- Metrics for availability, latency, error rate, saturation, queues, cost and usage.
- Distributed tracing with correlation IDs and no secrets/PII leakage.
- Alerts with severity, owner, runbook and escalation path.
- Synthetic checks for critical customer journeys.
- Service-level indicators/objectives agreed per service.
- Cost and quota budgets by product, environment and AI workload.
- Incident reviews focused on root cause and corrective actions.
- Regular access, dependency, backup and configuration-drift reviews.

## 13. Phased master installation

### Phase 0 — Reconcile and protect
- Freeze new duplicate builds.
- Inventory repos, branches, PRs, assets, domains, Workers, Pages, D1, Firebase, providers, tools and physical assets.
- Identify canonical owner/source for each item.
- Capture last-known-good state and backup/restore evidence.
- Reconcile conflicting names, IDs, versions and prior status claims.
- Produce a discrepancy register; do not silently overwrite conflicts.

### Phase 1 — Enable the workforce
- Publish contributor quickstart and role matrix.
- Establish secure accounts, MFA, access requests and offboarding.
- Register tools, models, equipment and vendors.
- Create shared templates, runbooks and support channels.

### Phase 2 — Restore engineering foundations
- Recover hosted CI and verify actual jobs/steps/logs/artifacts.
- Validate Core and Web separately.
- Reconcile PRs and exact Creator Studio source.
- Establish repeatable local and staging builds.
- Implement security scans, SBOM and artifact provenance.

### Phase 3 — Establish secure shared services
- Implement identity, SAAAE, secrets, audit, rate limiting and service registry.
- Verify staging isolation and data migrations.
- Complete backup/restore, observability and disaster recovery drills.

### Phase 4 — Product workstreams in parallel
- Run independent tracks for flagship, That's My Lingo, LINGOlane, arcade, library, media/Creator Studio and askLINGO.
- Each track uses its own owner, source, test matrix, release gates and acceptance.
- Shared platform changes are coordinated through ADRs and versioned APIs.

### Phase 5 — AI and world technology
- Install AI services according to tiered action policy.
- Connect approved knowledge sources and tool adapters.
- Run model and agent evaluations.
- Add domain-specific services only after regulatory, safety and operating model reviews.

### Phase 6 — Facilities and equipment
- Complete needs assessment and site surveys.
- Approve budgets and bills of materials.
- Procure, tag, configure, test and assign equipment.
- Complete professional inspections and maintenance schedules.

### Phase 7 — Release and operate
- Stage, test, certify and authorize each product separately.
- Promote only approved release candidates.
- Verify customer journeys and monitor health.
- Maintain rollback, incident response and support coverage.

## 14. Parallel workstream protocol

Parallel work is allowed when workstreams have distinct files, environments, owners and dependencies. Shared files, schemas, production settings and deployment targets require a coordinating owner and serialized changes.

Suggested parallel tracks:
A. Portfolio registry and IP.
B. Core CI and G02.
C. Web CI and hosting.
D. SAAAE and identity.
E. Cloudflare/Firebase inventory and staging.
F. That's My Lingo engine.
G. Flagship UX and accessibility.
H. Creator Studio/media.
I. Library/publishing and Kotton's Code.
J. LINGOlane/commerce and physical operations.
K. askLINGO/AI platform and evaluations.
L. Observability, backups, DR and compliance.
M. Marketing, analytics and customer operations.

Each track reports blockers immediately and never waits silently on a dependency. Work that is blocked continues with safe independent tasks; no bypass of a gate is permitted.

## 15. Completion definition

The ecosystem is complete only when:
- Every portfolio asset has a canonical owner and source.
- All required repositories build reproducibly.
- Required CI jobs execute and produce inspectable evidence.
- Security and privacy controls are enforced server-side.
- Every supported environment is correctly isolated.
- Critical integrations pass contract and end-to-end tests.
- Backups restore and recovery targets are demonstrated.
- Accessibility, performance, security and device acceptance pass.
- AI actions are permissioned, evaluated, auditable and controllable.
- Equipment/facilities are installed, tagged, inspected and maintained where in scope.
- Documentation and onboarding are current and usable.
- Product owners sign acceptance and release authority authorizes promotion.
- Production health, rollback and customer support are verified.

A checklist marked by a person is not proof. Evidence must identify the exact artifact, commit, environment, test run, result, reviewer and timestamp.

## 16. Immediate open actions from current reconciliation

1. PR #673 has expanded the Node test inventory but its latest observed Actions attempts ended in startup failure with zero jobs/artifacts; obtain a successful hosted runner execution before accepting the change.
2. PR #672 VSM work must remain isolated and its test/runner evidence must be restored without accidental default-branch changes.
3. Reconcile Cloudflare's current 11 Workers, 27 routes, five D1 databases and five Pages projects against route ownership, deployment records and environment boundaries.
4. Inspect all current Access applications and policies; do not infer protection from an application existing.
5. Inspect staging D1 schemas and runtime bindings; table presence alone does not establish enforcement.
6. Preserve Creator Studio project source at its known canonical project and commit; its workspace currently requires attention and must not be replaced with a duplicate.
7. Refresh Core, Web and Enterprise repository/PR status and map dependencies before merging.
8. Obtain current Firebase project/binding evidence and validate Android minSdk 21.
9. Reconcile the latest master work orders and protected-hold state. A user request to lift a hold is not a recorded release-gate transition.
10. Do not perform production DNS changes, secret rotation, destructive migrations, deletion or production promotion without the required change authorization.

## 17. Executive operating dashboard fields

Track by product and workstream:
- Scope / owner / priority.
- Canonical source and version.
- Build and test status.
- Security/privacy status.
- Integration status.
- Environment/deployment status.
- Evidence completeness.
- Open blockers and dependencies.
- Cost/budget and resource needs.
- Acceptance owner and date.
- Rollback readiness.
- Next action.

**Operating principle:** Reconcile first. Preserve what works. Rebuild only what is missing or irreparably broken. Strengthen weak controls. Make every task understandable, executable and verifiable for the people doing the work.
