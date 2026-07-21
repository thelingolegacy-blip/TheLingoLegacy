# Wave 0 — Foundation execution plan

Wave 0 establishes the minimum stable operating base for Lingo Legacy OS.

## Objective

Create a reliable foundation that can support later OS waves without slowing momentum or requiring repeated setup decisions.

## Foundation lanes

### Repo structure

Current state:

- Static root homepage at `index.html`.
- Landing page at `landing/index.html`.
- Asset library at `assets/index.html`.
- Operating docs in `docs/`.

Execution rule:

- Keep static launch surfaces simple until a later wave requires app logic.
- Add new OS docs under `docs/` before adding new runtime dependencies.
- Preserve root deployment compatibility for Vercel.

### Build pipeline

Current state:

- Vercel preview deployment is the primary build verification path.
- Static validation parses HTML and verifies local links.
- No package build step is required for the static site.

Execution rule:

- Treat Vercel `READY` as the deployment readiness signal.
- Treat local static validation as the pre-promotion quality gate.
- Keep external CI separate from the Vercel production path unless explicitly updated.

### Production flow

Current state:

- Vercel project: `the-lingo-legacy`.
- Production flow: preview, verify, promote.
- Stability sync runbook covers command expansion and production checks.

Execution rule:

1. Implement the next foundation change.
2. Validate static HTML, links, doctrine markers, and activation markers.
3. Confirm the Vercel preview deployment is `READY` after Git sync.
4. Promote only a verified deployment.
5. Record the result in the active pull request summary.

## Wave 0 intervention points

Only intervene when one of these is true:

- A required file or route is missing.
- A link, marker, or static page fails validation.
- Vercel deployment readiness is unclear.
- Docs drift from the active execution doctrine.
- A later wave needs a foundation dependency documented first.

## Completion criteria

- Repo structure is documented.
- Build pipeline expectations are documented.
- Vercel production flow is documented.
- Wave 0 is linked from the README and OS execution doctrine.
- Static validation passes.
