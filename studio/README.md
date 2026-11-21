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

The registry defines 12 Studio modules and current provider-readiness classifications for GitHub, Cloudflare, Flutter, Firebase, Supabase, Render, and Google AI Studio. It records only observed/source-backed state and includes evidence requirements for every module.

`studio/enterprise-module-registry.schema.json` defines the JSON Schema contract. This is a registry foundation, not a claim that all 12 modules are implemented or that providers are fully integrated.

Default authority is read-only. No secret values, provider credentials, production mutation, autonomous merge/deploy, billing, wallet/reward mutation, or access grants are allowed by this registry. Unknown state fails closed.
