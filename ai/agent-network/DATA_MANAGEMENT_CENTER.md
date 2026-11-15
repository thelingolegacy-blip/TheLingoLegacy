# LINGOlegacy Data Management Center (DMC)

**Status:** Proposed control-plane specification / implementation not yet verified  
**Canonical home:** `LINGOlegacy_MASTER` governance, integrated with the existing LINGOlegacy Enterprise Control Center and the 15-agent network  
**Release posture:** PROTECTED HOLD; no production activation is authorized by this specification

## 1. Mission

The DMC is the governed control surface for data assets, agent permissions, human approvals, governance reviews, audit evidence, demos, and operational handoffs across the LINGOlegacy ecosystem. It extends existing agent-network and enterprise-control work; it is not a second identity system, agent registry, policy engine, or source of truth.

The DMC must distinguish:
- **Designed:** a documented contract exists.
- **Built:** code/configuration exists on a traceable branch.
- **Tested:** reproducible tests have executed and passed.
- **Connected:** the component is integrated with its authoritative runtime and data source.
- **Accepted / certified:** an authorized independent reviewer has accepted the required evidence.

A screen, demo, schema, or workflow definition is not proof of a connected runtime.

## 2. Human approval service for agents

Agents may classify, recommend, prepare drafts, gather evidence, and submit approval requests. Agents may not approve their own requests, approve another agent's request on behalf of the human authority, elevate their own permissions, change policy, or execute a gated action before authorization.

### Approval lifecycle

`DRAFT → SUBMITTED → POLICY_CHECKED → AWAITING_HUMAN → APPROVED | REJECTED | EXPIRED | CANCELLED → EXECUTING → VERIFIED | FAILED`

- The policy engine evaluates identity, role, resource, environment, action, risk, scope, and current holds before presenting an approval.
- Approval is bound to one immutable action proposal: actor/agent, target resource, environment, operation, exact parameter or content digest, requested scope, risk classification, preconditions, expiry, and rollback plan.
- A material change to the action, target, parameters, environment, or content digest invalidates the approval and requires a new request.
- Approval is authenticated, attributable, time-bounded, single-use, and recorded with the approver identity and policy version.
- The execution gateway re-checks authorization and preconditions immediately before execution. Approval is not a standing permission grant.
- A rejection, expiry, cancellation, missing reviewer, policy mismatch, failed precondition, or unavailable audit sink fails closed.
- No agent, including the Host/orchestrator, can satisfy the human approval requirement.
- High-impact actions require separation of duties: the requester/preparer cannot be the approver; security-sensitive changes require an independent security reviewer; production release requires the separately defined release authority.
- Emergency stop and revocation must prevent new executions and cancel queued actions where safe. An in-flight operation must enter its defined safe-stop or recovery path.

### Risk classes and default controls

| Class | Examples | Agent authority | Human control |
|---|---|---|---|
| R0 Read | Approved catalog/schema and public documentation | Scoped read | No action approval; access still authorized |
| R1 Draft | Draft reports, code proposals, test plans, internal task drafts | Prepare in isolated workspace | Review before external use |
| R2 External effect | Send messages, publish content, create third-party records | Prepare request only | Explicit action-specific approval |
| R3 Sensitive | Identity, permissions, credentials, privacy settings, financial configuration | Diagnose and propose only | Authorized human approval plus independent checks |
| R4 Destructive / production | Delete/overwrite data, revoke access, production deploy, irreversible migration | Plan and prepare only | Explicit elevated approval, backup/rollback, change window and post-check |

Current ecosystem holds override this table. In particular, approval requests cannot authorize G02 activation, production promotion, DNS/Worker changes, Firebase publication, secret mutation, payments, or paid provisioning where separate authorization is required.

## 3. RBAC and authorization model

Authorization is server-side and deny-by-default. UI visibility is not a security boundary. Every decision evaluates:

`subject × agent_identity × action × resource × project/realm × environment × purpose × context`

| Role | Read | Draft | Submit approval | Approve | Execute gated action | Policy administration |
|---|---:|---:|---:|---:|---:|---:|
| Owner / designated human authority | Scoped | Yes | Yes | Within authority | Only after controls | Separate controlled workflow |
| Governance reviewer | Scoped | Yes | Yes | Governance scope only | No | No |
| Security reviewer | Security evidence | Findings | Yes | Security gate only | No | No |
| QA / independent verifier | Evidence | Test artifacts | Findings | Acceptance evidence only | No | No |
| Agent / specialist | Explicit scope | Isolated drafts | Yes | **Never** | No gated execution | No |
| Host / orchestrator | Routing metadata | Task/handoff drafts | Yes | **Never** | No gated execution | No |
| Auditor | Read-only audit scope | Findings | No | No | No | No |
| Demo participant | Synthetic demo scope | Demo-only | No | No | No | No |

- Role grants are explicit, project/realm-scoped, environment-scoped, and time-bounded where practical.
- Use stable human and agent identities; never infer authority from display names.
- Deny unknown, disabled, suspended, revoked, stale, or mismatched identities.
- Enforce tenant/user/project/resource boundaries on every read and write.
- Privileged human sessions require strong authentication and step-up verification appropriate to the action.
- Permission changes require a separately authorized request, before/after evidence, expiry/review date, and audit event.
- Agents cannot create users, assign roles, grant scopes, alter approval policy, or change their own role.
- Access review includes owner, purpose, last use, scope, expiry, and revocation decision.

## 4. Governance review (SOS label pending owner-defined expansion)

The DMC includes a governance-review queue for policy/control assessments. The acronym **SOS is intentionally not expanded here** until its canonical meaning is confirmed; this does not block implementation of the human-approval control contract.

Each review record contains:
- review ID, type, scope, requesting owner, assigned independent reviewer;
- applicable policy/control and version;
- affected systems, datasets, agents, environments, and data classifications;
- evidence references and evidence hashes;
- findings, severity, exceptions, compensating controls, remediation owner and due date;
- decision: `PASS`, `PASS_WITH_ACTIONS`, `FAIL`, `EXCEPTION_PENDING`, or `NOT_REVIEWED`;
- reviewer identity, timestamp, rationale, expiry/re-review date, and linked follow-up work.

An exception never silently changes policy. It must identify its scope, rationale, risk owner, compensating controls, expiry, and authorized approver. Expired exceptions revert to deny/hold.

## 5. Data governance and catalog

Every governed data asset should have:
- stable asset ID, canonical owner/steward, system of record, source and destination;
- schema/version, purpose, permitted uses, realm/project scope and dependencies;
- classification (public, internal, confidential, restricted) and personal/sensitive-data flags;
- lineage, transformation history, quality rules, validation status and freshness;
- retention/deletion rule, legal/consent basis where applicable, backup and restore classification;
- access policy, sharing/export restrictions, encryption expectations and audit references.

Do not copy secrets or unnecessary personal data into agent prompts, demos, ordinary logs, or evidence packages. Retention periods must be set by approved data policy and applicable obligations; do not invent a universal duration.

## 6. Append-only audit trail and evidence

Audit events are append-only at the application contract level and should be tamper-evident in the eventual storage implementation. Corrections are compensating events, never silent edits or deletion of history.

Minimum event fields:
- event ID and schema version;
- UTC timestamp and correlation/trace ID;
- authenticated human or service subject, agent ID and session;
- action, resource ID, project/realm, environment and purpose;
- policy version, authorization decision and reason code;
- approval request ID, approver identity and decision when applicable;
- before/after hashes or redacted change summary;
- execution outcome, error classification and affected artifact references;
- source commit, workflow run, test report and artifact digest where relevant.

Never log passwords, tokens, private keys, full payment credentials, or unnecessary personal content. Restrict audit access; monitor audit-sink health. If required audit evidence cannot be durably recorded, block the gated action.

## 7. Agent handoffs and accountable ownership

Every handoff is a first-class record, not an informal chat transfer.

Required handoff fields:
- originating task and requester;
- sending and receiving agent identities;
- accountable human owner;
- purpose, bounded scope, permitted tools and prohibited actions;
- input references with provenance/classification;
- expected output and acceptance criteria;
- due time/expiry, dependencies and risk class;
- current state, attempts, escalation and cancellation status;
- evidence package, verifier, receiving-owner acceptance or rejection.

Lifecycle: `CREATED → ACCEPTED → IN_PROGRESS → READY_FOR_REVIEW → ACCEPTED | REJECTED | BLOCKED | EXPIRED | CANCELLED`.

The receiving agent cannot broaden scope. Delegation inherits the narrowest effective permissions and original task constraints. The originator remains accountable until a named owner accepts the handoff. Cycles, recursive delegation, duplicate execution, and unbounded retries must be detected and stopped.

## 8. Demo management

Demos are isolated, visibly labelled **DEMO / SYNTHETIC DATA / NON-PRODUCTION** environments.
- Use synthetic identities and records; do not copy production personal, financial, credential, or private community data.
- Disable external writes, payments, wallet transfers, public publishing, production tool adapters, and destructive operations.
- Seed deterministic scenarios for approve, reject, expire, revoke, policy mismatch, failed precondition, audit-sink failure, duplicate request, and handoff rejection.
- Record demo version, source commit, data fixture version, enabled capabilities, test results, and reset/teardown status.
- Demo approvals are simulated and must never be accepted by production execution gateways.
- Clearly separate preview UI from a live connected runtime.

## 9. Core DMC modules

1. **Data Catalog:** assets, schemas, owners, lineage, classifications and quality.
2. **Governance Review:** control library, review queue, findings, exceptions and sign-offs.
3. **Access Center:** human/agent identities, RBAC grants, scopes, expiry and access recertification.
4. **Approval Center:** pending requests, risk, action diff, evidence, approve/reject/revoke and decision history.
5. **Audit Explorer:** immutable/tamper-evident event history, filters, correlation and evidence export.
6. **Agent Handoff Desk:** task routing, acceptance, ownership, escalation and completion.
7. **Demo Lab:** synthetic scenarios, capability isolation, run evidence and reset.
8. **Data Operations:** quality, retention, backup/restore, migration and reconciliation.
9. **Certification View:** gate status with linked evidence; no manual status promotion without acceptance records.

## 10. Required tests and acceptance

### Policy and authorization
- Unknown/revoked identity denied; cross-user, cross-tenant, cross-project and cross-realm reads denied.
- Agent self-approval, Host self-approval, requester self-approval and permission escalation denied.
- Approval replay, expired approval, altered payload/digest, wrong environment and wrong resource denied.
- Policy version change or hold activation invalidates stale approvals.
- Human approval cannot grant new persistent RBAC permissions.

### Audit and handoffs
- Every allow/deny, approval decision, permission change, handoff transition and execution result produces a correlated event.
- Audit sink failure blocks gated execution.
- Redaction tests prove secrets and unnecessary personal data are absent.
- Handoff scope cannot expand; duplicate delivery is idempotent; loops and expiry are handled.
- Evidence exports include provenance and integrity checks.

### Demo and recovery
- Synthetic fixtures only; production adapters unreachable from demo.
- Reject/expire/revoke/kill-switch scenarios pass.
- Backup restore and audit-history integrity are demonstrated.
- Independent security and QA reviews are recorded.

### Certification rule
The DMC is not certified until schemas, server-side policy enforcement, durable approval records, audit storage, isolated demo runtime, integrations, tests, recovery evidence, and independent acceptance are all verified against a commit. Documentation and preview UI alone do not satisfy acceptance.

## 11. Implementation sequence

1. Reconcile this contract with the existing agent registry, permissions, collaboration protocol, and Control Center.
2. Implement schemas and deterministic policy tests in the existing isolated agent-network branch.
3. Implement read-only catalog and audit views before any write-capable UI.
4. Implement approval request persistence and a server-side authorization/approval gateway.
5. Add handoff state machine and idempotent event delivery.
6. Add synthetic-only demo fixtures and negative security tests.
7. Connect to the selected authoritative identity/data runtime only after the backend decision and environment identity are verified.
8. Run hosted tests when GitHub Actions startup is restored; preserve current startup-blocked status until real jobs, logs, and artifacts exist.
9. Obtain independent security, QA, governance and owner acceptance.
10. Keep production HOLD until separately authorized release acceptance.

## 12. Current known state and non-goals

- The existing 15-agent registry and role charter are the canonical starting point; do not create another roster.
- The existing permissions file already requires default-deny, server-side enforcement, human approval for consequential actions, and no self-approval.
- The existing runtime acceptance contract says the agent runtime is not implemented / not verified.
- This DMC specification is a proposed extension, not evidence that an approval service, audit database, RBAC enforcement, or connected runtime exists.
- No production deployment, permission broadening, secret mutation, runner activation, payment activation, data migration, or paid resource provisioning is authorized by this document.
