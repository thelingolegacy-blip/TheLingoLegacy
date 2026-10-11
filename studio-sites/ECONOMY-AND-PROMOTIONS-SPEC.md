# LINGO Economy, Identity, Rewards & Promotions — v0.1

## Mini-games by surface
- LINGOarcade: memory match, quickfire trivia, daily puzzle, rhythm tap and world explorer.
- LINGOslots / That’s My Lingo: valueless demo spins, symbol hunt and odds tutorial; no cash-out.
- Spades Is My Lingo: rules tutorial, practice hand and score calculator; no wagering in prototype.
- UhNo Lingo University: trivia, word ladder and logic sprint.
- Kotton’s Code: WORD / HEART / FRIENDSHIP / DREAM / LEGACY quests and Paws Up! kindness challenges.
- Tricia’s Escape: route tiles and clue search.
- Doughboy’s Oasis: map fragments and resource planning.
- Crazy Weasols: sorting, reflex and co-op relay.
- Silly in Philly: rhythm and fictional neighborhood scavenger hunt.
- Jersey Shore: The Undead: stylized stealth and puzzle survival with adjustable intensity.
- Lingo Eruptions: chain puzzles and score trials.
- Cashman Lingo Mania: fictional ledger puzzles and symbol hunts; no real-money representation.

## Economy lanes
- Demo coins: local, entertainment-only, valueless; no transfer, deposit, withdrawal or redemption.
- XP: progression only, non-cash and non-transferable.
- Loyalty Bucks, Lingo Tokens and Bones-to-Coins are reserved for a later economy design; no conversion ratios or redemption promises until finance, security and legal approval.
- Store rewards require a store-specific catalog and terms. One store’s mini-game cannot silently credit another store’s wallet.
- Story rewards are lore, narrative flags and cosmetics; core story progress must not be purchase-gated.

## Identity
Use Firebase Auth or equivalent. Require verified email where appropriate, consent and policy versions, recovery, deletion/export workflows, rate limits, bot defense, age/territory rules and privacy-safe analytics. Never store raw payment credentials in game services.

## Ledger / bank
Client balances are display-only. Production ledger is append-only; each event includes transaction_id, account_id, wallet_type, event_type, signed_amount, unit, source, idempotency_key, created_at, actor, reason_code, status, correlation_id, reversal_of and policy_version. Server validates authorization, balance and eligibility transactionally. Add idempotency, daily reconciliation, immutable audit logs, anomaly detection, dual-control admin and reversal events.

## Leaderboards
Server validates score range, build version, session duration, replay/anti-cheat signals and duplicate submissions. Separate daily/weekly/all-time, per-game, friends-only and global boards. Default to display-name aliases; support opt-out, report/moderation and age-appropriate visibility. Publish tie-break and reset rules; audit admin changes.

## Referrals
Opaque server-generated tokens; consent-aware attribution and data minimization. Define qualifying action, limits, anti-self-referral, abuse review and reward reversal. Disclose reward value, timing, expiry, exclusions and relevant tax treatment. Never trust client-only events for rewards.

## Notifications
In-app, email and push have separate consent. Store preference, locale, consent time and unsubscribe/suppression state. Security alerts remain narrowly scoped. Use dedupe keys, rate limits, delivery logs and retry policy.

## Sweepstakes gate — disabled
Before activation, qualified legal review must approve sponsor, official rules, eligibility, territory, dates, prize descriptions/values, odds/selection method, free alternate entry route where required, winner verification, tax/affidavit process, privacy notices, retention and platform/store terms. Do not require purchase or tie entries to game outcomes without jurisdiction-specific review. No UI may imply a live giveaway before approval.

## Release gates
Product/legal requirements; identity/privacy; real runner assignment and CI evidence; server-authoritative wallet/score APIs; anti-cheat/security; accessibility; QA/story sign-off; asset provenance; independent reachability; required approvals; controlled rollout and monitoring. Fail closed on any missing gate.