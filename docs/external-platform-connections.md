# External platform connection hub

This hub maps Canvas, GDevelop, GoDaddy, Square, Wix, SoFi, Chime, Apple, and Google Play into Lingo Legacy OS.

## Rule

Vercel hosts the OS routing layer. External platforms require account-owner credentials and must be connected inside their own dashboards. Do not store external account credentials, bank data, API secrets, or private tokens in this repository.

## Platform routes

- Canvas — education/course operations for Avalon and youth programs.
- GDevelop — HTML5 game export source for Lingo.ai.
- GoDaddy — optional registrar/DNS management if a domain is managed there.
- Square — POS, merch, event checkout, and vendor lane payments.
- Wix — legacy site/page inventory, redirects, or migration source.
- SoFi — external funding source policy only.
- Chime — external funding source policy only.
- Apple — Apple Pay through Stripe, later Apple Developer/App Store distribution.
- Google Play — Google Pay through Stripe, later Android distribution.

## Safe next steps

1. Add only public URLs to the OS site.
2. Keep secrets in external dashboards or secure backend environment variables.
3. Use Stripe for Apple Pay and Google Pay on web checkout.
4. Use GDevelop HTML5 export to replace the current Lingo.ai prototype canvas when ready.
5. Keep Vercel as the canonical deployment target for `thelingolegacy.com`.

## Machine-readable source

- [`../os/platforms/external-platform-connections.json`](../os/platforms/external-platform-connections.json)

## Lingo.ai activation

- [`lingo-ai-activation.md`](lingo-ai-activation.md)
- [`../os/games/lingo-ai-activation.json`](../os/games/lingo-ai-activation.json)

## Lingo.ai distribution kit

- [`lingo-ai-distribution-kit.md`](lingo-ai-distribution-kit.md)
- [`../os/games/lingo-ai-distribution-kit.json`](../os/games/lingo-ai-distribution-kit.json)
