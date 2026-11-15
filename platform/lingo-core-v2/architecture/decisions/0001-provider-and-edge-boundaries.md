# ADR-0001: Provider and edge boundaries

**Status:** PROPOSED  
**Date:** 2026-11-15

## Context
The LINGO estate contains existing edge, application, data and hosting integrations. The greenfield foundation must avoid overlapping providers, duplicate sources of truth and unapproved recurring costs.

## Proposal
- GitHub remains the canonical source and review/evidence system.
- Cloudflare remains the intended public edge and DNS/Worker layer, subject to existing production controls.
- Firebase is not a universal backend by default; retain only verified, bounded capabilities with explicit project identity and ownership.
- AWS is a candidate for selected application infrastructure, not an approved default for every workload.
- PostgreSQL is the initial candidate transactional store for the Go API vertical slice.
- Select exactly one IaC engine after a documented OpenTofu/Terraform evaluation.
- Use adapters and portable contracts to avoid embedding provider-specific assumptions in product services.

## Consequences
- Provider ownership and integration responsibilities must be recorded in the service registry.
- No provider provisioning, paid resource, domain change or data move is authorized by this proposal.
- Cost, region, security, data residency, backup and exit strategy must be evaluated before selection.

## Acceptance
Architecture, security and cost review; explicit owner approval; documented decision record; no conflicting provider responsibilities.
