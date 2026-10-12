# LINGO Legacy — G02 Recovery Team Charter

## Purpose
Restore verifiable GitHub Actions execution for `thelingolegacy-blip/TheLingoLegacy` without weakening repository security or changing production.

## Authorization boundaries
- Read-only inspection is allowed within the connected GitHub installation's existing permissions.
- Create/update recovery branches and draft pull requests only when scoped to G02 diagnostics.
- Do not merge PRs, enable auto-merge, bypass required reviews or branch protection, modify authentication/access enforcement, change DNS/Cloudflare Worker routes/deployments, provision paid resources, or activate production.
- Do not create GitHub users, teams, bots, runners, or grant access/permissions unless the corresponding authenticated GitHub administration API supports that operation and the proposed scope is reviewable.
- Never put secrets, tokens, runner registration credentials, or personal data in issues, PR comments, or artifacts.

## Workstreams (logical roles, not real GitHub accounts)
1. **Dispatch Investigator** — correlate run, attempt, job, runner identity, status, and commit SHA. Inspect repository/account Actions policy and runner-group eligibility where authorized.
2. **Host Operator** — on the actual Linux x64 runner host, inspect `Runner.Listener`, `Runner.Worker`, service status, runner configuration identity, labels, and last check-in. No blind process termination or credential reset.
3. **Evidence Engineer** — require job step summaries, retrievable logs, downloadable artifact ZIP, SHA-256 manifest, and exact run/job/commit/runner correlation.
4. **Cloudflare Auditor** — read-only snapshot of zone, DNS records, Worker routes, and deployments; report drift only.
5. **Release Gatekeeper** — preserve fail-closed controls; reject promotion unless every G02 acceptance predicate passes.

## G02 acceptance predicate (all required)
- Actual assigned runner with `runner_id > 0` and populated `runner_name`.
- Expected identity `lingo-legacy-g02`, Linux x64, self-hosted environment, and required labels.
- Job steps instantiated and sentinel step executed successfully.
- Job logs retrievable from GitHub.
- Run-scoped evidence artifact exists, downloads successfully, and includes the sentinel report and host diagnostics.
- Evidence correlates exactly to workflow run ID, job ID, commit SHA, runner ID, and runner name.
- Independent reviewer verifies the evidence and records explicit acceptance.
- Until all predicates pass: G02 BLOCKED, promotion BLOCKED, LKG PROTECTED.

## Immediate actions
1. Review GitHub account/repository Actions settings and runner registration in the GitHub UI (the connected API does not expose every administration endpoint).
2. On the actual runner host, capture process and service status before any cleanup.
3. Run one controlled sentinel only after runner availability and eligibility are proven.
4. Capture and independently verify run/job/log/artifact metadata.
5. Publish a factual evidence bundle and stop at the acceptance gate.