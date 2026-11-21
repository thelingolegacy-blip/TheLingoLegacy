# Preview route-contract remediation — 2026-10-24

## Scope
This branch adds Vercel preview routing/contract handlers to address observed HTTP 404s on the Vercel preview. It does not change Cloudflare Worker configuration, production DNS, production traffic, secrets, or Firebase.

## Changes
- Redirect `/game` to `/thats-my-lingo/` and `/arcade` to `/lingoarcade/` using permanent redirects.
- Add `/api/v1/runtime` and `/api/v1/platform/gates` preview handlers.
- API responses explicitly state `PREVIEW_ONLY`, `backend_integrations: NOT_VERIFIED`, fail-closed gate states, and no production authorization.

## Non-goals and acceptance limits
- These preview handlers are contract shims; they do not prove Cloudflare Worker behavior, Firebase readiness, persistence, or production parity.
- `/about` is intentionally not redirected because its intended destination has not been confirmed by the product owner.
- A merged change is not authorized by this document. Verify the resulting preview's status codes, redirect locations, method handling, response schemas, and noindex headers; review the diff and test results before considering acceptance.
- G02 remains blocked until real runner/job/sentinel/log/artifact evidence is independently verified.
- Production remains Protected HOLD.
