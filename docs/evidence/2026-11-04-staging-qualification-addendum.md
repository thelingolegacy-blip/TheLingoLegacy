# LINGO Staging Qualification Addendum — 2026-11-04

**Verified at:** 2026-11-04T21:55:30Z  
**Source branch:** `studio-hub/recovery-preview-2026-11-04`  
**Source commit:** `662d7d68cc7b242fc29050b03e35223111e7a7ec`  
**Cloudflare Pages deployment:** `e5994858-32f2-4dc3-b229-0437bc82a0d6`  
**Deployment URL:** https://e5994858.lingo-legacy-github-integration-test.pages.dev/

## Additional game qualification

Tricia’s Escape now has progressive difficulty. A mobile browser test completed the first 3-symbol room, advanced to a 4-symbol second room, then used Restart and confirmed the sequence returned to 3 symbols. The progression change is source-checked and deployed in the isolated preview.

## AppDeploy discrepancy and credit warning

Read-only AppDeploy inspection returned deployment status `ready` for the Crazy Weasols, Jersey Shore: The Undead, That’s My Lingo standalone demo, and Studio Hub projects. However, live browser rendering of the four AppDeploy URLs displayed an interstitial headed **“This app is paused”** instead of the application. A source search of the Crazy Weasols snapshot did not find that pause message in app code. Treat these AppDeploy URLs as **not player-accessible until the platform/runtime discrepancy is resolved**, despite the API’s `ready` status.

AppDeploy also returned this account warning: **credit balance below 100 credits**. No top-up, paid upgrade, deployment retry, or billing change was made. Dashboard: https://dashboard.appdeploy.ai/my/dashboard

## Free-preview payment verification

The global `assets/premium-studio-refresh.js` injection was updated to remove Stripe/founder checkout links and show disabled future-payment labels. The That’s My Lingo page’s own checkout CTAs were also disabled, and jackpot values now use Demo Coins rather than dollar amounts. The rendered That’s My Lingo DOM was checked for checkout/payment links; count was **0**. The virtual spin still worked (5,000 Demo Coins → 4,750 after a 250 Demo Coin bet; 25 XP). No payment processing is configured.

## Updated Play Lab source integrity

| File | Bytes | Git blob SHA-1 | SHA-256 |
|---|---:|---|---|
| `studio-sites/play/index.html` | 24,472 | `f85e2f5af36b20166e2497b07e9b20b70d436713` | `9c3aceafc0a43eb4b7e83462e30b8b875bac4f252cad0d9165ada3b934d4b6da` |

**Disposition unchanged:** staging functionality only; production remains on HOLD. No production route, DNS, Firebase, billing, or G02 acceptance change was made.


## Final preview revalidation

**Verified at:** 2026-11-04T21:56:45Z  
**Source commit:** `8c4462dc2ca3ad2d77f70a7770fb599779fc8d01`  
**Cloudflare deployment:** `a4ae44a3-663d-43d5-b9cc-28f7331e973a` — all stages SUCCESS  
**Preview:** https://a4ae44a3.lingo-legacy-github-integration-test.pages.dev/

- Studio Hub mobile menu opened; 0 broken images.
- That’s My Lingo browser title now reads **Playable Game Preview**; a spin executed (bank 5,000→4,750; XP 25); rendered payment-link count remained 0.
- Tricia’s Escape progression remained 3 symbols → 4 symbols on the next room.
- This evidence addendum was served from the Pages preview.

### Updated That’s My Lingo source integrity

| File | Bytes | Git blob SHA-1 | SHA-256 |
|---|---:|---|---|
| `thats-my-lingo/index.html` | 56,166 | `c557c43c668d1aae40a03d63f1ad20c46f853222` | `bb50f05d3db06eca21f8eada64c9ffee69f73aefbc101e7f01e114d20444c7ed` |
