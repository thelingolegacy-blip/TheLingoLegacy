# Cash Readiness, Repayment & Subscription Release Policy

## 1. Core release rule
Optional or accelerated debt repayment may be considered only after both gates pass:

1. One complete calendar month of cleared collections meets or exceeds the configured monthly cleared-revenue target.
2. Available cleared cash covers all verified unpaid obligations, next-month essential bills, tax reserve, refund/chargeback reserve, minimum operating runway, and contingency.

Pending processor balances, invoices, pledges, forecasts, unsettled payouts, and expected subscriptions are not cleared cash.

## 2. Protected cash calculation
`Required protected cash = verified unpaid debt + essential bills due in next month + tax reserve + refund/chargeback reserve + minimum operating runway + contingency`

`Cash coverage = available cleared cash after restricted/held amounts`

The cash coverage gate passes only when available cleared cash is at least the full protected-cash requirement. Do not count the same opening bank balance or receipt twice.

## 3. Cash waterfall
1. Reconcile processor fees and actual settlement deductions.
2. Set aside taxes using accountant-approved assumptions.
3. Protect refunds, disputes, chargebacks, and processor holds.
4. Pay legally or contractually mandatory items by their actual due dates.
5. Protect essential operating bills and the next month's bill reserve.
6. Protect the minimum operating runway and contingency.
7. Consider verified debt repayment in approved priority order.
8. Consider discretionary reinvestment only after the above.

This waterfall does not authorize withholding legally required payments. Mandatory obligations remain subject to their real deadlines even while optional repayments are on hold.

## 4. Debt verification and priority
Every debt must have a creditor, current balance, due date, minimum payment, rate/fees if applicable, status, supporting statement/contract/invoice, and last verification date. Resolve disputes and duplicate entries before calculating the total.

Prioritize statutory/tax/legal obligations and contractual minimums by actual deadline; then essential service continuity; then high-cost or penalty-bearing debt; then other verified obligations. Confirm terms before paying.

## 5. Subscription activation gate
Subscriptions remain disabled until:
- cash readiness gates pass;
- product/service delivery and customer entitlements are tested;
- price, renewal frequency, cancellation, refund, and recurring-charge disclosures are approved;
- payment authorization, webhook signature validation, idempotency, duplicate-charge prevention, refunds, and failed-payment handling pass end-to-end tests;
- customer support and dispute procedures are ready;
- owner approval is explicitly recorded.

The workbook is not a payment processor and does not activate billing.

## 6. Monitoring and evidence
Review daily during the pre-due funding window and at least weekly otherwise. Reconcile:
- opening cleared bank cash to a dated statement snapshot;
- processor transactions to settlement reports and bank deposits;
- bills to invoices and proof of payment;
- debt balances to current creditor statements;
- refunds and disputes to processor records;
- forecast versus actual settlement dates.

Record reviewer, timestamp, evidence reference, variance, decision, and approval. Do not store secrets or full financial account identifiers.

## 7. Exceptions
A grace-watch window is for escalation and documenting written creditor terms only. It is not an assumed contractual grace period and never changes the legal, tax, or contractual due date. Any exception requires documented owner review and qualified professional advice where appropriate.

## 8. Status vocabulary
- `HOLD`: one or more release conditions fail or evidence is missing.
- `ELIGIBLE FOR REVIEW`: arithmetic gates pass; this is not payment authorization.
- `APPROVED`: explicit authorized human approval is recorded.
- `PAID`: cleared payment is reconciled to a confirmation and ledger.
- `NOT CERTIFIED`: live system integration, controls, or operating evidence have not been independently verified.
