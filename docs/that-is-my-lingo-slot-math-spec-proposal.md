# That’s My Lingo — Slot Math Specification (Proposal)

**Status:** DRAFT / NOT PRODUCT-APPROVED / NOT RELEASE MATH  
**Scope:** 5-reel × 3-row, 20-line presentation; isolated demo-credit engine only  
**Required reviewers:** Product owner, independent game-math reviewer, engineering reviewer  
**Safety:** no real-money wagering, purchase, transfer, cash-out, prize redemption, or production wallet integration.

## 1. Purpose

This document defines the math contract required before the candidate engine can be described as matching the That’s My Lingo product. It intentionally does not select final symbol weights, paytable values, RTP, hit frequency, or volatility targets. Those values must be derived, reviewed, versioned, and approved—not guessed.

The current implementation is a deterministic-testable server prototype. Its 20 paths are candidate geometry only. Existing paytable and weight constants are implementation fixtures, not approved product economics.

## 2. Configuration contract

| Parameter | Current observation / proposal | Status |
|---|---|---|
| Reels / visible rows | 5 / 3 | Presentation target |
| Active paylines | 20 | Candidate set; owner approval pending |
| Evaluation direction | Left-to-right, contiguous from reel 1 | Observed; approval pending |
| Symbols | LEGACY_LION, OBSIDIAN_BAR, SEVEN, DIAMOND, WILD | Current vocabulary; approval pending |
| Minimum / maximum match | 3 / 5 consecutive reels | Observed; approval pending |
| Scatter / bonus / free spins / jackpot | Not specified or implemented | Out of scope |
| RNG | Node cryptographic random bytes with rejection sampling | Source-level only; hosted verification pending |

### Candidate payline coordinates

Coordinates are row indexes (0 = top, 1 = middle, 2 = bottom), ordered from reel 1 to reel 5.

| Line | Rows across reels 1–5 |
|---:|---|
| 1 | 1,1,1,1,1 |
| 2 | 0,0,0,0,0 |
| 3 | 2,2,2,2,2 |
| 4 | 0,1,2,1,0 |
| 5 | 2,1,0,1,2 |
| 6 | 0,0,1,2,2 |
| 7 | 2,2,1,0,0 |
| 8 | 1,0,0,0,1 |
| 9 | 1,2,2,2,1 |
| 10 | 0,1,1,1,0 |
| 11 | 2,1,1,1,2 |
| 12 | 1,0,1,2,1 |
| 13 | 1,2,1,0,1 |
| 14 | 0,0,1,1,2 |
| 15 | 2,2,1,1,0 |
| 16 | 0,1,0,1,0 |
| 17 | 2,1,2,1,2 |
| 18 | 1,0,1,0,1 |
| 19 | 1,2,1,2,1 |
| 20 | 0,1,2,2,1 |

Acceptance requires approval of the exact ordered paths, numbering, display mapping, and whether all 20 lines are always active. A count of 20 unique paths alone does not establish product parity.

## 3. Symbol generation and probability model

Let S be the approved symbol set. For reel r, define a non-negative integer weight w(r,s) for each symbol s. The reel total is W(r) = sum over s of w(r,s), and the probability of symbol s on reel r is w(r,s) / W(r).

The ruleset must state whether reel outcomes are independent and whether weights vary by reel. The current prototype uses one common weight vector across all 15 visible cells and independent draws. This is an implementation assumption, not a signed product rule.

### Existing source constants — observation only

The current code contains this same vector for all three labels:

| Symbol | Current weight | Implied single-cell probability |
|---|---:|---:|
| LEGACY_LION | 5 | 5/85 = 5.882% |
| OBSIDIAN_BAR | 15 | 15/85 = 17.647% |
| SEVEN | 25 | 25/85 = 29.412% |
| DIAMOND | 35 | 35/85 = 41.176% |
| WILD | 5 | 5/85 = 5.882% |
| **Total** | **85** | **100%** |

Low, medium, and high currently reference identical vectors. They are not distinct volatility profiles and must not be marketed as such. These constants are not approved values.

For approval, provide a versioned weight matrix for every profile and reel, including exact rational probabilities. If virtual reel strips are used instead of weighted independent draws, publish the full strip sequence and mapping.

## 4. Payline resolution

For each payline, read its five symbols from reel 1 through reel 5. Resolve only the contiguous sequence beginning at reel 1 unless the product owner approves another rule.

The approved ruleset must define:
1. Which symbols WILD substitutes for.
2. How a leading WILD run resolves.
3. Whether an all-WILD line pays, and at what multiplier.
4. Whether WILD substitutes for bonus/scatter symbols if those are introduced.
5. Whether one line can award multiple combinations (current code allows at most one).
6. Left-to-right only or both directions.
7. Whether overlapping lines pay independently, subject to the stake model.

### Current implementation behavior — not final rules

- Evaluates left-to-right from reel 1.
- Counts contiguous matches of the first symbol, allowing WILD substitution.
- If the first symbol is WILD, the first later non-WILD symbol becomes the target.
- An all-WILD line does not currently pay.
- Requires at least three matching positions.
- Awards at most one resolved combination per line.
- Has no scatter, bonus, free-spin, jackpot, or feature-state engine.

Every item requires product confirmation and deterministic edge-case test vectors.

## 5. Paytable and stake semantics

Define approved multiplier M(symbol, match length) for match lengths 3, 4, and 5. The paytable must be immutable and versioned for every committed spin.

Current unapproved implementation fixtures:

| Symbol | 3 match | 4 match | 5 match |
|---|---:|---:|---:|
| LEGACY_LION | 5 | 20 | 100 |
| OBSIDIAN_BAR | 3 | 10 | 50 |
| SEVEN | 2 | 8 | 30 |
| DIAMOND | 2 | 6 | 20 |
| WILD | 0 | 0 | 0 |

Do not publish these as approved paytable math.

**Critical unresolved decision — wager units:** the current implementation multiplies every winning line by the full wagerUnits input. It does not establish whether that input means stake per line or total spin stake. With 20 active lines, this ambiguity materially changes total exposure and RTP.

Choose exactly one contract before acceptance:

- **Per-line stake:** input betPerLineUnits; total wager = 20 × betPerLineUnits; each line payout = betPerLineUnits × approved multiplier.
- **Total-spin stake:** input totalWagerUnits; define a deterministic allocation across 20 lines and apply the allocated stake to each line.

Never reuse one field name for both meanings. Reject zero, negative, fractional, unsafe-integer, and overflow values. Use integer credit units, never floating-point balances.

Under the proposed per-line model, spin payout is the sum of the 20 line payouts and total stake is 20 × betPerLineUnits.

## 6. RTP, hit frequency, and volatility

For one payline under independent reel draws, the five-reel sequence space has |S|^5 outcomes. With five symbols, that is 3,125 sequences. For each sequence, multiply the five reel probabilities, resolve the approved payline rule, and apply the approved multiplier.

Expected line payout:

E[line payout] = betPerLine × sum over all five-symbol sequences of (sequence probability × resolved multiplier).

For 20 always-active lines, expected total payout is the sum of expected line payouts. Theoretical RTP is expected total payout divided by total wager (20 × betPerLine under the proposed per-line model). This linearity-of-expectation calculation does not require paylines to be independent.

However, paylines share cells and are correlated. Total-spin variance must include covariance between every pair of lines. Exact any-win frequency and total-spin variance therefore require a validated joint-state/dynamic-programming calculation or another independently reviewed exact method. Monte Carlo is a secondary cross-check, never the sole basis for a published RTP claim.

Report at least:
- Exact theoretical RTP under the approved ruleset.
- Any-win frequency and per-line hit frequency.
- Mean payout, variance, standard deviation, and a defined volatility index.
- Maximum possible payout per spin and maximum payout-to-stake ratio.
- Zero-payout frequency and payout distribution bands.
- Profile-specific comparisons using identical stake and line activation.

For simulations, publish seed/control method, sample count, confidence interval, implementation version, and observed-vs-theoretical deviation. Do not silently tune approved math based on simulation output.

## 7. Volatility profile acceptance

Low, medium, and high are product labels, not merely enum values. Each needs a distinct approved distribution and independently calculated statistics. The product owner must set target bands for RTP, hit frequency, variance/standard deviation, payout concentration, and maximum payout before weights are selected.

A profile is not accepted until its complete reel-weight matrix differs from the others, exact theoretical RTP is calculated and approved, hit frequency and payout distribution are reviewed, deterministic tests prove the intended profile is selected, and regression tests prove the distributions are distinct.

Do not invent target RTPs, hit rates, or volatility thresholds in this proposal.

## 8. RNG and reproducibility

Outcome generation must use a cryptographically secure random source with unbiased bounded sampling. Deterministic random sources are test-only dependency injection and must not be reachable from public requests.

Record game version, ruleset/paytable version, profile ID, and a non-secret spin correlation ID with each outcome. Never log raw RNG state, bearer tokens, or secrets. A retry must return the original committed result and must never draw a second outcome.

## 9. Required deterministic acceptance vectors

Add tests for:
- Every approved line winning independently and no off-path arrangement being misattributed.
- Every symbol at 3, 4, and 5 consecutive matches.
- Every WILD position, leading WILD, multiple WILD, all-WILD, and invalid substitution.
- Left-to-right breaks at each reel position; gaps never count as contiguous.
- Overlapping paylines and simultaneous wins; each winning line paid exactly once.
- Every profile's symbol distribution and selected profile identity.
- Per-line vs total-spin stake semantics, including the 20-line total.
- Maximum payout and integer-overflow boundaries.
- Invalid paytable, missing symbols, zero/negative weights, and invalid profiles.
- Deterministic fixed vectors for exact payout and exact probability calculations.
- Independent math-oracle fixtures that do not call the production evaluator to compute expected results.

## 10. Versioning, approval, and release gates

Each approved math release must include an immutable ruleset ID and semantic version; approved line coordinates and activation rule; symbol set and reel model; exact weight matrix; WILD/bonus behavior; paytable; wager-unit definition; exact RTP and hit-frequency report with method and reviewer; volatility metrics and simulation cross-check; deterministic test vectors; code commit and build provenance; product-owner approval; independent math review; and separate release authorization.

Until those records exist, this document is PROPOSAL ONLY and the engine remains an isolated demo prototype. No merge, deployment, wallet connection, purchase, cash-out, or prize redemption is authorized by this specification.
