# askLINGO v2.0 — Policy Primitive Contract

## Scope

The v2 policy module is an isolated, deterministic policy primitive. It is not a complete SAAAE service, identity provider, durable grant registry, approval database, audit store, or production enforcement point.

## Current implementation

`src/ai/v2/policy.mjs` provides:

- default-deny identity and scope evaluation;
- exact matching across subject, tenant, product, resource type, resource ID, operation, environment, capability, validity window, and grant status;
- rejection of wildcard resource/tenant/product scopes;
- high/critical risk and explicit approval-required signaling;
- canonical JSON action hashing using SHA-256;
- approval snapshot validation for requester/approver separation, action digest, scope, expiry, status, and consumption state.

## Trust contract

The caller must supply a principal marked verified only after a trusted server-side verifier succeeds. Client-supplied `verified`, subject, grants, risk tier, and approval state are never trusted in a live request. A production service must obtain those values from authoritative server-side identity, policy, and approval adapters.

## Approval atomicity requirement

`evaluateAskLingoApproval` validates a record snapshot only. Before execution, a persistent approval adapter must atomically compare-and-consume the approval ID, exact action digest, requester, scope, expiry, revocation state, and unused state. A read-then-write sequence without atomicity is insufficient and vulnerable to replay.

## Audit requirement

No execution integration is included in this primitive. A future orchestrator must durably record an intent event before consequential execution and correlate the authoritative downstream result, evidence, and independent verification. If required audit persistence is unavailable, fail closed. An action that may have executed but cannot be verified must be reported as UNKNOWN / NOT VERIFIED, never success.

## Explicit non-claims

- No production route imports this module.
- No production grant or approval store is connected.
- No durable audit sink is connected.
- No agent or worker is enabled to execute actions.
- Unit tests do not certify the policy as production-ready.
