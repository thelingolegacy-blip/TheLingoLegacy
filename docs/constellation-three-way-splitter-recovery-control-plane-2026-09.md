# Lingo Legacy — Constellation Three-Way Splitter & Recovery Control Plane
Date: 2026-09-20

## Purpose

This document upgrades the Lingo Legacy platform architecture with a governed three-way Cloudflare traffic splitter, isolated recovery environment, human control layer, secret architecture, telemetry, and promotion evidence model.

It is a design/control-plane specification. It does not constitute production activation or certification.

## 1. Three-way topology

Cloudflare edge
→ governed splitter
→ Origin A / Origin B / Origin C

Origin A:
- primary/main environment
- current authorized production target when certified

Origin B:
- duplicate/blue-green candidate
- isolated candidate for validation

Origin C:
- clean recovery environment
- rebuilt from verified recovery artifacts/LKG
- isolated until independently accepted

The splitter must never become an alternate path around production gates.

## 2. Routing model

The public apex remains under Cloudflare control.

The desired flow is:

thelingolegacy.com
→ Cloudflare
→ splitter
→ authorized active origin

Candidate and recovery validation can use controlled paths or protected administrative routes.

Traffic transitions should not require an apex DNS mutation.

DNS remains a separate evidence gate. The existence of a Worker route does not prove authoritative DNS state.

## 3. Routing state

KV may contain non-secret routing state:

- activeOrigin
- recoveryEnabled
- routingEpoch
- origin identifiers
- environment identifiers
- metadata
- audit references

Secrets do not belong in ordinary KV.

KV read/modify/write must not be represented as an atomic transaction. Use a version/epoch/concurrency strategy and reject stale transitions.

Example logical state:

{
  "activeOrigin": "A",
  "recoveryEnabled": false,
  "routingEpoch": 1,
  "origins": {
    "A": "main",
    "B": "duplicate",
    "C": "recovery"
  }
}

This is a schema example, not a live production value.

## 4. Origin contract

Every origin must expose independently verifiable:

- source SHA
- artifact ID
- deployment/version ID
- environment ID
- runtime version
- health endpoint
- rollback/LKG ID
- dependency status

A 200 response is necessary evidence for some probes but is not sufficient certification.

## 5. Dashboard human-control layer

Browser
→ Cloudflare Access
→ Dashboard Proxy Worker
→ internal governance API

The browser must never receive ADMIN_API_SECRET.

The proxy:
- validates Access identity at the protected boundary
- provides read-only status
- accepts authorized administrative actions
- attaches server-side credentials only inside the Worker
- forwards actor/correlation identity
- sanitizes responses
- records audit metadata

Administrative routes require Cloudflare Access.

Browser-side secret prompts are prohibited.

## 6. Governance API

The governance API is separate from the public runtime.

Responsibilities:
- validate target origin
- validate actor/service identity
- verify routing epoch
- require accepted evidence
- require explicit authorization
- perform the routing transition
- emit audit event
- expose rollback identity
- reject stale or incomplete requests

Health checks can support readiness but cannot independently authorize production.

## 7. Promotion gate

Do not use:

readiness flags → automatic promotion

Use:

readiness
→ executable runner evidence
→ artifact identity
→ tests
→ live probe
→ verification
→ acceptance
→ explicit authorization
→ routing change
→ post-routing probe

This preserves the existing fail-closed governance model.

## 8. Recovery vault

Origin C must be reconstructable from a verified recovery package.

Required recovery package:

- immutable build artifact
- checksum
- source SHA
- database snapshot ID where applicable
- configuration version
- recovery environment identity
- LKG identity
- deployment identity
- validation results

The recovery vault is not itself production authority.

A recovery drill must validate Origin C without changing public traffic.

## 9. Recovery transition

Controlled recovery sequence:

1. retrieve immutable recovery artifact
2. verify checksum and source identity
3. restore isolated recovery data
4. deploy Origin C
5. validate runtime and dependencies
6. execute functional probes
7. correlate evidence
8. obtain acceptance/authorization
9. update routing state
10. execute post-routing live probes
11. preserve rollback identity

No DNS rewrite is required for the traffic transition.

## 10. Secret architecture

Secret classes:

- ADMIN_API_SECRET
- RECOVERY_ACCESS_TOKEN
- provider/deployment credentials
- webhook destination secrets

Rules:

- store secrets only in provider secret stores
- never commit production secrets
- never store recovery/master credentials in ordinary routing KV
- rotate on schedule or immediately after suspected compromise
- verify new credentials before revoking old credentials
- audit rotation
- avoid secrets in telemetry payloads

Example secret strings in documentation are placeholders only.

## 11. Telemetry

Approved telemetry may report:

- promotion requested
- promotion accepted/rejected
- recovery enabled/disabled
- routing transition
- runner gate state
- deployment candidate state
- live probe state
- rollback
- secret rotation

Each event should carry:

- event
- timestamp
- environment
- actor/service
- correlation ID
- from/to state
- source/artifact identity when relevant
- result

Telemetry failure cannot authorize a promotion.

## 12. Dashboard status model

Read-only dashboard status should distinguish:

ARCHITECTURE
IMPLEMENTATION
DEPLOYED
OBSERVED
VERIFIED
ACCEPTED
AUTHORIZED
ACTIVE

These states must never be collapsed into a single “healthy” label.

Example:

SPLITTER_IMPLEMENTATION = STAGED
SPLITTER_DEPLOYMENT = UNVERIFIED
ROUTING_STATE = UNVERIFIED
RECOVERY = UNVERIFIED
PROMOTION = BLOCKED

## 13. DNS model

Cloudflare must be authoritative for the production zone before relying on the edge routing fabric.

Required authoritative evidence includes, as applicable:

- NS
- A
- AAAA
- www CNAME/redirect behavior
- recovery/candidate records
- Worker route configuration
- SSL/TLS state
- redirect behavior

Placeholder IPs and example CNAMEs must not be copied into production without verification.

DNS configuration and Worker routing are separate gates.

## 14. Release evidence bundle

A splitter promotion requires:

1. workflow/run identity
2. real runner identity
3. executed steps
4. complete logs
5. artifact identity
6. source SHA
7. origin deployment identity
8. origin health/live probe
9. LKG/recovery identity
10. authorization identity
11. routing epoch
12. pre-state
13. transition result
14. post-state
15. post-transition live probe
16. rollback target

Missing evidence blocks promotion.

## 15. Rollback

Every routing transition must retain:

- previous active origin
- new active origin
- routing epoch
- authorization identity
- timestamp
- source/artifact identity
- rollback target

Rollback is a governed state transition.

After rollback:
- probe the active origin
- correlate the resulting state
- preserve evidence
- keep the LKG immutable

## 16. Current integration with GitHub

GitHub remains:
- source authority
- workflow authority
- CI evidence authority
- release artifact authority

The current hosted-runner boundary remains a prerequisite.

Until GitHub produces real executable runner evidence:

RUNNER_GATE = BLOCKED

No splitter promotion may use the splitter itself to bypass that condition.

## 17. Current integration with AppDeploy

AppDeploy remains a candidate/deployment/QA surface where applicable.

AppDeploy “Deployment ready” does not equal production certification.

Candidate evidence must be correlated with:
- source SHA
- artifact identity
- live probe
- GitHub execution evidence
- Cloudflare deployment/routing state

## 18. Current integration with Flutter

Flutter consumes the canonical API/runtime surface.

Flutter must not:
- directly control production routing
- hold administrative routing secrets
- decide production authorization
- treat client health as production certification

Flutter build identity participates in the release evidence bundle when the candidate includes mobile changes.

## 19. Current integration with Firebase

Firebase remains responsible for assigned identity/data/backend capabilities.

The splitter does not directly mutate Firebase production data.

Recovery database restoration must occur in an isolated recovery environment and be independently verified before any controlled promotion.

## 20. Current production boundary

This architecture does not authorize:

- DNS mutation
- Worker production deployment
- splitter activation
- KV routing promotion
- Firebase production writes
- payment activation
- wallet activation
- production promotion
- LKG modification

Current canonical state:

RUNNER_GATE = BLOCKED
CI_EXECUTION = BLOCKED
CERTIFICATION = BLOCKED
PROMOTION = BLOCKED
ACTIVATION = BLOCKED
LKG = PROTECTED
MUTATION_FREEZE = ACTIVE

## 21. Acceptance chain

SOURCE
→ BUILD
→ EXECUTE
→ TEST
→ ARTIFACT
→ VERIFY
→ DEPLOY CANDIDATE
→ ORIGIN PROBE
→ SPLITTER READINESS
→ LIVE PROBE
→ ACCEPT
→ AUTHORIZE
→ ROUTING CHANGE
→ POST-ROUTING VERIFY
→ PROMOTE

No missing step may be silently inferred.

## 22. Non-goals

This system does not:
- manufacture runner evidence
- infer DNS state
- equate AppDeploy readiness with certification
- equate HTTP 200 with complete readiness
- expose administrative secrets to browsers
- automatically promote solely from health flags
- bypass GitHub runner gating
- modify the LKG on failure
- silently promote a recovery origin

## 23. Implementation status

Architecture:
DEFINED

Contracts:
DEFINED

Security model:
DEFINED

Human control model:
DEFINED

Recovery model:
DEFINED

Telemetry model:
DEFINED

Production deployment:
NOT CERTIFIED

Live routing:
NOT CERTIFIED

Recovery drill:
NOT EXECUTED

Promotion:
BLOCKED

LKG:
PROTECTED
