# G02 Public-Repository Runner Security Gate

Status: BLOCKING SECURITY FINDING — DESIGN REVIEW REQUIRED.

## Finding
The repository is public and the proposed G02 runner would be registered at repository scope under a personal GitHub account. GitHub explicitly warns that self-hosted runners should almost never be used for public repositories because contributors can submit pull requests that may execute untrusted workflow code and persistently compromise the runner.

Source: https://docs.github.com/en/actions/reference/security/secure-use

Workflow approval settings are not a sufficient substitute for runner isolation. GitHub documents that approved pull-request workflows may execute user-controlled code on self-hosted infrastructure. A one-job ephemeral runner registration does not by itself prove the underlying machine/container is a clean, isolated VM after each job.

## Repository workflow inventory finding
A code-search review found several workflows targeting the canonical `[self-hosted, linux, x64, lingo-g02]` labels. At least these workflows include push triggers:
- `.github/workflows/runner-self-hosted-g02.yml` — push to `infra/g02-runner-recovery-clean-2026-10-09`
- `.github/workflows/g02-fresh-assignment-probe.yml` — push to `main`
- `.github/workflows/runner-dispatch-diagnostic.yml` — push to `main`
- `.github/workflows/actions-runner-smoke.yml` — push to `main`
- `.github/workflows/g02-qualified-evidence-probe.yml` — push to `main`

Manual-dispatch-only G02 jobs also exist. This is a partial code-search inventory, not a complete proof of repository Actions policy or all workflow trigger behavior.

## Decision gate — do not provision until one safe architecture is selected

### Option A — private dedicated runner repository (preferred if self-hosted execution is required)
- Create a separate private repository dedicated to trusted runner control and sentinel code.
- Do not execute application pull-request source on the runner.
- Use a distinct runner identity scoped only to that private repository.
- Use a fresh isolated VM per job where possible; do not treat an ephemeral registration alone as VM isolation.
- Keep application repository artifacts as untrusted inputs; verify signatures/hashes and never execute them on the control runner without a separate threat review.

### Option B — keep this repository public; do not attach a persistent self-hosted runner
- Use GitHub-hosted runners for normal CI.
- Keep G02 as a separate infrastructure experiment in a private test repository.
- Do not deploy the proposed Render runner worker for this public repository.

### Option C — change this repository's visibility
Changing repository visibility is a high-impact ownership/product decision and is not authorized by this design PR. It requires explicit owner decision and a separate review of forks, access, integrations, licensing, and public-site expectations.

## Render-specific constraints
Render background workers run continuously without inbound traffic and can poll queues. Render services use ephemeral filesystems by default; persistent disks are available for paid background workers but are single-instance and constrain deployment behavior. A persistent disk does not make a runner secure or isolated. Render background workers are not general-purpose disposable VMs.

Sources:
- https://render.com/docs/background-workers
- https://render.com/docs/disks

## Credential policy
No GitHub App, PAT, Render API key, runner registration token, or private key should be created for this public-repository runner design. Do not add runner credentials to the proposed Render worker.

## Required next steps
1. Confirm whether the repository is intended to remain public.
2. If public, choose Option A or B; do not create a runner for this repository.
3. If Option A, design the private control repository and trust boundary separately.
4. Reassess Render as a queue/orchestration worker only after the runner trust model is resolved.
5. Only then implement a token broker and supervisor, test it in an isolated private test repository, and provision paid compute after owner approval.

## Gate result
- Public repository self-hosted runner safety: BLOCKED.
- Render service provisioning: BLOCKED.
- Credential creation: BLOCKED.
- Production promotion: NOT AUTHORIZED.
