# G02 Recovery Bridge — 2026-10-11

## Purpose

Provide a read-only GitHub Actions evidence bridge and safer host-recovery controls while the runner-dispatch failure is unresolved. This patch does not fix a GitHub-side scheduler/account restriction by itself, does not provision a host, and does not establish G02 acceptance.

## Current decision

Keep G02 **BLOCKED**, production **FROZEN**, and last-known-good **PROTECTED** until all P1–P9 acceptance predicates have real correlated evidence. Do not merge this draft or promote production based on static checks, a running systemd service, or a browser intake page.

## Route A — collect direct Actions evidence

From an authorized operator workstation with GitHub CLI (`gh`) and `jq` installed and read access to `thelingolegacy-blip/TheLingoLegacy`:

    bash ops/g02/diagnose-actions-dispatch.sh

The script creates a new mode-700 evidence directory, records the latest ten workflow runs, job/run/commit correlation, runner ID/name/labels, instantiated and completed step counts, artifact counts, log-retrieval outcomes, and a SHA-256 sidecar. It does not save raw job logs, dispatch or rerun workflows, alter settings, or change production. Review and independently verify the output before treating it as evidence.

A `CANONICAL_ASSIGNED` observation means only that the job payload reports a positive runner ID, the exact canonical runner name, and all required labels. It does not by itself prove the sentinel succeeded or independently accept G02.

## Route B — distinguish provider dispatch failure from host failure

Recent failures on both GitHub-hosted labels and the canonical self-hosted label occur before steps initialize, with runner ID 0, empty runner name, and unavailable logs. This is consistent with a pre-step dispatch/provider/control-plane problem, but does not prove its exact cause.

If the bridge reports the same signature:

1. Preserve the run IDs, job IDs, head SHAs, timestamps, and API responses.
2. Have the repository/account owner inspect Actions usage and spending limits, workflow policies, account restrictions, runner groups/availability, and any platform incident or restriction.
3. If those controls appear normal, escalate to GitHub Support with the correlated run/job IDs and the empty-step/404 log signature.
4. Do **not** repeatedly re-register the runner, reset the host, broaden permissions, disable access enforcement, or use a different CI provider's success as a substitute for G02 acceptance.

## Route C — host inspection and controlled recovery

Only on the authorized Linux x64 host, begin with read-only status:

    bash ops/g02/runner-control.sh status

The controller's mutating actions require both `G02_CONFIRM_HOST_MUTATION=YES` and `--confirm-host-mutation`. It no longer exposes reset, reboot, or enable actions. Review actual service identity, daemon state, runner registration, and redacted journal output before any approved host change.

The bootstrap script refuses an existing local registration or an existing remote runner named `lingo-legacy-g02`; it never uses `--replace` and never removes an existing registration. It requires explicit host-mutation and runner-registration confirmations plus a short-lived `RUNNER_TOKEN`. Never paste the token or credential files into chat or commit them.

## Route D — public-site path remains separate

Read-only Cloudflare inventory currently shows an active, unpaused `thelingolegacy.com` zone, apex and `www` routes to Worker `thelingolegacy`, and an enabled 301 redirect from `www` to apex. The apex homepage is retrievable from the external web vantage used in this review. That vantage did not provide a successful `www` fetch, so end-to-end `www` reachability remains unverified.

No DNS, redirect, Worker route, Worker deployment, or authentication change is included here. Do not change those paths until an independent browser/network probe establishes the actual failure mode and the route/Worker authority is reviewed.

## Static safety test

    bash ops/g02/tests/test-recovery-guard.sh

This test checks Bash syntax and guardrail text only. It is not an actual host execution, GitHub Actions run, log/artifact acceptance, or independent G02 verification.

## Stage 3 — Preview asset deployment (isolated, 2026-10-17)

The isolated Cloudflare preview Worker `lingo-recovery-preview` is the only permitted target for the asset deployment procedure described here. Production Worker routes and DNS are explicitly out of scope.

### Known boundary

- Current recorded preview deployment: `fb6f59b2-1186-49f9-bf09-8c7cd771f0a0` (version `1066b634-8fa7-43c4-9b16-5482077bdce0`).
- The preview Worker settings read returned an empty bindings array; an `ASSETS` binding is not yet verified on the deployed Worker.
- Static-assets manifest registration was accepted for eight core files, but the authenticated payload upload returned HTTP 401 through the connector. Payload upload/completion and a new deployment were not confirmed.
- Wrangler-based deployment is the selected recovery path because the connector API wrapper does not expose a supported custom Authorization header for the per-session upload JWT.

### One-time procedure

Use the existing repository's worker source and asset files; do not clone, create, or promote a separate application. From an authorized operator workstation where GitHub access and Cloudflare authentication are available:

1. Fetch the exact approved source branch and verify the commit before staging.
2. Stage only explicitly listed public assets and `worker.js`; never copy secrets, Git metadata, workflows, or environment files into the asset directory.
3. Use a dedicated Wrangler configuration whose only worker target is `lingo-recovery-preview`, with `workers_dev = true`, `assets.directory` pointing to the staged public directory, and `assets.binding = "ASSETS"`.
4. Do not set custom domains, production `routes`, zone bindings, DNS records, or production script names.
5. Run `wrangler deploy --dry-run` first. Abort on any config/build failure. Require a deliberate operator confirmation before deploying.
6. After deployment, capture the deployment/version identifiers and verify HTTP responses for `/`, `/healthz`, `/assets/lingo-os.css`, `/assets/lingo-os.js`, `/api/v1/platform/gates`, and `/api/v1/platform/modules`. Confirm the API endpoints preserve dynamic Worker behavior and static assets return their expected content types.
7. Independently read Worker settings and require the `ASSETS` binding to be present. Preserve response status, headers, timestamps, commit SHA, deployment IDs, and hashes as evidence.

### Acceptance

This work remains BLOCKED until the authenticated deploy succeeds, the deployed binding is confirmed, and the regression probes are independently captured. A script review, successful dry run, or asset manifest registration does not count as runtime acceptance. G02 runner dispatch remains independently BLOCKED; this asset-preview work cannot satisfy G02 or authorize production release.

Production DNS/routes, the authoritative Worker, release gates, and last-known-good are not to be changed by this procedure.

### Repository helper

The existing integration branch now contains `ops/g02/deploy-preview-assets.sh`. From a clean checkout of this exact branch, the default invocation authenticates Wrangler and runs a dry-run only:

    bash ops/g02/deploy-preview-assets.sh

It does not deploy unless the operator separately sets `LINGO_PREVIEW_DEPLOY_CONFIRM=YES` and passes `--deploy`. The script checks branch identity and clean working tree, stages only the homepage, tracked public assets, manifest, and optional LINGO Nexus registry, and hard-pins Wrangler to `lingo-recovery-preview` with no production routes. Its post-deploy HTTP checks are preliminary only; independent browser and Worker-binding verification are still required.

