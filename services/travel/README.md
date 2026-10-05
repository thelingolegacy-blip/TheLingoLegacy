# Lingo Travel OS 2.0

Second reference implementation of Lingo Legacy Living Infrastructure.

## Core lifecycle

`search -> normalize -> quote -> policy -> hold -> payment -> book -> verify -> itinerary -> rewards -> audit`

Travel supplier inventory and pricing are external and ephemeral. The platform must re-verify availability and price before committing a booking. Supplier adapters are isolated behind a common contract.

## Safety boundaries

- No fabricated inventory, price, availability, or booking confirmation.
- No raw payment-card storage in the travel domain.
- No autonomous financial payout.
- No booking confirmation without supplier verification.
- High-risk production mutations require the platform Policy Engine.
- Supplier credentials remain outside source control.

## Initial modules

- `types.ts` — travel domain contracts
- `events.ts` — travel event envelope/catalog
- `supplier.ts` — supplier adapter contract
- `search.ts` — normalized multi-supplier search orchestration
- `booking.ts` — quote/hold/payment/book state machine
- `policy.ts` — local safety boundary beneath platform policy
- `reconciliation.ts` — booking-state drift detection
- `config.yaml` — desired runtime configuration
