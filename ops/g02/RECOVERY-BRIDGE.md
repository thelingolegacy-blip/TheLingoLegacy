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
