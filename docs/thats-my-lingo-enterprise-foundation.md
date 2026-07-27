# That’s My Lingo Enterprise Production Foundation

That’s My Lingo is scoped as a virtual casino-style entertainment experience for The Lingo Legacy ecosystem. It must not include real-money gambling, cash wagering, cash prizes, cryptocurrency gambling, sports betting, or cash-out flows. Demo Coins, Loyalty Bucks, Lingo Tokens, XP, badges, cosmetics, and collectibles have no cash value.

## Shared platform architecture

- **Identity:** one user account and shared profile for The Lingo Legacy, That’s My Lingo, Kotton’s Code, Loyalty Lane, Loyalty Lane Cycles, Obsidian Closet, and Legacy Legends.
- **Profile:** avatar, display name, accessibility preferences, content permissions, and optional public profile controls.
- **Progression:** shared achievements can exist at the parent ecosystem level while each experience keeps its own seasons, levels, cosmetics, and identity.
- **Design system:** Industrial Noir base tokens with product-specific accent palettes, reusable cards, wallet displays, navigation, modals, toasts, reward states, progress bars, and motion rules.

## Gameplay scope

Phase-one gameplay is a 5x3 virtual reel engine with weighted symbols, horizontal paylines, wilds, scatters, multipliers, Demo Coins, XP, missions, history, wallet display, collections, achievements, daily rewards, events, and accessibility controls. Future releases should add free-spin and bonus-round state machines with server-authoritative reward verification before persistence.

## Backend readiness

The static Vercel build is ready to evolve into a Firebase-backed app after service approval and environment setup:

- Firebase Authentication for account sessions.
- Cloud Firestore for profiles, wallets, inventories, achievements, missions, seasons, events, and audit trails.
- Cloud Storage for generated/profile media and event assets.
- Cloud Functions for reward grants, anti-cheat checks, rate limits, scheduled events, and push notification jobs.
- Remote Config for live events, economy tuning, feature flags, version compatibility, and kill switches.
- Analytics and Crash Reporting for retention, progression, errors, and release health.

## Security and compliance gates

Persistent wallets require server-side verification. Client-side reward calculations are acceptable for the current demo only.

- Validate all client inputs and reject impossible reward states.
- Store economy mutations through Cloud Functions or another server-authoritative path.
- Enforce Firestore rules by user ownership, role, and least privilege.
- Add rate limits for spin, reward, mission, login, and profile endpoints.
- Log economy changes with before/after balances and request metadata.
- Encrypt sensitive data in transit and avoid storing secrets in client code.
- Keep no-cash-value disclosures visible wherever balances, rewards, or purchases appear.

## Live operations model

Admin tooling should support event scheduling, promotions, daily rewards, seasonal content, push notifications, feature flags, content management, economy balancing, analytics dashboards, QA reports, and release checklists. Vercel should remain the web deployment surface; mobile builds should consume the same design tokens and backend contracts.

## QA release checklist

Before release, validate gameplay math, wallet changes, rewards, achievements, leaderboards, offline recovery, accessibility, reduced motion, responsive layouts, error handling, startup time, memory behavior, and security rules. Run the static validation script before each Vercel deployment.
