# askLINGO v2.0 — Master Architecture

## Architecture overview

```text
WEB / FLUTTER / VOICE / EMBEDDED SURFACES
                  |
         SHARED EXPERIENCE CLIENT
                  |
          FIRST-PARTY API GATEWAY
                  |
      IDENTITY + SESSION VERIFICATION
                  |
      SAAAE POLICY / AUTHORIZATION GATE
                  |
       ASK LINGO INTELLIGENCE CORE
          /        |         \
     CONTEXT    PLANNER     RESPONSE
        |          |
   MEMORY/RAG   LINGOassist ORCHESTRATOR
                    |
            AGENT / WORKER REGISTRY
                    |
          APPROVED CONNECTOR ADAPTERS
                    |
       PRODUCT-SCOPED SERVICES / DATA
                    |
        EVIDENCE + AUDIT + TELEMETRY
```

## Logical layers

### 1. Experience layer
Responsive web, Flutter mobile, voice, and approved embedded experiences. All clients use the same versioned first-party API contract. Clients are presentation surfaces, never authorization authorities.

### 2. API and edge layer
Cloudflare Worker is the proposed first-party API boundary consistent with the current repository runtime. It validates request shape, applies abuse controls, verifies identity, invokes policy checks, routes approved requests, and returns generic safe errors. No provider key or privileged service credential reaches a client.

### 3. Identity and session layer
A verified identity is established from a trusted identity provider. The existing repository notes Firebase options are placeholders and Firebase Auth is not currently verified. Therefore Firebase is a candidate, not an assumed active dependency. No client-supplied user ID is trusted.

### 4. Governance layer
SAAAE makes server-side authorization, approvals, and audit recording mandatory for every protected operation. The policy engine is independent of the model and agents. Unknown policy state means deny.

### 5. Intelligence core
Classifies intent, identifies the product/tenant scope, selects context, plans an answer or bounded task, invokes only approved capabilities, and synthesizes a response with provenance and uncertainty.

### 6. LINGOassist orchestration
Coordinates task lifecycle: understand, classify, identify target, inspect state, check requirements/dependencies/authority, plan, prepare, request approval, execute, capture evidence, verify, update state, report, archive.

### 7. Agent and worker layer
Agents reason within declared roles and contracts. Workers perform narrowly scoped operations. Neither can grant itself permissions or bypass policy. Tool adapters validate inputs and enforce idempotency and target scope.

### 8. Memory and knowledge layer
Separates user preferences, conversation history, product knowledge, source documents, operational records, and audit records. Each store has distinct purpose, access, retention, deletion, and provenance rules.

### 9. Observability and evidence layer
Correlates request, user/service identity, policy decision, approval, tool invocation, result, evidence, and verification. Logs avoid secrets and unnecessary message content.

## Trust boundaries

- Browser/mobile to API: untrusted client input.
- API to identity provider: token verification boundary.
- API/orchestrator to model provider: untrusted generated output.
- Agent to worker: delegated, bounded request.
- Worker to connector: external system boundary.
- Product-to-product: tenant and product authorization boundary.
- Retrieval to model: retrieved content is untrusted data, not executable instruction.
- Audit store: restricted, append-only evidence boundary.

## Core invariants

1. Model output never authorizes an operation.
2. User intent is not equivalent to authenticated identity.
3. Authentication is not authorization.
4. Agent role labels are not permissions.
5. Tool availability is not tool authorization.
6. Approval is bound to an exact action digest, target, scope, actor, and expiry.
7. Revocation is checked at execution time.
8. Retries are idempotent or explicitly rejected.
9. Product data remains scoped to its owning domain.
10. A success response requires authoritative downstream confirmation.

## Deployment topology

Use GitHub as source of truth and Cloudflare as the current edge/runtime target. Preserve the existing web/Worker contract. Flutter remains a client target. Firebase, SQL, queues, vector retrieval, and model providers are selected only after architecture fit, security, cost, data residency, and operations review. No new paid infrastructure is assumed.

## Availability and failure

Identity, policy, approval, audit, or target-resolution failures block protected execution. Provider timeouts return a generic retryable response without leaking internals. Memory failure must not silently fall back to cross-user or unscoped data. If audit persistence is required but unavailable, consequential actions fail closed.
