# LINGO Legacy Unified DevOps Foundation

Status: isolated implementation scaffold; not production-ready and not a deployment authorization.

## Authority model

- GitHub is the authoritative source and release-control path.
- GitLab and CircleCI, if connected, perform independent validation only.
- Jenkins coordinates validation; this initial pipeline has no deployment stages.
- Terraform is provider-neutral and declares no resources.
- Ansible is local-only and read-only.
- Docker application packaging is deferred until the actual runtime contract is verified.
- Kubernetes manifests and cluster provisioning are deferred until the image and target environment are approved.

## Observability and quality

- Prometheus currently scrapes only itself; production/application targets are not configured.
- Grafana has a Prometheus datasource provisioning file, but dashboards and deployment are not configured.
- The ELK Compose file is a loopback-only development scaffold. It has not been executed or security-certified; Logstash currently writes to stdout.
- SonarQube project properties exist, but scans remain disabled until server and secret configuration are verified.
- HashiCorp Vault is documented as a future secret-provider integration; no Vault endpoint or authentication is configured.
- Smart cache is policy-only and disabled until cold/warm measurements, invalidation tests, and trust-boundary review pass.

## Required release sequence

SOURCE → EVIDENCE → VERIFICATION → ACCEPTANCE → AUTHORIZATION → PROMOTION

No downstream stage can infer authorization from an earlier validation result. G02 remains a separate hard gate and must be accepted using actual GitHub runner assignment/execution evidence. GitHub-hosted validation does not satisfy G02.

## Protected surfaces

This scaffold does not modify Cloudflare routing, DNS, production secrets, Firebase configuration, deployment environments, production workloads, or the last-known-good release. No cloud resources are created and no workflow is dispatched as part of authoring these files.

## Exit criteria for this phase

- YAML and Ansible syntax checks pass.
- Terraform formatting, backend-free initialization, and validation pass.
- Jenkins, GitLab, and CircleCI configurations receive independent review.
- Observability configuration is linted and reviewed before any local or remote stack is started.
- Smart cache remains disabled until measured benefit and integrity are independently verified.
- The actual application packaging contract and cloud target are documented before Docker/Kubernetes deployment assets are introduced.
- G02 is accepted independently before any runner-dependent release work.
