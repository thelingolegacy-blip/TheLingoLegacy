# LINGO Legacy Container + Kubernetes Proposal

## Purpose and boundary

This directory is an isolated proposal for a conventional containerized HTTP runtime. It does not replace the canonical Cloudflare Worker, modify production routing, or claim parity with the existing Worker application.

The current source of truth observed on `main` is `worker.js` plus `wrangler.jsonc`. A Cloudflare Worker uses a different runtime model than a long-running container. Do not build or deploy this image as a production replacement until a dedicated Node-compatible application entrypoint and feature parity plan have been reviewed.

## What is included

- A minimal Node.js HTTP health service suitable for container smoke tests.
- A non-root, multi-stage Dockerfile.
- Docker Compose for local-only validation.
- Kubernetes Deployment and ClusterIP Service manifests with securityContext, probes, resource requests/limits, and no ingress by default.
- A validation script that checks manifests and refuses to treat placeholder images as a release image.

## What is not included

- Production Worker code copied into a Node server.
- Credentials, external integrations, Firebase/Stripe/Twilio configuration, persistence, ingress, DNS, or production deployment.
- A registry image built from canonical production code.
- CI workflow modifications. G02 stays blocked until external diagnosis and qualified runner evidence exist.

## Local smoke test

From the repository root:

```sh
docker compose -f containers/compose.yaml up --build --abort-on-container-exit
```

Then, in a second terminal:

```sh
curl --fail http://127.0.0.1:8080/healthz
```

Expected response: `ok`.

Clean up:

```sh
docker compose -f containers/compose.yaml down --remove-orphans
```

This validates only the scaffold health endpoint. It does not validate the Worker’s APIs, asset delivery, authentication, billing, or integrations.

## Build the image

```sh
docker build -f containers/Dockerfile -t lingo-legacy-container:local .```

The Dockerfile intentionally copies only the scaffold runtime files and not the repository, secrets, or production Worker source.

## Kubernetes validation

Requires a configured Kubernetes context. First inspect the current context and namespace before running any commands against a cluster.

```sh
kubectl config current-context
kubectl apply --dry-run=client -f containers/k8s/
```

The included manifests use the image placeholder `ghcr.io/REPLACE_ME/lingo-legacy-container:REVIEW_REQUIRED`. Replace it only after the image is actually built, scanned, pushed to an approved registry, and pinned by digest. Do not apply the deployment to production.

## Promotion prerequisites

1. Specify the intended workload (web frontend, API, worker service, jobs, or all) and its functional contract.
2. Add focused runtime tests and security review.
3. Build and scan an immutable image; record the source commit and image digest.
4. Validate manifests on an isolated test cluster.
5. Confirm secrets, storage, network policy, ingress, observability, backup, and rollback requirements.
6. Resolve G02 and pass the approved gate/evidence chain before any controlled staging deployment.
