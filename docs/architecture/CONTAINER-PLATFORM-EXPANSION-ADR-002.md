# ADR-002: Container Platform and Orchestration Expansion

- **Status:** Proposed for review; no infrastructure deployed
- **Date:** 2026-10-30
- **Scope:** Docker images, Docker Compose, CI runner containers, Kubernetes adoption, image supply chain, runtime observability, and platform scaling
- **Authority:** Source-only planning branch. This ADR does not authorize cloud resource creation, billing, cluster creation, production changes, PR merge, or promotion.

## Objectives

Establish a repeatable container platform for LINGOlegacy that supports development, staging, and production with explicit isolation, image provenance, resource controls, observability, rollback, and recovery.

The target must scale horizontally where the workload and measured demand justify it. It must not introduce Kubernetes as an operational dependency before a cluster, operator, workload, and support model exist.

## Verified baseline (2026-10-30)

The repository main branch contains:

- `ops/github-runner/Dockerfile`: Ubuntu 24.04 base, Actions runner version 2.337.0, a dedicated non-root `runner` user, and a container entrypoint.
- `ops/github-runner/docker-compose.yml`: one ephemeral `github-runner` service, repository-scoped URL, token/name/labels supplied through environment variables, and no declared host Docker socket mount.
- `ops/github-runner/entrypoint.sh`: configures the runner with `--ephemeral` and `--disableupdate`, then executes the runner.
- `ops/github-runner/bootstrap.sh`: checks for an existing same-name runner, requests a short-lived registration token, creates a restrictive local `.env`, builds and runs the container, and removes the local env file on exit.
- `ops/g02/host-provisioning.md`: explicitly records that no dedicated Linux host or verified runner daemon has been provisioned.
- No Kubernetes, Helm, or Terraform/Bicep deployment manifests were found in the inspected repository paths or current PR #414–#416 changed-file lists.

This is a source inspection only. It does not establish that the image has been built, scanned, run, or accepted on a live host.

## Container standards

### Image construction

1. Keep the runner process non-root. Do not add `privileged: true`, host PID/network namespaces, or a host Docker socket mount.
2. Pin the runner version and base-image digest for release builds. Record source URL, digest, build provenance, and SBOM.
3. Verify downloaded release archives against a publisher-provided checksum/signature before extraction. If no verifiable checksum is published, document the limitation and use an approved immutable artifact mirror.
4. Use multi-stage builds where they materially reduce runtime attack surface; remove build-only packages and package indexes.
5. Run image vulnerability and secret scans before publishing. Define severity thresholds and documented exceptions; do not suppress findings silently.
6. Publish immutable tags and retain the exact image digest used by each environment. Never deploy `latest`.
7. Rebuild on base-image and runner security updates; test compatibility before rollout.

### Compose and local container runtime

1. Keep the G02 runner ephemeral until a separate persistent-runner security review is approved.
2. Preserve token handling through short-lived, repository-scoped registration credentials. Do not bake credentials into image layers, build args, labels, or artifacts.
3. Maintain the existing no-host-Docker-socket boundary. Workloads requiring image builds should use a separately isolated builder service or remote builder with scoped credentials—not the host daemon socket.
4. Apply least privilege: drop Linux capabilities not required by verified runner workloads, enable `no-new-privileges`, use a restrictive seccomp profile, and define CPU, memory, PID, and disk limits after measuring the actual job profile.
5. Use a dedicated Compose network and explicit egress policy at the host/firewall layer. Do not assume Compose alone is an egress firewall.
6. Use explicit health/readiness checks where the service has a meaningful health contract. A running container is not equivalent to a healthy or accepted runner.
7. Use named volumes only for explicitly approved state. Keep runner workspace disposable; never persist runner credentials or job workspaces between untrusted jobs.
8. Log structured lifecycle events without tokens, secret environment values, or private host data.

## Kubernetes adoption gate

Kubernetes is a target option, not an immediate prerequisite. Adopt it only when at least one measured requirement justifies its control-plane and operational cost: multiple independently scaled services, sustained scheduling pressure, high availability across nodes/zones, deployment orchestration needs, or platform-team operating capacity.

Before creating a cluster, require:

- approved cloud subscription/project and billing owner;
- workload inventory, SLOs, capacity model, and cost estimate;
- network topology, private cluster/API access decision, ingress/egress policy, DNS and certificate plan;
- identity integration and workload identity; no static cloud keys in pods;
- managed secrets integration and rotation;
- container registry with immutable digests and scanning;
- infrastructure as code with reviewed plans and drift detection;
- namespace and tenant boundaries, Pod Security Standards (restricted where feasible), non-root containers, seccomp, dropped capabilities, read-only root filesystems where compatible;
- default-deny NetworkPolicies with explicit service dependencies;
- resource requests/limits, quotas, autoscaling signals, disruption budgets, topology spread, and node pool isolation;
- readiness/liveness/startup probes that reflect real service health;
- centralized logs, metrics, traces, audit logs, alerting, backup/restore, and tested disaster recovery;
- signed image/provenance policy and admission controls;
- staged rollout, rollback, and an independently verified acceptance checklist.

Do not move the canonical G02 runner into Kubernetes/Actions Runner Controller as a shortcut. That requires a separate design review, trust-boundary analysis, runner lifecycle proof, and evidence that the chosen architecture meets the existing G02 acceptance contract.

## Recommended topology

- **Static web/PWA and edge routing:** retain Cloudflare Workers/Pages where appropriate; keep edge services stateless and protect production routes.
- **Application APIs and long-running services:** containerize independently; deploy initially to a managed container platform or VM only when workload needs are clear. Keep application state in managed data services.
- **Background jobs and event processing:** isolate queues/workers from request-serving services; enforce idempotency, retry limits, dead-letter handling, and trace correlation.
- **Data services:** managed databases/object storage with backups, encryption, least-privilege identities, and restore tests.
- **Kubernetes:** introduce only for services whose scaling, availability, or orchestration requirements justify it. Prefer managed control planes and separate production/staging environments.
- **G02 runner:** dedicated isolated Linux x64 host, repository-scoped ephemeral runner, trusted-event policy, no production secrets, no host Docker socket exposure.

## CI/CD and supply-chain gates

Every image release should record:

- repository, commit SHA, workflow/run/job IDs;
- Dockerfile and build-context identity;
- base image and runner/toolchain versions;
- image digest, SBOM, provenance/attestation, scan result;
- test and policy results;
- target environment, rollout identifier, and rollback reference.

Promote the exact tested digest from staging to production. Rebuilding independently for production is not an acceptable substitute for promoting the verified artifact.

## Phased implementation

1. **Inventory and baseline:** enumerate all Dockerfiles, Compose files, images, build workflows, runtime dependencies, secrets, and deployment targets. Record ownership and current production state.
2. **Runner container hardening:** review the existing G02 Dockerfile/Compose/entrypoint, add only controls compatible with the verified job profile, and test on a disposable host.
3. **Supply chain:** add digest pinning, SBOM, vulnerability/secret scans, provenance, and immutable registry references.
4. **Service containerization:** package API/background services separately, add health checks and graceful shutdown, externalize configuration, and remove embedded state.
5. **Orchestration decision:** compare managed containers versus Kubernetes using measured cost, SLO, scaling, and operational burden. Produce a reviewed infrastructure plan before provisioning.
6. **Staging qualification:** deploy exact image digests, run integration/load/failure tests, verify telemetry, backups, rollback, and security controls.
7. **Production promotion:** only after acceptance, explicit promotion authorization, and confirmation that production remains recoverable.

## Acceptance criteria

- All container build inputs and image digests are reproducible and recorded.
- Images pass agreed vulnerability, secret, and policy checks.
- Containers run non-root with least privilege and explicit resource controls.
- No secrets are baked into images or exposed to untrusted jobs.
- Runtime health, logs, metrics, traces, and alerts are verified.
- Deployment and rollback use immutable artifacts and are demonstrated in staging.
- Kubernetes, if adopted, passes the cluster readiness and workload security gates above.
- G02 independently passes its existing runner ID/name, job steps, sentinel, logs, artifact, commit correlation, and checksum requirements.

## Non-goals and safeguards

- No cloud subscription, VM, registry, or Kubernetes cluster is created by this ADR.
- No billable resource is provisioned by documentation or source changes.
- No production DNS, Worker routes, secrets, release branches, or traffic allocations are changed.
- No PR is merged and no release gate is bypassed.
- No G02 PASS is inferred from image source, a successful local build, or an Online runner badge.


## Implementation checkpoint (2026-10-30, source-only)

The following source changes were made on `infra/container-platform-expansion-2026-10-30` after the baseline inspection:

- `ops/github-runner/Dockerfile`: added a pinned `RUNNER_SHA256` build argument and strict `sha256sum --check --strict` verification before extracting the Actions Runner archive. The configured v2.337.0 Linux x64 checksum is `70920811a4f8ad4328818682bca5c6469c1c942fab52448868071d0063816613`, confirmed on the official `actions/runner` v2.337.0 release page.
- `ops/github-runner/docker-compose.yml`: added `init: true`, `no-new-privileges:true`, and `cap_drop: [ALL]`. The service remains ephemeral and has no host Docker socket mount or privileged mode.
- The Dockerfile still uses the mutable `ubuntu:24.04` tag and apt package resolution is not version-locked. Base-image digest pinning and package snapshot/reproducibility remain open work; no digest is invented in this patch.
- `cap_drop: [ALL]` is a proposed runner profile and must be verified against the actual trusted job set before acceptance. Workloads requiring additional capabilities must use a separately reviewed isolated builder/runtime rather than weakening this runner by default.

### Local checks actually performed

- Compose YAML parsed successfully with PyYAML.
- Static assertions passed for init, no-new-privileges, dropped capabilities, absence of privileged mode, absence of host Docker socket mounts, non-root Dockerfile user, 64-character SHA-256 argument, and strict checksum verification.
- Docker Engine, Podman, and Hadolint were unavailable in the validation environment. Therefore no image build, container startup, image scan, SBOM, provenance attestation, or runner runtime test was performed.

### Live platform inventory (read-only)

Cloudflare account/zone and Worker inventory were queried through the connected account on 2026-10-30:

- Zone `thelingolegacy.com` is active.
- Apex A record `192.0.2.0` is proxied and explicitly commented `Cloudflare Worker route`; this is an intentional placeholder-style Worker route record in the current configuration, not proof of an origin server address.
- `www` is a proxied CNAME to the apex.
- `lingo-flagship-root` remains at 100% on version `658acd1a-997b-45cd-b8fc-e59c59b26b45`.
- `thelingolegacyv-5` remains at 100% on version `2d161fa5-598f-4998-ada8-7ac4c72c3461`.
- Newer uploaded versions for these Workers are preview versions; this inspection did not promote them.
- `lingo-legacy-studio-build` has an uploaded version and deployment record but no attached Worker route in the inventory response.
- `thelingolegacy-web-recovery-preview` has preview/deployment history but no attached Worker route in the inventory response.

This inventory is a point-in-time read-only snapshot. It does not validate page behavior, origin reachability, application APIs, authentication, persistence, or end-user acceptance.
