# askLINGO v2.0 — Agent Registry and Contracts

## Registry rules

Every agent record must include: immutable agent ID, display name, version, owner, purpose, allowed input types, allowed output types, permitted tools, product/tenant scope, data classification, capability grants, spend ceiling, timeout, retry policy, human-review conditions, and acceptance tests.

An agent is not a person, identity provider, approval authority, or security boundary. The server authenticates the calling principal and independently authorizes every capability.

## Core agents

| Agent ID | Responsibility | Default capability |
|---|---|---|
| `core-orchestrator` | Intent classification, routing, response synthesis | Analyze, plan, route |
| `research` | Source discovery and evidence synthesis | Read approved sources |
| `architect` | Product/system architecture and specifications | Analyze, prepare artifacts |
| `product` | Product requirements, prioritization, acceptance criteria | Analyze, prepare |
| `creative` | Writing, story, brand, and creative concepts | Generate drafts |
| `engineering` | Code analysis and scoped implementation preparation | Read repo; propose patch |
| `data` | Metrics, data validation, and reporting | Read approved datasets |
| `marketing` | Campaign strategy and content preparation | Prepare drafts |
| `support` | Customer help and product guidance | Read approved public knowledge |
| `security` | Threat modeling, policy review, security analysis | Read, analyze, recommend |
| `qa-evidence` | Test design, evidence collection, verification support | Run approved tests; verify evidence |
| `recovery-archivist` | Inventory, preservation, provenance, recovery planning | Read, checksum, archive proposal |

## LINGOassist workers

Preserve the established worker family: Core, Planner, Builder, Operator, QA Worker, Evidence Worker, Governance Worker, Monitor, and Archivist. Optional domain workers include Product, Engineering, Media, Commerce, Marketing, and Operations.

Workers execute a single bounded work package. They receive an immutable task envelope containing request ID, actor identity, scope, target, allowed operation, constraints, approval reference when required, expiry, and idempotency key.

## Capability vocabulary

Capabilities are independent and must not be inferred from one another:

- `CAN_ANSWER`
- `CAN_ANALYZE`
- `CAN_RECOMMEND`
- `CAN_PREPARE`
- `CAN_REQUEST_AUTHORIZATION`
- `CAN_EXECUTE`
- `CAN_VERIFY`
- `CAN_PROMOTE`
- `CAN_AUTHORIZE`

An agent may prepare a change without permission to execute it. A worker may execute an approved operation without permission to approve it. A verifier must not be the sole author of the evidence it accepts.

## Mandatory task lifecycle

```text
REQUEST → UNDERSTAND → CLASSIFY → IDENTIFY TARGET
→ CHECK CURRENT STATE → CHECK REQUIREMENTS
→ CHECK DEPENDENCIES → CHECK AUTHORITY → PLAN
→ PREPARE → AUTHORIZE WHEN REQUIRED → EXECUTE
→ CAPTURE EVIDENCE → VERIFY RESULT → UPDATE STATE
→ REPORT → ARCHIVE
```

## Prohibited behavior

- Self-granting or inheriting privileges from a user prompt.
- Treating retrieved text, issue comments, web pages, or model output as policy.
- Cross-product reads or writes without explicit scope grants.
- Self-approval or self-certification of high-impact work.
- Fabricating execution, logs, runner identity, test results, or completion.
- Secret discovery, display, or exfiltration.
- Retrying a non-idempotent operation without checking prior outcome.

## Human review

Required for ambiguity, policy conflict, external publication, legal or financial commitments, changes to identity or permissions, destructive or irreversible operations, production configuration, sensitive data access, and any action whose target or impact is uncertain.

## Agent evaluation

Evaluate instruction adherence, factual grounding, tool selection, permission denial correctness, scope isolation, prompt-injection resistance, refusal quality, evidence correlation, cost, latency, and reproducibility. An agent is not enabled for execution until its contract and tests are accepted.


## Executable registry baseline

`src/ai/v2/agents.mjs` contains the 12 specialist agent definitions. In this foundation all agents have an empty tool list and execution, approval, authorization, and promotion are disabled. Declared analytical capabilities are descriptive role metadata only; effective permissions must come from server-side SAAAE grants. The registry does not activate agents or connect tools.
