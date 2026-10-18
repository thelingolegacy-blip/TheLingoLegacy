# Constellation OS — Finalization / Execution Matrix
Date: 2026-09-20
Status: STAGED / FAIL-CLOSED

## Purpose
This matrix consolidates the remaining implementation work for the three-way splitter, dashboard proxy, governance API, recovery vault, telemetry, CI evidence, synchronization, configuration, release phases, waves, and sprints.

It is an execution contract. It does not authorize production mutation.

## Authority
- Source: GitHub
- CI/evidence: GitHub Actions
- Candidate/QA: AppDeploy
- Production runtime: Cloudflare
- Identity/data: Firebase
- Commerce: Shopify/Stripe
- Design: Figma/Canva/Adobe
- LKG: protected baseline

## Non-negotiable gate
SOURCE -> EVIDENCE -> VERIFICATION -> ACCEPTANCE -> PASSED -> AUTHORIZATION -> PROMOTION -> POST-PROMOTION

No verified runtime evidence means:
- no certification
- no production merge that requires a passing gate
- no DNS mutation
- no KV promotion
- no Worker production activation
- no Firebase production writes
- no payment/wallet activation
- no LKG mutation

## Final topology
Origin A = current/main production origin
Origin B = duplicate/blue-green candidate
Origin C = immutable isolated recovery origin

Cloudflare Worker = routing/control boundary
ROUTING_CONFIG = versioned non-secret routing state
Dashboard Browser -> Cloudflare Access -> Dashboard Proxy -> Governance API
Browser never receives ADMIN_API_SECRET.

## Sections

### S0 — Source and baseline
- Verify main SHA and LKG identity.
- Freeze production mutation.
- Correlate PRs, branches, commits, and evidence artifacts.
- Confirm no placeholder DNS/config values are treated as live.

Acceptance: source identity and LKG correlation recorded.

### S1 — Contract and configuration
- Validate splitter contracts.
- Validate origin identity schema.
- Validate routing epoch/version semantics.
- Validate dashboard proxy authorization model.
- Validate governance API request/response schema.
- Validate recovery artifact identity and checksum fields.
- Validate telemetry schema.
- Validate secret names without exposing secret values.

Acceptance: deterministic contract verification passes in CI.

### S2 — Build sections
Build independently:
1. splitter routing module
2. dashboard proxy
3. governance API
4. recovery vault adapter
5. health/live-probe adapter
6. telemetry/audit dispatcher
7. dashboard status surface
8. evidence collector/verifier
9. rollback controller
10. Flutter/Firebase/Cloudflare integration adapters

Each component must have a deterministic build/test boundary and must not self-authorize promotion.

### S3 — Synchronization
Synchronize only through explicit versioned identities:
- Git SHA
- build/artifact ID
- deployment ID
- routing epoch
- origin ID
- LKG ID
- recovery artifact checksum
- evidence bundle ID
- authorization/journal identity

Reject stale routing writes and mismatched identities.

### S4 — Staging waves

#### Wave 0 — Protected baseline
Runner gate, LKG, source integrity, and mutation freeze.

#### Wave 1 — Contract
Contracts, schemas, verifier, configuration validation.

#### Wave 2 — Candidate
Build A/B/C candidates; AppDeploy QA; no production promotion.

#### Wave 3 — Runtime evidence
Hosted runner executes real steps; logs and artifacts exist; probes correlate to deployment/origin identities.

#### Wave 4 — Recovery drill
Deploy Origin C only to isolated staging/recovery surface; execute forced failure; prove rollback and terminal evidence.

#### Wave 5 — Controlled routing
Exercise routing state with isolated traffic only after Wave 4 acceptance.

#### Wave 6 — Clean activation rehearsal
Prove clean activation sequence without changing public production traffic.

#### Wave 7 — Production authorization
Independent human authorization plus complete evidence bundle.

#### Wave 8 — Production promotion
Only after all gates are PASSED.

#### Wave 9 — Post-promotion
Live probes, telemetry, rollback readiness, synchronization checks, and monitoring.

### S5 — Sprint sequence
Sprint 01: source/LKG inventory
Sprint 02: contract verification
Sprint 03: runner/evidence recovery
Sprint 04: A/B build parity
Sprint 05: C recovery artifact
Sprint 06: dashboard proxy
Sprint 07: governance API
Sprint 08: routing epoch/concurrency controls
Sprint 09: telemetry/evidence correlation
Sprint 10: forced-failure recovery drill
Sprint 11: clean activation rehearsal
Sprint 12: authorization bundle
Sprint 13: production promotion
Sprint 14: post-promotion stabilization

A sprint cannot declare production completion when its required evidence is absent.

## Configuration matrix

| Area | Required state | Production mutation |
|---|---|---|
| Cloudflare Worker | versioned config validated | blocked until gates pass |
| DNS | authoritative raw evidence | blocked |
| KV routing | schema/version validated | blocked |
| Access | identity policy validated | blocked |
| Governance API | authorization + stale-write rejection | blocked |
| Recovery vault | immutable artifact/checksum | blocked |
| Firebase | contract/security validation | blocked |
| Flutter | build/test evidence | blocked |
| GitHub Actions | real runner evidence | BLOCKING |
| AppDeploy | candidate/QA evidence | non-authoritative |
| Shopify/Stripe | integration contract | activation blocked |
| Telemetry | correlation schema | non-authoritative |

## Merge policy
- Documentation/specification commits may be prepared on isolated branches.
- Implementation PRs remain unmerged when required CI/evidence gates are failing or indeterminate.
- Never use merge/auto-merge as a substitute for certification.
- Never merge a change that changes production routing solely because a candidate is "Deployment ready."
- Main remains the LKG authority until qualifying evidence proves a transition.

## Activation policy
Activation is a state transition, not a build step.

Required sequence:
1. source accepted
2. runner evidence PASS
3. build/test evidence PASS
4. staging evidence PASS
5. recovery drill PASS
6. clean activation evidence PASS
7. authorization identity verified
8. routing/DNS evidence accepted
9. production authorization recorded
10. controlled promotion
11. post-promotion probes PASS
12. rollback readiness PASS

## Current blocker
The observed GitHub Actions jobs are completing with zero instantiated steps and unavailable logs (BlobNotFound). Therefore the runtime-evidence gate is not satisfied.

This blocks certification, merge-as-release, promotion, activation, and synchronization into production.

## Current disposition
RUNNER_GATE = BLOCKED
CI_EXECUTION = BLOCKED
CERTIFICATION = BLOCKED
PROMOTION = BLOCKED
ACTIVATION = BLOCKED
LKG = PROTECTED
MUTATION_FREEZE = ACTIVE

## Completion definition
"Finalized" means every section has:
- implementation owner/boundary
- deterministic input/output contract
- test/evidence requirement
- synchronization identity
- rollback identity
- acceptance gate
- explicit production authorization boundary

"Activated" additionally requires live qualifying evidence. Architecture or code presence alone is insufficient.
