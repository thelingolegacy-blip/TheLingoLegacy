# Analytics and viewer visibility

Vercel Web Analytics is enabled in the site markup with `/_vercel/insights/script.js`.

What Vercel Web Analytics can show:

- Page views and visitor counts
- Top pages
- Referrers
- Country/region, device, browser, and OS breakdowns
- Anonymous custom events when added later

What it cannot show:

- A named list of exactly who viewed a page
- Personal identities, emails, or cross-site browsing history

Vercel Web Analytics is privacy-focused and uses anonymized/aggregated data. See Vercel's docs: https://vercel.com/docs/analytics and https://vercel.com/docs/analytics/quickstart.

To show known viewers later, add authenticated accounts and store consent-based page views in your own database with fields like `userId`, `page`, `timestamp`, and `sourceCampaign`. Do not store payment card data in this site; Stripe handles card data.
