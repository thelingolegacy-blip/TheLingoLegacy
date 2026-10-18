# LINGOsheilds Implementation Baseline

## Runtime boundaries

| Service | Responsibility | Authority |
|---|---|---|
| edge-api | authenticated API ingress | control |
| control-plane | repositories, policies, workflows, releases | control |
| git-service | native repository operations | data |
| provider-bridge | GitHub/GitLab federation | adapter |
| runner-controller | runner lifecycle and job dispatch | execution |
| agent-gateway | model/agent orchestration | agent |
| evidence-service | provenance and evidence records | evidence |
| security-service | findings and policy evaluation | security |
| artifact-service | immutable build artifacts | artifact |
| release-service | environment promotion and rollback | release |
| telemetry-service | logs, metrics, traces, audit | observability |

## Boundary rule

No service may directly promote production unless it possesses an explicit authorization token/state produced by the governance layer.

## Data classification

- PUBLIC: published project metadata
- INTERNAL: engineering metadata
- CONFIDENTIAL: source, private configuration, customer data
- SECRET: credentials, tokens, signing keys

Secrets never enter source control, model context, build logs, or evidence payloads.

## Required identifiers

request_id
operation_id
repository_id
commit_sha
change_set_id
pipeline_id
agent_run_id
evidence_id
artifact_digest
release_id
authorization_id
