# ADR-0002: Modular service topology

**Status:** PROPOSED  
**Date:** 2026-11-15

## Context
The portfolio needs shared platform capabilities without creating a fragile web of premature microservices.

## Proposal
Start with a modular Go service foundation organized by bounded context. Keep identity/profile, wallet/ledger, commerce, gaming, content/media, community and platform operations as separately owned domains with explicit APIs and data ownership. Extract independently deployable services only when scale, isolation, team ownership or reliability requirements justify the operational cost.

## Rules
- No cross-domain database writes.
- Service-to-service communication uses versioned APIs or events.
- Each service declares owner, lifecycle, dependencies, data classification, health endpoints, SLO and deployment unit.
- Shared libraries must remain small and versioned; avoid a shared database schema as an integration mechanism.
- Use transactional outbox/inbox patterns for reliable domain events.

## Consequences
A modular foundation reduces initial operations burden while preserving later extraction. Domain boundaries must be enforced in code review and tests.

## Acceptance
Context map approved; service registry complete for each implemented service; dependency and ownership checks pass.
