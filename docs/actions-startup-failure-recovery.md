# GitHub Actions startup failure recovery

## Purpose

This isolated probe tests whether GitHub can allocate a GitHub-hosted `ubuntu-latest` runner, execute real Linux/toolchain assertions, retrieve the provider-observed job and runner identity, and retain correlated evidence.

It is deliberately independent of the quarantined G02 self-hosted runner and does not deploy, publish, access application secrets, or modify production resources.

## Workflow

`.github/workflows/actions-startup-probe.yml`

The workflow is triggered by a pull request that changes this document or the workflow itself, or manually through `workflow_dispatch`.

## Evidence requirements

A successful validation requires all of the following:

1. A GitHub Actions run reaches job execution on `ubuntu-latest`.
2. The job has a provider-assigned job ID and runner ID greater than zero, with a non-empty runner name.
3. The runner identity, operating system, architecture, image metadata, commit SHA, run ID, and attempt are recorded.
4. Bash, Git, Python, Node.js, and npm versions are captured.
5. Linux assertions execute successfully.
6. The workflow retrieves its own job metadata through the GitHub Actions API using the workflow token with read-only `actions: read` permission.
7. A correlated manifest and SHA-256 checksums are produced.
8. The evidence artifact is uploaded and downloadable.

A workflow file existing, a run being created, or a job being queued does not constitute success. A failed, cancelled, queued, or startup-failure run is not accepted as recovery.

## Safety boundaries

- Uses GitHub-hosted `ubuntu-latest`; does not target `self-hosted` or `lingo-g02`.
- Grants only `contents: read` and `actions: read`.
- Does not request repository secrets or write tokens.
- Does not deploy, publish, modify DNS, change Cloudflare or Firebase production, or activate payment functionality.
- Does not change repository or organization settings.
- Does not merge this pull request.

## Acceptance procedure

Review the workflow run and confirm the provider-reported runner ID/name, completed job steps, successful conclusions, logs, downloadable artifact, manifest, and checksums. Repeat the probe successfully before declaring hosted Actions startup recovery verified.

Record the run URL, job ID, runner identity, commit SHA, artifact URL, and checksum evidence in the master execution issue #612.

If GitHub cannot allocate the hosted runner or the token cannot read job metadata, record the exact provider error and required owner-side permission or quota action. Do not substitute assumptions for provider evidence.
