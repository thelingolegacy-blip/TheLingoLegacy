# Changelog

All notable user-visible and operational changes are recorded here. Unreleased work is not represented as shipped.

## [Unreleased] — 2026-10-13

### Added
- Engineering contribution, architecture, orchestration, observability, integration, and delivery-roadmap documentation.
- Wiki-ready pages under docs/wiki so operational knowledge is versioned alongside source.
- A non-deploying repository quality workflow for Worker syntax, core shell syntax, and recovery unit tests.
- A Kubernetes capacity-lab design for a synthetic virtual bottleneck, explicitly separate from the Cloudflare production runtime.

### Clarified
- Cloudflare Workers remains the authoritative production web runtime.
- Kubernetes is a proposed isolated service/capacity-lab plane, not a replacement for the current Worker and not provisioned by this documentation change.
- A green static validation job does not prove G02 runner assignment, production readiness, or deployment authorization.
- No production route, DNS record, secret, Worker deployment, cluster, or cloud resource is changed by these additions.

### Pending verification
- GitHub Actions dispatch and execution evidence.
- G02 host inventory, actual runner assignment, sentinel execution, retrievable logs, and correlated artifact.
- Approved provider/account/region, network egress, cluster ownership, cost budget, image registry, and credentials before any Kubernetes or cloud provisioning.
- Production Worker source/runtime version reconciliation and public reachability verification.
