# Integration acceptance matrix

| Gate | Static package condition | Required live evidence | Current state |
|---|---|---|---|
| ASK-01 | Manifest and OpenAPI contract parse; endpoint explicitly unconfigured | Authenticated MCP handshake, tool-schema tests, unauthorized-request rejection | BLOCKED — endpoint not deployed |
| EDGE-01 | 16 exact origins; GET/HEAD only; workers.dev only; no secrets forwarded | Worker deployment ID, per-route smoke logs, redirect and API-denial tests | PARTIAL — current deployment record 3e86b188-1697-414c-b7bd-637e5eccdc5e serves version 6827a64d-53b6-4b96-93fe-89fb864ff4d9 at 100%; workers.dev enabled, previews disabled, no zone routes; runtime probe execution pending |
| FB-01 | Custom-claim role checks; client writes denied; Admin SDK-only mutations | Dedicated staging project, Emulator Suite tests, function logs, rules test report | BLOCKED — no Firebase project mutation |
| APP-16 | 16 distinct app IDs and HTTPS staging origins | HTTP health evidence for every origin, timestamp, status, response digest | PARTIAL — 16 deployment records ready and latest status snapshots report zero errors; direct HTTP probes pending |
| REL-01 | Acceptance function requires independently verified evidence and approver | Run/job/runner IDs, steps, logs, artifact digest, reviewer identity, human decision | BLOCKED — evidence not collected |

## Cloudflare deployment reconciliation

Cloudflare's deployment and version APIs were read directly for `lingo-studio-control-center-staging`. The latest deployment is the first record and is serving 100% of traffic.

| History | Deployment record ID | Worker version ID | Traffic |
|---|---|---|---:|
| Current | `3e86b188-1697-414c-b7bd-637e5eccdc5e` | `6827a64d-53b6-4b96-93fe-89fb864ff4d9` | 100% |
| Previous | `7f4d6a26-3866-405c-9909-0b58693bd134` | `69e9af5a-30e3-4abf-82ed-485f7c52e099` | Historical |
| Previous | `5b3da71c-3b04-4758-bb3d-feb44d3b452b` | `50fdc7c7-813b-47de-aa64-74d3c585350b` | Historical |
| Earliest | `fc5d79bb-712d-42ef-8ed0-1fd0788b1854` | `048b74be-cb67-4099-983e-574d72153ab5` | Historical |

The user-supplied identifier `048b74becb674099983e574d72153ab5` is the earliest Worker version ID with UUID separators omitted; it is not a deployment record ID. The additional supplied tag `cbf77cdb34764bc282f235de0e8be6c8` does not match any of the four Worker versions returned by Cloudflare's version-list API and remains unverified. Do not substitute either identifier for the active deployment/version pair above.

## Latest execution evidence

- Worker: `lingo-studio-control-center-staging` at `https://lingo-studio-control-center-staging.thelingolegacy.workers.dev`; workers.dev enabled, previews disabled, no zone routes added, 16 explicit origins registered.
- The four deployment records are history for one Worker. Retain them as rollback/audit history; do not delete them as duplicates.
- All 16 registered AppDeploy applications report deployment status `ready`; latest status snapshots show zero frontend, network, and backend errors. These are provider status/QA observations, not independently executed HTTP probes.
- Current PR head `72783a4232b047a1561848ac1deddde93b1e2f7f` has three GitHub Actions runs: 41541831211 (Lingo Legacy Static CI), 41541828855 (G02 Runner Image Build), and 41541827404 (Crimson Smoke UI static validation). All concluded `startup_failure`; each has zero jobs and zero artifacts. No runner assignment, execution steps, logs, or artifact evidence was produced.
- PR #445 compares cleanly with `main`: 9 commits ahead, 0 behind, 14 new files, no changed/deleted base files. It is mergeable at the Git level but remains draft and has no successful required checks. It is not ready to merge.

## Acceptance rule

A gate remains BLOCKED or UNKNOWN until every required live-evidence item is retrievable and independently checked. A deployment badge, source file, manifest, registry entry, queued workflow, or self-reported PASS is insufficient.

## Production rule

No production Worker route, DNS record, Firebase production project, AppDeploy production app, secret, payment path, or release promotion is changed by this package.
