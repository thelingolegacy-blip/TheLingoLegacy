# LINGOlegacy Organization-Wide Repository Reconciliation
**Audit date:** 2026-11-14  
**Organization:** `thelingolegacy-blip`  
**Canonical authority:** `thelingolegacy-blip/TheLingoLegacy` on `main`  
**Recovery branch:** `recovery/org-wide-reconciliation-2026-11-14`

## Executive disposition

- **38 repositories** are visible to the connected GitHub identity. All 38 returned admin/maintain/push permissions in the organization inventory.
- Keep `TheLingoLegacy` as the authoritative governance and release-control repository. Do not promote a duplicate master/hub repository by name or age alone.
- Treat repository classifications in `infrastructure/registry/repositories.json` as provisional until source ancestry, ownership, build, deployment and runtime evidence are reconciled.
- **Actions/G02 remains BLOCKED / UNVERIFIED.** Latest canonical Actions runs on 2026-11-14 terminate as `startup_failure`; the G02 image build and other workflows have zero instantiated jobs. This is an Actions dispatch/startup failure, not evidence of an application test failure.
- Several older active-candidate repositories have job records that fail before any steps execute. Their step lists are empty and log downloads return `BlobNotFound`; this is not enough evidence to diagnose source-level build failures.
- Runner inventory, repository/org Actions permissions, and branch protection are not available through the current GitHub connector/API surface (403/unsupported responses previously observed). Do not infer that no runner exists; report it as unverified.
- No repositories were deleted, archived, force-pushed, reset, merged, or deployed during this audit.

## Repository inventory and disposition

The classifications below preserve the current registry's intent. They are not a claim that every app has passed runtime QA.

| Repository | Registry status | Audit disposition |
|---|---|---|
| `-the-lingo-legacy-master` | REFERENCE_ONLY | Preserve as master blueprint candidate; reconcile ancestry before reuse |
| `thelingolegacy-hub` | ACTIVE_CANDIDATE | Inspect source/deployment; branch name is unusual (`main-/-root⁠`) |
| `LingoLegacy-MasterBlueprint` | REFERENCE_ONLY | Preserve workflow/blueprint references; historical workflow failures |
| `thelingolegacy-hub-` | DEPRECATED_STUB | Empty; archive only after dependency and link checks |
| `-the-lingo-legacy-hub` | REFERENCE_ONLY | README-only reference |
| `ZavioneLingo` | ACTIVE_CANDIDATE | Artist/media surface; runtime not verified |
| `kottens-code-engine` | REFERENCE_ONLY | Documentation/reference companion; do not merge without ancestry proof |
| `LINGO_LEGACY_HQ` | ACTIVE_CANDIDATE | Control-plane candidate; historical runner probes failed pre-step |
| `thelingolegacy-blip-REPO-` | REFERENCE_ONLY | Architecture/reference candidate; compliance job had no steps |
| `TheLingoLegacy` | CANONICAL | Sole authoritative source/release authority |
| `Kotton-code-engine` | ACTIVE_CANDIDATE | Product implementation candidate; CI failures need fresh job/log evidence |
| `Loyaltylaneapparel` | ACTIVE_CANDIDATE | Apparel/commerce surface; historical build failed pre-step |
| `Lingolegends` | ACTIVE_CANDIDATE | Content candidate; no Actions runs observed |
| `Devontray` | REFERENCE_ONLY | Empty/readme candidate; no Actions runs observed |
| `Theriseofzavione` | ACTIVE_CANDIDATE | Media project; no Actions runs observed |
| `Github` | REFERENCE_ONLY | Tooling reference |
| `Tricia-escape-` | ACTIVE_CANDIDATE | LINGOarcade candidate; no Actions runs observed |
| `LingoLegacy-` | REFERENCE_ONLY | Empty placeholder |
| `thats_my_lingo_app` | DEPRECATED_STUB | Empty; active implementation candidate is `THATS-MY-LINGO` |
| `lingo_backend` | DEPRECATED_STUB | Empty initial repository; no independent backend found |
| `lingo_admin_console` | ACTIVE_CANDIDATE | Admin-console candidate; no Actions runs observed |
| `lingo_website` | ACTIVE_CANDIDATE | Website candidate; content/build ownership unverified |
| `lingo_documentation` | REFERENCE_ONLY | Documentation repository; no independent app runtime |
| `lingo_assets` | ACTIVE_CANDIDATE | Asset library; licensing/provenance and build use need review |
| `codemagic-docs` | REFERENCE_ONLY | Build-tool documentation; default branch is `master` |
| `THATS-MY-LINGO` | ACTIVE_CANDIDATE | Primary game implementation; historical quality-gate jobs failed before steps |
| `nextjs-boilerplate` | REFERENCE_ONLY | Starter template; do not treat as product |
| `chatbot` | ACTIVE_CANDIDATE | AI/chat surface; provider policy and secret boundaries need review |
| `angular` | REFERENCE_ONLY | Framework/template candidate |
| `django` | REFERENCE_ONLY | Backend starter/template |
| `TheLingoLegacy-Web` | ACTIVE_CANDIDATE | Web/Studio surface; reconcile with canonical web ownership and Cloudflare |
| `nextjs` | REFERENCE_ONLY | Starter template; compare with `nextjs-boilerplate` |
| `lingo-legacy-` | REFERENCE_ONLY | Empty/reference placeholder |
| `Spades_is_my-lingo` | DEPRECATED_STUB | Empty; active implementation candidate is `Spades-is-my_Lingo` |
| `Spades-is-my_Lingo` | ACTIVE_CANDIDATE | Primary Spades candidate; wallet/progression client-write risks remain gated |
| `Tv-os` | ACTIVE_CANDIDATE | TV app candidate; implementation/runtime unverified |
| `Backend` | DEPRECATED_STUB | Empty repository |
| `Games` | ACTIVE_CANDIDATE | Game collection candidate; runtime and ownership unverified |

## CI / runner evidence

### Canonical repository

Latest observed run set on 2026-11-14 (commit `366134684ac574b9960450549a1c6dba130c2be5`):
- LINGOmedia Creator Studio CI — `startup_failure`
- Crimson Smoke UI — static validation — `startup_failure`
- G02 Runner Image Build (no publish) — `startup_failure`
- Lingo Legacy Static CI — `startup_failure`

A separate recent Actions snapshot showed the same failure pattern across canonical workflows. The G02 image workflow has no job record, runner identity, steps, logs or artifacts. Therefore the required acceptance evidence remains absent:
- runner ID greater than zero and non-empty runner name;
- runner labels `self-hosted, linux, x64, lingo-g02`;
- expected runner service registration;
- hosted Ubuntu smoke job separately completing;
- instantiated and completed workflow steps;
- correlated run, job, commit, logs and artifacts.

### Cross-repository CI observations

Historical Actions runs were found in `LINGO_LEGACY_HQ`, `Kotton-code-engine`, `Loyaltylaneapparel`, `THATS-MY-LINGO`, `LingoLegacy-MasterBlueprint` and `thelingolegacy-blip-REPO-`. In the sampled runs, job records existed but step arrays were empty; log downloads returned `BlobNotFound`. Re-run only after the dispatch/log retrieval path is understood, to avoid creating more uninformative attempts.

### Required recovery sequence

1. **Restore GitHub Actions dispatch first.** Verify organization and repository Actions policies, billing/usage restrictions, workflow permissions, runner groups, hosted runner availability, and account/org suspension or policy errors through GitHub UI/support or an authorized API principal.
2. **Verify hosted runner independently.** Use a minimal no-secret Ubuntu hosted smoke workflow. Require a real job ID, runner name, completed steps and downloadable logs.
3. **Only then validate G02.** Use one approved Linux x64 host, one runner registration, exact labels and service name. Confirm token exposure remediation first; never duplicate runner registration.
4. **Run G02 acceptance and evidence capture.** Capture runner ID/name, job, steps, logs, artifacts and commit correlation. Keep runner image build separate from runner registration and do not publish the image as a side effect.
5. **Re-enable product CI in waves.** Start with canonical static CI, then web/Studio, Kotton's Code, That’s My Lingo, Spades, Loyalty Lane, media and game candidates. Fix source-level errors only when actual steps/logs are available.
6. **Reconcile repository ownership.** For every active candidate, declare world, product, owner, canonical source, deployment target, backend/data project, secrets owner, CI workflow and archive/merge relationship. Keep all assignments provisional until evidence passes.
7. **Retire stubs only after proof.** Check forks, remotes, workflows, deploy targets, package references, DNS, documentation links and asset dependencies before archiving any stub. Do not delete repositories.

## Open governance items retained

- PR #570 merged baseline remains preserved.
- PR #571 remains draft/unmerged. Its G02 Control Watch sentinel target changes from `g02-aws-sentinel.yml` to `g02-sentinel.yml`; these are distinct workflows, so keep the semantic change under review until the intended control plane and evidence contract are explicit.
- The canonical repository's production release posture remains **PROTECTED HOLD**. G02 is **FAIL / UNVERIFIED**; G03–G11 remain held.
- No production promotion, Worker/DNS mutation, payment activation, runner registration, secret rotation, or last-known-good replacement is authorized by this audit.

## Completion criteria

A repository is not marked recovered merely because it exists, a deployment says ready, or a workflow was queued. Completion requires:
- source ancestry and ownership reconciled;
- branch and workflow configuration reviewed;
- actual CI jobs instantiated with non-empty steps;
- tests/builds passing with correlated logs and artifacts;
- deployment target and backend/data project verified;
- security, secrets, licensing, privacy and data rules reviewed;
- staging QA completed across web/mobile/TV/game surfaces as applicable;
- owner acceptance recorded;
- release gates passed independently of implementation work.

**Current overall state: organization inventory completed; repository recovery in progress; Actions/G02 blocked; production protected hold.**
