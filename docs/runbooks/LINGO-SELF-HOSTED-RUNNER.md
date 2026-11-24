# LINGO G02 Self-Hosted GitHub Actions Runner

**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Runner name default:** `lingo-g02-<hostname>`  
**Required labels:** `self-hosted`, `linux`, `x64`, `lingo-g02`  
**Host baseline:** dedicated Ubuntu 22.04 or 24.04 VM  
**Status:** bootstrap files prepared; VM provisioning, registration, online check and job execution are NOT yet confirmed.

## Architecture and security boundaries

- Register this runner at repository scope, restricted to this repository.
- Use a dedicated VM and non-login `actions` account.
- Do not attach production credentials, Cloudflare API tokens, Firebase service-account keys, Supabase service-role keys, wallet/payment secrets, or customer data.
- Do not run untrusted fork or pull-request code on this runner. The initial probe is manual-only and has no checkout, secrets, external actions or write permissions.
- Prefer an ephemeral runner or a dedicated runner group for untrusted CI. This persistent runner is for trusted, reviewed, manual validation only.
- Keep the host patched, restrict inbound networking, allow only required outbound HTTPS, enable provider console/MFA, and monitor disk, memory and runner service health.
- Registration tokens are short-lived. Never commit them, place them in workflow YAML, save them in shell history, or paste them into chat.

## Provisioning prerequisites

1. Provision one dedicated Ubuntu 22.04/24.04 VM in an account controlled by LINGO.
2. Set a cost ceiling and confirm provider, region, CPU/RAM/disk, billing owner and shutdown policy before creating billable infrastructure.
3. Download the official GitHub Actions runner archive from the official `actions/runner` GitHub releases page. Verify its published SHA-256 checksum.
4. In GitHub, open repository Settings → Actions → Runners → New self-hosted runner. Select Linux and x64. Copy the short-lived registration token locally; do not share it.
5. Run the installer below from a secure terminal on the VM.

## Install

Set these environment variables in the VM terminal, not in chat or a committed file:

- `RUNNER_TOKEN`: short-lived registration token from GitHub.
- `RUNNER_TARBALL_URL`: official GitHub runner release tarball URL for Linux x64.
- `RUNNER_TARBALL_SHA256`: published SHA-256 checksum for that exact archive.
- Optional `RUNNER_NAME`: defaults to `lingo-g02-<hostname>`.

Then run:

```bash
sudo --preserve-env=RUNNER_TOKEN,RUNNER_TARBALL_URL,RUNNER_TARBALL_SHA256,RUNNER_NAME bash scripts/runner/install-lingo-runner.sh
```

The script refuses to overwrite an existing runner directory/user, checks the official release URL and checksum, configures a repository-scoped runner, and installs its system service.

## Verification

1. GitHub Settings → Actions → Runners must show the named runner as **Idle/Online**.
2. Dispatch `.github/workflows/lingo-self-hosted-runner-probe.yml` from the trusted default branch.
3. Confirm a job is assigned to the expected runner, has a nonzero runner ID, completes all steps, and exposes logs.
4. Record runner name, OS, architecture, runner version, job ID, run ID, commit SHA, timestamps and outcome.
5. Do not mark G02 accepted until these facts are independently verified.

## Operations

- Check service: `sudo systemctl status 'actions.runner.*'`
- View logs: `sudo journalctl -u 'actions.runner.*' --since today`
- Stop service before maintenance: use the runner service's `svc.sh stop` from `/opt/actions-runner`.
- Unregister before decommission: `./config.sh remove --token <fresh-removal-token>`; then remove the VM through its provider.
- Rotate registration/removal tokens by generating fresh short-lived tokens in GitHub settings. Never reuse expired tokens.

## Rollback

If the runner behaves unexpectedly, stop and disable its service, remove it from GitHub repository Settings → Actions → Runners, preserve logs for investigation, and rebuild from a clean VM. No production system should depend on this runner until G02 acceptance and release controls pass.

## Current blockers

The ChatGPT-connected GitHub integration does not expose repository runner registration-token creation, repository secrets, or cloud VM provisioning. Therefore these files prepare the controlled bootstrap but do not provision a VM or register a runner. A cloud provider account and a cost-approved VM are still required. The short-lived token must be generated and used locally by an authorized repository administrator.


## DigitalOcean provisioning decision — hard $0 ceiling

**Selected provider:** DigitalOcean  
**Authorized recurring and one-time spend:** USD $0.00  
**Provisioning status:** BLOCKED — no Droplet created and no billing action taken.

DigitalOcean's published Droplet pricing currently starts at $4/month. Its signup credit is promotional, expires 90 days after signup, and requires a valid payment method before Droplets can be created. A temporary credit does not satisfy a guaranteed $0 ongoing-cost ceiling. Therefore this runbook intentionally does not create a Droplet, attach a payment method, or consume promotional credit. Recheck current pricing and credit terms before any future provisioning.

### Prepared DigitalOcean host profile (not deployed)

- Resource name: `lingo-g02-runner-01`
- Region: NYC3 (proposed; choose nearest available region when approved)
- Image: Ubuntu 24.04 LTS x64
- Size: smallest Basic plan that satisfies the current Actions runner requirements; do not create until a nonzero budget is explicitly approved
- Access: SSH key only; no password SSH; non-root sudo operator; provider firewall permits SSH only from an explicitly approved admin IP; runner makes outbound HTTPS connections
- Runner scope: repository-only, labels `self-hosted,linux,x64,lingo-g02`
- Billing guard: do not create, resize, snapshot, enable backups, or reserve IP resources under the current $0 ceiling

### Registration handoff (prepared; requires authorized local operator)

1. Once a $0-cost compute allocation or a separately approved budget exists, create the dedicated Ubuntu host with the security profile above.
2. SSH to the host using its pre-registered public key and patch the OS.
3. In the GitHub repository, open Settings → Actions → Runners → New self-hosted runner → Linux → x64. Generate a fresh repository-scoped registration token.
4. Keep the token in the operator's local terminal environment only. Do not paste it into ChatGPT, issues, pull requests, logs, shell history, or source control.
5. Download the runner release archive and published checksum shown by GitHub's runner setup instructions. Verify the checksum, then run the installer from the trusted checked-out branch with the three required environment variables.
6. Confirm the runner appears Idle/Online in repository settings. Only then dispatch the manual G02 probe from the trusted default branch.
7. Accept G02 only after the run records a nonzero runner ID, assigned job, completed steps, retrievable logs, run ID and commit SHA.

**No token has been generated or exposed, no host has been created, and no runner is registered.** The repository integration does not provide the GitHub registration-token action or DigitalOcean account provisioning. Those two operations must be completed by an authorized operator in the provider/GitHub consoles or by an explicitly connected, properly scoped automation integration.
