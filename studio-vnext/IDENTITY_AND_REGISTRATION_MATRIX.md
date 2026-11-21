# G02 Identity, Host, Agent, and Bot Registration Matrix

## Authority boundary

This document is a tracking inventory, not an assertion that any host, runner, agent, or bot is live. Repository artifacts and proposed identifiers do not create runtime identities. No credentials are stored here.

| Resource | Proposed/canonical label | Verified state | Required evidence |
|---|---|---|---|
| Linux host | `lingo-legacy-g02` | NOT INSPECTED IN THIS SESSION | Read-only host telemetry, reviewed by an administrator |
| GitHub runner | `runner-lingo-legacy-g02-prod-01` | PROPOSED NAME ONLY | Repository runner inventory with numeric runner ID, status, labels, and host mapping |
| Runner label | `lingo-g02` | WORKFLOW REQUIREMENT | Runner inventory confirming exact label on an isolated least-privileged runner |
| Sentinel workflow | `g02-self-hosted-sentinel.yml` | SOURCE COMMITTED; NOT DISPATCHED | Real workflow run, assigned job, sentinel output, retrievable logs and artifact |
| Proposed tracking IDs | 25 values in `proposed-tracking-id-registry.json` | UNASSIGNED / UNVERIFIED | Approved mapping to a real resource; never use as GitHub runner IDs |
| Agent catalog | Studio VNext blueprints | DESIGN/TEMPLATE ONLY | Agent implementation, access scope, owner, evaluation, runtime health and audit evidence |
| Bot catalog | Workflow/tool templates | DESIGN/TEMPLATE ONLY | Explicit identity, permission review, event scope, execution evidence and rollback owner |

## Identifier rules

- `proposed_tracking_id` is a correlation token only. It is not a GitHub runner ID, host ID, agent ID, bot account, or credential.
- Numeric runner IDs must be read from GitHub runner inventory or qualifying administrator evidence.
- Do not put registration tokens, PATs, private keys, environment dumps, or secrets into repository files or issue comments.
- Do not name an actual runner `prod` or grant production access until its trust boundary, labels, network access, and permissions are independently reviewed. Prefer a dedicated non-production diagnostic runner.
- Agent and bot templates are not activated services. Keep their credentials absent and capabilities disabled until each has a least-privilege permission matrix and tests.
- No production mutations, deployment, DNS/network changes, merge, or release-gate promotion are authorized by this matrix.

## G02 pass predicate

A human reviewer must confirm: runner is registered and online; numeric runner ID and exact labels are known; the intended job was assigned to that runner; sentinel executed; logs are retrievable; artifact checksum validates; and the evidence corresponds to the approved commit and incident reference. Until all are true, G02 remains BLOCKED.
