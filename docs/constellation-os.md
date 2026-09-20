# Constellation OS — Staged Control Plane

Constellation OS is the governance blueprint for routing, promotion, recovery, dashboard control, CI/CD, telemetry, and secret rotation across Avalon, Game143, and LegacyOS.

## Canonical boundaries

- GitHub is the implementation source of truth.
- Cloudflare is the production runtime and domain authority.
- AppDeploy is a non-authoritative Studio QA/build surface.
- Shopify is the connected commerce system for Loyalty Lane.
- No credential values are committed to source.
- No synthetic runner/deployment/live evidence is accepted.

## Routing fabric

Reserved configuration is represented by `ROUTING_CONFIG` with three logical origins:

- Origin A: `main.thelingolegacy.com`
- Origin B: `dup.thelingolegacy.com`
- Origin C: `recovery-preview.thelingolegacy.com`

The `/dup` and `/recovery` paths are reserved contracts only until their corresponding edge controls, authentication, audit logging, and live evidence are verified.

## Governance fabric

Promotion control is designed around an internal governance hostname and Cloudflare Access-protected dashboard. Any production mutation remains subject to the independent runner, runtime, deployment, live-probe, rollback, and evidence gates.

## Deployment fabric

The recommended pattern is hybrid:

`universe build -> universe readiness evidence -> gate worker -> explicit promotion boundary`

The existing canonical repository already enforces the GitHub-hosted `ubuntu-latest` runner gate. A real runner execution must expose runner identity, an executable step, step state, and logs before any downstream production promotion is considered.

## Recovery fabric

Recovery artifacts are synchronized from an isolated vault process, checksummed, restored to Origin C, and validated through `/recovery` before any later decision. A recovery preview is not itself production certification.

## Telemetry

Promotion, recovery, readiness, vault synchronization, unauthorized access, and health-probe failures are modeled as auditable event classes. Delivery credentials remain server-side.

## Secret rotation

Rotation cadence is documented as policy. The values themselves must be provisioned through the owning secret store and must never be copied into source.

## Acceptance chain

SOURCE -> EVIDENCE -> VERIFICATION -> ACCEPTANCE -> PASSED -> AUTHORIZATION -> PROMOTION -> POST-PROMOTION

Each gate is independent. Passing one gate never implies another.

## Staging execution probe

This marker is intentionally documentation-only. It exists to produce a new staging-branch push event so the already-staged Constellation contract workflow can be observed. It grants no authority, performs no production mutation, changes no DNS, and does not alter LKG.
