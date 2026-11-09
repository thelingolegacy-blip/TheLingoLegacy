# Wave 0 GitHub Repository, CI, and PR Reconciliation

**Snapshot:** 2026-11-09 UTC  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Working branch:** `feat/lingo-master-registry-wave0-2026-11-08`  
**Related PR:** #511 (open, draft, unmerged)  
**Disposition:** READ-ONLY RECONCILIATION REPORT; no merge, runner registration, repository deletion/archive, production setting, DNS, deployment, secret, or provider mutation was performed.  
**Production:** PROTECTED HOLD  
**G02:** FAIL / UNVERIFIED

## 1. Executive result

The connected GitHub repository search for `lingo` returned 38 repositories. The continuation cursor returned zero additional repositories, so the 38-item result set is complete for this exact connected search query and installation scope. It is not a guarantee that every repository in every account, organization, or disconnected installation has been enumerated.

The Wave 0 registry and dependency graph already exist on PR #511. Do not create a competing master registry or duplicate graph. The registry JSON parses successfully and records 40 product-inventory entries across nine product groups. The dependency graph JSON parses successfully and contains 13 nodes with 33 declared dependency relationships through `dependsOn`.

CI remains blocked at the execution boundary:
- TheLingoLegacy: three PR-triggered runs listed by PR #512 returned zero jobs.
- TheLingoLegacy-Web: the referenced run returned zero jobs.
- LINGO_LEGACY_HQ: two Jekyll/build runs returned one failed job each, but the Steps API returned no steps; the job-log fetch for the newer run returned `BlobNotFound`. PR #48's description reports runner_id=0 and an empty runner name.
- THATS-MY-LINGO: October failures are present in the founder-supplied reconciliation notes; they were not independently rechecked in this snapshot.

A zero-job or zero-step startup failure is evidence that executable validation did not begin. It is not evidence that application source code passed or failed, and it does not by itself identify the provider-side root cause.

## 2. Repository inventory and provisional classification

Classification is provisional and based on repository names, the connected search result, and the repository baseline. It is not a verified ownership assignment, code-quality rating, or archive recommendation.

| # | Repository | Provisional classification | Review note |
|---:|---|---|---|
| 1 | `-the-lingo-legacy-master` | DUPLICATE-CANDIDATE | Similar-name master repository; compare history and ownership |
| 2 | `thelingolegacy-hub` | SUPPORTING-CANDIDATE | Hub candidate; unusual default branch value requires validation |
| 3 | `LingoLegacy-MasterBlueprint` | SUPPORTING-CANDIDATE | Blueprint candidate; reconcile with HQ charter and core registry |
| 4 | `thelingolegacy-hub-` | EMPTY / DUPLICATE-CANDIDATE | Empty similarly named hub |
| 5 | `-the-lingo-legacy-hub` | DUPLICATE-CANDIDATE | Similar-name hub variant |
| 6 | `ZavioneLingo` | UNVERIFIED | Role and ownership not established |
| 7 | `kottens-code-engine` | PRODUCT-CANDIDATE | Kotton's Code engine candidate |
| 8 | `LINGO_LEGACY_HQ` | GOVERNANCE-CANDIDATE | Enterprise charter, portfolio governance, operations and control documentation |
| 9 | `thelingolegacy-blip-REPO-` | UNVERIFIED | Generic repository; role requires owner confirmation |
| 10 | `TheLingoLegacy` | CANONICAL IMPLEMENTATION CANDIDATE | Flagship implementation source of truth per current enterprise charter |
| 11 | `Kotton-code-engine` | DUPLICATE-CANDIDATE | Similar-name variant of Kotton's Code engine |
| 12 | `Loyaltylaneapparel` | PRODUCT-CANDIDATE | Apparel implementation candidate |
| 13 | `Lingolegends` | PRODUCT-CANDIDATE | Product/IP role requires content inspection |
| 14 | `Devontray` | UNVERIFIED | Role and ownership not established |
| 15 | `Theriseofzavione` | PRODUCT-CANDIDATE | LINGOmedia / media-IP implementation candidate |
| 16 | `Github` | EMPTY / UNVERIFIED | Generic repository; no purpose established |
| 17 | `Tricia-escape-` | PRODUCT-CANDIDATE | LINGOarcade game candidate |
| 18 | `LingoLegacy-` | EMPTY / DUPLICATE-CANDIDATE | Empty similarly named repository |
| 19 | `thats_my_lingo_app` | EMPTY / DUPLICATE-CANDIDATE | Empty app variant; compare with dedicated game source |
| 20 | `lingo_backend` | EMPTY / SUPPORTING-CANDIDATE | Empty backend candidate |
| 21 | `lingo_admin_console` | SUPPORTING-CANDIDATE | Admin console candidate; implementation scope unverified |
| 22 | `lingo_website` | EMPTY / DUPLICATE-CANDIDATE | Empty website candidate; compare with canonical web surface |
| 23 | `lingo_documentation` | EMPTY / SUPPORTING-CANDIDATE | Empty documentation candidate |
| 24 | `lingo_assets` | SUPPORTING-CANDIDATE | Asset library/dashboard candidate; rights and source lineage require review |
| 25 | `codemagic-docs` | REFERENCE / VENDOR-CANDIDATE | Large documentation repository; do not assume it is owned LINGO product source |
| 26 | `THATS-MY-LINGO` | PRODUCT-CANDIDATE | Dedicated game implementation candidate |
| 27 | `nextjs-boilerplate` | PRIVATE TEMPLATE-CANDIDATE | Generic private framework starter; not a product source absent owner confirmation |
| 28 | `chatbot` | PRIVATE PRODUCT-CANDIDATE | Role, owner, and integration contracts unverified |
| 29 | `angular` | PRIVATE FRAMEWORK-CANDIDATE | Generic framework repository; do not treat as LINGO product |
| 30 | `django` | PRIVATE FRAMEWORK-CANDIDATE | Generic framework repository; do not treat as LINGO product |
| 31 | `TheLingoLegacy-Web` | ACTIVE WEB-CANDIDATE | Separate private web implementation; define its relationship to flagship source |
| 32 | `nextjs` | PRIVATE FRAMEWORK-CANDIDATE | Generic framework repository; do not treat as LINGO product |
| 33 | `lingo-legacy-` | EMPTY / DUPLICATE-CANDIDATE | Empty similarly named repository |
| 34 | `Spades_is_my-lingo` | EMPTY / DUPLICATE-CANDIDATE | Empty Spades name variant |
| 35 | `Spades-is-my_Lingo` | PRODUCT-CANDIDATE | Spades implementation candidate |
| 36 | `Tv-os` | EMPTY / PLATFORM-CANDIDATE | Empty smart-TV app candidate |
| 37 | `Backend` | EMPTY / DUPLICATE-CANDIDATE | Empty generic backend variant |
| 38 | `Games` | EMPTY / SUPPORTING-CANDIDATE | Empty generic games repository |

### Required repository decisions

1. Confirm one canonical owner and one intended purpose for each active repository.
2. Compare commit history, trees, branches, releases, workflows, domains, and consumers before declaring duplicates.
3. Map every product to its source path, runtime, route, API, data store, test suite, and release gate.
4. Keep empty repositories and similarly named repositories untouched until ownership and dependency checks are complete.
5. Exclude generic framework and vendor/reference repositories from the LINGO product count unless a responsible owner documents a deliberate fork or product relationship.

## 3. Existing Wave 0 source of truth

PR #511 in `TheLingoLegacy` is the current Wave 0 implementation vehicle:
- Base: `main`
- Head: `feat/lingo-master-registry-wave0-2026-11-08`
- Head SHA observed: `b171c3a534eeee61cc648c42111b2ab4a73de309`
- 17 commits ahead; 0 behind at inspection
- 11 changed files; 2,124 additions; 0 deletions
- Open, draft, unmerged

The branch contains:
- `config/registry/lingo-master-registry.v1.json`
- `config/registry/lingo-dependency-graph.v1.json`
- `config/registry/cloudflare-route-inventory.v1.json`
- Identity/wallet and integration network contracts
- Cloudflare reconciliation and G02 evidence intake
- Master execution router and Waves 0–4 checklist
- Registry validation script

The registry's product groups contain 40 product entries across nine groups. This is a product-to-repository many-to-many portfolio; the number of repositories is not expected to equal the number of products.

The dependency graph has 13 nodes and 33 declared dependency relationships. It is a useful baseline, not yet an accepted complete enterprise graph. Acceptance still requires owner-approved product-to-repository-to-runtime mappings, explicit API/data/asset/test dependencies, cycle and dangling-reference checks, and independent review.

## 4. CI startup evidence

| Repository | Evidence inspected | Observed result | Interpretation |
|---|---|---|---|
| `TheLingoLegacy` | PR #512 lists runs 42546146795, 42546147646, 42546148685; Jobs API queried for all three | 0 jobs for each | Pre-job failure boundary; no test or build result |
| `TheLingoLegacy-Web` | Run 40138200822; Jobs API queried | 0 jobs | Pre-job failure boundary; no test or build result |
| `LINGO_LEGACY_HQ` | Runs 40598475856 and 40598152899; Jobs and Steps APIs queried | 1 failed build job per run; 0 steps returned | Job record exists but no observable step execution |
| `LINGO_LEGACY_HQ` | Job log requested for job 122520311609 | `BlobNotFound` | No retrievable log evidence for this job |
| `THATS-MY-LINGO` | October failure history from supplied reconciliation notes | Not independently rechecked in this API sample | Retain as reported; re-query before acceptance |

For HQ runs 40598475856 and 40598152899, the PR #48 description reports `runner_id=0` and an empty runner name. The connected Jobs API payloads returned no steps. These results do not prove that a runner was assigned or that any test ran.

### CI diagnosis sequence

1. Preserve run IDs, attempts, commit SHAs, timestamps, workflow names, and raw API responses.
2. Separate GitHub-hosted `ubuntu-latest` smoke validation from the dedicated G02 runner predicate.
3. Inspect repository/account Actions policy, billing/usage restrictions, workflow permissions, event/ref, and runner availability through authorized administrator evidence.
4. If a run fails before any job is instantiated, escalate the run IDs and UTC timestamps to GitHub Support or an authorized administrator; do not infer a source-code defect.
5. Once jobs instantiate, collect job metadata, step summaries, logs, artifacts, checksums, and exact commit correlation.
6. Do not rerun, dispatch, register, or modify runners as part of this read-only snapshot.

## 5. G02 proposal reconciliation

| Repository / PR | Scope | Observed overlap or dependency | Proposed disposition |
|---|---|---|---|
| HQ #47 | Original runner dispatch cleanup | Based on a divergent diagnostic branch; description says superseded by HQ #48 | Retain as historical diagnostic record; do not merge |
| HQ #48 | Main-based runner recovery, probe trigger cleanup, evidence controls | Main-based HQ proposal; its runbook assumes a persistent dedicated runner | Review only after resolving lifecycle architecture mismatch |
| Core #495 | Pin workflow actions to immutable SHAs | Changes G02 and release workflow YAML; separate security hardening | Review as an independent workflow-security change; verify exact refs and combined CI |
| Core #508 | Correct G02 sentinel path in verifier and fixtures | Its three changed files are also changed by Core #512 | Treat as overlapping; do not merge both without exact diff reconciliation |
| Core #512 | Sentinel-path repair, regression fixtures, read-only Compose diagnostic, runner runbook alignment | Includes the same three paths as #508 plus three operational/diagnostic files | Primary consolidated source-level repair candidate, subject to review and executable validation |
| Core #431 | Offline execution-boundary classifier and evidence-manifest tooling | Supporting evidence tooling; its hosted workflow also encountered startup failure | Retain as supporting tooling; local mirror tests are not hosted CI acceptance |

Core #508 changes:
- `scripts/test-run-static-gates.mjs`
- `scripts/test-verify-release-config-consistency.mjs`
- `scripts/verify-release-config-consistency.mjs`

Core #512 changes those same three paths and adds:
- `ops/g02/diagnose-runner-compose.sh`
- `ops/g02/host-provisioning.md`
- `ops/github-runner/README.md`

Therefore #512 is the broader consolidation candidate. Confirm the exact hunks and tests before deciding whether #508 is redundant; do not merge both merely because both are mergeable.

Core #495 changes:
- `.github/workflows/g02-isolated-staging-sentinel.yml`
- `.github/workflows/g02-sentinel.yml`
- `.github/workflows/production-promotion.yml`
- `.github/workflows/sentinel-check.yml`

Its immutable action pins are a separate security concern and should be reviewed alongside the canonical workflow, not treated as proof of successful runner dispatch.

## 6. Runner lifecycle architecture conflict

The HQ #48 runbook describes a persistent dedicated Linux x64 runner as the only runner that can satisfy G02.

The Core #512 branch's `ops/github-runner/README.md` states:
- The current bootstrap is ephemeral.
- The frozen target architecture is a persistent dedicated Linux x64 runner.
- Persistent mode is not implemented or accepted yet.
- The runner is repository-scoped because the owner is a personal account, not an organization.
- Public-repository untrusted pull-request code must not execute on the self-hosted runner.

The Core #512 host-provisioning document says to inspect the existing runner inventory first, use the Compose-specific diagnostic for the current ephemeral package, and use the systemd diagnostic only if a separate bare-metal installation is actually present.

These documents describe different lifecycle states and must not be treated as interchangeable. Before any runner action, publish one approved architecture decision that states:
- Host lifecycle: provisioned or not provisioned.
- Runner lifecycle: ephemeral one-job container or persistent service.
- Exact repository scope, runner name, labels, and allowed event/actor policy.
- Whether caches persist and how workspaces are isolated.
- How untrusted PR code is excluded.
- Recovery and stale-registration handling.
- Required evidence and independent acceptance.

No runner registration, deletion, restart, host provisioning, or workflow dispatch is authorized by this report.

## 7. Enterprise PR and implementation order

Recommended review order (not merge authorization):

1. **CI control-plane diagnosis:** resolve the pre-job startup boundary using administrator/provider evidence. This is the immediate blocker for executable acceptance.
2. **G02 lifecycle decision:** reconcile HQ #48's persistent-runner assumption with Core #512's ephemeral bootstrap and persistent-target documentation.
3. **G02 source repair:** review Core #512 as the consolidation candidate; compare and disposition Core #508 to prevent duplicate overlapping changes.
4. **Workflow supply-chain review:** review Core #495 action pins and confirm the production-promotion job remains fail-closed.
5. **Evidence tooling:** review Core #431's classifier and manifest against the exact run/job/artifact schema; distinguish local test evidence from hosted execution.
6. **Wave 0 registry:** review Core #511 ownership, product inventory, dependency references, schema validation, and completeness.
7. **Web integration:** reconcile TheLingoLegacy-Web PR #43 Supabase foundation with the flagship architecture and verify the separate web repo's source-of-truth boundary.
8. **Game implementation:** inspect THATS-MY-LINGO source, workflow history, assets, and dependency contracts only after CI and shared platform interfaces are stable.

Parallel work is permitted for isolated documentation, source review, static analysis, creative asset cataloging, and test authoring when no shared files or runtime dependencies conflict. Shared workflow files, canonical contracts, runner lifecycle, data migrations, production routing, and release authorization remain serialized.

## 8. Wave 0 acceptance checklist

- [x] Connected search returned 38 repositories for query `lingo`.
- [x] Pagination continuation returned zero additional repositories.
- [x] Provisional classifications and obvious naming overlaps recorded.
- [x] Existing Core PR #511 registry and graph identified; no duplicate master registry created.
- [x] Registry JSON parsed; 40 product-inventory entries and nine product groups observed.
- [x] Dependency graph JSON parsed; 13 nodes and 33 dependency relationships observed.
- [x] Core G02 PR overlap #508/#512 identified.
- [x] HQ runner recovery proposal #47/#48 relationship identified.
- [x] Sampled CI run/job/step evidence queried for Core, Web, and HQ.
- [ ] Named accountable owner confirmed for every active repository and product.
- [ ] Every product mapped to repository path, surface, runtime, API, data, assets, tests, and release gate.
- [ ] Duplicate candidates reviewed against code/history/consumers and assigned a final disposition.
- [ ] CI startup root cause established with authorized provider/admin evidence.
- [ ] G02 runner lifecycle architecture decision approved and implemented only under separate authorization.
- [ ] Hosted CI jobs instantiate and complete with retrievable logs/artifacts on exact reviewed commits.
- [ ] G02 assignment and execution predicates independently pass with runner ID/name, instantiated steps, retrievable logs, correlated artifact, and checksum.
- [ ] Independent registry and dependency graph review completed.
- [ ] Rollback paths and release ownership verified for every production-bound workstream.

## 9. Explicit non-actions

This reconciliation did not:
- Merge, close, retarget, approve, or mark any PR ready.
- Register, restart, remove, or dispatch a runner.
- Delete or archive any repository.
- Change branch protection, Actions settings, billing, secrets, or provider permissions.
- Change Cloudflare routes, DNS, Worker deployments, Firebase resources, AppDeploy projects, or production traffic.
- Authorize production promotion or public publishing.

**Final Wave 0 disposition:** PARTIALLY EVIDENCED / NOT ACCEPTED. Repository inventory, existing registry/graph, PR overlaps, and sampled CI execution boundaries are documented. Ownership, complete dependency mapping, CI root cause, G02 lifecycle decision, hosted execution, and independent acceptance remain open.
