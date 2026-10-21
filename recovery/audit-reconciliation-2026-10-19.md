# Audit reconciliation — 2026-10-19

Review-only record. The supplied audit references `.github/workflows/deploy.yml`, but that path was not found on `main` or in the sampled recovery branches. The inspected `main` branch instead contains `.github/workflows/production-promotion.yml` and `.github/workflows/lingo-autorepair-deploy.yml`.

The reported D1–D8 findings therefore cannot be applied safely to this repository snapshot until the source artifact is reconciled. Existing draft PRs #276 (hard deployment hold), #277 (staging isolation), and #295 (promotion gate order) are proposals only, not merged controls.

The repository has numerous open PRs. Branch-protection settings could not be read with the current integration permission. Keep production deployment locked; do not infer that branch protections or staging isolation are verified. No production deployment or Cloudflare resource mutation was performed.