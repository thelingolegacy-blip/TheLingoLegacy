# Kubernetes Virtual Bottleneck Lab

**Scope:** disposable, non-production capacity experiment only. This is a scaffold, not a provisioned cluster. It does not route production traffic and must not be connected to production credentials or DNS.

## What it does

The small Node.js service exposes:
- `/healthz` and `/readyz` for health checks;
- `/metrics` for basic Prometheus-format request, queue, rejection, and completion counters;
- `/simulate?delay_ms=100&fail_rate=0.05` to inject bounded synthetic latency and failures while lab mode is enabled.

The handler bounds concurrency and queue length. Requests beyond the configured capacity receive HTTP 429. Injected failures are capped at 25%; delay is capped by MAX_DELAY_MS. The service is intentionally synthetic and has no business data or production integrations.

## Local disposable cluster

Requirements: Docker, kubectl, Kind, and a Kubernetes version compatible with the manifests.

From the repository root:

~~~bash
kind create cluster --name lingo-capacity-lab --config ops/kubernetes/bottleneck-lab/kind-config.yaml
docker build -t lingo-bottleneck-lab:local ops/kubernetes/bottleneck-lab
kind load docker-image lingo-bottleneck-lab:local --name lingo-capacity-lab
kubectl apply -k ops/kubernetes/bottleneck-lab
kubectl -n lingo-capacity-lab rollout status deployment/lingo-bottleneck-lab --timeout=120s
kubectl -n lingo-capacity-lab port-forward service/lingo-bottleneck-lab 18080:8080
~~~

In a second terminal, test health and capacity behavior:

~~~bash
curl --fail http://127.0.0.1:18080/healthz
curl --fail http://127.0.0.1:18080/readyz
curl --fail 'http://127.0.0.1:18080/simulate?delay_ms=250&fail_rate=0'
curl --fail http://127.0.0.1:18080/metrics
~~~

To observe the synthetic 429 boundary, send a bounded burst from a test client against the port-forward. Do not run unbounded load generators. The HPA requires a functioning metrics API; confirm it before interpreting autoscaling results.

## Security and networking

- The Service is ClusterIP only; there is no Ingress, LoadBalancer, public route, or DNS record.
- The pod runs as a non-root UID, drops Linux capabilities, disallows privilege escalation, uses a read-only root filesystem, disables service-account token mounting, and has CPU/memory limits.
- The namespace has ResourceQuota and LimitRange bounds.
- NetworkPolicy resources are included, but enforcement depends on the cluster CNI. Verify that the installed CNI enforces NetworkPolicy before treating isolation as proven. A default Kind network may not enforce these policies.
- Do not add egress or ingress allowances without a reviewed need.
- This lab must not contain production credentials, customer data, or live payment integrations.

## Measurements to capture

For each test, record the image digest, Git commit, cluster/Kubernetes/CNI versions, load profile, concurrency, queue limit, delay/failure settings, duration, request rate, 429/5xx rate, p50/p95/p99 latency, CPU/memory, queue depth, HPA events, recovery time, and test stop reason.

## Teardown

~~~bash
kubectl delete -k ops/kubernetes/bottleneck-lab
kind delete cluster --name lingo-capacity-lab
~~~

Verify the cluster is deleted. The commands above create a local disposable Kind cluster only; they do not provision AWS/GCP/Azure or a production Kubernetes cluster.
