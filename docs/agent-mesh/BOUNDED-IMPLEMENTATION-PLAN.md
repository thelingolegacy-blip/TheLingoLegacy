# Bounded Implementation Plan — LINGO Legacy Agent Mesh

**Phase:** 0 / inventory and architecture  
**Permissions:** read-only recovery  
**Decision requested:** review this bounded proposal before any runtime or workflow is added

## Guardrails

Maintain `G02 BLOCKED`, `PRODUCTION HOLD`, `FAIL_CLOSED ACTIVE`, and `LKG PROTECTED`. No production changes, deployment, runner changes, permissions changes, schedule/alert setup, credentials, secrets, external writes, or merge are part of this plan. All future code changes require an isolated branch and human review.

## Phases and exit criteria

### Phase 0 — Inventory and architecture (this PR)
**Scope:** repository source inventory, matrix coverage, role registry, policy boundaries, and bounded rollout plan.

Exit criteria:
- [ ] Reviewer confirms authoritative policy sources and resolves conflicts with legacy agent-governance language.
- [ ] Reviewer confirms gate/surface/OS scope and missing-data semantics.
- [ ] Registry roles are accepted as *logical responsibilities*, not running agents.
- [ ] Production invariants and prohibition list are retained.

### Phase 1 — Static registry and schema validation
**Scope:** add a versioned declarative role registry and a local schema/consistency test only if the repository's existing test conventions support it. No workflow trigger changes, no runtime services, no dependencies.

Exit criteria:
- [ ] Schema validation rejects unknown permissions, missing owner/evidence fields, and any production-mutation capability.
- [ ] Coverage check ensures all G00–G11 gates, all critical release gates, all discovered surfaces, and each applicable OS target is mapped or explicitly marked not applicable.
- [ ] Static checks run on a safe, isolated environment and their exact outputs are retained.

### Phase 2 — Read-only orchestrator prototype
**Scope:** local/CI-only task planner that reads the registry and repository metadata. No privileged credentials, external writes, background schedules, self-hosted execution, production API calls, or autonomous code changes.

Exit criteria:
- [ ] Input schema and source trust boundaries are documented.
- [ ] Output is deterministic, bounded, redacted, and stamped with source SHA/time.
- [ ] Permission denial produces `UNKNOWN`, not an inferred empty inventory.
- [ ] Unit tests cover fail-closed states, prompt/content injection in retrieved material, missing evidence, and run/attempt correlation.
- [ ] No release gate can be mutated by the orchestrator.

### Phase 3 — Read-only GitHub integration
**Scope:** use an explicitly authorized least-privilege GitHub token/app connection to read repository/PR/workflow metadata. Do not dispatch runs or call write endpoints.

Exit criteria:
- [ ] Access is documented and least-privilege reviewed.
- [ ] Read-only inventory distinguishes source facts, derived conclusions, and unknowns.
- [ ] API failures/rate limits remain visible and do not become PASS.
- [ ] Evidence links and commit/run/attempt identifiers are retained without secrets.

### Phase 4 — Surface and OS coverage expansion
**Scope:** add deterministic inventories and tests for web/API, game, identity, commerce, creative/media, accessibility/security, Linux/Windows/macOS/mobile/container/edge surfaces as supported by actual project configuration.

Exit criteria:
- [ ] Each test target has a documented runtime/toolchain prerequisite.
- [ ] Unsupported targets are explicitly marked `NOT_APPLICABLE` with rationale.
- [ ] No production endpoint is mutated or used for destructive tests.
- [ ] Cross-platform claims are based on actual executions, not directory presence.

### Phase 5 — Independent assurance and acceptance
**Scope:** separate reviewer checks the registry, orchestrator, evidence model, permission boundaries, and tests.

Exit criteria:
- [ ] Independent reviewer did not author the implementation under review.
- [ ] All required tests and security checks have retrievable results.
- [ ] G02 acceptance remains separate from the agent mesh and follows the canonical acceptance contract.
- [ ] Release authority remains human-controlled and separate from CI/agent status.

## Deliverables in this first slice

- `docs/agent-mesh/README.md` — charter and guardrails.
- `docs/agent-mesh/INVENTORY.md` — source inventory, gate/surface/OS coverage and gaps.
- `docs/agent-mesh/BOUNDED-IMPLEMENTATION-PLAN.md` — phases and acceptance criteria.
- `config/agent-mesh/registry.json` — logical role catalog, scopes, and safety constraints.

## Explicitly out of scope

- Agent runtime deployment or hosted agent services.
- GitHub workflow creation/modification or manual workflow dispatch.
- New schedules, alerts, webhooks, bots, long-running daemons, or external notifications.
- Runner installation/re-registration/relabeling/service restart.
- Cloudflare, DNS, Vercel, Firebase, payment, Shopify, wallet, or customer-data changes.
- Production merge/deploy/rollback/activation and gate mutation.
- Declaring G02 fixed, root cause confirmed, or production accepted.

## Stop conditions

Stop and report rather than guessing if the default branch/commit changes during implementation, relevant permissions are unavailable, source files conflict, registry validation cannot be executed, a requested action would cross a prohibited boundary, or evidence cannot be tied to the exact source/run/attempt. A stop is a safe result, not permission to widen scope.
