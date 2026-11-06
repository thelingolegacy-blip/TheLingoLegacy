# Master Chat and Agent Collaboration Runtime Acceptance

Status: Not implemented / not verified. This checklist is the acceptance contract.

## Gate MC-01 — Identity and authentication
- Authenticate human users and service identities.
- Resolve stable agent IDs from the canonical registry.
- Reject unknown, disabled, suspended or revoked identities.
- Verify tenant, user, project and channel membership on the server.

## Gate MC-02 — Durable Master Chat
- Persist channels, conversations, messages, attachments and read state.
- Support direct messages, group threads, mentions and search.
- Apply retention, export and deletion policies.
- Prevent cross-project and cross-user data leakage.

## Gate MC-03 — Agent collaboration
- Deliver internal messages between distinct agent runtimes.
- Support help requests, specialist routing, handoffs and task-linked threads.
- Prevent delegation loops and runaway agent-to-agent conversations.
- Preserve originating task accountability.

## Gate MC-04 — Daily scheduler
- Build daily plans from source-of-truth project records, tasks, PRs, issues, holds and due dates.
- Respect workspace timezone and configurable working windows.
- Avoid duplicate assignments and capacity overcommitment.
- Preserve unfinished work and historical decisions.

## Gate MC-05 — Tool gateway
- Enforce per-agent, per-project, per-resource and per-environment capabilities server-side.
- Bind every tool call to an authenticated session and policy decision.
- Require human approval for external writes, financial actions, credential changes, destructive operations and production changes.
- Ensure model prompts cannot grant permissions.

## Gate MC-06 — Provider adapters
- Connect approved model providers through isolated adapters.
- Keep provider secrets server-side.
- Support model allowlists, version pinning, budgets, rate limits, timeout, retry and fallback.
- Record provider/model usage without exposing sensitive prompts unnecessarily.

## Gate MC-07 — Observability and control
- Audit messages, handoffs, tasks, approvals and tool outcomes.
- Provide per-agent pause and network-wide kill switch.
- Support cancellation, timeout, retry and incident handling.
- Provide backup, restore and rollback procedures.

## Gate MC-08 — Independent verification
- Unit and schema tests.
- Authorization and cross-tenant isolation tests.
- Agent-to-agent delivery and handoff integration tests.
- Daily schedule correctness and carryover tests.
- Tool gateway denial/approval tests.
- Load, resilience and browser/mobile QA.
- Retrievable logs and artifacts correlated to source commit and test run.
- Independent Datrell review and Dialoe security review.

## Activation rule

A static UI, architecture document, provider API key, or successful build alone does not pass these gates. Runtime activation requires all applicable tests, independent evidence, explicit human acceptance and separate production authorization. Until then, the console must clearly display PREVIEW / RUNTIME NOT CONNECTED.
