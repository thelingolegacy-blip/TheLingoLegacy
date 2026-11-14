# Timing, Runway & Cash Cushion Specification

## Configurable planning defaults
These are starting values only and must be replaced with measured business/processor/creditor timing:
- Pre-due funding lead: 7 calendar days.
- Processor settlement lag: 3 calendar days.
- Collection-delay stress: 7 additional calendar days.
- Post-due grace-watch: 3 calendar days, for escalation tracking only.
- Minimum operating runway: 30 days of essential operating costs.
- Forecast review cadence: 7 days.

## Before a due date
For each bill:
- `Funding ready-by = contractual due date - pre-due funding lead`.
- Expected cleared date must include customer payment date + verified processor settlement lag + stress delay.
- If expected cleared date is later than the funding ready-by date, mark the bill at risk and identify a lawful funding source or contact the creditor before the due date.
- Pending payouts never count as available funds.

## On the due date
The contractual/statutory due date remains controlling. Confirm cleared funds and payment confirmation. Do not rely on an assumed grace period.

## After a due date
- `Grace-watch end = due date + configured watch days`.
- Any unpaid bill past due is escalated immediately.
- The watch window is not permission to pay late. Confirm written creditor terms; record fees, interest, notices, and dispute status.
- Beyond the watch window, mark critical overdue and escalate to owner/accountant/counsel as appropriate.

## Runway
Protect at least the configured runway amount in addition to next-month bills and other reserves. A simple monthly estimate is:

`Runway reserve target = average monthly essential operating cost × runway days / 30`

For mature operations, replace this approximation with a daily/weekly cash forecast using actual payroll, rent, utilities, vendors, taxes, debt service, seasonality, and settlement timing.

## Monitoring cadence
- Daily: bills inside the 7-day funding window, failed/late settlements, chargebacks, and cash exceptions.
- Weekly: 13-week rolling forecast, cleared cash reconciliation, debt/bill aging, variance analysis, and approvals.
- Monthly: close actual collections, reconcile all liabilities, recalculate reserves, review creditor priorities, and evaluate subscription readiness.

## Alerts
- Funding window open: due within configured lead time.
- Past due — grace watch only: due date passed; immediate escalation required.
- Overdue — escalate: beyond watch period.
- Settlement risk: expected payout after funding ready-by date.
- Runway breach: cleared unrestricted cash below protected runway target.
- Release hold: any missing or failed cash, evidence, legal, operational, or approval gate.
