# LINGO Legacy DevOps Deployment Roadmap

## Phase 0 — Foundation (current)

- [x] Add isolated-branch validation configuration.
- [x] Define Jenkins and GitLab validation-only pipelines.
- [x] Add provider-neutral Terraform scaffold with no resources.
- [x] Add local-only Ansible diagnostics.
- [x] Document Docker/Kubernetes prerequisites.
- [ ] Review the diff and run all foundation checks.
- [ ] Obtain independent review and retain correlated CI evidence.

## Phase 1 — Runner and CI acceptance

- [ ] Collect host-generated G02 diagnostics and checksum.
- [ ] Correlate host service/polling evidence with GitHub runner inventory.
- [ ] Obtain real runner assignment, positive runner ID, populated canonical name, executed steps, retrievable logs, and correlated artifact.
- [ ] Independently verify and formally accept G02.

## Phase 2 — Runtime and packaging contract

- [ ] Identify the exact deployable application/runtime and build output.
- [ ] Decide whether Docker is appropriate for that runtime.
- [ ] Define image provenance, scanning, immutable digest, registry, and rollback.
- [ ] Define staging Kubernetes security and networking only if Kubernetes is selected.

## Phase 3 — Infrastructure design

- [ ] Select cloud provider only when required.
- [ ] Design remote Terraform state, locking, IAM, network boundaries, cost controls, and recovery.
- [ ] Review a plan; do not apply from this scaffold.
- [ ] Define Ansible target inventory and explicit mutation approvals.

## Phase 4 — Staging certification

- [ ] Deploy only after explicit authorization and required gates.
- [ ] Run integration tests and readiness/health checks.
- [ ] Capture immutable build, commit, image digest, run/job IDs, logs, and test results.
- [ ] Verify rollback in staging.

## Phase 5 — Production promotion

- [ ] Confirm G02 and all release gates are PASS.
- [ ] Obtain explicit production authorization.
- [ ] Verify backup/last-known-good and rollback readiness.
- [ ] Promote the exact certified artifact with a controlled change window.
- [ ] Verify live health, telemetry, and acceptance evidence.

Production promotion remains BLOCKED until each prerequisite is independently satisfied.
