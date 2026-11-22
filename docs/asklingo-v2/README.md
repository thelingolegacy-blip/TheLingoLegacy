# askLINGO v2.0 — Canonical Foundation

**Status:** Architecture baseline / implementation not yet authorized  
**Version:** 2.0.0-draft.1  
**Source baseline:** `main@3fe099eb11329cc333ffa5a1ea36affcd0375343`  
**Working branch:** `feat/asklingo-v2-foundation-2026-11-21`

## Purpose

This directory adds the v2.0 architecture without replacing or silently rewriting existing askLINGO assets. Existing runtime contracts, facade code, UI, historical proposals, and LINGOassist specifications remain preserved.

## Document index

1. [Product charter](00-PRODUCT-CHARTER.md)
2. [Master architecture](01-MASTER-ARCHITECTURE.md)
3. [Agent registry and contracts](02-AGENT-REGISTRY.md)
4. [Identity and authorization](03-IDENTITY-AUTHORIZATION.md)
5. [SAAAE governance](04-SAAAE-GOVERNANCE.md)
6. [Memory and knowledge](05-MEMORY-KNOWLEDGE.md)
7. [API and integration registry](06-API-INTEGRATION.md)
8. [Experience and UX](07-EXPERIENCE-UX.md)
9. [Infrastructure and operations](08-INFRASTRUCTURE-OPERATIONS.md)
10. [Validation and release criteria](09-VALIDATION-RELEASE.md)
11. [Asset reconciliation](10-ASSET-RECONCILIATION.md)

## Canonical product distinction

- **LINGOai:** ecosystem intelligence capability family.
- **askLINGO:** user-facing conversational and reasoning experience.
- **LINGOassist:** internal task planning and execution coordination layer.
- **Agents:** specialized, bounded reasoning roles.
- **Workers:** bounded execution units.
- **Governance:** independently enforced authority and state-transition control.
- **Evidence:** verifiable proof of what actually happened.

## Non-negotiable state rule

Specification is not implementation. Implementation is not execution. Execution is not proof. Proof is not independent verification. Verification is not acceptance. Acceptance is not authorization. Authorization is not production promotion.

## Current release boundary

The existing production contract says askLINGO is not production-enabled. The current facade intentionally returns `ASKLINGO_DISABLED`. This foundation does not enable a provider, persist conversations, change Firebase or Cloudflare bindings, modify secrets, change routes, deploy, merge, or authorize production activation.

## Change control

This branch is additive and reviewable. No existing files are deleted or overwritten. Any later runtime implementation must be a separate scoped change with tests, security review, explicit approval, and independent evidence.
