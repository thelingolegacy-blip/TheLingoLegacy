# LINGO Legacy Container + Kubernetes Proposal

## Purpose and boundary

This directory is an isolated proposal for a conventional containerized HTTP runtime. It does not replace the canonical Cloudflare Worker, modify production routing, or claim parity with the existing Worker application.

The current source of truth observed on `main` is `worker.js` plus `wrangler.jsonc`. A Cloudflare Worker uses a different runtime model than a long-running container. Do not build or deploy this image as a production replacement until a dedicated Node-compatible application entrypoint and feature parity plan have been reviewed.

## What is included

- A minimal Node.js HTTP health service suitable for container smoke tests.
- A non-root Dockerfile and local-only Docker Compose configuration.
- Kubernetes Deployment and ClusterIP Service manifests with securityContext, probes, resource requests/limits, and no ingress by default.
- A Node.js smoke-test script (executed locally: 7 assertions passed) and a manifest contract checker (passed locally).
- Documentation for local container testing and future isolated Kubernetes validation.

## What is not included

- The production Worker ported into Node.js.
- Application API parity, static asset serving, authentication, payments, external integrations, or persistence.
- Credentials, Firebase/Stripe/Twilio configuration, ingress, DNS, or production deployment.
- A registry image built from canonical production code.
- CI workflow modifications. G02 stays blocked until external diagnosis and qualified runner evidence exist.

## Local smoke test

Requires Node.js 22 or newer. Run from the repository root:

```sh
node --check containers/server.mjs
node --check containers/test.mjs
node containers/test.mjs
```

The test starts a loopback-bound test server and checks startup, the `/healthz` response, security/cache headers, 404 behavior, and a disallowed method. It does not validate the Worker’s APIs or feature parity.

For a container smoke run, install Docker Engine and the Compose plugin, then run:

```sh
docker compose -f containers/compose.yaml up --build --abort-on-container-exit
```

The service binds on host loopback only at `http://127.0.0.1:8080`. Clean up with:

```sh
docker compose -f containers/compose.yaml down --remove-orphans
```

## Build the image

```sh
docker build -f containers/Dockerfile -t lingo-legacy-container:local containers/
```

The build context is the `containers/` directory and `containers/.dockerignore` allowlists only `Dockerfile` and `server.mjs`. This keeps the repository, secrets, and production Worker source outside the Docker build context.

## Kubernetes validation

Requires a configured Kubernetes context. First inspect the target context and namespace before any cluster operation.

Run the local manifest-contract checker:

```sh
node containers/scripts/validate-manifests.mjs
```

The Kubernetes YAML files were parsed and their isolation/security contracts checked successfully in the available local environment. This is not Kubernetes API-server validation. Docker/Podman and `kubectl` are unavailable in that environment.

If `kubectl` and Kustomize are installed, validate locally without applying:

```sh
kubectl config current-context
kubectl kustomize containers/k8s/
kubectl apply --dry-run=client -k containers/k8s/
```

The included Deployment uses the image placeholder `ghcr.io/REPLACE_ME/lingo-legacy-container:REVIEW_REQUIRED`. Replace it only after the intended application runtime is implemented, the image is actually built and scanned, and an immutable digest is recorded. Do not apply this scaffold to production.

## Promotion prerequisites

1. Specify the workload scope (web frontend, API, worker service, jobs, or all) and functional contract.
2. Design and implement a Node-compatible runtime with reviewed parity requirements.
3. Add route-level, asset, auth, and integration tests relevant to the agreed scope.
4. Build and scan an immutable image; record source commit and image digest.
5. Validate manifests on an isolated test cluster.
6. Confirm secrets, storage, network policy, ingress, observability, backup, and rollback requirements.
7. Resolve G02 and pass the approved evidence chain before any controlled staging deployment.
