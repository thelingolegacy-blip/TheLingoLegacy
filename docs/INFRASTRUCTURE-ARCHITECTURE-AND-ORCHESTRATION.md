# Infrastructure Architecture and Orchestration

**Status:** Engineering target state; not a declaration that unprovisioned infrastructure exists.  
**Production web authority:** Cloudflare Worker/edge runtime.  
**Source of truth:** thelingolegacy-blip/TheLingoLegacy, branch main.

## 1. Design principles

- Keep the current production web plane simple: GitHub source and CI → reviewed Cloudflare Worker/asset release → canonical domain.
- Do not introduce Kubernetes as a proxy for fixing GitHub Actions dispatch. They are separate systems and failure domains.
- Add infrastructure only for a named workload with a measurable service-level objective, owner, security boundary, budget, and rollback.
- Separate CI validation, release evidence, deployment credentials, runtime services, and production authorization.
- Prefer immutable artifacts, reproducible builds, least privilege, bounded concurrency, and observable failure.
- No environment is considered live because configuration files or a plan exist. Require provider-side evidence.

## 2. Logical architecture

~~~text
Developer change
    |
    v
GitHub branch + pull request
    |
    +--> Static validation / unit tests / security checks
    |       |
    |       v
    |   Evidence artifact + commit/run correlation
    |
    +--> G02 execution lane (runner identity + sentinel + logs)
            |
            v
      Release candidate package
            |
            v
      Explicit release authorization
            |
            v
      Cloudflare Worker + assets
            |
            v
      Canonical domain + live probes

Optional future service plane (separate project boundary):
API/background workload -> Kubernetes staging/capacity lab -> approved image registry
                         -> metrics/logs/traces -> capacity and SLO review
~~~

The optional Kubernetes plane must not sit in front of the current Worker or become a production dependency until a concrete workload demonstrates why it is needed.

## 3. Environment boundaries

| Environment | Purpose | Allowed mutation | Promotion condition |
|---|---|---|---|
| Local/dev | Fast iteration and unit tests | Disposable local changes | Relevant tests pass |
| CI validation | Syntax, tests, static analysis, packaging | Ephemeral job workspace | Steps execute and evidence is retrievable |
| G02 execution lane | Prove approved runner assignment and execution | Dedicated repository-scoped runner | Positive runner identity, successful sentinel, logs and artifact |
| Staging/capacity lab | Synthetic load, failure injection, service experiments | Isolated resources only | Budget, network, SLO, security and rollback reviewed |
| Production | Canonical public experience | Explicitly authorized release only | Candidate evidence, live probes, approved promotion |

## 4. Kubernetes strategy

Kubernetes is **not currently established as the production runtime**. Treat it as a future isolated lab for services that require container scheduling, background workers, or repeatable load experiments.

Before creating a cluster, decide and record:
- provider, account/project, region, cluster owner, support model, and monthly budget;
- workload and why Cloudflare Workers/managed services are insufficient;
- private/public control-plane posture and approved network egress destinations;
- identity model, secret manager, image registry, image-signing policy, and patching responsibility;
- node/pod resource limits, autoscaling minimum/maximum, quotas, and disruption budgets;
- metrics, logs, traces, alert owner, SLOs, data retention, and incident process;
- teardown procedure and proof that the cluster is isolated from production.

Do not provision a cluster from a template alone. The current repository has a draft AWS runner-host scaffold, but that does not prove an AWS account, host, or Kubernetes cluster has been provisioned.

## 5. Orchestration model

Use separate workflow responsibilities rather than one giant privileged pipeline:

1. **Validate:** syntax, unit tests, static configuration and policy checks; no deployment credentials.
2. **Package:** produce immutable build output and a manifest with commit and checksums.
3. **Verify:** validate provenance, artifact integrity, dependency/security results, and runtime compatibility.
4. **Stage:** deploy only to an explicitly selected non-production target.
5. **Probe:** exercise health, runtime, manifest, API and critical user journeys.
6. **Approve:** record an identifiable human or policy decision tied to the exact artifact.
7. **Promote:** deploy that same artifact, not a rebuilt or floating version.
8. **Verify live:** check canonical domain, version identity, health and rollback readiness.
9. **Rollback:** return to the last known-good artifact and verify the recovery.

Every job should have least-privilege permissions, explicit timeouts, concurrency controls, bounded retries, and an artifact trail. Retries must not conceal repeatable pre-step dispatch failures.

## 6. Virtual bottleneck / capacity lab

The **virtual bottleneck** is a deliberate, synthetic choke point for capacity experiments—not a production bottleneck. A staging test harness should constrain request concurrency, queue depth, response latency, and failure rate so the team can measure backpressure and recovery.

Required controls:
- isolated test hostname/namespace and synthetic data only;
- explicit maximum request rate, concurrency, queue size, duration, and spend;
- configurable latency/failure injection behind a test-only flag;
- load generator limits and automatic stop conditions;
- metrics for request rate, queue depth, p50/p95/p99 latency, errors, saturation, and recovery time;
- test assertions for 429/503 behavior, bounded queue growth, graceful degradation, and recovery;
- no public production traffic routing through the harness and no production credentials.

Do not run this experiment until the harness has an executable service image, a staging environment, and an approved test window. Documentation is not proof that the virtual bottleneck exists or has been exercised.

## 7. Capacity and scaling

Scale from measured saturation, not guesswork. Define per-service SLOs and record baseline load first. Autoscaling should have lower and upper bounds and use a signal tied to actual work (CPU/memory where appropriate, plus queue depth or request concurrency for queue-driven workloads). Avoid unbounded retries, unbounded queues, and simultaneous autoscaling that amplifies downstream overload.

Initial acceptance measures:
- p95/p99 latency and error-rate budgets;
- queue depth and oldest-message age;
- CPU/memory and connection saturation;
- successful scale-up and scale-down;
- behavior at maximum capacity;
- recovery after dependency slowdown;
- cost per 1,000 successful requests.

## 8. Operational gates and truthfulness

A workflow configuration is not an executed workflow. A Terraform file is not a provisioned VM. A Kubernetes manifest is not a cluster. A Cloudflare Worker health endpoint is not proof of GitHub runner assignment. Keep these facts separate in status reporting.

For G02, require actual runner ID > 0, exact runner name, instantiated steps, successful sentinel, retrievable logs/artifact, and independently correlated evidence. The repository's present recorded job signature (runner_id=0, no steps) does not satisfy that contract.

## 9. Rollback and incident handling

- Preserve the last-known-good production artifact and deployment metadata.
- Stop promotion when provenance, health, or live probes disagree.
- Prefer rollback to a known artifact over emergency mutation of DNS or unrelated infrastructure.
- Record incident start, impact, exact run/commit, evidence, mitigation, and follow-up actions.
- Keep credentials out of issue comments and evidence artifacts.

## 10. Decisions required before implementation

- [ ] Name the owner for each runtime and workflow.
- [ ] Confirm GitHub Actions provider/account restrictions and resolve the pre-step dispatch failure.
- [ ] Verify or provision the actual G02 host.
- [ ] Reconcile checked-in Worker runtime version with the live runtime version.
- [ ] Select and approve a Kubernetes provider only if a concrete workload justifies it.
- [ ] Approve a capacity-lab image, budget, SLO, load profile, and stop conditions.
- [ ] Define alert routing and retention for logs/metrics/traces.
