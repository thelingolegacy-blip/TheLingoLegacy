# LINGO CORE V2 Architecture Baseline

**Decision state:** ACCEPTED provider-neutral CORE V2 baseline; provider implementation selection deferred  
**Program:** #597  
**Architecture proposal:** PR #594  
**Implementation:** PR #596

## System boundaries
- Experience: Next.js/React/TypeScript and Flutter.
- Core application: Go services organized initially as a modular platform with explicit bounded contexts.
- Connectivity: OpenAPI REST contracts, versioned events, outbox/inbox, typed SDKs and adapter interfaces.
- Identity: OIDC federation and LINGO ID subject mapping; authorization policy is enforced server-side.
- Data: product-owned schemas and stores; no cross-product direct database access.
- Infrastructure: environment-separated, reproducible IaC and provider-neutral deployment contracts.
- Control plane: read-only inventory and health first; privileged operations require explicit authorization and audit.
- Governance: ADRs, data classification, service ownership, evidence, release gates and cost approvals.

## Provisional provider boundaries
- GitHub: canonical source, review history and engineering evidence.
- Cloudflare: intended public edge, DNS and Worker routing subject to existing release controls.
- Firebase: existing specialist integrations only where justified, with explicit service contract and verified project identity; not a co-equal authority for the same data domain.
- AWS: candidate application infrastructure provider; no account, region, resources or recurring costs are approved by this ADR.
- OpenTofu/Terraform: IaC candidate; choose and pin one implementation after licensing, provider compatibility, state security and cost review.
- PostgreSQL: authoritative transactional data for explicitly migrated domains; initial Go vertical slice uses isolated disposable development only.

These are proposed responsibility boundaries, not a claim that providers are currently connected or provisioned.

## Architecture principles
1. One authoritative source per data domain.
2. Product autonomy with shared, governed platform capabilities.
3. Contract-first integration; no undocumented point-to-point coupling.
4. Least privilege and explicit trust boundaries.
5. Secure defaults, synthetic test data and isolated environments.
6. Reversible decisions and portable interfaces where practical.
7. Observe before automate; read-only Control Plane first.
8. Cost approval before paid resources.
9. Build and test evidence before integration claims.
10. Production changes require separate release acceptance.

## Required reviews
- Product/domain owners approve bounded contexts and data ownership.
- Security review approves identity, secrets, networking and data controls.
- Platform review approves provider responsibilities and IaC state design.
- Finance/owner approval required for paid cloud resources.
- Release authority separately approves production changes.
