# askLINGO v2.0 — Canonical Foundation

**Status:** Architecture baseline + isolated policy primitive / production implementation not enabled  
**Version:** 2.0.0-draft.3  
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
12. [Canonical mode registry](11-MODE-REGISTRY.md)
13. [Voice and multimodal architecture](12-VOICE-AND-MULTIMODAL.md)
14. [Implementation readiness](13-IMPLEMENTATION-READINESS.md)
15. [Policy primitive contract](14-POLICY-PRIMITIVE-CONTRACT.md)
16. [Legacy voice branch assessment](15-LEGACY-VOICE-BRANCH-ASSESSMENT.md)
17. [Persistence and adapter contracts](16-PERSISTENCE-AND-ADAPTER-CONTRACT.md)
18. [Product-domain routing](17-PRODUCT-DOMAIN-ROUTING.md)
19. [Delivery ledger](18-DELIVERY-LEDGER.md)
20. [Master system prompt](19-MASTER-SYSTEM-PROMPT.md)
21. [Query API contract](20-QUERY-API-CONTRACT.md)
22. [Cloudflare infrastructure inventory](21-CLOUDFLARE-INFRASTRUCTURE-INVENTORY.md)

## Executable foundation

- `src/ai/v2/policy.mjs`: isolated default-deny policy evaluator, deterministic action digest, and approval snapshot validator.
- `src/ai/v2/modes.mjs`: canonical 13-mode registry and explicit operating-state resolver; unknown modes are rejected.
- `src/ai/v2/agents.mjs`: 12 bounded specialist-agent definitions; all tools and execution privileges remain disabled.
- `src/ai/v2/request.mjs`: strict query-request validation; rejects unknown fields and unregistered modes.
- `scripts/tests/ask-lingo-governance.test.mjs`, `scripts/tests/ask-lingo-modes.test.mjs`, `scripts/tests/ask-lingo-agents.test.mjs`, and `scripts/tests/ask-lingo-request.test.mjs`: deterministic policy, mode, agent, and request validation tests.
- Run: `npm run test:asklingo` (Node.js 20+).

The policy primitive is not wired to the production Worker, persistent grants, an atomic approval store, a durable audit sink, or an inference provider. It is not a production authorization boundary.

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

This branch is additive and reviewable. Existing runtime and historical assets remain preserved. Any later runtime integration must be separately scoped, tested, security-reviewed, approved, and supported by independent evidence.
