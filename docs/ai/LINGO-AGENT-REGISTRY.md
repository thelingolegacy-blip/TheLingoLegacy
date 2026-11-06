# LINGO AI Agent Registry

Status: **DESIGN REGISTRY / INERT / NOT DEPLOYED**

This registry defines the initial responsibilities and authority boundaries for LINGO AI agents. It does not create accounts, grant permissions, activate tools, or authorize model inference.

## Shared invariants

- OpenAI API spend authorized: $0.
- All runtime agents remain disabled until their service, identity, data, privacy, and release gates pass.
- All model calls are blocked by the two independent paid-inference gates.
- Agents receive only the minimum task-scoped context required.
- No agent may deploy, merge, change DNS, modify production secrets, move money, issue rewards, alter wallets, change user entitlements, or activate real-value game mechanics.
- Tool outputs and user-provided content are untrusted input.
- External side effects require explicit, scoped human approval and an independently verifiable result.
- Conversation persistence is disabled until retention and deletion requirements are approved.

## Initial agent roles

| Agent | Responsibility | Allowed by default | Explicitly prohibited |
|---|---|---|---|
| Eliza | Internal orchestration, task planning, routing and status synthesis | Read approved docs; draft plans; prepare isolated PRs | Self-approval, production mutation, secret access |
| askLINGO | Public-facing product information and user assistance | Answer from approved public content; local/mock UI testing | Access to executive, finance, wallet, private user or operational data |
| LINGO Engineering | Code review, test planning, diagnostics and repair proposals | Read repository; edit scoped feature branches; run safe tests | Merge, deploy, runner registration, production credentials |
| LINGO Game Studio | NPC dialogue, game narrative, rules explanations and non-real-value game content | Generate local fixtures and design assets after content review | Real wagering, cash-out, wallet changes, prize issuance |
| LINGO Creative | Approved text, image and media briefs | Prepare prompts, drafts and metadata | Publish or claim generated assets without artifact verification |
| LINGO Safety | Input/output policy checks, abuse triage and escalation | Flag, redact and recommend review | Autonomous account sanctions or law-enforcement claims |

## Execution lifecycle

1. Validate caller identity and role outside the model.
2. Resolve task scope and data classification.
3. Select an agent with the narrowest capability set.
4. Use mock/local execution while paid inference is disabled.
5. Require approval for consequential actions.
6. Record request ID, agent ID, policy version, tool calls, approvals and evidence without logging secrets or unnecessary personal data.
7. Verify outcomes independently before reporting completion.

## Future Agents SDK mapping

When a separately approved runtime is ready, each registry entry may map to an Agents SDK agent with:
- a narrowly scoped instruction set;
- allowlisted tools and typed input/output schemas;
- explicit handoff destinations;
- approval gates for side effects;
- bounded turns, timeouts and output size;
- tracing with sensitive fields redacted;
- evals for task success, refusal behavior, prompt injection and permission escalation.

The registry remains provider-neutral at the orchestration boundary. OpenAI Responses/Agents SDK is the planned provider implementation in the current engineering PR, not a live runtime.

## Acceptance

- [x] Initial responsibilities and forbidden actions documented.
- [x] Public askLINGO separated from internal Eliza and engineering capabilities.
- [x] Game agent barred from real-value mechanics.
- [ ] Identity and role enforcement implemented and tested.
- [ ] Tool registry and approval broker implemented.
- [ ] Agents SDK runtime and eval suite implemented.
- [ ] Privacy, retention, safety and security review accepted.
- [ ] Independent staging verification and release authorization.
