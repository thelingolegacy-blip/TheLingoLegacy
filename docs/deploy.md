# Deployment and release controls

## Canonical architecture

- Source authority: GitHub repository `thelingolegacy-blip/TheLingoLegacy`, branch `main`.
- Intended edge runtime: Cloudflare Worker `thelingolegacy`, entry point `worker.js`.
- Production configuration: `wrangler.jsonc`.
- Isolated staging configuration: `wrangler.staging.jsonc`, Worker name `thelingolegacy-staging`, workers.dev only, assets limited to `staging-public/`.
- Cloudflare DNS and route authority must be verified from live provider state; this document does not authorize DNS mutations.

## Current protected state (2026-10-09)

Production promotion is **BLOCKED**. G02 self-hosted runner assignment is not established. GitHub Actions jobs are failing before step initialization, with runner ID 0, blank runner name, no steps, and unavailable logs/artifacts. Source-level CI results therefore have not been proven to execute.

All four Cloudflare Builds triggers have nonmatching path filters and remain deliberately contained. The reserved hold branch was not created. Do not re-enable any trigger until the intended Worker ownership, build commands, asset scope, CI execution, staging probes, rollback target, and release evidence are independently verified.

## Safe validation commands

These commands validate the configuration without deploying. Do not remove `--dry-run`.

```bash
npx --yes wrangler@4 deploy --dry-run --config wrangler.jsonc
npx --yes wrangler@4 deploy --dry-run --config wrangler.staging.jsonc
```

The current GitHub Actions infrastructure is not returning executed steps/logs. A successful local result is not a substitute for a passing CI run correlated to the reviewed commit.

## Required release sequence

1. Restore GitHub Actions assignment and execution.
2. Require G02 real runner ID/name, executed sentinel, downloadable logs, sanitized correlated artifact, and exact run/job/commit linkage.
3. Run repository static/security/configuration gates; inspect actual logs for any script-level defects.
4. Validate the isolated staging configuration and deploy only through an explicitly authorized staging workflow.
5. Probe staging health, HTML, runtime manifest, APIs, assets, security headers, error paths, and unwanted source/config access.
6. Reconcile live Cloudflare route ownership against the chosen Worker config and correct unvalidated build trigger commands while they remain contained.
7. Verify production public reachability separately. Set an accepted rollback target and build an evidence ledger that correlates source, CI, staging, provider state, deployment ID, and live probes.
8. Obtain review and explicit promotion authorization. Keep production promotion blocked until every required predicate passes.

## External work not replaceable by repository edits

- GitHub repository Settings → Actions → General: verify Actions is enabled, allowed action policies permit the intended workflows, PR policies are not blocking execution, and account usage/billing or resource limits are clear.
- Verify runner groups and the self-hosted daemon separately. On the intended Linux host, inspect `sudo ./svc.sh status`, `pgrep -af 'Runner.Listener|Runner.Worker'`, `sudo journalctl -u actions.runner.* --since '2 hours ago' --no-pager`, and recent `_diag/` records.
- If `ubuntu-latest` and self-hosted jobs continue to fail before step initialization, escalate the exact run/job IDs to GitHub Support for a runner-dispatch/backend investigation; no log exists that proves an in-repository script caused the failure.
- GitLab CI remains blocked by GitLab identity verification. Complete the legitimate verification flow before creating another pipeline; rotate the legacy runner-registration credential through GitLab settings.
- Checkout/provider secrets, live Firebase rules, storage backends, current domain reachability, TLS, and analytics must be verified in their owning providers. Never put secret values in source control, artifacts, issues, or chat.

## Never infer production readiness from

- A green status badge in a static HTML file.
- A Cloudflare Worker configuration existing in the API.
- A runner marked Online without an assigned/executed job.
- A generated evidence scaffold with `NOT_RUN` states.
- A Vercel status context, an old deployment, or a source file without a current correlated live probe.
