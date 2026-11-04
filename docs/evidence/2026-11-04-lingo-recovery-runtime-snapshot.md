# LINGO Recovery Runtime Snapshot — 2026-11-04

**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Branch:** `studio-hub/recovery-preview-2026-11-04`  
**Scope:** read-only operational verification plus this evidence-document commit.  
**Production mutation:** none.  
**PR #451:** remains open, draft, unmerged.

## GitHub Actions

Six newest workflow runs on the inspected branch head `0c4110c7e6b8de58b55af3f53823bf0f39c37807` were created at approximately 2026-11-04 23:42 UTC and all ended `completed / startup_failure`:

| Workflow | Run ID | Result | Jobs | Artifacts |
|---|---:|---|---:|---:|
| Studio Static Validation | 41935887597 | startup_failure | 0 | 0 |
| Studio Preview Package | 41935886146 | startup_failure | 0 | 0 |
| Studio Sandbox Guard | 41935884660 | startup_failure | 0 | 0 |
| G02 Runner Image Build (no publish) | 41935883179 | startup_failure | 0 | 0 |
| Crimson Smoke UI — static validation | 41935881797 | startup_failure | 0 | 0 |
| Lingo Legacy Static CI | 41935880608 | startup_failure | 0 | 0 |

The run records resolve to their actual workflow names and paths, but the job-list and artifact-list APIs return empty arrays. No runner assignment, steps, logs, or artifact exists for these attempts. This is a pre-job failure. It is not evidence of a test assertion failure and cannot be repaired by changing application code without additional evidence.

GitHub's public status page reported Actions incidents on Nov 4 and marked them resolved at 17:01 UTC and 18:16 UTC. The six runs above were created later, around 23:42 UTC. The timing means the public incidents cannot be asserted as the cause of these later failures. GitHub's current public status page reports Actions operational. Repository-level Actions settings and control-plane diagnostics are not exposed by the connected GitHub read/write tools used in this session.

## Cloudflare production and domain observations

Account: `Thelingolegacy@gmail.com's Account`  
Zone: `thelingolegacy.com` (`active`)  
Zone ID: `91c3f6315fb3ca132b22744721103f88`

- Production Worker route `thelingolegacy.com/*` points to `thelingolegacyv-5`.
- The exact root route `thelingolegacy.com/` points to `lingo-flagship-root`.
- Current `thelingolegacyv-5` deployment is 100% on version `2d161fa5-598f-4998-ada8-7ac4c72c3461` (version 137).
- Uploaded version 208 remains preview-only; no traffic allocation to it was observed.
- The apex A record currently contains `192.0.2.0` and is proxied. Do not change it without validating the Worker-route/DNS architecture; the existing Worker routes are currently active.
- `https://thelingolegacy.com/healthz` returned HTTP 200 with body `ok`.
- The public homepage loads and labels itself a candidate experience; its destination catalog explicitly says destinations must be connected to verified routes before production activation.
- Tunnel `Legacy Loop` (`be2be937-b642-407c-bacf-b04defffb606`) is `inactive` with zero connections.

No DNS, Worker routes, Worker code, deployment allocations, tunnel tokens, or production settings were changed.

## AppDeploy staging observations

The connected AppDeploy account returned plan `free`, monthly available credits `72.838641164`, and no top-up credits. The account emitted a below-100-credit alert. Existing app status reads returned `ready` and zero frontend, network, or backend errors for:

- Studio Hub — `lingo-legacy-studio-hub-nhda3b`
- Universe Gateway — `lingolegacy-universe-gateway-h6kqu4`
- Enterprise Control Center — `lingo-enterprise-control-center-qos4ix`
- That’s My Lingo — `that-s-my-lingo-casino-studio-2xntye`
- Crazy Weasols — `crazy-weasels-0j3ujc`
- Jersey Shore: The Undead — `jersey-shore-the-undead-l4h5ea`
- askLINGO — `lingo-ai-sonic-boom-2030-7plgl2`
- LINGOloyalty preview — `lingoloyalty-staging-preview-x4ld0h`

These are platform deployment/QA snapshots, not authenticated end-to-end acceptance. The earlier AppDeploy deploy preflight returned a daily free-tier minimum-credit block for new deployments until the next UTC reset. No deployment retry was attempted in this audit.

## Remaining repair dependencies

1. **GitHub Actions control plane:** obtain repository Actions settings and check-suite/dispatcher diagnostics; run a minimal workflow only after the cause is understood. Do not modify six workflow definitions blindly.
2. **G02 host:** provide an authorized persistent host session or provisioned runner host access. The connected session has GitHub/Cloudflare access but no verified host shell/service control; tunnel is inactive.
3. **Production website:** correct and verify the live flagship route only after an approved staging candidate passes independent checks. Current homepage is a candidate experience; do not promote preview version 208.
4. **App integrations:** complete separate auth, persistence, AI provider, wallet, game, and payment tests. Keep payment activation disabled until compliance and backend checks pass.
5. **Release:** keep PR #451 draft and production protected until source SHA, actual execution, retrievable evidence, independent verification, acceptance, and explicit promotion authorization are all recorded.

## Audit boundary

This document records observed API and HTTP results. It does not claim that all LINGO services are fully operational. Existing staging deployments and the public health endpoint are reachable; GitHub Actions pre-job execution and G02 host/tunnel availability remain blocked.


## Follow-up workflow attempts after the snapshot commit

The evidence snapshot itself was committed as `5068c90dbbc243e7d3130577c915a3c0f2f2bda2`. Three PR-triggered runs were subsequently created for that exact commit and again failed before job creation:

| Workflow | Run ID | Result | Jobs | Artifacts |
|---|---:|---|---:|---:|
| Studio Sandbox Guard | 41936220970 | startup_failure | 0 | 0 |
| Studio Preview Package | 41936218040 | startup_failure | 0 | 0 |
| G02 Runner Image Build (no publish) | 41936219426 | startup_failure | 0 | 0 |

The three job-list and artifact-list calls independently returned empty arrays. This fresh reproduction on the evidence commit, after GitHub's public Nov 4 Actions incidents had been marked resolved, reinforces that the remaining issue cannot be cleared by a source-code-only change in this branch. Repository Actions settings / job-graph diagnostics and GitHub-side control-plane support are still required. No workflow rerun, settings toggle, merge, or production change was performed.
