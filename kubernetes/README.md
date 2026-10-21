# Kubernetes deployment boundary

Status: no cluster and no deployable workload manifests created.

Kubernetes resources are intentionally deferred until the application container contract and target environment are verified. The initial infrastructure-first phase must not invent an image name, namespace ownership, ingress exposure, secret source, or cloud-specific load balancer configuration.

Before a workload is added, require:
- a reviewed immutable image digest;
- non-root security context and least-privilege service account;
- resource requests/limits and readiness/liveness probes;
- environment-specific overlays with no production defaults;
- external secret integration rather than committed secrets;
- rollout health checks, rollback procedure, and evidence retention;
- explicit environment approval and successful staging validation.

No cluster creation, `kubectl apply`, Helm release, or production promotion is authorized by this scaffold.
