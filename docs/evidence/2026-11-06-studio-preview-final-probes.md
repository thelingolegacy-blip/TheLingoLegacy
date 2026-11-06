# Studio Preview — Final Staging Probe Record — 2026-11-06

## Deployment

- Worker: `lingo-studio-control-center-staging`
- Version: `6`
- Version ID: `e142ffd0-8e76-495d-a9f0-e6a3c9ef3558`
- Deployment ID: `a61fd6e1-65b8-47e1-9cd0-a04f1b307669`
- Allocation: 100%
- Source SHA-256: `908f592c4c572ba27d470fd0de729919ab9c54650449e7d286b5e475ad001011`
- Custom domain: `studio-preview.thelingolegacy.com` — enabled; proxied DNS record present.

## Positive GET/HEAD probes

- Root `/_next/static/chunks/695-948c687547f7d4e5.js`: JavaScript content served.
- Root `/_next/data/<build-id>/studio.json?slug=studio`: static-export JSON served with `__N_SSG: true`.
- Root `/_next/data/<build-id>/legacy.json?slug=legacy`: static-export JSON served with `__N_SSG: true`.
- `/apps/universe/studio/`: expected Studio page HTML returned; relative Membership link rebased to `/apps/universe/legacy/`.
- `/apps/universe/legacy/`: expected Legacy page HTML and Studio navigation returned.
- `HEAD /_next/static/chunks/695-948c687547f7d4e5.js`: HTTP 200.
- Kotton’s Code `/resources/KottonsCode-world-1.jpeg`: image document returned at 1024×1024.
- `/healthz/apps`: 16/16 registered gateway origins returned HTTP 200 to HEAD probes.

## Negative security probes

- `POST /api/runtime/probe/test`: HTTP 405.
- `GET /api/runtime/probe/test`: explicitly denied with `Protected application endpoints are not proxied.`.
- `GET /apps/runtime/api/runtime/probe/test`: explicitly denied with `Protected application endpoints are not proxied.`.
- `GET /_next/data/<build-id>/admin.json?slug=admin`: explicitly denied with `Static page data path not allowed.`.
- `GET /_next/image?... `: explicitly denied with `Image optimization route is not proxied.`.

## Status and limits

- AppDeploy status checks for Universe and Kotton reported no new frontend/backend errors since the version-6 deployment. Older resource errors in their history predate version 6; the travel app has two older script-error records.
- The AppDeploy owner account lists 18 apps; the gateway registers 16. The older LINGO shell and separate Obsidian preview remain unregistered pending disposition.
- The repository regression test exists and is wired into static CI. It has not executed because GitHub Actions attempts fail at startup with zero jobs. Browser Rendering probes independently cover the key GET/HEAD/POST and allow/deny paths.
- Full interactive click-through, complete responsive/mobile acceptance, and independent security review remain outstanding.
- Production routes, Worker code, DNS, payment settings, Firebase, and secrets were not changed. PR #473 remains draft and unmerged.

**Disposition: STAGING ROUTING AND METHOD-GUARD PROBES PASS; RELEASE ACCEPTANCE REMAINS BLOCKED.**

## Interactive navigation

- Starting at `/apps/universe/studio/`, Browser Rendering clicked the Membership link and reached the Legacy page; final title was `LINGOlegacy | LINGOlegacy` and the `IDENTITY.` content was present.
- Starting at `/apps/universe/legacy/`, Browser Rendering clicked the Studio link and returned to the Studio page; final title was `Studio / Enterprise | LINGOlegacy` and the Studio headline was present.
- Both transitions completed with the gateway's root-level Next.js data/static aliases active.

## Kotton’s Code image acceptance

- `/apps/kottonscode/` returned the expected `Kotton’s Code — Cartoon Studio` page.
- Browser Rendering forced lazy images to load and inspected their natural dimensions. All four unique world assets (`KottonsCode-world-1.jpeg` through `KottonsCode-world-4.jpeg`) completed successfully at 1024×1024.

## Complete static page-data allowlist

A same-origin Browser Rendering probe fetched all nine allowlisted static-export data routes. Every request returned HTTP 200, valid JSON, `__N_SSG: true`, and a `pageProps` object: `legacy`, `slots`, `arcade`, `library`, `media`, `world`, `lane`, `legacyxclub`, and `studio`.
