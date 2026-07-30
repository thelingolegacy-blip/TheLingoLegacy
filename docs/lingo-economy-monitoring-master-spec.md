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
