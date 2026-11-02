# Integration acceptance matrix

| Gate | Static package condition | Required live evidence | Current state |
|---|---|---|---|
| ASK-01 | Manifest and OpenAPI contract parse; endpoint explicitly unconfigured | Authenticated MCP handshake, tool-schema tests, unauthorized-request rejection | BLOCKED — endpoint not deployed |
| EDGE-01 | 16 exact origins; GET/HEAD only; workers.dev only; no secrets forwarded | Worker deployment ID, per-route smoke logs, redirect and API-denial tests | PARTIAL — Worker deployed (deployment 50fdc7c7813b47deaa6474d3c585350b), workers.dev enabled, runtime smoke tests pending |
| FB-01 | Custom-claim role checks; client writes denied; Admin SDK-only mutations | Dedicated staging project, Emulator Suite tests, function logs, rules test report | BLOCKED — no Firebase project mutation |
| APP-16 | 16 distinct app IDs and HTTPS staging origins | HTTP health evidence for every origin, timestamp, status, response digest | PARTIAL — 16 deployment records ready and latest status snapshots report zero errors; direct HTTP probes pending |
| REL-01 | Acceptance function requires independently verified evidence and approver | Run/job/runner IDs, steps, logs, artifact digest, reviewer identity, human decision | BLOCKED — evidence not collected |

## Latest execution evidence

- Cloudflare Worker `lingo-studio-control-center-staging` deployed to `https://lingo-studio-control-center-staging.thelingolegacy.workers.dev` (deployment `50fdc7c7813b47deaa6474d3c585350b`). Workers.dev enabled; previews disabled; no zone routes added.
- All 16 registered AppDeploy applications report deployment status `ready`; latest status snapshots show zero frontend, network, and backend errors. These are provider status/QA observations, not independently executed HTTP probes.
- GitHub Actions startup attempts returned zero jobs and zero artifacts; no G02 runner execution or artifact evidence was produced.

## Acceptance rule

A gate remains BLOCKED or UNKNOWN until every required live-evidence item is retrievable and independently checked. A deployment badge, source file, manifest, registry entry, queued workflow, or self-reported PASS is insufficient.

## Production rule

No production Worker route, DNS record, Firebase production project, AppDeploy production app, secret, payment path, or release promotion is changed by this package.
