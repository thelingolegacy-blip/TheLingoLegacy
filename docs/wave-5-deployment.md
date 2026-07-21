# Wave 5 — Deployment execution plan

Wave 5 defines the deployment, routing, and automation layer for Lingo Legacy OS.

## Objective

Keep deployment predictable, verifiable, and aligned with Vercel production flow.

## Deployment lanes

### Deployment stack

- Use Vercel preview deployments for branch validation.
- Promote only verified ready deployments.
- Keep deployment notes current after every production push.

### Routing rules

- Preserve root `index.html` as the public homepage for the static site.
- Keep landing, asset, and docs links stable.
- Document any future custom routing before rollout.

### Automation triggers

- Trigger automation only when validation criteria are known.
- Keep automated actions visible in pull request or deployment notes.
- Require rollback or recovery notes for production-affecting automation.

## Intervention points

Intervene only when:

- Deployment readiness is unclear.
- Routing behavior changes.
- Automation lacks validation or rollback notes.
- Production flow drifts from Vercel preview-to-promote practice.

## Completion criteria

- Deployment stack rules are documented.
- Routing rules are documented.
- Automation trigger rules are documented.
- Wave 5 is linked from the doctrine and README.
