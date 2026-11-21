# Lingo Legacy Consolidated Studio Architecture

## Objective

Reduce fragmented deployment locations by making **TheLingoLegacy** the source-of-truth integration repository and **Cloudflare Workers** the primary edge runtime.

This does not delete specialized repositories. They remain source modules until their contents are safely integrated, exported, or mounted behind the shared runtime.

## Target topology

```
SPECIALIZED GITHUB REPOS
        |
        v
TheLingoLegacy / main
        |
        +-- shared studio shell
        +-- shared assets
        +-- shared contracts
        +-- route integration
        |
        v
CLOUDFLARE WORKER
        |
        +-- /
        +-- /lingoarcade/
        +-- /thats-my-lingo/
        +-- /kottons-code
        +-- /lane
        +-- /media
        +-- /ai
        +-- /assets
```

## Important boundary

A source repository being listed here does **not** mean its production runtime has already been migrated.

Migration requires:

1. source integration,
2. build success,
3. runtime deployment,
4. live observation,
5. verification,
6. acceptance,
7. only then promotion.

No production routing is changed by this registry alone.


## Source integrity

The consolidated source includes a deterministic surface-integrity checker at `studio/runtime/surface-integrity.js` and a GitHub Actions workflow at `.github/workflows/studio-surface-integrity.yml`. The checker validates surface entrypoints, shared runtime files, adapter linkage, surface identity, route registration, and manifest registration. Its result is source-integrity evidence only and never infers production state.


## Enterprise module and provider registry

`studio/enterprise-module-registry.json` is the Studio control-plane capability catalog. It is intentionally distinct from `studio/surface-contracts.json` (product surface/entrypoint contracts) and `studio/production-feature-manifest.json` (runtime feature flags).

The registry defines 22 Studio modules and current provider-readiness classifications for GitHub, Cloudflare, Flutter, Firebase, Supabase, Render, and Google AI Studio. It records only observed/source-backed state and includes evidence requirements for every module.

`studio/enterprise-module-registry.schema.json` defines the JSON Schema contract. This is a registry foundation, not a claim that all 22 modules are implemented or that providers are fully integrated.

Default authority is read-only. No secret values, provider credentials, production mutation, autonomous merge/deploy, billing, wallet/reward mutation, or access grants are allowed by this registry. Unknown state fails closed.


### Separately permissioned LINGOworld operations domains

The registry exposes separate read-only module boundaries for:
- workforce operations (organizers, promoters, managers, scheduling and approvals);
- HR and payroll (restricted personnel, compensation, payroll and tax records);
- residential property operations;
- hotel and hospitality operations;
- roads and transportation infrastructure;
- street and road lighting;
- water distribution/flow monitoring and wastewater, drainage and sewer-flow monitoring as separate modules.

These permission labels describe required authorization scopes; they do not grant runtime access. Each module remains planned until its owner, tenant/jurisdiction model, data classification, GIS/asset registry, audit evidence, retention and negative authorization tests are accepted. HR/payroll must not inherit general workforce, game, community or property access.


### World engineering and game live operations

The Studio catalog also separates the **World Builder & Simulation Studio** (world schemas, procedural generation, scene graphs, GIS overlays, deterministic simulation, asset lineage and Unity/web adapters) from **Game Live Operations** (sessions, progression, matchmaking, events, anti-cheat, moderation, telemetry and rollback). Both remain planned and read-only until their runtime contracts and test evidence are accepted.



### Dashboard integration — 2026-11-21

The Studio dashboard now loads the canonical 21-module catalog from `/studio/enterprise-module-registry.json` and renders each module's declared readiness, scope and read-only boundary. It no longer substitutes the legacy 21-name runtime module array for the enterprise capability catalog.

The provider panel deliberately separates evidence classes:
- **Live browser probes:** the same-origin Cloudflare Worker status/gate APIs and the public GitHub repository metadata endpoint. The Worker CSP permits only the exact `https://api.github.com` origin for this additional read-only probe.
- **Session-observed connector evidence:** Supabase project health and advisor/table/migration results retrieved through the authorized ChatGPT connector. This is displayed as a timestamped evidence snapshot, not falsely represented as a browser-side endpoint.
- **Not yet browser-integrated:** Firebase, Flutter native builds, Render service inventory, and Google AI Studio. Render service discovery requires the operator to explicitly confirm a workspace before inventory is queried. No provider secrets are embedded in the page.

The dashboard remains a public-reachable, noindex preview, not an authenticated enterprise control plane. It exposes only public-safe provider metadata and release-lock state. Authenticated provider APIs, secret-backed adapters, audit persistence and any mutation capability require a separately designed, authenticated server-side boundary. No production Worker deployment is implied by this source change.
