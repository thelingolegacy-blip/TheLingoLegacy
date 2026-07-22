# Studio Release System

Studio Mode stays on for every Lingo Legacy OS release. This pipeline keeps the visual bar high while using free-tier infrastructure and static-site checks.

## Release stages

1. **Staging** — every change starts in a pull request or preview deployment.
2. **QA Review** — validate local links, assets, metadata, scripts, mobile layout, and accessibility basics.
3. **Studio Review** — confirm Industrial Noir visuals, cinematic motion, typography, spacing, and world identity are consistent.
4. **Production Deployment** — merge only after validation and review pass.
5. **Monitoring** — watch Vercel Web Analytics, Speed Insights, deployment health, and reported errors after launch.
6. **Iteration** — fixes return to staging, pass QA and Studio Review, then ship.

## Required release gate

Run the static smoke test before merge:

```bash
node --check scripts/validate-static-site.mjs
node scripts/validate-static-site.mjs
```

The validator checks JSON config, sitemap URLs, local links/assets, anchor targets, inline script syntax, titles, and meta descriptions.

## Studio QA checklist

- Production pages include canonical metadata, social metadata, Web Analytics, and Speed Insights scripts.
- Every local link, asset path, and anchor target resolves.
- Mobile and desktop layouts preserve the Industrial Noir design system.
- Buttons and cards have clear hover, focus, and press states.
- No secret, API token, or credential appears in static HTML.
- 404, manifest, robots, sitemap, and Vercel headers stay present.

## Post-launch monitoring

For the first 48 hours after production deploy:

- Check Web Analytics for traffic and route engagement.
- Check Speed Insights for LCP, CLS, INP, and FCP regressions.
- Check Vercel deployment status and runtime logs if errors are reported.
- Log every issue with its world: HQ, AI Lab, Wallet, XP Engine, Games, Apparel, Media Hub, or Avalon Identity.

## Iteration rules

- No fix goes straight to production.
- Every fix starts in staging or a pull request.
- Every fix passes the static smoke test.
- Every fix gets mobile, desktop, and Studio Review before merge.
- Every production fix is monitored for 48 hours.
