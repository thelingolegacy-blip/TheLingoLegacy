# LINGO Master Control Plane — Registry Schema Proposal

**Status:** PROPOSED / READ-ONLY FIRST

## Purpose
Provide a reliable inventory of services, repositories, environments, owners, contracts, dependencies and health evidence. The Control Plane is a control surface, not an unrestricted superuser path.

## Minimum service record
- `service_id`: immutable, unique identifier.
- `display_name`: human-readable service name.
- `owner`: accountable team or role.
- `repository`: canonical repository and path.
- `domain`: bounded context.
- `lifecycle`: planned, development, staging, production, retired.
- `environment`: isolated environment identifier.
- `contract_refs`: OpenAPI/event contract references and versions.
- `dependencies`: service/provider IDs with relationship type.
- `data_classification`: public, internal, confidential, personal, restricted.
- `health_probes`: liveness/readiness endpoints and last verified time.
- `slo_ref`: service-level objective reference.
- `runbook_ref`: operational runbook.
- `deployment_ref`: commit, workflow, artifact digest and environment.
- `cost_owner`: accountable owner and approved budget reference.
- `release_state`: NOT_STARTED, BUILT, TESTED, CONNECTED, CERTIFIED, PRODUCTION.
- `evidence_refs`: immutable links to checks, logs, artifacts and approvals.

## Trust and safety
- Registry data is not authorization. Access decisions remain in service-side policy.
- Initial Control Plane is read-only.
- Mutating actions require explicit role, scoped approval, audit record, idempotency key and rollback plan.
- No secret values are stored in registry; store references to approved secret managers only.
- A failed health probe must not trigger an automatic production mutation.
- The registry must remain available independently of any one application service.

## Acceptance
Schema validation, duplicate-ID checks, owner/dependency validation, health-probe verification, audit review and read-only permission tests.
