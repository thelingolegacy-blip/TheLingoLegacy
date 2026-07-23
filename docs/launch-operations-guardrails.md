# Launch operations guardrails

This static site uses Vercel's Git-connected deployment flow. Do not manually run a production deploy for this branch.

## Pre-merge gates

Run these locally before merge:

```bash
node scripts/validate-static-site.mjs
node scripts/smoke-static-site.mjs
```

The smoke script checks launch-critical files, security headers, AI crawler robots guards, and unsafe overlay z-index values.

## Health check

- `/healthz` returns `ok` as a static health endpoint.
- After a production merge, verify `https://thelingolegacy.com/healthz` returns `200 OK` and body `ok`.

## Rollback

Use Vercel's deployment history to promote the previous stable production deployment if a release breaks. Rollback should be preferred over a rushed follow-up deploy.

## Release checklist

1. PR is reviewed.
2. Static validator passes.
3. Smoke script passes.
4. No paid telemetry, storage, database, or server functions were added.
5. Security headers are present in `vercel.json`.
6. `robots.txt` keeps advisory crawler guardrails.
7. Footer/legal/safety docs exist before collecting any personal data.
8. After merge, verify `/`, `/tapstich/`, `/robots.txt`, `/sitemap.xml`, and `/healthz`.

## Observability without new cost

Use Vercel deployment status, `vercel usage`, and manual smoke checks first. Enable paid monitoring only after approval and a spend cap are in place.
