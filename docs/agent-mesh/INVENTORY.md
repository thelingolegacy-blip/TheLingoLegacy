# Agent Mesh Inventory — Read-Only Baseline

**Assessment date:** 2026-10-26  
**Source of truth:** repository `main` as read during preparation of this proposal  
**Confidence:** partial; this is a source inventory, not a live infrastructure inventory  
**Production changes:** none

## 1. Repository and governance inventory

| Item | Observed source state | Boundary / implication |
|---|---|---|
| Canonical repository | `thelingolegacy-blip/TheLingoLegacy`, public repository, default branch `main` | Repository visibility does not prove Actions policy, runner availability, or production access. |
| Agent rules | `AGENTS.md` exists | This is the governing repository instruction set; broad legacy role descriptions do not grant actual platform permissions. |
| Agent governance | `docs/AGENT-LEADERSHIP-GOVERNANCE.md` exists | Contains older broad permission language; mesh must defer to `AGENTS.md` and current platform authorization. |
| Gate matrix | `config/release/gate-matrix.json` | Promotion rule is `ALL_CRITICAL_GATES_PASS`; not-run critical gates are blocked. |
| Master control matrix | `config/lingo-master-control-matrix.json` | Catalogs product pages/integration planes; statuses in a static file are not live health evidence. |
| G02 acceptance | `docs/G02-ACCEPTANCE-CONTRACT.md` referenced by `AGENTS.md` | Must be read and applied before any future G02 acceptance decision. |
| Inventory register | `docs/operations/wave-0-inventory-evidence-register.md` | Explicitly partial; account policies, runner inventory, Cloudflare access, and some deployment provenance remain unverified. |
| Existing recovery logic | `infra/recovery/lingo-g02-control-agent.js`, `ops/g02/recovery_agent.py` | Existing components are diagnostic/staging-bounded; do not infer they are running or connected. |
| Existing G02 PRs | PR #386 and PR #387 are draft/open/unmerged per latest inspected PR #387 metadata and repository context | Do not merge or treat proposed workflows as executed evidence. |

## 2. Release-gate matrix

The release sequence contains G00–G11. Preserve each gate as a separate state, owner, dependency set, and evidence bundle. The known canonical posture is:

| Gate | Mesh responsibility | Current baseline |
|---|---|---|
| G00 Source authority | Source/branch/commit provenance | Prior baseline recorded PASS; re-verify when acting on a specific run |
| G01 Repository | Repository and source integrity | Prior baseline recorded PASS; re-verify for each candidate |
| G02 Runner dispatch | Runner ID/name, job assignment, steps, sentinel, logs, artifact correlation | **BLOCKED** |
| G03 CI execution | Real execution evidence and tests | BLOCKED pending G02 evidence |
| G04 Certification | Independent certification against release contracts | BLOCKED |
| G05 Release candidate | Candidate identity and immutable provenance | BLOCKED |
| G06 Deployment | Authorized deployment and exact target mapping | BLOCKED |
| G07 Live validation | Independent live route/API probes | BLOCKED |
| G08 Synchronization | Source/build/runtime/configuration agreement | BLOCKED |
| G09 Activation | Separate, explicit activation authority | BLOCKED |
| G10 Post-activation | Post-change validation and monitoring | BLOCKED |
| G11 Acceptance | Independent final acceptance record | BLOCKED |

These are governance defaults, not a fresh query of every gate. No agent may change a gate state simply by writing a report.

### Critical release gates from `config/release/gate-matrix.json`

The repository defines these as critical, with no allowed warning gates: source, build, tests, security, secrets, Vercel eradication, routes, interactions, APIs, identity, games, commerce, assets, audio, motion, accessibility, performance, Cloudflare, live probes, and rollback. Each needs an evidence owner and an explicit status of `PASS`, `WARN`, `FAIL`, or `NOT_RUN`; a critical `NOT_RUN` blocks promotion.

## 3. Surface inventory

The repository tree contains a broad static/web/runtime estate and named product areas. The following are agent coverage domains, not claims that every feature is complete or live:

- **Core runtime and web:** `worker.js`, `wrangler.jsonc`, `index.html`, route/page directories, runtime contract endpoints, headers and redirects.
- **Platform APIs and governance:** runtime/platform/gates/modules/status/manifest, health probes, control plane, evidence registers, policy/configuration.
- **Identity and app:** `lingo-id`, `app`, `android`, `ios`, `lib`, Firebase configuration files and Flutter-related workflows.
- **Games and world surfaces:** `thats-my-lingo`, `casino`, `games`, `lingoarcade`, `worlds`, `universe`, `multiplayer-rap-arena`, `auto-racing-universe`, `live-casino-studio`, `kottons-code`.
- **Commerce and economy:** `loyalty-lane-apparel`, `lane`, `monetization`, `economy-command-center`, checkout/payment integration contracts.
- **Creative/media:** `media`, audio/motion/assets, creator surfaces, visual system and studio tooling.
- **AI/assistant and integrations:** `ai`, `lingo-ai`, `lingoassister`, `integrations-console-checklist`, `integration-os`, integration readiness and resource-assignment surfaces.
- **Security/trust/accessibility:** `trust-compliance`, `monetization-safety`, security headers, auth boundaries, keyboard/focus/reduced-motion/contrast acceptance.
- **Operations/observability:** `diagnostics`, `known-issues`, `launch-verification`, `day-one-monitoring`, CI workflows, release evidence and incident journals.

Coverage must be discovered from the current tree and tests, not inferred from folder names. The first runnable inventory should enumerate paths, workflow triggers/permissions/runners, package manifests, runtime entry points, and tests without reading or exposing secrets.

## 4. OS and execution matrix

| Target | Intended coverage | Present evidence / caveat |
|---|---|---|
| Linux | Hosted CI and self-hosted G02 runner | Workflow definitions exist; recent G02 runs have failed before observable job initialization. Active runner dispatch is not verified. |
| Windows | Cross-platform script/runtime compatibility where supported | No fresh Windows execution evidence collected in this inventory. |
| macOS | Apple build/test compatibility and iOS toolchain where applicable | No fresh macOS execution evidence collected in this inventory. |
| Android | Flutter/mobile build, manifest, identity, runtime contracts | Directories/workflows indicate target surface; build acceptance not established by this inventory. |
| iOS | Flutter/mobile build, signing/config shape, runtime contracts | Directory exists; signing/build state not inspected and no credentials should be exposed. |
| Containers | Docker/build context, reproducibility, image/runtime policy | Docker-related assets/workflows exist; no container build run in this phase. |
| Cloudflare Workers/Pages | Edge runtime, routes, bindings, compatibility/configuration | Repository describes Worker architecture; current production mapping and live state require fresh authorized verification. |
| GitHub-hosted CI | Workflow parsing, job initialization, step/log/artifact evidence | Recent runs show startup/empty-job evidence; root cause remains unconfirmed. |
| Self-hosted runner | Labels, runner-group access, listener polling, job assignment | Must be verified by an authorized read-only administrator check; no runner mutation is authorized. |

Do not add OS-specific jobs or claim support for an OS until the actual toolchain, project configuration, and CI requirements are confirmed.

## 5. Current G02 incident facts to preserve

The latest previously recorded control-plane run `40252186129` was `startup_failure` with empty jobs and artifacts. Related autorepair workflow records `40252181361`, `40252048885`, and `40252035494` showed an unresolved workflow/event metadata discrepancy: workflow ID `349529252` was recorded as `push` although the retrieved workflow source declared `workflow_dispatch` only. This is an investigation lead, not a confirmed root cause. Re-fetch current records before relying on this snapshot.

The control-plane collector, static validator, target sentinel, and artifact upload were not demonstrated to have executed in those runs. Do not mark their tests passed.

## 6. Access gaps and inventory limitations

- Current organization/account Actions policies, hosted-runner restrictions, runner groups, runner inventory and active polling are not verified by this source inventory.
- Current Cloudflare account identity, Worker deployment mapping, DNS, routes and Access policy are not verified here.
- Current Firebase production binding validity and secret/configuration state are not verified here.
- Current live production version, route health and rollback target require independent fresh evidence.
- No OS matrix tests were executed for this inventory.
- This inventory is static and must be refreshed before implementation decisions that depend on mutable platform state.
