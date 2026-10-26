# The Lingo Legacy — Surface Matrix Architecture Charter

**Status:** Proposed reference architecture; not deployed or security-certified.
**Date:** 2026-10-26

## Purpose
Define the governed platform layer connecting experience surfaces, business modules, APIs, data, identity, policy, infrastructure, and operational evidence. “OS” means a shared control/orchestration layer, not an operating-system kernel.

## Non-goals
- No assumption that AWS, EKS, or any service is already provisioned.
- No promise of compliance certification, production readiness, availability, or capacity without test evidence.
- No microservice decomposition for its own sake.
- No bypass of authorization, approval, CI, or deployment controls.
- No direct cloud administrator credentials in browser applications.

## Architecture principles
1. **Inventory before migration.** Map the current repository, routes, runtime APIs, domains, deployment target, and existing data stores before moving code.
2. **Modular core first.** Keep bounded business modules in one deployable application initially; use separate workers for asynchronous jobs. Split services only when ownership, scaling, release cadence, or isolation requires it.
3. **Registry describes; controls enforce.** Registry metadata is not an authorization boundary. Enforce policy in API handlers, data access, storage, workers, and cloud IAM.
4. **Fail closed for sensitive actions.** Missing identity, tenant context, policy result, or approval must not grant access.
5. **Customer runtime independence.** Architecture studio and provisioning control-plane failures must not stop ordinary customer requests.
6. **Evidence over claims.** Distinguish proposed, implemented, tested, deployed, and independently verified states.
7. **Portable contracts.** Use OpenAPI, event schemas, container images, and infrastructure modules with explicit cloud-specific adapters.
8. **Least privilege and isolation.** Separate environments, workload identities, production access, secrets, and audit evidence.
9. **Recoverability is tested.** Backup creation alone does not prove restoration or RTO/RPO.
10. **Cost is a design input.** Do not provision a full enterprise stack until load, staffing, budget, and recovery needs are sized.

## Logical planes
- **Experience plane:** public web, customer workspace, enterprise administration, partner APIs, architecture studio, support console.
- **Application plane:** organizations, tenants, workspaces, domain records, files, collaboration, entitlements, usage, notifications, integrations.
- **Data plane:** PostgreSQL as authoritative transactional store where appropriate; object storage for files; optional cache, search, and analytics as derived services.
- **Control plane:** surface registry, policy definitions, service catalog, environment requests, deployment orchestration, architecture decisions.
- **Trust plane:** identity, workload identity, authorization, secrets, audit, supply-chain controls.
- **Operations plane:** telemetry, SLOs, incidents, runbooks, cost allocation, recovery evidence.

## Initial technology direction
Proposed greenfield default: TypeScript/React/Next.js experience, modular TypeScript API, OpenAPI contracts, managed identity, PostgreSQL, object storage, queue/event services, Terraform, container delivery, and OpenTelemetry. AWS/EKS is a candidate target, not a precondition for local development or code-level progress. Confirm current stack before choosing migration work.

## Decision records required before production
- ADR-001: cloud/provider and region selection
- ADR-002: tenancy and isolation tier
- ADR-003: identity provider and account lifecycle
- ADR-004: application module boundaries
- ADR-005: transactional database and migration strategy
- ADR-006: CI identity, runner trust, and deployment promotion
- ADR-007: data classification, retention, deletion, and residency
- ADR-008: availability, RTO/RPO, and DR topology
- ADR-009: monitoring, log retention, and incident response
- ADR-010: monetization, payments, age/jurisdiction controls, and applicable legal review if paid or prize-based game features are enabled

## Release-state vocabulary
- **Proposed:** documented design only.
- **Implemented:** code/configuration exists in a reviewed branch.
- **Locally verified:** a reproducible local command passed.
- **CI verified:** a successful workflow run is linked.
- **Staging verified:** deployed staging behavior was tested.
- **Production deployed:** release record and target environment are known.
- **Production verified:** post-deploy checks and monitoring passed.
- **Security reviewed:** documented review completed; this is not equivalent to certification.

Every status claim must link to a commit, workflow run, test report, deployment identifier, or review record when applicable.
