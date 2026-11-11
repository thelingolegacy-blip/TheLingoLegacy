# Agent Collaboration and Handoff Protocol

Status: Contract specification; runtime implementation pending.

## Message envelope

Every internal message must include:
- message_id
- conversation_id and channel_id
- sender_agent_id
- recipient_agent_ids (one or more)
- project_id (required for project work)
- task_id (when task-related)
- message_type: message | help_request | handoff | decision | progress | blocker | evidence | approval_request | announcement
- body
- artifact_refs (authorized references only)
- sensitivity: public_internal | project_confidential | restricted
- created_at (UTC)
- correlation_id
- policy_decision_id

## Help request

A help request must identify:
- requesting agent and accountable task owner;
- precise blocker and attempted steps;
- required specialty or capability;
- relevant project and permitted context;
- expected deliverable;
- urgency and due window;
- approval or access boundary, if any.

The coordinator should invite the smallest useful specialist group. Agents may add another specialist when justified, recording the reason.

## Handoff lifecycle

`requested → accepted → in_progress → review → returned → integrated → closed`

Alternative terminal states: `blocked`, `cancelled`, `expired`.

A handoff must never silently transfer accountability. The originating task owner remains responsible until the receiving agent explicitly accepts ownership or the task is reassigned by an authorized coordinator.

## Disagreement and decision rules

- Specialists provide evidence, assumptions, risks and a recommendation.
- The task owner integrates technical recommendations.
- Datrell independently checks test claims.
- Dialoe independently reviews security-sensitive work.
- Neveah facilitates resolution but cannot waive policy.
- Founder decisions are requested only for reserved decisions, material trade-offs or required approvals.
- If evidence is incomplete, status remains `unverified`; do not manufacture consensus.

## Anti-loop and workload controls

- Set maximum delegation depth and message/turn budgets per task.
- Detect repeated identical help requests and circular handoffs.
- Use task deadlines, cancellation and escalation.
- Avoid broadcasting every question to all 15 agents.
- Neveah routes by capability and current workload.
- Agents must return a concise outcome and durable task update, not endless chat.

## Tool invocation

All tool calls go through a server-side policy gateway. A model prompt is not an authorization mechanism. The gateway evaluates identity, role, project scope, resource, operation, environment, risk, user grant and approval state on every call.

## Audit

Record sender, recipient, purpose, project, task, timestamps, tool identifiers, policy decision, approval reference, result state and evidence reference. Do not log secrets or unnecessary message content.
