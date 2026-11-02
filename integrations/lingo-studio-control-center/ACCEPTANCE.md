# Integration acceptance matrix

| Gate | Static package condition | Required live evidence | Current state |
|---|---|---|---|
| ASK-01 | Manifest and OpenAPI contract parse; endpoint explicitly unconfigured | Authenticated MCP handshake, tool-schema tests, unauthorized-request rejection | BLOCKED — endpoint not deployed |
| EDGE-01 | 16 exact origins; GET/HEAD only; workers.dev only; no secrets forwarded | Worker deployment ID, per-route smoke logs, redirect and API-denial tests | PARTIAL — Worker deployed (deployment 69e9af5a30e34abf82ed485f7c52e099), workers.dev enabled, runtime smoke tests pending |
| FB-01 | Custom-claim role checks; client writes denied; Admin SDK-only mutations | Dedicated staging project, Emulator Suite tests, function logs, rules test report | BLOCKED — no Firebase project mutation |
| APP-16 | 16 distinct app IDs and HTTPS staging origins | HTTP health evidence for every origin, timestamp, status, response digest | PARTIAL — 16 deployment records ready and latest status snapshots report zero errors; direct HTTP probes pending |
| REL-01 | Acceptance function requires independently verified evidence and approver | Run/job/runner IDs, steps, logs, artifact digest, reviewer identity, human decision | BLOCKED — evidence not collected |

## Latest execution evidence

- Cloudflare Worker `lingo-studio-control-center-staging` deployed to `https://lingo-studio-control-center-staging.thelingolegacy.workers.dev` (deployment `50fdc7c7813b47deaa6474d3c585350b`). Workers.dev enabled; previews disabled; no zone routes added.
- All 16 registered AppDeploy applications report deployment status `ready`; latest status snapshots show zero frontend, network, and backend errors. These are provider status/QA observations, not independently executed HTTP probes.
- Latest commit eb53a4c283adc83fd16673c7d221362c8c248267 has three startup_failure workflow runs: 41541387681 (Lingo Legacy Static CI), 41541385229 (Crimson Smoke UI static validation), and 41541386429 (G02 Runner Image Build). Each returned zero jobs and zero artifacts; no G02 runner assignment or execution evidence was produced.

## Acceptance rule

A gate remains BLOCKED or UNKNOWN until every required live-evidence item is retrievable and independently checked. A deployment badge, source file, manifest, registry entry, queued workflow, or self-reported PASS is insufficient.

## Production rule

No production Worker route, DNS record, Firebase production project, AppDeploy production app, secret, payment path, or release promotion is changed by this package.
