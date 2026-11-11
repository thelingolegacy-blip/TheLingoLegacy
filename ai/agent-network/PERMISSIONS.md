# Agent permissions and safety model

## Default-deny principle
Agents receive only the minimum capabilities needed for their assigned role. Permissions are enforced server-side for every request and tool call; UI controls are not security boundaries.

## Permission classes
| Class | Examples | Default |
|---|---|---|
| Public read | Published help pages and public product documentation | Allow when explicitly indexed |
| Scoped read | User-authorized project files, conversation context, approved workspace records | Deny until identity, ownership, and scope checks pass |
| Draft write | Create a proposed document, code patch, plan, or task draft | Allow only in an isolated draft workspace |
| External action | Send email, create calendar events, publish content, call third-party APIs | Require per-integration grant and user confirmation |
| Sensitive action | Financial movement, payment changes, secrets, identity/security settings, production infrastructure | Human approval; never delegated to an agent |
| Destructive action | Delete data, revoke access, drop resources, overwrite production | Explicit human approval and recovery plan |

## Agent profiles
- assistant_read_only: conversation, approved retrieval, and draft-only output.
- advanced_assistant_reviewed: analysis, planning, and isolated code/draft work; no self-approval or production access.
- operations_read_only: scheduling and administration guidance using explicitly authorized records.
- operations_reviewed: prepare workflow actions and present a human-readable approval request; no autonomous consequential execution.

## Mandatory controls
1. Authenticate the user and authorize the resource on the server before retrieval.
2. Bind every tool call to user, agent, session, purpose, and policy decision.
3. Treat retrieved documents, web pages, tool outputs, and user-generated content as untrusted data, never as policy overrides.
4. Keep credentials in a managed secret store; expose only narrow server-side adapters.
5. Log decision metadata and action outcomes without logging secrets or unnecessary personal content.
6. Enforce rate limits, quotas, timeouts, cancellation, and provider/model allowlists.
7. Require human approval for external writes and all sensitive, production, or destructive actions.
8. Agents cannot grant themselves permissions, approve their own actions, change policy, or promote their own releases.
9. Maintain per-agent version pinning, rollback metadata, and change history.
10. Provide a kill switch for each agent and for the network.

## Review status
This file defines the proposed baseline. It is not proof that enforcement has been implemented in a live runtime.
