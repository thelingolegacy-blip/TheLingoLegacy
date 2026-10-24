# LINGO Legacy Studio VNext

**Status:** isolated concept / preview shell. **Not production.** This branch is deliberately separate from `main`.

## Goals
- A studio-grade universe gateway for The Lingo Legacy, Loyalty Lane Apparel, That's My Lingo, Kotton's Code, the community, and internal studio systems.
- Responsive navigation and interactive sections for worlds, agent blueprints, workflow templates, integration inventory, architecture, governance, and roadmap.
- Fail-closed release posture: no implicit promotion, no credentials in browser code, no production mutations from this preview.

## Preview
Open `studio-vnext/index.html` directly in a browser or serve the `studio-vnext` directory with any static file server. No build step or third-party runtime dependency is required for this initial visual prototype.

## Architecture direction
- **Experience:** Next.js + TypeScript for the production implementation; semantic accessible components and a shared design token system.
- **Edge:** Cloudflare Workers + static assets; domain routing stays unchanged until separately approved and verified.
- **Identity/data:** Firebase Auth, Firestore, and Cloud Functions, with separate development and production projects and no client-side privileged secrets.
- **Commerce:** Shopify integration through verified server-side webhooks and idempotent event handling.
- **AI orchestration:** scoped agent registry, tool permission manifests, human approval queue, bounded execution, trace IDs, and immutable audit events.
- **Observability:** structured logs, Sentry, service health endpoints, privacy-reviewed analytics.
- **Delivery:** GitHub branch checks, deterministic build, accessibility/E2E/security checks, preview artifact, independent evidence review, explicit authorization.

## Agent blueprints
1. Studio Orchestrator — dispatches work to approved specialists.
2. Brand Guardian — checks canonical naming and design/voice rules.
3. Build & QA Analyst — reports CI and test evidence.
4. Release Gatekeeper — blocks promotion when evidence is incomplete.
5. Commerce Operations — supports scoped catalog/order diagnostics.
6. Community Producer — drafts content for human review.

These are design blueprints, not running agents.

## Workflow templates
Change intake; branch preview; visual acceptance; integration onboarding; incident response; content publishing; commerce reconciliation; release certification.

## Proposed API contracts
- `GET /healthz`
- `GET /api/v1/runtime`
- `GET /api/v1/platform/manifest`
- `GET /api/v1/platform/gates`
- Future `POST /api/v1/workflows/preview` (authenticated, dry-run only until approved)

These routes are an architecture proposal, not claims that endpoints are deployed by this branch.

## Required acceptance gates
- Source/branch provenance verified.
- Runner dispatch produces an initialized job, assigned runner, executed sentinel, and retrievable logs.
- Build, typecheck, lint, unit, contract and end-to-end tests pass.
- Browser accessibility: keyboard-only, contrast, reduced-motion, forced-colors and responsive checks.
- Security review, secret/dependency scans, sandbox integration tests, telemetry and rollback runbook.
- Independent approval and explicit release authorization.

## Hard boundaries
- Do not merge this branch or point apex/www DNS at it as part of preview work.
- Do not alter Cloudflare production Worker/custom domains, Firebase production, Shopify, or payment settings.
- Do not claim agent, workflow, integration, API, or deployment functionality beyond what has actually been implemented and verified.
- Existing production hold and prior gate matrix remain authoritative.
