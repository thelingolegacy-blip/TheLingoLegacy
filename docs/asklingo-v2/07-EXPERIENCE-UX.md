# askLINGO v2.0 — Experience and UX Specification

## Experience direction

Premium, clear, human, warm, modern, and restrained. Use the established LINGO Crimson / White / Shadow Noire visual system where compatible. Preserve exact brand spelling: `askLINGO`. No star symbol in product names.

## Core surfaces

1. Conversation home — prompt composer, mode selection, recent approved context, and clear availability state.
2. Research view — source list, citations, dates, evidence quality, and uncertainty.
3. Create view — artifact type, draft status, revisions, and export boundaries.
4. Task view — plan, target, impact, dependencies, permissions, approval state, execution status, evidence, and verification.
5. Agent view — registered agents, purpose, current state, scoped capabilities, and recent verified work.
6. Governance view — pending approvals, policy decisions, audit references, and access review.
7. Settings — privacy, memory controls, connected integrations, consent, accessibility, and account security.

## Status vocabulary

Use truthful states: Draft, Planned, Preview, Awaiting approval, Authorized, Running, Succeeded, Failed, Blocked, Not verified, and Archived. Do not use "Live", "Connected", "Complete", or "Secure" without the applicable evidence.

## Action confirmation

Before a consequential action, show the exact target, requested change, scope, expected impact, reversibility, cost, data involved, approval requirement, and expiry. Approval UI must be driven by a server-created approval record. A client button cannot create authority by itself.

## Privacy and safety UX

- Make persistence state explicit.
- Provide clear controls and explanations for memory and conversation retention.
- Distinguish public knowledge from private account or product data.
- Explain why an action is blocked without revealing security-sensitive policy internals.
- Do not imply professional licensure or emergency dispatch.
- Provide accessible, age-appropriate content and escalation paths.

## Accessibility

Keyboard and screen-reader support, semantic landmarks, visible focus, sufficient contrast, reduced motion, scalable text, accessible error messages, captions/transcripts for voice, and mobile-safe touch targets.

## Responsive behavior

Design mobile-first while preserving efficient desktop work surfaces. Voice is an optional modality, never the only way to use a critical function. Smart-TV and embedded surfaces remain read-oriented unless their authorization and interaction model is separately validated.

## Existing asset rule

The current `ai/index.html` and shared Crimson studio styles are preserved. A v2 interface proposal must be a separate preview until product review and runtime contract validation are complete.
