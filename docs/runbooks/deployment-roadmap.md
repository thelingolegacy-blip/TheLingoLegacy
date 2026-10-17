# LINGO Legacy DevOps Deployment Roadmap

## Phase 0 — Foundation and tooling scaffold (current)

- [x] Add isolated-branch validation configuration.
- [x] Define Jenkins and GitLab validation-only pipelines.
- [x] Add provider-neutral Terraform scaffold with no resources.
- [x] Add local-only Ansible diagnostics.
- [x] Document Docker/Kubernetes prerequisites.
- [x] Add central config.yaml and CircleCI validation-only configuration.
- [x] Add Prometheus/Grafana configuration scaffolds and ELK development files.
- [x] Add SonarQube properties and Vault integration contract.
- [x] Add smart-cache policy without activating cache.
- [ ] Review the diff and run all foundation checks.
- [ ] Obtain independent review and retain correlated CI evidence.

## Phase 1 — Runner and CI acceptance

- [ ] Collect host-generated G02 diagnostics and checksum.
- [ ] Correlate host service/polling evidence with GitHub runner inventory.
- [ ] Obtain real runner assignment, positive runner ID, populated canonical name, executed steps, retrievable logs, and correlated artifact.
- [ ] Independently verify and formally accept G02.

## Phase 2 — Runtime, quality, and cache contracts

- [ ] Identify the exact deployable application/runtime and build output.
- [ ] Decide whether Docker is appropriate for that runtime.
- [ ] Configure SonarQube server identity and token via approved secret storage; enable scan only after project/test paths are verified.
- [ ] Benchmark cold and warm cache runs; verify cache invalidation and trust isolation before enabling smart cache.
- [ ] Define image provenance, scanning, immutable digest, registry, and rollback.
- [ ] Define staging Kubernetes security and networking only if Kubernetes is selected.

## Phase 3 — Observability readiness

- [ ] Verify actual Prometheus scrape endpoints and network access.
- [ ] Provision Grafana dashboards and access control only after metrics are approved.
- [ ] Harden ELK authentication, TLS, retention, storage, and index lifecycle before using it beyond local development.
- [ ] Decide whether Vault is required and approve its identity/authentication model before integration.
- [ ] Define alert ownership, retention, and incident-response runbooks.

## Phase 4 — Infrastructure design

- [ ] Select cloud provider only when required.
- [ ] Design remote Terraform state, locking, IAM, network boundaries, cost controls, and recovery.
- [ ] Review a plan; do not apply from this scaffold.
- [ ] Define Ansible target inventory and explicit mutation approvals.

## Phase 5 — Staging certification

- [ ] Deploy only after explicit authorization and required gates.
- [ ] Run integration tests and readiness/health checks.
- [ ] Capture immutable build, commit, image digest, run/job IDs, logs, and test results.
- [ ] Verify rollback in staging.

## Phase 6 — Production promotion

- [ ] Confirm G02 and all release gates are PASS.
- [ ] Obtain explicit production authorization.
- [ ] Verify backup/last-known-good and rollback readiness.
- [ ] Promote the exact certified artifact with a controlled change window.
- [ ] Verify live health, telemetry, and acceptance evidence.

Production promotion remains BLOCKED until each prerequisite is independently satisfied.
