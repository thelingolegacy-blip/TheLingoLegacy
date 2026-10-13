# LINGO Legacy Unified DevOps Foundation

Status: isolated implementation scaffold; not production-ready and not a deployment authorization.

## Authority model

- GitHub is the authoritative source and release-control path.
- GitLab, if connected, performs independent merge-request validation only.
- Jenkins coordinates validation; this initial pipeline has no deployment stages.
- Terraform is provider-neutral and declares no resources.
- Ansible is local-only and read-only.
- Docker application packaging is deferred until the actual runtime contract is verified.
- Kubernetes manifests and cluster provisioning are deferred until the image and target environment are approved.

## Required release sequence

SOURCE → EVIDENCE → VERIFICATION → ACCEPTANCE → AUTHORIZATION → PROMOTION

No downstream stage can infer authorization from an earlier validation result. G02 remains a separate hard gate and must be accepted using actual GitHub runner assignment/execution evidence. GitHub-hosted validation does not satisfy G02.

## Protected surfaces

This scaffold does not modify Cloudflare routing, DNS, production secrets, Firebase configuration, deployment environments, production workloads, or the last-known-good release. No cloud resources are created and no workflow is dispatched as part of authoring these files.

## Exit criteria for this phase

- YAML and Ansible syntax checks pass.
- Terraform formatting, backend-free initialization, and validation pass.
- Jenkins and GitLab configurations receive independent review.
- The actual application packaging contract and cloud target are documented before Docker/Kubernetes deployment assets are introduced.
- G02 is accepted independently before any runner-dependent release work.
