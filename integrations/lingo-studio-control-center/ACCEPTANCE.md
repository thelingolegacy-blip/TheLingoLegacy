# Integration acceptance matrix

| Gate | Static package condition | Required live evidence | Current state |
|---|---|---|---|
| ASK-01 | Manifest and OpenAPI contract parse; endpoint explicitly unconfigured | Authenticated MCP handshake, tool-schema tests, unauthorized-request rejection | BLOCKED — endpoint not deployed |
| EDGE-01 | 16 exact origins; GET/HEAD only; workers.dev only; no secrets forwarded | Worker deployment ID, per-route smoke logs, redirect and API-denial tests | BLOCKED — source only |
| FB-01 | Custom-claim role checks; client writes denied; Admin SDK-only mutations | Dedicated staging project, Emulator Suite tests, function logs, rules test report | BLOCKED — no Firebase project mutation |
| APP-16 | 16 distinct app IDs and HTTPS staging origins | HTTP health evidence for every origin, timestamp, status, response digest | BLOCKED — registry is not health evidence |
| REL-01 | Acceptance function requires independently verified evidence and approver | Run/job/runner IDs, steps, logs, artifact digest, reviewer identity, human decision | BLOCKED — evidence not collected |

## Acceptance rule

A gate remains BLOCKED or UNKNOWN until every required live-evidence item is retrievable and independently checked. A deployment badge, source file, manifest, registry entry, queued workflow, or self-reported PASS is insufficient.

## Production rule

No production Worker route, DNS record, Firebase production project, AppDeploy production app, secret, payment path, or release promotion is changed by this package.
