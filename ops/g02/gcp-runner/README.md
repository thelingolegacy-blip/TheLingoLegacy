# LINGO Legacy G02 — Google Cloud self-hosted runner

This module provisions an isolated Ubuntu 24.04 LTS Compute Engine VM and a dedicated VPC/subnet. It does **not** register a GitHub runner, change repository workflow routing, merge a PR, or deploy production.

## Defaults

- VM: `lingo-legacy-g02`, `e2-standard-2` (2 vCPU / 8 GB RAM)
- OS: Ubuntu 24.04 LTS x86-64
- Disk: 40 GB balanced persistent disk
- Network: dedicated VPC/subnet with a reserved external IPv4 address for outbound GitHub HTTPS connectivity
- SSH administration: IAP TCP forwarding by default; optional direct SSH only when `admin_ssh_cidr` is set to a trusted public IPv4 CIDR
- VM identity: dedicated service account with no project IAM roles granted by this module; legacy metadata endpoints disabled
- Runner labels after enrollment: built-in `self-hosted`, `linux`, `x64`, plus `lingo-g02`

Review the subnet CIDR, zone, and SSH source CIDR before applying. Defaults may conflict with existing network ranges or organization policy. The VM has a reserved external IPv4 address. The firewall allows only IAP SSH by default; direct SSH is disabled unless `admin_ssh_cidr` is set to a trusted address such as `YOUR_PUBLIC_IP/32`. Never use `0.0.0.0/0` for SSH. The reserved external IP incurs charges while allocated. The module creates a dedicated service account but intentionally grants it no project IAM roles. The VM cannot use Google Cloud APIs that require IAM permissions unless an administrator later grants a narrowly scoped role for a documented need.

## Prerequisites

1. An existing Google Cloud project with billing enabled.
2. Permission to enable the Compute Engine API and create network, firewall, and VM resources.
3. Terraform 1.5+ and authenticated Google Cloud credentials, preferably through Application Default Credentials. The deploying identity must have the permissions required to create the service account, VPC, subnet, firewall, reserved external IP, and Compute Engine VM.
4. A GitHub repository administrator able to create a short-lived repository runner registration token.

## Provision

From this directory, initialize, review and validate before applying:

```bash
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable compute.googleapis.com
terraform init
terraform fmt -check
terraform validate
terraform plan -out=tfplan -var="project_id=YOUR_PROJECT_ID" -var="admin_ssh_cidr="
terraform apply tfplan
```

Do not commit `tfplan`, Terraform state, service account keys, registration tokens, or other credentials. The VM and related resources incur Google Cloud charges while present.

## Enroll the runner

1. Generate an SSH key pair locally if needed: `ssh-keygen -t ed25519 -f ~/.ssh/lingo-g02`. With OS Login enabled, add the public key to your Google OS Login profile using `gcloud compute os-login ssh-keys add --key-file ~/.ssh/lingo-g02.pub`. Never upload the private key to GitHub, Terraform, VM metadata, or chat. Use `iap_ssh_command` to connect with IAP. Direct SSH to the external IP requires an explicitly configured `admin_ssh_cidr` and corresponding client key.
2. Verify bootstrap completed: `sudo cat /var/log/lingo-g02/bootstrap-status.txt`.
3. In GitHub, open **Settings → Actions → Runners → New self-hosted runner** for this repository and generate a short-lived registration token. Follow GitHub's current instructions if the download API or runner configuration flow changes.
4. Copy this directory's `register-runner.sh` to the VM using a trusted route, then run it as a sudo-capable administrator. Enter the token only at its prompt; do not place it in shell history, metadata, files, or logs.
5. Verify the service with `sudo /opt/actions-runner/svc.sh status` and verify GitHub shows `lingo-legacy-g02` as **Online** with `self-hosted`, `linux`, `x64`, and `lingo-g02` labels.

The enrollment script retrieves the current runner release version from GitHub's API and validates the downloaded archive structure. For high-assurance environments, verify the release checksum/signature against GitHub's published release data before installation.

## Acceptance — no release promotion

Use a minimal, non-deploying canary targeted to:

```yaml
runs-on: [self-hosted, linux, x64, lingo-g02]
```

The repository workflow `.github/workflows/runner-dispatch-diagnostic.yml` is deliberately `workflow_dispatch` only. It requires an incident reference and explicit confirmation before routing to `[self-hosted, linux, x64, lingo-g02]`; it does not auto-run on pushes. The canary records run ID, attempt, runner identity, OS/architecture, incident reference, sentinel result, and forensic exit marker, then uploads a 14-day evidence artifact. It must complete with retrievable job logs and artifact. Capture the workflow run URL, runner name/labels, job ID, logs, and artifact evidence. Do not mark G02 passed unless the runner is online, assigned to the job, the sentinel executes, and logs are retrievable.

Do not route untrusted pull-request code or production deployment jobs to this runner until security boundaries and permissions are reviewed. A self-hosted runner does not diagnose or repair separate failures on GitHub-hosted `ubuntu-latest` jobs.

## Cleanup

After reviewing the planned destruction, run `terraform destroy -var="project_id=YOUR_PROJECT_ID"`. Confirm the VM is no longer needed first. GitHub runner deregistration is a separate step and should be completed before destroying the VM.


## Secrets and SSH key handling

There is no checked-in `secrets.yml` for this runner, and credentials must not be stored in a YAML file. Do not create or commit a file containing runner registration tokens, SSH private keys, cloud credentials, or GitHub secrets. GitHub runner registration tokens are short-lived and should be entered interactively only when enrolling the runner. The SSH private key stays on the administrator's device; only its public key is added to the Google OS Login profile. Use GitHub repository/environment secrets only for a specific workflow requirement, with least privilege and rotation. The current G02 sentinel does not require repository secrets.

## External IP and firewall verification

Terraform reserves a regional external IPv4 address and attaches it to the VM for outbound HTTPS access to GitHub. The default inbound SSH rule permits only Google IAP TCP forwarding from `35.235.240.0/20`. Direct inbound SSH is disabled unless `admin_ssh_cidr` is set to a trusted public IPv4 CIDR (normally `YOUR_PUBLIC_IP/32`); never expose TCP/22 to `0.0.0.0/0`. The external address may incur charges while allocated. After provisioning, verify the assigned address with `terraform output external_ip` and verify runner connectivity separately from SSH connectivity.


## Orchestrated recovery pipeline

`run-sentinel-pipeline.sh` coordinates validation, a reviewed Terraform plan, optional provisioning, IAP bootstrap verification, runner enrollment, online-status polling, manual sentinel dispatch, and evidence collection. It does not merge code or clear the production hold.

Run from a trusted control machine after installing and authenticating Terraform, Google Cloud CLI, GitHub CLI, `jq`, and `curl`:

```bash
export GCP_PROJECT_ID="YOUR_REAL_PROJECT_ID"
export GCP_REGION="us-east1"
export GCP_ZONE="us-east1-b"
export GH_REPO="thelingolegacy-blip/TheLingoLegacy"
export G02_GIT_REF="infra/gcp-self-hosted-runner-g02-2026-10-24"
export INCIDENT_REFERENCE="YOUR_APPROVED_RECOVERY_TICKET"
bash ops/g02/gcp-runner/run-sentinel-pipeline.sh
```

The first pass validates and plans only. Inspect the saved plan review before explicitly enabling provisioning:

```bash
APPLY_INFRA=1 bash ops/g02/gcp-runner/run-sentinel-pipeline.sh
```

The apply path requires typing `APPLY G02`. After provisioning, the script stops before enrollment by default. Review the instructions and confirm interactive IAP access before opting in:

```bash
APPLY_INFRA=1 AUTO_ENROLL=1 bash ops/g02/gcp-runner/run-sentinel-pipeline.sh
```

Use a short-lived runner registration token only at the interactive enrollment prompt. Never export it as an environment variable or place it in shell arguments, source control, metadata, or logs. The pipeline is intentionally fail-closed; a failed check stops later steps. A successful sentinel is evidence of execution only, not independent release authorization. Production remains protected until every required release gate is reviewed and accepted.


### Important pre-provisioning gate: default-branch workflow

GitHub manual dispatch uses the workflow definition present on the repository's default branch, even when a dispatch selects another ref. The current `main` version of `.github/workflows/runner-dispatch-diagnostic.yml` does not yet declare the required `incident_reference` and `confirm_runner` inputs. The orchestration script therefore refuses to provision cloud infrastructure when `APPLY_INFRA=1` until the reviewed workflow change is accepted through the repository's normal review and merge controls. Do not bypass this check or manually dispatch an incompatible workflow.
