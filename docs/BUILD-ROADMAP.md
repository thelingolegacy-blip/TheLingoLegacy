# Engineering Build Roadmap

This roadmap is ordered by dependency and evidence. Dates are planning windows, not promises of completion. No stage is marked complete until its acceptance evidence exists.

## Wave 0 — Stabilize and discover
- Preserve production and last-known-good state.
- Inventory workflows, open recovery PRs, integrations, and deployment surfaces.
- Capture the GitHub Actions dispatch failure and determine whether the fault is account/policy/provider-side or host-side.
- Reconcile live Worker runtime version and public reachability with repository source.
- Add contribution, changelog, architecture, and operations documentation.

**Exit evidence:** repository/branch/PR inventory with exact SHAs; runner inventory and effective Actions policy; host preflight or explicit finding that no host exists; successful retrievable static CI run; version and live-probe discrepancy report.

## Wave 1 — CI reliability
- Map workflow triggers and required checks before consolidating workflows.
- Ensure static checks run without deployment permissions.
- Add JavaScript syntax checks, unit tests, configuration checks, dependency/security scanning, and artifact provenance.
- Pin actions according to repository policy; ensure path filters cannot suppress required checks.

**Exit evidence:** actual workflow steps run; logs and artifacts are downloadable; repeatable tests pass on the same commit.

## Wave 2 — G02 execution recovery
- Inspect runner inventory and effective Actions policy.
- Identify the actual host or record that no host has been provisioned.
- Repair the evidenced issue without duplicate registrations.
- Run the canonical sentinel and independently verify runner identity, run/attempt/job/commit correlation, logs and artifact.

**Exit evidence:** exact runner lingo-legacy-g02, required labels, positive runner ID, successful sentinel, retrievable logs and artifact, independent acceptance.

## Wave 3 — Release candidate
- Build a reproducible immutable release candidate.
- Run security/configuration checks and runtime compatibility probes.
- Verify canonical domain, Worker version, health, manifest, platform status and critical flows.
- Confirm rollback artifact and procedure.

**Exit evidence:** release manifest, checksums, successful live probes, recorded approval, verified rollback path.

## Wave 4 — Observability and integrations
- Establish service inventory and ownership.
- Standardize structured logs, correlation IDs, runtime version, and redaction.
- Set metrics for availability, latency, errors, saturation, queues, and business-critical outcomes.
- Define alert thresholds, severity, recipients, on-call owner, and runbooks.
- Inventory GitHub, Cloudflare, Firebase, commerce, creative, analytics, and deployment integrations; classify each as verified, configured-but-unverified, planned, or retired.

**Exit evidence:** telemetry reaches its destination, alerts fire in a test, and each critical integration has an owner and recovery runbook.

## Wave 5 — Capacity lab and virtual bottleneck
- Select a concrete service to test; do not load-test production by default.
- Implement a test-only synthetic bottleneck with bounded concurrency, queue, latency, and error injection.
- Establish baseline traffic and service-level objectives.
- Exercise gradual load, saturation, dependency slowdown, recovery, and stop conditions.
- Record p50/p95/p99, error rate, queue depth, saturation, recovery time, and cost.

**Exit evidence:** reproducible test run, metrics, bounded failure behavior, and documented scaling thresholds.

## Wave 6 — Kubernetes decision and optional staging cluster
Kubernetes is conditional, not a prerequisite for G02 or the Cloudflare Worker site.
- Approve a concrete containerized workload and justify why a managed service/Worker is insufficient.
- Select provider, account, region, budget, network model, identity, registry and security owner.
- Review the infrastructure plan and threat model.
- Create a disposable staging cluster only after approval.
- Deploy an immutable image with resource requests/limits, health checks, autoscaling bounds, disruption policy, network policy, and observability.
- Run capacity and recovery tests, then destroy the cluster if it is only an experiment.

**Exit evidence:** provider-side cluster inventory, security review, workload health, measured scale test, cost record, and tested teardown.

## Wave 7 — Scale and continuous improvement
- Use measured demand and saturation to choose autoscaling thresholds.
- Establish SLO/error budgets and recovery drills.
- Track deployment frequency, lead time, change-failure rate, restore time, availability, and cost per successful transaction/request.
- Review bottlenecks and capacity before adding orchestration complexity.

## Priority order
1. Actual CI dispatch evidence.
2. Actual G02 host/runner state.
3. Worker source/live version and reachability reconciliation.
4. Reliable static validation and artifacts.
5. Release candidate and rollback proof.
6. Observability/integration ownership.
7. Capacity lab and virtual bottleneck.
8. Kubernetes only when a justified workload and approved provider exist.

## Status semantics
- **DONE:** backed by current, retrievable evidence.
- **IN PROGRESS:** implementation exists but acceptance is incomplete.
- **BLOCKED:** a named external dependency prevents progress.
- **PLANNED:** not implemented.
- **UNVERIFIED:** claimed/configured state lacks independent evidence.

Never turn a planned task into a completed status because a file was added.
