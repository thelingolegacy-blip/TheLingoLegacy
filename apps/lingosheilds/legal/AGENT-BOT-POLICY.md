# LINGOsheilds Agent & Bot Policy

## Purpose

Define the operational boundary for Claude, LINGO agents, automated repair bots, security bots, evidence bots, and release bots.

## Mandatory principles

1. Agent identity is explicit.
2. Tool permissions are scoped.
3. Production credentials are never placed in model prompts.
4. Agent actions are logged.
5. Agent-generated changes require validation.
6. Security findings can block progression.
7. Agents cannot self-approve their own work.
8. Agents cannot self-authorize production promotion.
9. External model output is untrusted until validated.
10. Human/authorized acceptance remains distinct from automated analysis.

## Required audit fields

agent_id, model/provider, task_id, repository, source_sha, target_ref, tools_used, timestamp, result, evidence_id, authorization_state.

## Emergency controls

The platform must support:
- immediate agent disablement
- credential revocation
- runner isolation
- workflow cancellation
- release freeze
- evidence preservation
