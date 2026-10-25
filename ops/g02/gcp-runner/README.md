# LINGO Legacy G02 — Google Cloud self-hosted runner

This module provisions an isolated Ubuntu 24.04 LTS Compute Engine VM and a dedicated VPC/subnet. It does **not** register a GitHub runner, change repository workflow routing, merge a PR, or deploy production.

## Defaults

- VM: `lingo-legacy-g02`, `e2-standard-2` (2 vCPU / 8 GB RAM)
- OS: Ubuntu 24.04 LTS x86-64
- Disk: 40 GB balanced persistent disk
- Network: dedicated VPC/subnet; private VM address only; Cloud NAT for outbound connectivity; no public ingress rule
- SSH administration: Google Cloud IAP TCP forwarding only
- VM identity: dedicated service account with no project IAM roles granted by this module; legacy metadata endpoints disabled
- Runner labels after enrollment: built-in `self-hosted`, `linux`, `x64`, plus `lingo-g02`

Review the subnet CIDR and zone before applying. Defaults may conflict with existing network ranges or organization policy. Cloud NAT incurs additional charges. The VM has no public IP; outbound traffic uses Cloud NAT. The module creates a dedicated service account but intentionally grants it no project IAM roles. The VM cannot use Google Cloud APIs that require IAM permissions unless an administrator later grants a narrowly scoped role for a documented need.

## Prerequisites

1. An existing Google Cloud project with billing enabled.
2. Permission to enable the Compute Engine API and create network, firewall, and VM resources.
3. Terraform 1.5+ and authenticated Google Cloud credentials, preferably through Application Default Credentials. The deploying identity must have the permissions required to create the service account, VPC, subnet, firewall, router/NAT, and Compute Engine VM.
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
terraform plan -out=tfplan -var="project_id=YOUR_PROJECT_ID"
terraform apply tfplan
```

Do not commit `tfplan`, Terraform state, service account keys, registration tokens, or other credentials. The VM and related resources incur Google Cloud charges while present.

## Enroll the runner

1. Use the output `iap_ssh_command` to connect with IAP.
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

The canary must execute `uname -a`, `id`, and a unique sentinel command; the completed job must have retrievable logs. Capture the workflow run URL, runner name/labels, job ID, and log evidence. Do not mark G02 passed unless the runner is online, assigned to the job, the sentinel executes, and logs are retrievable.

Do not route untrusted pull-request code or production deployment jobs to this runner until security boundaries and permissions are reviewed. A self-hosted runner does not diagnose or repair separate failures on GitHub-hosted `ubuntu-latest` jobs.

## Cleanup

After reviewing the planned destruction, run `terraform destroy -var="project_id=YOUR_PROJECT_ID"`. Confirm the VM is no longer needed first. GitHub runner deregistration is a separate step and should be completed before destroying the VM.
