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
