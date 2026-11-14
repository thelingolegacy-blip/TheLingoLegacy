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

Vite binds to localhost only (127.0.0.1). The application is a development preview; sample analytics and starter media are clearly illustrative.

## Current implementation

- Responsive crimson / black / white / gold studio shell.
- Overview, media library, playlists, presentations, creator management and analytics surfaces.
- Search/filter, local draft creation and selectable media preview state.
- Typed D1 repository boundary, Worker API scaffold and initial D1 migration.

## Persistence and deployment boundary

The UI currently uses in-memory sample data. It does not upload media bytes, transcode video, authenticate users, persist playlists, render slide decks, or collect real analytics. The Worker and D1 adapter are scaffolds only; they are not bound to production resources and have not been deployed.

Before any environment binding: provision a separate development D1 database, apply the migration, configure a non-production Worker route and authentication/authorization, then add integration tests. Never bind production credentials or production routes from this project branch.

## Validation

Run the commands above in a Node-enabled environment. A Git commit is not test evidence. Production, main, G02, billing and last-known-good remain outside this project's scope.
