# Studio Preview Static Asset Routing Repair — 2026-11-06

## Scope
Staging-only repair of Cloudflare Worker `lingo-studio-control-center-staging`. No apex/www route, production Worker, application backend, auth, secrets, payments, or write routes changed.

## Defect
The gateway denied all `_next` requests, including Next.js static JavaScript bundles. AppDeploy QA recorded failed script loads on the Universe preview. Kotton's Code requested four world images from root-level `/resources/` paths, which were not routed through the app prefix.

## Change
- Permit only `_next/static/` within the app proxy. Continue blocking `_next/data`, `_next/image`, APIs, auth, OAuth, admin, and internal paths.
- Add a root-level alias for only `/resources/KottonsCode-world-[1-4].jpeg`, routed to the Kotton's Code app origin.
- Preserve GET/HEAD-only gateway behavior, response security headers, origin pinning, redirect blocking, and no-cookie forwarding.

## Deployment evidence
- Worker: `lingo-studio-control-center-staging`
- Cloudflare content update: successful
- Deployment ID: `6f1abd0c2f3947c08982179b88e4490e`
- Worker tag: `cbf77cdb34764bc282f235de0e8be6c8`
- Source SHA-256: `5a6dce7643a8ba5dd99029f61680edadf9263c66586951ad61ad8890be55adda`
- Source size: 7,596 bytes
- Worker tags remain `lingo`, `staging`, `read-only`, `studio-control-center`.

## Browser Rendering checks
The Cloudflare Browser Rendering service successfully retrieved:
- Universe static bundle `/_next/static/chunks/main-2b9941bf3dc05642.js` through the staging gateway (133,741 characters in browser text rendering).
- Universe `/_next/static/chunks/pages/_app-ed0c91b30fe5a893.js` through the staging gateway.
- Kotton's Code image `/resources/KottonsCode-world-1.jpeg` through the staging gateway (browser image document reports 1024×1024).
- Kotton's Code image also resolves via `/apps/kottonscode/resources/KottonsCode-world-1.jpeg`.

The initial full-page HTML render for both apps completed successfully. This verifies static resource delivery, not full interactive application acceptance. Follow-up QA must verify the rendered app, all four Kotton assets, API/auth path denial, and GET/HEAD-only behavior.

## Release disposition
Staging repair only. Production remains protected. No merge/promotion authorization.