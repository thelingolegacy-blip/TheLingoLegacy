# Studio safety guardrails

These guardrails keep the static Lingo Legacy site production-safe without adding paid services.

## Current no-cost controls

- Security headers are set in `vercel.json`: HSTS, CSP with `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, strict referrer policy, and locked-down browser permissions.
- `robots.txt` blocks common AI crawlers and disallows `/api/` paths. This is advisory only; enforce with Vercel Firewall if traffic becomes a measured cost driver.
- The site stays static: no server functions, no database, no paid storage, no paid telemetry scripts, no Shopify Admin writes.

## Overlay and hidden-content rules

- Use z-index tokens only: content `0-10`, nav `100`, backdrop `400`, overlay `500`, toast `600`, FX `650`, HUD/UI `700`.
- Do not use arbitrary `999999` z-index values.
- Decorative layers must use `aria-hidden="true"` and `pointer-events: none` unless they are the active overlay.
- Never hide sensitive or admin-only data with CSS. If a user cannot access data, do not render that data into HTML.
- When a real modal is added later, it must include focus trap, Escape close, explicit close button, backdrop click close, and body scroll lock.

## Legal and privacy placeholders

- Footer links should point to Privacy, Terms, Cookie, and Support pages before collecting personal data.
- Until forms are added, collect no personal data on the static site.
- If forms are added later, use a honeypot field plus server-side validation before considering paid CAPTCHA services.

## Billing safety

- Before enabling Web Analytics, Speed Insights, Blob, database, WAF rate-limit metering, or BotID Deep Analysis, confirm the expected monthly cost and set a spend cap in Vercel Billing.
- For billing disputes or refunds, use https://vercel.com/help with measured usage evidence from `vercel usage`.
