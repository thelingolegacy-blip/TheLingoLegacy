# LINGOlegacy Payment-Free Operational Standard

Status: isolated source change set; not merged or deployed.

## Runtime contract
- No payment processor SDK, payment-provider secret, transaction-session endpoint, price identifier, paid subscription, purchase CTA, or transaction webhook is required by the application.
- Games, founder identity previews, community participation, and apparel design previews are free to access.
- Virtual coins, XP, badges, and cosmetic progression have no cash value and cannot be purchased, redeemed, transferred, or cashed out.
- Contact and interest forms must not request card numbers, bank details, payment credentials, or payment authorization.
- Provider account billing and historical billing records are outside this source change and are not modified.

## Operational contract
- Use free/open-source tooling and provider free tiers where eligible.
- Do not bypass provider authentication, quotas, metering, or billing enforcement.
- Stop gracefully when a free quota is exhausted; do not silently switch to paid services.
- No payment, paid subscription, paid runner, or AI service activation without separate explicit authorization.
- Production remains protected until actual execution, retrievable evidence, independent verification, acceptance, and authorization are complete.

## Acceptance checks
- The Worker has no payment-processing route or payment-provider secret dependency.
- Active pages have no checkout or purchase controls.
- The payment-provider browser asset is absent.
- The environment contract does not require payment credentials.
- Static source verification passes; runtime verification remains separate and must be executed in an authorized environment.
