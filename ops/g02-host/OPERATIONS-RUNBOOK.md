# G02 Host and Assistant Platform Operations Runbook

Status: DRAFT — source documentation only; not deployment evidence.
Applies to: `lingo-g02-host`, Ubuntu Server 24.04 LTS amd64, Docker Engine/Compose, the isolated LINGO assistant workloads, and the separately managed ephemeral GitHub Actions runner.
Repository: `thelingolegacy-blip/TheLingoLegacy`
Infrastructure change: draft PR #421. Do not merge or promote on the strength of this document.

## 1. Operating contract and authority

The required release chain is:

`SOURCE → ACTUAL EXECUTION → RETRIEVABLE EVIDENCE → INDEPENDENT VERIFICATION → ACCEPTANCE → AUTHORIZATION → PROMOTION`

Current gate: **BLOCKED**. Production: **PROTECTED**. Promotion: **HOLD**.

This runbook does not claim that a VM, DNS record, public endpoint, container image, assistant service, runner, or backup currently exists. No Azure VM or billable resource has been provisioned by this change. The Azure Resource Manager/VM connector was not available in the execution environment. Azure subscription authorization alone does not create a connected deployment session.

Never:
- put passwords, private SSH keys, PATs, runner registration tokens, cloud credentials, or production secrets in Git, issue comments, chat, shell history, image layers, or logs;
- expose the Docker API/socket, runner control plane, database, metrics, or internal assistant ports to the public internet;
- attach production secrets to PR/fork jobs or untrusted code;
- run a privileged persistent runner for arbitrary pull-request code;
- use a mutable image tag as an accepted release identity;
- interpret a queued job, UI "online" badge, source-only check, or empty workflow run as execution evidence;
- promote a Worker, DNS route, application, or production configuration without a separate approved change and rollback plan.

## 2. Target architecture

### 2.1 Host baseline (proposed; validate before purchase)

- Name: `lingo-g02-host`
- OS: Ubuntu Server 24.04 LTS, amd64
- Proposed VM: 4 vCPU / 8 GiB RAM; proposed 128 GiB Premium SSD
- Network: dedicated VNet and private subnet; private NIC; no public IP; NSG default-deny inbound
- Identity: system-assigned managed identity, least privilege
- Boot security: Trusted Launch, Secure Boot and vTPM where supported
- Runtime: Docker Engine, CLI, containerd, Buildx and Compose plugin from Docker's signed apt repository
- Logs: Docker local driver with rotation; host journald retention configured and monitored
- Time: chrony/systemd-timesyncd synchronized to trusted time source
- Patch: security updates, controlled reboot window, kernel/daemon restart evidence

VM size, region, disk tier, backup retention, egress, monitoring, support, and recurring spend require an explicit cost review before resource creation. Do not assume the proposed size is approved.

### 2.2 Workload isolation

The Compose specification defines three distinct internal networks and services:
- `LINGOassist`
- `LINGOassister`
- `LINGOassisthem`

Each service must use a reviewed immutable image digest, non-root UID/GID, read-only root filesystem where compatible, `no-new-privileges`, all capabilities dropped, bounded CPU/memory/PIDs, and no host port or Docker socket. Secrets are injected at runtime from an approved secret manager and are never baked into images.

The three services are separate trust boundaries. Do not assume that network separation alone prevents access to host resources. Validate filesystem mounts, DNS, egress, service accounts, secrets, and container runtime policy independently.

The GitHub runner is a separate ephemeral workload. It must not share the assistant networks, mount the Docker socket, or receive production credentials. If a workflow needs image builds, use an isolated disposable builder or an approved remote build service.

### 2.3 Endpoints and exposure policy

No routable service endpoint is currently established by this source package. Do not publish or invent one.

| Interface | Intended access | Exposure |
|---|---|---|
| SSH/admin | approved operator through private access path (VPN, bastion, or just-in-time access) | private only; no general internet ingress |
| Azure VM/management | cloud control plane and managed identity | provider control plane; RBAC-scoped |
| Docker Engine API | local host administration only | Unix socket; never TCP/public |
| Assistant APIs | approved internal gateway/service callers | internal network only; no host port mapping |
| Assistant health checks | orchestrator/local monitoring | internal only |
| Metrics/logs | approved monitoring collector | private authenticated channel |
| GitHub runner listener | outbound runner-to-GitHub connection | outbound TLS only; no inbound listener |
| Public web | existing Cloudflare-routed application only | unchanged by this runbook |

Before any endpoint is activated, record its owner, exact hostname/IP, listener, port/protocol, TLS issuer and renewal owner, authentication method, authorization model, network policy, health probe, rate limit, WAF policy, logging destination, data classification, and rollback command. Public ingress requires a separate security review and explicit authorization. Never open broad inbound CIDRs as a troubleshooting shortcut.

### 2.4 Service and endpoint registry

Maintain a deployment-specific registry after provisioning; populate only from actual outputs:
- Azure subscription ID (store in approved inventory, not public docs), resource group, region, deployment name and activity-log correlation ID;
- VM resource ID, image reference, size, OS build, private IP, NIC, subnet, NSG and managed-identity principal ID;
- SSH/bastion/VPN access route and authorized operator group;
- Docker Engine/Compose versions and daemon configuration hash;
- each assistant image repository@sha256 digest, SBOM, scan report, signature/attestation, config version, health result and deployment timestamp;
- runner registration scope, runner ID/name/labels, ephemeral status, GitHub repository, workflow run/job IDs and evidence artifact;
- internal DNS names and ports only after they are actually allocated;
- monitoring workspace, log destination, alert routes, backup vault and restore point identifiers.

Do not commit sensitive values or credentials into this registry.

## 3. Prerequisites and preflight

1. Connect a supported Azure subscription/ARM deployment integration or an approved controlled Azure CLI execution environment. Confirm the signed-in principal and tenant; do not paste credentials into chat.
2. Confirm a dedicated G02 resource group and scoped Contributor permissions sufficient for VM, NIC, VNet, subnet, NSG, disk, identity and deployment operations. Use narrower custom roles where practical. RBAC scope must not include unrelated production resources.
3. Check subscription quota, selected region availability, VM family quota, trusted-launch support, disk availability, policy restrictions, required resource providers, and cost estimate.
4. Inventory existing VMs, networks, disks, public IPs, runner registrations and resource names to prevent duplication.
5. Review Bicep source and parameters. Validate template compilation and policy before deployment. Check that NSG has no inbound allow rules, NIC has no public IP, and VM has only required outbound paths.
6. Confirm approved SSH public key delivery through the deployment system. Private key remains with the operator.
7. Define named primary and secondary operators, approval owner, on-call route, maintenance window, cost owner, incident channel and escalation contact.
8. Confirm backup/restore objectives and retention with the service owner. Do not invent RPO/RTO commitments.
9. Verify immutable assistant image digests, vulnerability policy, SBOM, provenance/signature and licensing. If these do not exist, keep workloads stopped.
10. Ensure no existing runner will be duplicated. Inspect repository runner inventory using an authorized GitHub administrative surface before registration.

Preflight output must be retained: principal identity, RBAC scope, quota, cost estimate, Bicep validation, policy result, resource inventory, approved parameters and change ticket. Redact account secrets.

## 4. Provisioning and host bootstrap

### 4.1 Infrastructure deployment

- Deploy only into the dedicated G02 resource group after cost and scope approval.
- Use the reviewed Bicep template and a unique deployment name.
- Capture the full deployment operation result and Azure activity log.
- Verify the VM resource ID, power state, image SKU, size, disk encryption, boot diagnostics, identity, NIC, subnet, NSG association and absence of public IP.
- Verify effective NSG rules and routes, including outbound egress. No broad inbound rule is acceptable.
- If deployment fails, stop. Inspect the failed operation and activity log; do not repeatedly redeploy blindly. Correct the source/parameter issue, validate again, and use a new deployment correlation ID.

### 4.2 Private access and host bootstrap

Use the approved private access path (bastion, VPN, or managed run-command mechanism). Do not temporarily add public SSH just to make setup easier.

On the new host:
1. Verify hostname, OS release, architecture, disk layout, free space, time synchronization, DNS resolution, route table and package repository trust.
2. Apply approved security updates and reboot if required. Record kernel and reboot status.
3. Run `ops/g02-host/install-docker-engine.sh` only on a newly provisioned supported host. It must refuse unexpected OS/architecture and existing Docker socket conditions.
4. Verify Docker package signatures/repository, daemon startup, socket ownership, Docker and Compose versions, live-restore, log rotation, and daemon configuration.
5. Confirm no TCP listener on Docker API ports and no public inbound path.
6. Confirm the operator group membership is minimal. Docker group membership is effectively root-equivalent; grant only to named administrators.
7. Configure unattended security updates or a documented patch cadence, disk/log monitoring, audit logging, and controlled reboot procedure.
8. Capture command output, package versions, daemon config hash, host ID and timestamps as evidence.

Never execute a bootstrap script on an existing production host without a separate review and backup.

### 4.3 Host acceptance checks

- OS is Ubuntu 24.04 LTS amd64 and supported.
- VM has no public IP; NSG and effective rules are default-deny inbound.
- Private administration works from the approved operator path.
- Docker daemon runs and its API is not exposed over TCP.
- Docker logging rotates and disk usage is monitored.
- Time is synchronized; host security updates are applied.
- No unexpected privileged containers, mounts, listeners, users, SSH keys or services exist.
- Host reboot and Docker restart behavior are tested in a maintenance window.
- Evidence is retrievable by a second operator.

A failed check blocks workload startup.

## 5. Assistant image build and deployment

### 5.1 Image supply chain

For each assistant image:
- build from reviewed source in a controlled pipeline;
- pin base images by digest and pin OS/application dependencies where feasible;
- produce SBOM and provenance;
- scan OS and application dependencies and record exceptions with owner/expiry;
- sign the image and verify signature/attestation at deployment;
- publish to an approved private registry;
- deploy by immutable `repository@sha256:digest`, never a floating tag.

The current host Compose file requires image references to be supplied. Do not substitute guessed image names or placeholders.

### 5.2 Configuration and secrets

- Validate config schema before deployment.
- Store secrets in a managed secret store; grant workload-specific read permissions only.
- Rotate credentials on suspected exposure and on the approved schedule.
- Keep secrets out of environment dumps, debug logs, crash reports, support bundles and artifacts.
- Separate development, staging and production credentials.
- Use explicit data retention and deletion rules for prompts, outputs, attachments and telemetry.

### 5.3 Start-up sequence

1. Verify registry reachability and image signature/digest.
2. Validate Compose configuration and security settings.
3. Confirm networks are internal and services have no published host ports.
4. Start one assistant at a time, initially with health checks and external dependencies disabled or mocked where possible.
5. Verify process UID/GID, capabilities, mounts, root filesystem mode, resource limits, PID limit, network membership and absence of Docker socket.
6. Run readiness checks and a synthetic non-sensitive request.
7. Start the next assistant only after the preceding service passes.
8. Verify inter-service communication is explicitly allow-listed and denied by default.
9. Record image digest, config hash, container ID, start time, health status and test result.

No workload is accepted without an actual health check. A running container is not necessarily a ready service.

## 6. Health checks, monitoring and operational endpoints

Each service owner must define:
- liveness: process is alive and not irrecoverably deadlocked;
- readiness: service can accept its intended requests and required dependencies are available;
- startup: initialization has completed within a bounded timeout;
- dependency health: registry, model provider, datastore, queue, DNS and secret store as applicable;
- synthetic transaction: a harmless request that validates end-to-end behavior without personal or production data.

Use private, authenticated monitoring. Do not expose health endpoints publicly. Health responses must not disclose prompts, secrets, environment variables, internal stack traces, or customer data.

Monitor at minimum:
- VM CPU, memory, disk, inode use, network throughput, reboot and availability;
- Docker daemon and container restart counts, OOM kills, health status, CPU/memory/PID limits;
- assistant request count, latency percentiles, error rate, queue depth and dependency failures;
- certificate expiry for any later-approved TLS endpoint;
- registry/image pull failures and signature verification failures;
- runner assignment, job completion, logs and artifacts;
- backup age, backup failures and restore-test age;
- security updates, audit events, privilege changes and NSG/network changes.

Alert thresholds must be set from measured baseline and service objectives, not guessed. Every alert needs severity, owner, runbook link, notification route and escalation timeout.

## 7. Failure modes and recovery actions

| Symptom | Likely causes | Safe response |
|---|---|---|
| VM deployment denied | RBAC, policy, quota, provider registration | inspect activity log and exact denied action; correct scoped permission/policy; do not broaden subscription rights blindly |
| VM unavailable | provisioning failure, host fault, quota/region issue | inspect VM instance view, boot diagnostics and platform events; preserve disk; rebuild only from reviewed template |
| Cannot reach private host | VPN/bastion route, NSG, DNS, route table, wrong private IP | verify approved access path and effective rules; do not open public SSH as workaround |
| SSH authentication fails | wrong public key, account/permissions, sshd policy | use approved recovery channel; verify key fingerprint and authorized account; never send private key |
| Docker daemon fails | invalid daemon JSON, package mismatch, disk full, socket conflict | inspect `systemctl status docker`, journal and config validation; restore last known-good daemon config; restart in maintenance window |
| Image pull denied | registry auth, network egress, missing digest, policy | validate identity and registry scope; do not embed registry passwords or use mutable tags |
| Signature/digest mismatch | tampering, wrong digest, incomplete publish | stop deployment; quarantine image; rebuild and re-attest from trusted source |
| Container exits/restarts | bad config, missing secret, incompatible image, dependency failure | inspect bounded logs and exit code; verify config/secret references; roll back to last accepted digest |
| OOM/PID exhaustion | limits too low, leak, traffic spike | preserve telemetry; scale only after capacity review; do not remove limits as a quick fix |
| Assistant not ready | dependency outage, invalid model endpoint, failed migration | isolate dependency; use circuit breaker; do not route traffic until readiness returns |
| DNS/TLS failure | record mismatch, certificate expiry, wrong origin | keep existing Cloudflare production records unchanged; verify exact hostname, certificate chain and ownership before any separate change |
| Runner remains queued | no eligible runner, offline host, labels mismatch, runner registration absent | inspect runner inventory and job assignment; verify host and labels; never treat queued as execution |
| Runner starts but has no logs/artifacts | job did not instantiate, runner lost, workflow setup failed | correlate run/job/runner IDs; retrieve logs and artifacts; no PASS without complete evidence |
| Disk fills | unbounded logs, images, artifacts, backups | identify largest consumers; prune only known-unused resources under change control; preserve required evidence and backups |
| Host compromise suspected | unexpected users/processes/keys, privilege escalation, suspicious egress | isolate host at network layer, preserve disk/log evidence, revoke identity/credentials, rebuild from trusted source; do not clean and continue |
| Backup restore fails | corrupt/incomplete backup, missing key/config, incompatible version | keep service stopped; test alternate restore point; escalate data-loss incident; do not overwrite original backup |

For every incident record UTC timestamps, reporter, severity, impact, affected resource IDs, observed symptoms, recent changes, evidence links, containment, recovery steps, verification, data-loss assessment, and follow-up owner.

## 8. Rollback and restoration

### 8.1 Application rollback

- Keep the last accepted image digest and matching configuration version.
- Stop routing new work to the failing service.
- Roll back to the last independently accepted digest/config pair.
- Do not roll back across an incompatible data migration without the migration owner's explicit procedure.
- Verify readiness, synthetic request, error rate and telemetry before restoring traffic.
- Retain failed image and logs for forensic review; do not overwrite evidence.

### 8.2 Host recovery

If the host is unhealthy but not suspected compromised:
1. Capture diagnostics and disk snapshot/backup according to policy.
2. Stop assistant workloads gracefully.
3. Restore the last known-good daemon/configuration or rebuild a replacement VM from reviewed IaC.
4. Reattach/restore only validated encrypted data volumes.
5. Reinstall Docker from the signed repository.
6. Redeploy only signed immutable images and reviewed config.
7. Verify network isolation, health, telemetry and backup state.
8. Retire the old host only after evidence preservation and approval.

If compromise is suspected, do not trust the existing OS or binaries. Isolate, preserve evidence, revoke credentials/managed identity permissions, rotate secrets, and rebuild cleanly. Do not restore potentially compromised executable content.

### 8.3 Data restoration

Before go-live, define what state exists, where it is stored, encryption keys and key custodians, backup schedule, retention, immutable/offsite copy, restore permissions, and tested restore procedure. If assistants are stateless, document that fact and identify any external state stores. A backup job reporting success is not proof of recoverability: conduct and record a restore test into an isolated environment. Never overwrite the only surviving copy.

RPO, RTO, retention and recovery tier remain **TBD pending service-owner approval**. Do not claim a recovery objective until tested.

### 8.4 GitHub runner recovery

The runner is disposable and separate from assistant workloads:
1. Inspect repository runner inventory and confirm no duplicate `lingo-legacy-g02` registration exists.
2. Confirm host is clean, patched, isolated and meets runner prerequisites.
3. Obtain a short-lived registration token through an approved GitHub administrative workflow; never persist it in repo, logs or chat.
4. Register exactly one ephemeral runner with labels `self-hosted, linux, x64, lingo-g02`.
5. Execute only the approved trusted sentinel workflow; do not run untrusted fork code or grant production secrets.
6. Correlate workflow run ID, job ID, runner ID/name, full commit SHA, actual steps, logs, artifact, checksum and independent verification.
7. If compromised or inconsistent, remove registration, revoke credentials, destroy runner instance and recreate from a clean image. Do not use `--replace` or duplicate registration as a shortcut.

## 9. G02 execution evidence and acceptance

A valid evidence bundle must include:
- exact source commit SHA and reviewed PR;
- cloud deployment operation ID and activity log;
- VM resource ID, OS/architecture, instance view and network configuration;
- effective NSG and route evidence showing no unintended ingress;
- host bootstrap transcript and Docker versions/configuration;
- immutable image digests, SBOM, scan and signature verification;
- container inspection proving security settings and network isolation;
- health/readiness/synthetic test results;
- monitoring/log links with timestamps;
- runner inventory before and after registration;
- workflow run/job IDs, runner ID/name, full SHA, completed step list, logs and retrievable artifact;
- independent artifact checksum verification;
- backup and isolated restore test;
- named reviewer and signed acceptance decision.

Acceptance is blocked by missing or contradictory evidence, empty jobs, `runner_id=0`, missing runner name, missing logs, missing artifact, failed checksum, stale telemetry, unverified image, open inbound rule, public Docker API, or failed restore test.

The sentinel must fail closed. A status label alone cannot establish acceptance.

## 10. Handoff and ownership

A formal handoff is complete only when the incoming operator has:
- access through their own named account and MFA, least-privilege RBAC, and private admin route;
- read access to architecture, runbook, IaC, source PR, change records and evidence bundle;
- access to monitoring, alerting, incident channel, backup vault and restore instructions;
- verified knowledge of service owners, escalation chain, maintenance windows and approval boundaries;
- completed a supervised login, health check, log retrieval and tabletop failure/rollback exercise;
- confirmed secrets are accessible only through approved secret manager roles;
- accepted the open risks, deferred tasks, costs and current release gate in writing.

Handoff packet:
1. system diagram and resource inventory;
2. endpoint/port/DNS/TLS registry;
3. IaC commit, parameters reference and deployment outputs;
4. service image digests, SBOMs and configuration versions;
5. access matrix and break-glass procedure;
6. dashboards, alert rules and log queries;
7. backup schedule, restore points and restore-test report;
8. incident, failure, rollback and runner recovery procedures;
9. outstanding defects, risk owners and expiry dates;
10. explicit statement: production protected; promotion hold unless separately authorized.

Never transfer personal credentials. Remove departing operators' access and rotate any shared secrets they could have accessed.

## 11. Change, maintenance and decommissioning

Every change must identify scope, owner, risk, validation, maintenance window, expected impact, rollback, evidence and approver. Separate staging from production. For upgrades, test a new immutable image/config in staging, verify health and rollback, then request authorization for any production change.

For patching: review advisories, snapshot/backup as appropriate, apply updates, reboot if required, verify host and container health, confirm runner registration state, and attach evidence. Do not automatically retry failed jobs until the underlying runner/host fault is resolved.

For decommissioning: drain workloads, preserve required logs/evidence, snapshot or securely delete data per retention policy, revoke managed identity and registry/secret access, unregister runner, delete resources in dependency order, verify no public IP/DNS/route remains, and reconcile final cloud billing. Obtain approval before deleting any persistent data.

## 12. Go-live checklist

- [ ] Dedicated Azure access connected and verified
- [ ] Cost, region, quota and resource scope approved
- [ ] Bicep compile, policy and security review passed
- [ ] VM deployed; no public IP; inbound deny verified
- [ ] Private admin path tested by primary and secondary operator
- [ ] Host patching, time, disk and audit controls verified
- [ ] Docker Engine/Compose installed and daemon hardened
- [ ] Three assistant images built, scanned, signed and pinned by digest
- [ ] Three services isolated; no published ports or Docker socket
- [ ] Liveness/readiness/synthetic checks pass
- [ ] Monitoring, logs and alert ownership verified
- [ ] Backup and isolated restore test pass; RPO/RTO approved
- [ ] Runner inventory checked; no duplicate registration
- [ ] Ephemeral runner executes trusted sentinel with complete evidence
- [ ] Independent reviewer verifies evidence and checksum
- [ ] Handoff exercise completed
- [ ] Separate production change authorization granted

Until every required item is verified, status remains **G02 BLOCKED / PRODUCTION PROTECTED / PROMOTION HOLD**.

## 13. Unresolved inputs (must be supplied through approved systems)

- Azure subscription, tenant, dedicated resource group, region and quota
- Approved VM size and recurring cost ceiling
- Private access method and operator group
- Private registry and three immutable assistant image digests
- Model/API dependency endpoints and egress allow-list
- Secret manager and workload-specific secret names/permissions
- Internal DNS/service discovery plan, if required
- Monitoring/logging destination and alert owners
- Backup vault, retention, RPO/RTO and restore approver
- GitHub runner administrative access and registration owner
- Named service owner, primary/secondary operator and acceptance reviewer

No endpoint, image, credential, cost, SLA, RPO/RTO, or deployment result may be fabricated to fill these gaps.
