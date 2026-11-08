# LINGO G02 Docker host

## Purpose

A dedicated Ubuntu 24.04 x86_64 VM running Docker Engine for isolated LINGO assistant workloads and controlled build support. The host is separate from Cloudflare production Workers and must not be treated as a production application server.

The three assistant workloads are distinct:
- `LINGOassist`
- `LINGOassister`
- `LINGOassisthem`

## Provisioning status

**Source prepared; host not provisioned.** This repository change does not create a VM, attach a disk, open firewall ports, create a billable resource, install Docker remotely, or register a GitHub runner.

A cloud VM is required. The preferred target is an Azure Linux VM in a dedicated resource group and VNet, but Azure ARM/VM account access is not currently connected in the execution environment. Render is not a general-purpose VM/host provider for this Docker Engine host workflow.

## Host baseline

- Ubuntu Server 24.04 LTS, amd64/x86_64.
- Dedicated VM; no production workloads or shared tenant workloads.
- Start with 4 vCPU and 8 GiB RAM, 80 GiB encrypted OS/data disk; resize only from measured load.
- SSH restricted to an approved administrator source range; no public Docker TCP endpoint.
- Cloud firewall: deny inbound by default; permit only administrator SSH and explicitly approved service ingress. Assistant networks remain private.
- Docker Engine from Docker's official Ubuntu apt repository, signed by its repository key.
- Docker daemon local log driver with rotation and live-restore.
- Host patching, time sync, disk monitoring, centralized audit logs, and backup/rebuild procedure required.
- Do not add application or runner users to the unrestricted `docker` group.

## Install Docker Engine

On a newly provisioned Ubuntu 24.04 amd64 host, inspect and run:

```bash
sudo bash ops/g02-host/install-docker-engine.sh
```

The script refuses non-Ubuntu-24.04/non-amd64 hosts and refuses to overwrite an existing Docker socket. It installs Docker Engine, CLI, containerd, Buildx, and Compose v2. It does not install/register the Actions runner or deploy assistant images.

## Assistant isolation

`docker-compose.assistants.yml` defines three separate services and three separate internal-only networks. Each service:
- uses a separately reviewed immutable image reference;
- runs as UID/GID 10001;
- has a read-only root filesystem, no Linux capabilities, no-new-privileges, PID/memory/CPU limits, and a constrained temporary filesystem;
- has no published host port, host mount, privileged mode, or Docker socket.

Before starting, build and scan each application image in a separate trusted pipeline, pin it by digest, and confirm that it supports UID/GID 10001 and read-only root. The Compose file is intentionally not startable until the three image references are supplied. A gateway/API contract and explicit ingress policy must be reviewed before any service is exposed.

Example after all image digests are approved:

```bash
export LINGOASSIST_IMAGE='registry.example/lingoassist@sha256:<approved-digest>'
export LINGOASSISTER_IMAGE='registry.example/lingoassister@sha256:<approved-digest>'
export LINGOASSISTHEM_IMAGE='registry.example/lingoassisthem@sha256:<approved-digest>'
docker compose -f ops/g02-host/docker-compose.assistants.yml --profile assistants config
```

Do not use mutable `latest` tags or place credentials in the Compose file.

## G02 runner security boundary

The G02 GitHub Actions runner remains a separate ephemeral workload with labels:
`self-hosted, linux, x64, lingo-g02`.

- Inspect repository runner inventory before registration; never create a duplicate.
- Do not expose the host Docker socket to the runner or assistant workloads.
- Do not run untrusted fork or pull-request code on the privileged host.
- Use an isolated remote builder or a separately hardened rootless build service if trusted CI requires image builds.
- Registration token must be short-lived, generated only after host access and duplicate checks, and never stored in repository source.
- Runner execution is not accepted until run/job/runner/full-SHA correlation, completed steps, logs, artifact, checksum verification, and independent G02 acceptance are all retrievable.

## Completion gates

1. Cloud subscription, resource group, region, network, budget alert, and VM owner confirmed.
2. VM created; host identity, image, size, disk, IP policy, and cloud audit record verified.
3. OS patching and Docker Engine install verified on the host.
4. Firewall and SSH access independently checked; no public Docker API.
5. Assistant images built, scanned, signed/attested, pinned by digest, and runtime-tested.
6. Three assistant services started and health-checked on isolated networks.
7. G02 runner inventory inspected; one ephemeral runner registered without duplication.
8. Real workflow executed; logs and artifact independently retrieved and verified.
9. Acceptance recorded separately from source merge; production promotion remains a separate authorization gate.

## Current release posture

G02: **BLOCKED** until host and real execution evidence exist.
Production: **PROTECTED**.
Promotion: **HOLD**.


## Azure host deployment template

An Azure Bicep template is provided at `ops/g02-host/azure/main.bicep`. It defines:
- one Ubuntu 24.04 LTS VM with a system-assigned managed identity;
- Trusted Launch with Secure Boot and vTPM;
- Premium SSD OS disk (128 GiB);
- a dedicated VNet, private subnet, and NSG with no inbound allow rules;
- a private NIC only; no public IP or public Docker API.

Before deployment, confirm the Azure subscription, resource group, region, VM size availability, budget alerts, and private administration path. The default size is `Standard_D4s_v5`; it is a sizing proposal, not a cost approval. No Azure resources are created by committing this template.

Prepare parameters from `parameters.example.json` and replace the SSH public-key placeholder with a public key. Never place a private key in the parameters file or repository. Example deployment after subscription and resource-group selection:

```bash
az deployment group create \
  --resource-group <approved-resource-group> \
  --template-file ops/g02-host/azure/main.bicep \
  --parameters @ops/g02-host/azure/parameters.json
```

The template intentionally creates no public IP and no inbound SSH exception. Administer the host through Azure Run Command or an approved private access path such as Azure Bastion after the network design and required Bastion resources are reviewed. Once the host is reachable through the approved management path, transfer and run `install-docker-engine.sh`.

The deployment operator must verify the resulting VM, NIC private address, NSG rules, managed identity, disk encryption posture, Azure activity log, and actual hourly/monthly cost before installing Docker or registering G02.
