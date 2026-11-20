# ADR-0001: Provider and edge boundaries

**Status:** ACCEPTED baseline — provider implementation selection deferred  
**Date:** 2026-11-15

## Context
The LINGO estate contains existing edge, application, data and hosting integrations. The greenfield foundation must avoid overlapping providers, duplicate sources of truth and unapproved recurring costs.

## Accepted baseline
- GitHub remains the canonical source and review/evidence system.
- Cloudflare remains the intended public edge and DNS/Worker layer, subject to existing production controls.
- Firebase remains an existing specialist integration where justified, with explicit project identity and ownership; it is not a co-equal authority for the same data domain.
- Cloudflare remains the complementary public edge and delivery layer; AWS and other providers may be evaluated only as implementation/hosting options under the provider-neutral contracts, not as a competing data authority.
- PostgreSQL is the authoritative transactional store for explicitly migrated domains; the Go API vertical slice begins with an isolated disposable PostgreSQL database.
- Select exactly one IaC engine after a documented OpenTofu/Terraform evaluation.
- Use adapters and portable contracts to avoid embedding provider-specific assumptions in product services.

## Consequences
- Provider ownership and integration responsibilities must be recorded in the service registry.
- No provider provisioning, paid resource, domain change or data move is authorized by this proposal.
- Cost, region, security, data residency, backup and exit strategy must be evaluated before selection.

## Acceptance
Architecture, security and cost review; explicit owner approval; documented decision record; no conflicting provider responsibilities.
