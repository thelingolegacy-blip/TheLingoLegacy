# LINGO G02 — Render Ephemeral Runner (staging recovery route)

This package defines a separate Render Background Worker that registers a repository-scoped, one-job GitHub Actions runner. It is intentionally isolated from the canonical `lingo-g02` runner label and does not alter existing G02 workflows or production services.

## Current state

- Source package only; no Render service is created by this repository change.
- The Blueprint is stored at this path so it can be selected as a custom Blueprint path in Render: `ops/github-runner/render/render.yaml`.
- The proposed service is a paid `1c-2g` Background Worker in Ohio, one instance, with automatic deploys disabled. Do not apply it while the no-billing restriction is active.
- No persistent disk is required. The runner installation and workspace are rebuilt for each one-job runner cycle.
- The container does not install Docker or mount a Docker socket. It is intended for the dedicated evidence-probe workflow, not Docker builds or arbitrary CI workloads.

## GitHub App requirements

Create or use a GitHub App installed only on `thelingolegacy-blip/TheLingoLegacy` with repository **Administration: read and write** permission. The worker uses the App private key to mint a short-lived installation token, then requests a short-lived repository runner registration token. It does not use a PAT and never stores a token in the repository.

Configure these Render environment variables as secrets:

- `GITHUB_APP_ID`: numeric GitHub App ID.
- `GITHUB_APP_INSTALLATION_ID`: numeric installation ID for this repository installation.
- `GITHUB_APP_PRIVATE_KEY_B64`: base64-encoded PEM private key. Generate the base64 value locally; never paste the private key into GitHub or this repository.

Static settings are defined in the Blueprint. The runner name is unique per cycle and the labels are `self-hosted,linux,x64,lingo-g02-render`.

## Isolation and lifecycle

- Only the new `g02-render-ephemeral-probe.yml` workflow targets `lingo-g02-render`.
- That workflow is `workflow_dispatch` only; no pull-request, push, or production deployment trigger is added.
- The runner uses `--ephemeral` and `--disableupdate`; GitHub deregisters it after one job.
- The supervisor runs as root only to mint registration tokens and recreate a clean runner directory. Runner configuration and job execution run as the unprivileged `runner` user.
- The job process receives a clean environment; GitHub App private-key material and installation tokens are not inherited by job steps.
- Existing online runners with this Render prefix block duplicate registration. Offline/stale registrations are not automatically deleted; inspect the exact runner ID before manual cleanup.
- The Render worker has no production secrets, no production routes, no Cloudflare credentials, no Docker daemon, and no persistent disk.

## Evidence contract

The manual probe validates the positive numeric runner ID, generated runner name, Linux/x64/self-hosted identity, run ID, commit SHA, and numeric job ID obtained from GitHub's Actions API. It writes a JSON evidence manifest, verifies its SHA-256 checksum, and uploads the evidence as `g02-render-evidence-<run_id>`.

The artifact is not self-accepting. After the job completes, an independent reviewer must retrieve the GitHub run/job records and artifact, verify the checksum and all correlations, and record acceptance separately. This workstream does not authorize promotion.

## Deployment gate

Do not apply this Blueprint until the owner separately authorizes paid Render compute. Before deployment, validate the Blueprint with Render CLI/API, configure the three GitHub App secrets in Render, review the plan and estimated spend in the Render Dashboard, and confirm the worker is isolated from production. Keep auto-deploy off and trigger a reviewed deploy manually.
