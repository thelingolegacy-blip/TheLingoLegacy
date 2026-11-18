# Identity, Access, Authorization & Approval Standard

## Core distinctions

- **Authentication (AuthN):** verifies who or what is connecting.
- **Access:** the ability to reach a resource or interface.
- **Authorization (AuthZ):** evaluates whether the authenticated principal may perform a specific action on a specific resource under current policy.
- **Approval:** a recorded human decision by an authorized approver for a defined scope and time.
- **Acceptance:** an independent quality/operational decision that a deliverable meets its criteria.
- **Release authorization:** explicit permission to promote an accepted immutable artifact to a named environment.

None of these concepts substitutes for another.

## Identity requirements

- Unique human identities; no shared operator accounts.
- Service identities are separate from human identities and have named owners.
- OIDC/OAuth issuer, audience, signature, expiry, nonce/state and key-rotation validation.
- MFA for privileged access; phishing-resistant MFA preferred for administrators.
- Session rotation, expiry, revocation and secure account recovery.
- Account lifecycle: request → verify identity → provision → review → suspend/revoke → retain audit.
- Separate development, staging and production identities and credentials.
- No tokens or secrets in browser bundles, local storage, URLs, screenshots, logs or exported files.

## Authorization model

Use deny-by-default RBAC with contextual ABAC constraints. Evaluate:

- Principal and role.
- Resource, realm, tenant and environment.
- Action and data classification.
- Device/session assurance where applicable.
- Change window, ticket and approval reference.
- Grant start/end and emergency status.

Suggested roles (permissions are policy-defined, not implied by title):

| Role | Typical responsibility |
|---|---|
| Viewer/Auditor | Read authorized records and evidence |
| Contributor | Submit changes and evidence |
| Operator | Execute approved non-production procedures |
| Recovery Operator | Execute explicitly authorized recovery scope |
| Security Reviewer | Review security and privacy evidence |
| Evidence Reviewer | Validate provenance and test evidence |
| Product Owner | Define product acceptance criteria |
| Release Manager | Coordinate accepted release candidate |
| Production Approver | Approve scoped production change |
| Platform Administrator | Manage platform configuration under dual control |
| Break-glass Custodian | Initiate time-limited emergency process |

## Approval workflow

1. Requester creates a change/privilege request with exact scope.
2. Policy engine checks role, resource, environment, risk, conflicts and prerequisites.
3. Required approvers review evidence and impact.
4. Independent approver records approve/reject with rationale and expiry.
5. Authorization service issues a narrowly scoped, short-lived grant.
6. Execution service rechecks policy at action time.
7. Immutable audit records request, decision, grant, action and result.
8. Grant expires or is revoked; post-action review closes the record.

The requester must not self-approve a high-risk change. The executor and independent verifier must be different people for critical production actions.

## Risk-based approvals

| Risk | Minimum control |
|---|---|
| Read-only | Authenticated, least-privilege scope |
| Routine reversible non-production | Owner approval and logged change |
| Sensitive data/config | Data/security owner review and time-bound grant |
| Production deployment | Product acceptance + independent release approval |
| Identity, payment, tenant isolation, destructive data | Dual control, security/data owner and explicit change approval |
| Emergency recovery | Incident commander + authorized approver, narrow scope, automatic expiry and retrospective review |

Emergency override must never bypass authentication, tenant isolation, privacy, immutable audit or baseline security controls. It cannot be an unbounded admin token. Limit it to one incident, exact resources/actions and a short maximum duration (default 30 minutes unless policy specifies less); automatically expire and require independent post-use review.

## Access review and revocation

- Review privileged grants at least quarterly and after role/owner changes.
- Revoke immediately on departure, compromise, scope completion or policy violation.
- Detect dormant, excessive, duplicate and orphaned service accounts.
- Rotate credentials after exposure and document affected systems.
- Preserve audit records under approved retention policy.

## Required audit event fields

`event_id, actor_id, principal_type, authn_method, role, action, resource_id, realm_id, tenant_id, environment, request_id, approval_ids, policy_version, grant_id, timestamp_utc, outcome, reason_code, source_ip/device_context_if_approved, correlation_id`

Never log credentials, raw tokens, recovery codes, private memory content or unnecessary personal data.
