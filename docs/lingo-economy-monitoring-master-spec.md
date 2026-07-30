# Lingo Legacy Economy Monitoring Master Specification

This document defines the static-first economy monitoring scaffold for Lingo OS. It is designed to be reviewed safely in the current Vercel static site before any live Firestore writes, wallet mutations, or automated remediation are enabled.

## Goals

- Track Bones creation, Bones spending, net inflation, XP velocity, reward pressure, storefront health, and fraud risk.
- Give the Command Center a single Economy Stress Index from 0 to 100.
- Keep all automated economy changes gated behind explicit admin approval until backend services and security rules are implemented.
- Provide JSON contracts that future services can write to Firestore, analytics pipelines, or a Vercel-backed API.

## Core pillars

| Pillar | Purpose | Example signals |
| --- | --- | --- |
| Currency flow | Measures Bones supply and sinks | Bones issued, Bones spent, net inflation, transaction velocity |
| XP dynamics | Measures earning pace and pressure | XP per minute, bonus multipliers, cooldown pressure |
| Reward economics | Measures sustainability of rewards | Reward cost index, redemption pressure, mid-tier sink demand |
| Fraud and abuse | Detects exploit patterns | XP bursts, wallet velocity anomalies, multi-account clusters |
| Spending behavior | Separates hoarding from healthy circulation | Active spender ratio, hoarding ratio, repeat purchase cadence |

## Economy Stress Index

The stress index is a weighted 0-100 score:

```text
StressIndex =
  (0.25 * inflationScore) +
  (0.20 * xpVelocityScore) +
  (0.20 * rewardPressureScore) +
  (0.20 * fraudRiskScore) +
  (0.15 * spendingImbalanceScore)
```

Interpretation:

- 0-30: Stable
- 31-60: Watch
- 61-100: Critical

Inputs must be normalized to 0-100 before the formula is applied. The first implementation should calculate the score in read-only mode and log recommendations without changing rewards, quests, or wallets.

## Dashboard modules

1. Economy Overview: stress index, active alerts, last sync, data freshness.
2. Currency Flow: Bones issued, Bones spent, net inflation, sink ratio.
3. XP Velocity: XP per minute, bonus pressure, cooldown hot spots.
4. Reward Pressure: reward cost index, redemption rate, seasonal pressure.
5. Storefront Health: purchases, refunds, failed checkout attempts, churn indicators.
6. Fraud Signals: wallet velocity, XP farming, inactive-account bursts, device/account clusters.
7. AI Recommendations: suggested changes, confidence, required approval.
8. Auto-Remediation Log: proposed or executed actions with rollback notes.

## Data collections

The initial contract supports these logical collections:

- `economy_metrics`: current aggregate snapshot.
- `economy_reports`: daily rollups and recommendations.
- `economy_alerts`: generated warnings and alert lifecycle.
- `economy_recommendations`: recommended actions and approval state.
- `economy_history`: append-only trend points.

See `config/economy/monitoring-contracts.json` for concrete field names and example records.

## Service integration map

- `EconomyAIService`: reads metrics, computes stress, produces recommendations.
- `FraudDetectionService`: writes risk scores and supporting signals.
- `RewardEngine`: supplies reward costs, redemptions, and inventory pressure.
- `XPService`: supplies XP velocity, bonus multipliers, and cooldown status.
- `StorefrontService`: supplies purchases, refunds, failed checkouts, and churn signals.
- `AnalyticsService`: normalizes event streams for reports and dashboards.
- `CommandCenter Dashboard`: reads aggregate data and shows recommendations.

These service names are architectural contracts. They are not assumed to exist in the current static deployment until backend code is added.

## Alert thresholds

Recommended first-pass alert rules:

- Inflation watch: net inflation is above 300,000 Bones in 24 hours.
- Inflation critical: net inflation is above 500,000 Bones in 24 hours.
- Issuance spike: Bones issued increases more than 30% versus the prior 24 hours.
- Spending collapse: Bones spent falls more than 25% while issuance remains flat or rising.
- XP burst: XP velocity exceeds the 7-day p95 by more than 40%.
- Fraud watch: fraud risk score reaches 50.
- Fraud critical: fraud risk score reaches 75.

## Remediation policy

Auto-remediation starts in recommendation-only mode.

Allowed recommendations:

- Reduce daily login bonus.
- Increase quest difficulty.
- Add Bones sinks.
- Tune store prices.
- Adjust XP multipliers.
- Increase cooldowns.
- Rotate seasonal rewards.
- Flag suspicious wallets for review.

Blocked until backend authorization exists:

- Freezing wallets automatically.
- Reducing payouts automatically.
- Changing live store prices without approval.
- Mutating user balances directly from AI output.

## Rollout phases

1. Static scaffold: master spec, dashboard shell, JSON contracts.
2. Read-only ingestion: API endpoints or scheduled jobs write aggregate metrics only.
3. Alerting: Vercel Alerts, email, or webhook notifications for threshold breaches.
4. Recommendations: AI-generated recommendations with admin approval state.
5. Controlled remediation: approved actions only, with audit logs and rollback paths.

## Production readiness checklist

- Data contracts reviewed and versioned.
- Firestore or database security rules written before live writes.
- Admin-only dashboard access defined.
- Personally identifiable data excluded from aggregate metrics.
- Wallet mutations isolated behind audited service methods.
- Recommendation confidence and rollback plan stored for every action.
- Vercel deployment alerts configured for backend API errors.

## Auto-Mode master system

Auto-Mode is the future self-regulating economy loop for Lingo Legacy. In this static scaffold it is documented as a policy and contract layer only. The dashboard may show Auto-Mode controls, but no live autonomous writes are enabled by this change.

### Auto-Mode loop

1. Collect metrics from currency, XP, reward, storefront, and fraud services.
2. Normalize signals and compute the Economy Stress Index.
3. Detect anomalies against threshold and trend windows.
4. Select a playbook action for each active domain.
5. Apply safety caps and approval rules.
6. Execute only actions allowed by the current mode.
7. Write an immutable audit entry with metric snapshot, reason, and rollback note.
8. Update the Command Center dashboard and alert feed.

### Auto domains

- Currency Auto: daily bonus tuning, quest payout tuning, Bones sink activation, store price recommendations.
- XP Auto: multiplier tuning, cooldown tuning, XP sink recommendations, XP velocity alerts.
- Rewards Auto: reward cost tuning, seasonal rotation recommendations, mid-tier reward gap detection.
- Fraud Auto: suspicious account flagging, payout throttling recommendations, wallet freeze recommendations, fraud review queue updates.
- Behavior Auto: hoarding detection, spending collapse detection, reward demand forecasting, inflation forecasting.

### Aggression by stress index

| Stress range | Mode | Max recommended adjustment per day |
| --- | --- | --- |
| 0-30 | Stable | 2% |
| 31-60 | Watch | 5% |
| 61-100 | Critical | 10% |

The caps prevent runaway corrections. Destructive actions such as permanent bans, irreversible wallet changes, or cash-value payout changes require manual approval even when Auto-Mode is otherwise active.

### Auto-action playbook

| Domain | Signal | Action | Safety cap | Default execution mode |
| --- | --- | --- | --- | --- |
| Currency | Net inflation above 0.60 normalized score | Reduce daily bonus | 5% per cycle | recommendation-only |
| Currency | Bones hoarding above 40% | Activate or recommend a Bones sink | one sink per cycle | recommendation-only |
| Currency | Bones spent drops more than 25% | Lower selected store prices | 10% per day | approval-required |
| XP | XP velocity spikes more than 30% | Reduce XP multipliers | 5% per cycle | recommendation-only |
| XP | XP inflation above 0.50 | Add or promote an XP sink | one sink per cycle | recommendation-only |
| XP | XP burst pattern detected | Increase cooldowns on high-yield actions | 10% per day | approval-required |
| Rewards | Reward pressure above 0.70 | Raise reward costs | 10% per day | approval-required |
| Rewards | Reward pressure below 0.30 | Lower reward costs | 5% per day | approval-required |
| Rewards | Mid-tier reward gap detected | Create a mid-tier reward proposal | one proposal per cycle | recommendation-only |
| Fraud | Fraud risk above 0.40 | Throttle payout recommendation | policy-defined | approval-required |
| Fraud | Fraud risk above 0.60 | Freeze wallet recommendation | case-by-case | approval-required |
| Fraud | Multi-account cluster detected | Flag accounts for review | no destructive action | recommendation-only |

### Command Center Auto-Mode controls

- Global Auto-Mode banner: `OFF`, `RECOMMENDATION ONLY`, `APPROVAL REQUIRED`, or `ACTIVE WITH CAPS`.
- Per-domain switches: Currency, XP, Rewards, Fraud, Behavior.
- Pause Auto for 24 hours.
- Roll back last approved auto-action.
- View full audit trail.
- Export the current economy snapshot.

### Auto-Mode audit fields

Every selected action must write:

- `actionId`
- `domain`
- `signal`
- `selectedAction`
- `executionMode`
- `stressIndexBefore`
- `stressIndexAfter`
- `metricSnapshot`
- `safetyCapApplied`
- `rollbackPlan`
- `createdAt`
- `approvedBy`
- `executedAt`

### Security requirements before live Auto-Mode

- Admin-only access for override controls.
- Service-account-only writes for AI-selected actions.
- Strict schema validation for action documents.
- Append-only audit logs.
- No user-controlled client can write economy metrics, fraud logs, or remediation actions.
- Wallet changes must go through audited backend service methods.
- Fraud evidence must not be exposed to public clients.
