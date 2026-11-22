# askLINGO v2.0 — Identity and Authorization Model

## Identity classes

1. Human user — authenticated account subject.
2. Service identity — non-human application or integration principal.
3. Agent identity — registered agent instance with a scoped service identity.
4. Worker identity — execution identity for a bounded job.
5. Reviewer/approver identity — human or separately authorized approval principal.

Each identity has a stable subject ID, issuer, status, tenant/product scope, credential type, issued-at/expiry, and revocation state. Secrets and raw tokens are never stored in ordinary application records.

## Authentication

- Verify signed identity tokens server-side using issuer/audience/key validation.
- Validate expiry, not-before, signature, issuer, audience, and relevant claims.
- Reject client-supplied identity claims that are not cryptographically bound to a verified token.
- Revalidate privileged sessions and check revocation at action time.
- Use short-lived, audience-restricted service credentials and workload identity where supported.
- Never embed provider, database, or administrative secrets in web/mobile bundles.

The existing repository has not established Firebase Auth as active; its integration notes identify placeholder Firebase configuration. Do not mark Firebase identity ready until real staging configuration and live verification exist.

## Authorization model

Use RBAC for stable role bundles and ABAC for context-sensitive policy. A decision must evaluate:

- subject and identity status;
- requested action and resource;
- tenant and product;
- resource owner and classification;
- environment (development, staging, production);
- session assurance and authentication age;
- time, jurisdiction, and applicable policy;
- purpose and data minimization;
- approval requirements and approval status;
- current revocation state.

Default decision is DENY. Missing attributes, unavailable policy service, stale grants, ambiguous targets, or conflicting rules produce DENY/BLOCKED.

## Scope model

Every grant is bounded by tenant, product, resource type, resource ID or selector, operation, environment, and validity period. Wildcard/global grants are prohibited by default and require a separately reviewed exception.

## Separation of duties

- Requester cannot approve their own consequential action.
- Agent cannot approve its own plan.
- Executor cannot alter the approval record.
- Evidence author cannot be the only independent verifier.
- Release promoter cannot self-certify production readiness.

## Revocation

Revocation must invalidate the relevant session/grant at the authoritative server-side enforcement point. Cache TTL and propagation are measurable. A stale cache cannot be used to permit a high-impact operation. If revocation state cannot be checked, deny.

## Authorization response

Every decision returns a structured internal record: decision ID, allow/deny, reason code, policy version, subject, action, resource, scope, evaluated attributes, approval reference, timestamp, and correlation ID. Client responses expose only safe reason codes.

## Testing

Test valid grants, missing claims, wrong tenant/product, wrong resource, wrong environment, expired credentials, revoked users, stale sessions, policy outage, conflicting rules, replay, privilege escalation, cross-agent delegation, and self-approval attempts.
