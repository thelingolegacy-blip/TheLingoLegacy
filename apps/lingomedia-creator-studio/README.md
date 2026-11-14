# LINGOmedia Creator Studio

An isolated React + TypeScript creator workspace for the LINGOmedia product family.

## Local development

Requirements: Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
npm run build
npm test
```

Vite binds to localhost only (127.0.0.1). Starter content and analytics are illustrative. Drafts created in the browser are not durable until an authenticated API/storage adapter is connected.

## Current implementation

- Responsive crimson / black / white / gold studio shell.
- Overview, media library, playlists, presentations, creator management and analytics surfaces.
- Search/filter, local draft creation and selectable media preview state.
- Typed D1 repository boundary, Worker API and initial D1 migration.
- Branch-scoped GitHub Actions build and unit-test workflow.

## API security boundary

The Worker exposes a public health response at `GET /api/health`. All `/api/media` operations fail closed unless a non-production Cloudflare secret named `MEDIA_API_TOKEN` is configured with at least 32 characters and the caller supplies it as a Bearer token. Never put this token in browser code, Vite variables, Git, logs, or a public issue. This temporary service credential is a development gate, not a replacement for user authentication, per-user authorization, or production identity management. Do not configure it on a production Worker.

The Worker is not deployed and no D1 database or secret is provisioned by this repository change. Do not expose the API publicly until an identity provider, per-user authorization, abuse controls, and integration tests are in place.

## Persistence and deployment boundary

The UI currently uses in-memory sample data. It does not upload media bytes, transcode video, authenticate users, persist playlists, render slide decks, or collect real analytics. The Worker and D1 migration are source-only and are not bound to any environment.

Before any environment binding: provision a separate development D1 database, apply migrations, configure a non-production Worker route and identity/authorization, then add integration tests. Never bind production credentials or production routes from this project branch.

## Validation

The branch workflow installs dependencies, runs the TypeScript/Vite production build, and executes Vitest. A Git commit alone is not test evidence; use the resulting GitHub Actions run. Browser/device QA and Cloudflare integration remain separate gates.

Production, main, G02, billing and last-known-good remain outside this project's scope.
