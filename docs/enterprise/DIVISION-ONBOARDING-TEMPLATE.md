# LINGO Division Onboarding Record

Copy this template once per division. Do not mark a division ONBOARDED until every required field has evidence and an accountable owner accepts the record.

## Identity
- Division ID:
- Canonical name:
- Business/product owner:
- Technical owner:
- Repository/repositories:
- Current lifecycle state:
- Last reviewed:

## Source inventory
| Surface / service | Canonical source path or provider ID | Owner | Environment | Classification | Evidence | State |
|---|---|---|---|---|---|---|

## Products and surfaces
- Websites:
- Mobile applications:
- Games:
- APIs:
- Admin/operations surfaces:
- Customer/community surfaces:
- Third-party integrations:

## Dependencies and connections
| Connection ID | Source | Target | Direction | Protocol/contract | Auth reference (no secret) | Health check | Failure behavior | State |
|---|---|---|---|---|---|---|---|---|

## Data and storage
- Data categories and classification:
- Authoritative data sources:
- Databases and object stores:
- Backup destinations:
- Retention and archival:
- Quarantine procedure:
- Restore test and evidence:
- Deletion policy and approval owner:

## Identity and security
- User identity provider:
- Service identities:
- Roles and permission scopes:
- Secret manager reference:
- Threat model:
- Privacy/accessibility obligations:
- Open security findings:

## Engineering and quality
- Build/test commands:
- CI workflows:
- Runner contract and evidence:
- Unit/integration/E2E coverage:
- Dependency/security scans:
- Artifact provenance:
- Independent reviewer:

## Operations and recovery
- SLO/availability target:
- Dashboards/telemetry:
- Alerts and escalation:
- Incident runbook:
- Rollback procedure:
- RTO/RPO:
- Last successful restore exercise:

## Knowledge and education
- LKIS source records:
- Architecture documentation:
- API references:
- Operator runbooks:
- Developer onboarding:
- Customer support knowledge:
- Training owner and review date:

## Release readiness
- Current release gate:
- Exact candidate commit SHA:
- Required approvals:
- Evidence links:
- Known blockers:
- Rollback evidence:
- Production state verified by:
- Explicit release acceptance reference:

## Acceptance checklist
- [ ] Source inventory reconciled against provider/repository evidence.
- [ ] Owners confirmed.
- [ ] Dependencies and interfaces recorded.
- [ ] Data classification and retention approved.
- [ ] Identity and least-privilege review completed.
- [ ] CI actually executed; zero-job/startup-failure runs are not passes.
- [ ] Required tests and independent verification completed.
- [ ] Backup restore tested.
- [ ] Runbooks and training published.
- [ ] Release gate and production state independently verified.

**Disposition:** PROPOSED / IN_REVIEW / ONBOARDED / BLOCKED  
**Owner acceptance:**  
**Evidence references:**  
**Next review date:**
