# Lingo Legacy Treasury and Lingo.ai Connect Blueprint

This blueprint defines two connected product pillars for The Lingo Legacy ecosystem: a treasury layer that manages subscription-first cash planning, and an AI orchestration layer that connects Ask Lingo to apps, websites, and business systems.

## 1. Lingo Legacy Treasury

Lingo Legacy Treasury is the central financial operating system for the ecosystem. It receives business revenue, classifies incoming funds, reserves required amounts, tracks recurring software costs, and reports owner distributions after required obligations are covered.

### Revenue sources

Supported revenue categories should include:

- App and game purchases
- In-app purchases
- Apparel, book, course, and digital product sales
- Memberships and subscriptions
- Advertising, sponsorship, affiliate, and licensing income
- API subscriptions
- Donations for nonprofit activity, where applicable

### Allocation order

Funds should be modeled in a rule-based allocation pipeline:

1. Tax reserve
2. Required operating expenses
3. Software subscriptions
4. Payroll and contractors
5. Marketing budget
6. Emergency reserve
7. Business savings
8. Owner distribution

The system should never assume distributions are guaranteed. It should calculate available distribution only after required obligations and reserve rules are satisfied.

### Subscription manager

Track each recurring cost with:

- Vendor name
- Category
- Monthly or annual amount
- Renewal date
- Auto-renew status
- Priority level
- Payment method label
- Reminder schedule
- Required versus optional status

Priority levels should drive alerts and cash-preservation rules. Required subscriptions should be protected before optional spending is approved.

### Treasury dashboard

The dashboard should show:

- Monthly revenue
- Monthly expenses
- Available cash
- Upcoming renewals
- Projected cash coverage
- Profit
- Owner distributions
- Cash reserves
- Budget by department

### Treasury automation

Automations should include:

- Renewal reminders before subscription charge dates
- Alerts when projected cash will not cover upcoming expenses
- Optional-spend pause recommendations below a cash threshold
- Monthly financial summaries
- CSV/PDF report exports for bookkeeping

## 2. Lingo.ai Connect

Lingo.ai Connect is the integration layer that lets Ask Lingo coordinate actions across devices, websites, and business systems through secure APIs and explicit user permissions.

### Platform layers

- Ask Lingo: conversational interface
- Lingo.ai Core: reasoning, routing, and agent orchestration
- Lingo.ai Connect: integrations, permissions, and event delivery
- Lingo API: external developer and internal app surface

### Agent types

Initial agent roles:

- Business Agent: sales reports, inventory, customer messages, scheduling
- Creator Agent: posts, scripts, videos, marketing ideas
- Developer Agent: code review, documentation, testing, deployment help
- Personal Agent: reminders, notes, organization, planning

### API surface

A future API can be organized around:

```text
/auth
/users
/voice
/agents
/apps
/automation
/payments
/notifications
/search
/analytics
```

### Integrations

Potential integration categories:

- Business: Shopify, Square, accounting, CRM, email, inventory
- Development: GitHub, deployment platforms, cloud services
- Communication: email, messaging, customer support
- Devices: mobile OS features, wearables, smart speakers, vehicles, kiosks, and IoT where supported

Every integration must be permissioned, revocable, and auditable.

## 3. Security and compliance requirements

Before enabling any financial automation or device control, the platform must include:

- Strong user authentication
- Explicit per-integration authorization
- Encryption in transit and at rest
- Audit logs for sensitive actions
- Revocable access tokens
- Privacy controls
- Role-based access for business users
- Manual approval for money movement and high-risk actions
- Accountant or advisor review for tax reserves and owner distributions

The system can prioritize payments and recommend distributions, but it cannot guarantee that subscriptions are paid unless supported payment providers, account balances, and authorization rules allow it.

## 4. Vercel-native implementation plan

A Vercel deployment can use:

- Static or Next.js dashboard pages for the Treasury and Connect UI
- Vercel Functions for API routes, alerts, reports, and automation handlers
- Vercel Cron Jobs for renewal reminders and monthly summaries
- Vercel Blob for exported reports and uploaded documents
- Neon via the Vercel Marketplace for relational financial data. Vercel Postgres is no longer first-party; existing databases were migrated to Neon via the Vercel Marketplace in December 2024.
- Upstash Redis via the Vercel Marketplace for queues, caching, and short-lived workflow state. Vercel KV is no longer first-party; existing stores were migrated to Upstash Redis via the Vercel Marketplace in December 2024.
- Vercel AI Gateway for AI model routing and agent orchestration

## 5. Suggested first milestone

Build the first version as a read-only planning dashboard:

1. Add subscription records manually.
2. Add monthly revenue and expense entries manually.
3. Calculate required reserves and projected owner distribution.
4. Show upcoming renewals and cash coverage warnings.
5. Export a monthly summary for bookkeeping review.

After the read-only model is validated, connect banking, accounting, app store, ecommerce, and notification providers through approved APIs.
