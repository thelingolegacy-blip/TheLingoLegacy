# Wave 0 — GitHub Actions Restriction and Runner-Eligibility Report

**Assessment captured:** 2026-10-21T11:52Z  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Base commit checked:** `53264252dfcda788897a9094c84e65e3425bae9c` (`main`)  
**Mode:** Read-only evidence collection; documentation-only report  
**Production posture:** Protected hold; no deployment, DNS, tunnel, billing, or Stripe mutation performed  
**Overall result:** G02 BLOCKED; root cause UNDETERMINED

## Executive finding

Two inspected GitHub Actions jobs have failed records with empty step arrays and no retrievable logs. Direct step queries returned `steps: []`; direct log retrieval returned Azure storage `BlobNotFound`. This is strong evidence that usable in-job execution evidence is missing. It does **not** identify the responsible layer.

The connector could not read the repository Actions permissions endpoint or runner inventory, and branch-protection details were denied by the integration. Cloudflare identity and OpenAPI inventory calls returned internal errors. These are access/connector limitations, not proof that the corresponding settings or resources are absent.

## Evidence register

| ID | Domain | Observed result | Status | Limitation / next action |
|---|---|---|---|---|
| RPT-01 | Current main | Branch API reports `main` at `53264252dfcda788897a9094c84e65e3425bae9c`, the merge commit for PR #333. | PASS | Re-check before any later decision. |
| RPT-02 | PR state | GitHub PR metadata reports PR #332 merged at `45117d311e2dcc420551ed97a56a35f9550d70f1` and PR #333 merged at `53264252dfcda788897a9094c84e65e3425bae9c`. | VERIFIED / CORRECTION REQUIRED | Earlier notes that both PRs remained unmerged are stale. This report does not authorize any additional merge or promotion. |
| RPT-03 | Wave 0 register location | Fetching `docs/operations/wave-0-inventory-evidence-register.md` from `main` returned 404. The register was previously committed as `e6b78d9349dc9b3c3cf255c94be865ac2d4a6f30` after PR #333's merge commit. | NOT ON MAIN | Preserve the branch copy; this report records the discrepancy. A separate reviewable PR is required if the register should be brought onto main. |
| RPT-04 | Run 39592303995 | Workflow `Lingo Legacy Static CI`; event `push`; branch `main`; head SHA `8397a88d03c91418e273bd5fd0c51ad0f1c6891a`; created `2026-10-21T11:29:16Z`; updated `2026-10-21T11:38:28Z`; attempt 3; conclusion `failure`. Job ID `119199828554`; `logs_url: null`; `steps: null`; direct step query returned empty array. | FAIL / NO EXECUTION EVIDENCE | Run predates PR #332 and PR #333 merges. Do not treat as a current-main post-merge validation. |
| RPT-05 | Run 39593803496 | Workflow `Static CI · pull_request · 332/merge`; event `pull_request`; branch `ci/static-ci-runner-evidence-upgrade-2026-10-21`; head SHA `9f86ac8af0b2417c73b00d890c0c2c83db29199c`; created `2026-10-21T11:41:22Z`; updated `2026-10-21T11:41:26Z`; attempt 1; conclusion `failure`. Job ID `119201043543`; `logs_url: null`; `steps: null`; direct step query returned empty array. | FAIL / NO EXECUTION EVIDENCE | The job did not provide evidence that its first diagnostic step executed. |
| RPT-06 | Log retrieval | Direct retrieval for both job IDs returned HTTP 404 with Azure storage code `BlobNotFound` at `2026-10-21T11:52:30Z`. | FAIL | Preserve exact run/job IDs and timestamps for GitHub Support. |
| RPT-07 | Workflow inventory | Current `.github/workflows` directory includes `actions-runner-smoke.yml`, `ci-runner-observation.yml`, multiple G02 probes, and `runner-self-hosted-g02.yml`. | PASS (inventory) | Presence of workflow files does not prove a runner is eligible or polling. Do not trigger additional runs solely for repetition. |
| RPT-08 | Repository Actions permissions | Read request to `/actions/permissions` was rejected by the GitHub connector as an unsupported endpoint. | UNKNOWN / ACCESS BLOCKED | Inspect Settings → Actions → General through an authorized owner session; capture screenshots/API output with secrets redacted. |
| RPT-09 | Runner inventory | Read request to `/actions/runners` was rejected by the connector as an unsupported endpoint. | UNKNOWN / ACCESS BLOCKED | Inspect Settings → Actions → Runners. Record runner name, online/idle state, labels, group, and repository access scope. |
| RPT-10 | Branch protection | Branch-protection read returned HTTP 403 `Resource not accessible by integration`. Repository rulesets endpoint returned an empty list. | PARTIAL / ACCESS BLOCKED | Empty rulesets result does not establish absence of classic branch protection. Verify branch protection in owner UI/API. |
| RPT-11 | Cloudflare inventory | Cloudflare identity and API-spec search calls failed internally; no usable account/zone/Worker/Tunnel inventory was returned. | UNKNOWN / CONNECTOR BLOCKED | Re-establish read-only Cloudflare access and capture account identity, zones, DNS, Worker routes, and tunnel connectors before any change. |
| RPT-12 | Apex public route | External fetch of `https://thelingolegacy.com/` returned the LINGO Legacy site content during this assessment. | PARTIAL PASS | This confirms a successful fetch path, not origin correctness or end-to-end health from all regions. |
| RPT-13 | WWW public route | External fetch tool could not access `https://www.thelingolegacy.com/`. | UNKNOWN | Tool inability is inconclusive; verify with an independent external HTTP/DNS probe. Do not change DNS during diagnosis. |
| RPT-14 | Vercel deployment provenance | Vercel returned production deployment `dpl_4ryU6qNRrVMQU47zqmu6ZvrZkEeN`, state `READY`, created `2026-08-01T03:35:49Z`, with aliases including apex and www. Its Git metadata points to SHA `d73d8849c69113e05371602e9756831adb18d9ed`, not current main SHA `53264252dfcda788897a9094c84e65e3425bae9c`. | STALE / PROVENANCE MISMATCH | The record is over two months old and does not prove the current production-serving commit. Query a fresh deployment inventory and verify public response provenance. |
| RPT-15 | Billing / organization policies | No authoritative billing, account-level Actions policy, or organization restriction data was available in this read-only pass. | UNKNOWN | Inspect actual owner billing/usage and applicable policies separately. Do not infer billing as root cause from missing logs. |

## Root-cause separation

The current evidence does not distinguish among:

1. GitHub Actions disabled or restricted at repository/account/organization level.
2. Runner-group access or runner eligibility restrictions.
3. A self-hosted runner not actively polling with matching labels.
4. GitHub-side job dispatch or log-storage failure.
5. Workflow logic failure (not demonstrated by jobs with no recorded steps).

Billing is not established as the cause. Standard GitHub-hosted runners are free and unlimited for public repositories when using the supported standard runner labels; do not add paid capacity solely to address this pre-step evidence gap.

## Bounded next actions and owners

| Action | Owner | Acceptance evidence | Mutation policy |
|---|---|---|---|
| A1. Capture Actions General settings and applicable owner/organization policies. | Repository/account owner | Timestamped, redacted settings evidence; note inherited/overriding policies. | Read-only |
| A2. Capture runner inventory and eligibility. | Repository/account owner | Runner name, online state, labels, group, repository access, and active polling evidence—or mark hosted-runner inventory not applicable. | Read-only |
| A3. Check billing usage/budget independently. | Account owner | Dated billing/usage evidence; separate from execution evidence. | Read-only; no payment changes |
| A4. Escalate G02 if settings and runner eligibility are clean. | Repository owner | Support case includes run IDs 39592303995 and 39593803496; job IDs 119199828554 and 119201043543; timestamps; empty steps; null logs URL; BlobNotFound responses; settings checks performed. | No workflow retries required |
| A5. Re-establish Cloudflare read-only access and inventory routes/resources. | Infrastructure owner | Account identity, zone/DNS/Worker/Tunnel inventory, source references and timestamp. | Read-only |
| A6. Verify live deployment provenance and public routes. | Deployment owner | Fresh deployment ID, commit SHA, deployment timestamp, apex/www HTTP status and redirect chain. | Read-only; no DNS/deployment change |
| A7. Reconcile the Wave 0 register location. | Repository owner / reviewer | Register reviewed on branch and, if approved, included through a separate PR. | Documentation-only PR; no merge implied |

## Release decision

**G02: BLOCKED. Wave 0: OPEN. Production: PROTECTED HOLD.**

Do not claim root cause, mark Wave 0 complete, merge this report, trigger more repetitive workflows, or change DNS, Workers, tunnels, billing, payment settings, or Stripe live mode based on this report. Close Wave 0 only after required evidence is captured or each remaining gap has a named owner, bounded next action, and escalation record.

Canonical evidence chain: SOURCE → EVIDENCE → VERIFICATION → ACCEPTANCE → PASSED → AUTHORIZATION → PROMOTION.
