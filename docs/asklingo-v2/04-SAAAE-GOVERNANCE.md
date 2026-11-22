# askLINGO v2.0 — Server-Side Authorization, Approval and Audit Enforcement (SAAAE)

## Purpose

SAAAE is the mandatory governance control plane for askLINGO, LINGOassist, every agent/worker, and every connected product integration. It is enforced by trusted server components, not by prompts, UI state, agent declarations, or documentation alone.

## Enforcement sequence

```text
REQUEST
  → AUTHENTICATE PRINCIPAL
  → RESOLVE TENANT / PRODUCT / RESOURCE
  → CLASSIFY OPERATION AND DATA
  → EVALUATE SERVER-SIDE POLICY
  → REQUIRE / VALIDATE APPROVAL
  → RECHECK REVOCATION AND TARGET STATE
  → EXECUTE WITH LEAST PRIVILEGE
  → RECORD OUTCOME AND EVIDENCE
  → VERIFY CORRELATION
```

## Default-deny policy

Deny when identity is absent or invalid; scope is missing or ambiguous; policy is unavailable; requested capability is not granted; approval is missing, expired, revoked, mismatched, or already consumed; resource state has changed; audit sink is unavailable for an action requiring durable audit; or any critical dependency cannot be verified.

## Approval record

Approval is a persistent, tamper-evident record containing:

- unique approval ID and schema version;
- requester and approver identities;
- requested action and canonical action digest;
- exact tenant, product, environment, resource, and scope;
- risk classification and impact summary;
- supporting plan and evidence references;
- decision, rationale, and policy version;
- created, expiry, and decision timestamps;
- single-use or bounded-use semantics;
- revocation/consumption state;
- correlation and idempotency identifiers.

Approval must be bound to the exact action digest. A material change to action, target, scope, amount, or effect invalidates approval and requires a new decision.

## Audit record

Audit events are append-only and access-controlled. Required event types include request received, identity verified, policy evaluated, approval requested/decided/revoked, operation started/completed/failed, evidence captured, verification accepted/rejected, and state transition attempted/completed.

Audit fields: event ID, timestamp, correlation ID, actor/service identity, action, resource, scope, policy version, decision, approval ID, outcome, evidence references, and integrity metadata. Avoid storing full conversation bodies, credentials, tokens, or unnecessary personal data.

## Privileged operations

Require step-up authentication and explicit human approval for production changes, access-control changes, secret rotation, DNS/Worker changes, data export/deletion affecting multiple users, financial transactions, external publication, and irreversible/destructive actions.

## Audit integrity and availability

Use an append-only or tamper-evident store with restricted write paths, integrity checks, retention policy, export controls, and independent review. If audit durability is required but unavailable, block the protected action. Audit records do not themselves prove the operation succeeded; correlate them with authoritative downstream evidence.

## Delegation

Delegated authority is narrower than or equal to the delegator's effective authority, never broader. Each hop records the original principal, delegating principal, agent/worker identity, delegated scope, expiry, and policy decision. No ambient authority.

## Conformance tests

Verify default deny, approval binding, replay prevention, revocation, time expiry, scope drift, target drift, cross-tenant isolation, audit outage, tampering detection, separation of duties, and denial of agent self-approval.
