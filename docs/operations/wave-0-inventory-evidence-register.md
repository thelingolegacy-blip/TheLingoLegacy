# Wave 0 — Inventory and Evidence Register

**Program:** LINGO Legacy recovery and alternate routes  
**Assessment date:** 2026-10-21  
**Mode:** Read-only inventory / planning  
**Production posture:** PROTECTED HOLD  
**Register status:** PARTIAL — multiple access scopes remain unverified  
**Related proposals:** PR #332 (Static CI diagnostics), PR #333 (alternate routes and subscription wave plan)

## Decision summary

The repository is public, so standard GitHub-hosted runner minutes are free for this repository. Two inspected Actions runs show failed jobs with no step records and no logs URL. This supports a pre-step execution-evidence gap, but does not identify the root cause. Billing, account/organization policy, Cloudflare resource state, tunnel health, and current deployment provenance remain unverified.

No billing change, production configuration change, DNS mutation, tunnel mutation, live subscription activation, or merge is authorized by this register.

## Evidence register

| ID | Domain / gate | Current status | Evidence observed | What this does not prove | Next diagnostic action |
|---|---|---|---|---|---|
| W0-01 | Repository visibility | PASS | GitHub repository metadata identifies thelingolegacy-blip/TheLingoLegacy as public. | Does not prove every workflow permission or repository setting. | Retain repository metadata and inspect Actions settings/policy through authorized account UI/API. |
| W0-02 | Actions billing relevance | PARTIAL | Public repository classification means standard GitHub-hosted runner minutes are free. | Does not prove current metered usage, account spending settings, larger-runner usage, or artifact/cache usage. | Read billing usage and budgets for the owner account; do not change payment settings solely to address pre-step failures. |
| W0-03 | G02 prior workflow run | FAIL / NO EXECUTION EVIDENCE | Run 39592303995; job 119199828554 returned status completed, conclusion failure, logs_url: null, and no step records. A direct step query returned an empty list. | Does not establish whether GitHub service dispatch, repository policy, account restrictions, or runner availability caused the failure. | Capture run details and workflow-run timestamps; inspect repository/organization Actions policies and runner inventory; escalate to GitHub Support if controls are clean. |
| W0-04 | PR #332 validation run | FAIL / NO EXECUTION EVIDENCE | Run 39593803496; job 119201043543 returned status completed, conclusion failure, logs_url: null, and no step records. A direct step query returned an empty list. | Does not show that the proposed diagnostics step executed; the job failed before evidence capture could run. | Keep PR #332 unmerged; inspect the exact run details and Actions policy; do not interpret this run as a test failure inside the workflow. |
| W0-05 | Runner identity / dispatch | BLOCKED | Inspected jobs have no step records and no retrievable logs URL; prior evidence recorded runner identity as absent / runner ID zero. | Does not identify the responsible layer or prove that billing is the cause. | Verify registered runners, labels, runner groups, access scope, and whether any eligible runner is actively polling. For GitHub-hosted jobs, inspect account/repository Actions availability and service restrictions. |
| W0-06 | GitHub account / organization restrictions | UNKNOWN | No current authoritative account-level policy inventory was returned in this check. | No assumption can be made that settings are permissive or restrictive. | Inspect Actions general settings, allowed actions, fork policies, runner groups, enterprise inheritance where applicable, and any account-level restriction messages. Record screenshots or API output with secrets redacted. |
| W0-07 | Cloudflare account identity and resource inventory | UNKNOWN / ACCESS NOT VERIFIED | Cloudflare read-only inventory did not return a usable result during this pass. | No claim is made about current Worker routes, DNS records, account identity, or API permissions. | Re-establish read-only Cloudflare connector access; capture account identity, zones, DNS records, Worker routes, and relevant deployment metadata before any mutation. |
| W0-08 | Cloudflare Tunnel inventory / health | UNKNOWN | No current tunnel list, connector status, or origin-health evidence is present in this assessment. | Tunnel existence, redundancy, or health must not be assumed from architecture notes. | Inventory configured tunnels, connector status, host ownership, Access policies, hostname-to-service mappings, and origin health. Do not expose runner/admin ports publicly. |
| W0-09 | DNS and public route validation | UNKNOWN / REQUIRES FRESH PROBE | Earlier project notes reported inconsistent external public reachability despite internal edge traces. This register has not independently repeated those probes. | Earlier edge traces alone do not prove current public reachability or origin correctness. | Run independent external checks for apex, www, and approved app hostnames; capture status, redirect chain, timestamp, and resolved route. Do not modify DNS during diagnosis. |
| W0-10 | Vercel / deployment provenance | UNKNOWN | No fresh deployment record tied to the current main commit was verified in this pass. Earlier notes reported no deployment found for a previously inspected commit. | Does not prove current deployment status, serving commit, or production health. | Query current deployments and compare deployment commit SHA to current main; independently fetch public routes and record response provenance where available. |
| W0-11 | Plan artifact / PR #333 | PASS (source existence) | Plan file was retrieved from branch architecture/alternate-routes-subscription-wave-2026-10-21; PR #333 is the associated draft proposal. | Does not mean the plan has been approved, implemented, or merged. | Review the plan and this register as documentation-only proposals. Keep draft until reviewed. |
| W0-12 | PR #332 status | DRAFT / REVIEW REQUIRED | Static CI runner-diagnostics upgrade exists as a separate draft PR. Its validation run also failed before steps. | The source changes do not fix the dispatch issue by themselves. | Review workflow source and preserve the PR unmerged until dispatch evidence is available. |
| W0-13 | Subscription / Stripe live mode | NOT STARTED / HOLD | This pass did not inspect Stripe account settings or implement subscription code. The proposal specifies sandbox-first work. | No statement is made about current Stripe configuration or credentials. | Keep live mode untouched; inventory existing integration only through authorized read-only access, then build and test in sandbox after the CI/evidence path is established. |

## Root-cause separation

Do not conflate these failure classes:

- **Billing restriction:** would require direct account billing or usage evidence.
- **Actions policy restriction:** would require repository, organization, enterprise, or account settings evidence.
- **Runner eligibility/availability:** would require runner inventory, labels, groups, and dispatch evidence.
- **GitHub-side dispatch/log service issue:** remains a hypothesis until repository/account settings are checked and GitHub-side evidence or support confirms it.
- **Workflow logic failure:** not demonstrated by runs that never produce steps or logs.

Current best-supported statement: G02 is blocked before usable step execution evidence; root cause remains undetermined.

## Acceptance requirements for closing Wave 0

Wave 0 may close only when each relevant item is either verified or explicitly escalated with a bounded next action:

- [ ] Repository Actions settings and applicable organization/account policy recorded.
- [ ] Runner inventory and runner-group access recorded, or confirmed inapplicable to the failing hosted-runner path.
- [ ] Billing usage/budget checked and clearly separated from execution evidence.
- [ ] Cloudflare account identity and read-only DNS/Worker/tunnel inventory retrieved.
- [ ] Public DNS/HTTP routes independently tested with timestamped results.
- [ ] Current deployment commit provenance checked against main.
- [ ] G02 root cause identified, or a support escalation package includes run IDs, job IDs, empty step results, missing log URLs, timestamps, and policy checks performed.

## Canonical evidence record fields

For every new finding, retain:

- Finding ID and timestamp (UTC).
- System and resource identifier.
- Source URL or API resource reference.
- Expected state and observed state.
- Result status: PASS, FAIL, BLOCKED, UNKNOWN, or NOT STARTED.
- Evidence artifact/hash when available.
- Next action and responsible owner.
- Explicit note whether the observation is read-only or a mutation.

Canonical release chain remains: SOURCE → EVIDENCE → VERIFICATION → ACCEPTANCE → PASSED → AUTHORIZATION → PROMOTION.

## Actions explicitly not performed

- No production deployment.
- No DNS, Worker, tunnel, or origin changes.
- No billing or payment-method changes.
- No Stripe live-mode activation or customer charges.
- No relaxation of branch protection or fail-closed release gates.
