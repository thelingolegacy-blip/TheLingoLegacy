# G02 workflow quarantine source reconciliation — 2026-11-20

## Scope

Compared all 12 workflow files changed by PR #589 `safety/2026-11-14-g02-push-trigger-quarantine` against current main `1a60e2314cb3f9b5e3efe648ade83121080cb7b2`.

The branch head is `940695bb39cdf7802617e13dd1626e8fac8ff110`. PR #589 remains draft/open/unmerged.

## Findings

| Workflow | Main-branch exposure | Quarantine branch control |
|---|---|---|
| `actions-runner-smoke.yml` | push + manual trigger; direct `lingo-g02` runner | removes push trigger; job `if: false` |
| `g02-aws-sentinel.yml` | manual trigger; direct `lingo-g02` runner | job `if: false` |
| `g02-fresh-assignment-probe.yml` | push + manual trigger; direct `lingo-g02` runner | removes push trigger; job `if: false` |
| `g02-isolated-staging-sentinel.yml` | manual trigger; staging runner gated by typed confirmation | condition becomes `false && confirmation` |
| `g02-qualified-evidence-probe.yml` | push + manual trigger; direct `lingo-g02` runner | removes push trigger; job `if: false` |
| `g02-run-wrapper.yml` | manual trigger; GitHub-hosted wrapper can dispatch G02 probe | wrapper trigger job `if: false` |
| `g02-sentinel.yml` | manual trigger; direct `lingo-g02` runner | job `if: false` |
| `lingo-autorepair-deploy.yml` | manual trigger; runner-gate job targets G02, downstream deployment workflow | runner-gate job `if: false` |
| `production-promotion.yml` | manual trigger; runner-gate job targets G02, downstream promotion jobs | runner-gate job `if: false` |
| `runner-dispatch-diagnostic.yml` | push + manual trigger; direct `lingo-g02` runner | removes push trigger; job `if: false` |
| `runner-self-hosted-g02.yml` | push + manual trigger; direct `lingo-g02` runner | removes push trigger; job `if: false` |
| `sentinel-check.yml` | manual trigger; staging runner gated by typed confirmation | condition becomes `false && confirmation` |

## Assessment

- All 12 changed workflow files have a job-level fail-closed condition on the quarantine branch.
- Four push-triggered G02 workflows lose their push trigger in the quarantine branch.
- The staging workflows preserve their runner label but make the job condition unconditionally false.
- The wrapper is itself disabled before it can dispatch the qualified probe.
- The production/auto-repair runner-gate jobs are disabled; downstream jobs are dependent on those gates and must remain reviewed as part of the same control boundary.
- This is source-level quarantine only. It does not disable an already-registered runner, revoke runner-group access, or prove that no other workflow/organization repository can target the same runner labels.
- Search across the current repository's workflow files surfaced the 10 G02 and 2 staging runner-target workflows represented in this PR. Administrative runner/runner-group state remains unavailable through the current connector.

## Required completion

1. Owner/admin independently disables or removes the G02 and staging runner-group assignments/registrations while the protected hold is active.
2. Owner/admin confirms Actions workflow disablement/policy and runner group access from repository/organization settings.
3. Independent reviewer checks all 12 workflow diffs and downstream job dependency conditions.
4. After Actions admission is resolved, run a safe GitHub-hosted validation that confirms all protected jobs are skipped and no self-hosted allocation is attempted. Do not dispatch a G02 probe.
5. Merge only after explicit governance approval and exact-SHA evidence.

No runner was registered, restarted, activated, or dispatched. No workflow was dispatched by this review. No branch merge or production mutation occurred.
