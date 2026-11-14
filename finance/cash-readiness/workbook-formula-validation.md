# Workbook Formula & Timing Gate Validation

## Critical protected-cash formula
The dashboard protected-cash total must include:
- verified unpaid debt;
- next-month essential bills;
- tax reserve;
- refund/chargeback reserve;
- contingency reserve; and
- minimum operating runway reserve.

The runway reserve is calculated on the Cash Timing & Buffers sheet as:

`average monthly essential spend over the next 30 days × configured runway days ÷ 30`

The dashboard cash coverage gate compares cleared cash available (opening cleared cash plus cleared receipts after the opening snapshot date) against this complete protected-cash total.

## Timing controls
For each bill:
- Funding ready-by date = due date minus configured pre-due funding buffer.
- Grace-watch end date = due date plus configured post-due watch days.
- Status distinguishes paid, buffered, funding-window-open, past-due/grace-watch-only, and overdue/escalate.

The post-due watch is an escalation aid only. It never changes the actual due date or grants permission to pay late.

## Formula validation checklist
- [x] Workbook opens and contains 11 expected worksheets.
- [x] Setup inputs include pre-due buffer, post-due watch, settlement lag, operating runway, review cadence, and collection-delay stress.
- [x] Bills include funding-ready-by, grace-watch-end, and timing-status formulas.
- [x] Dashboard protected-cash formula includes runway reserve.
- [x] Repayment gate requires both the monthly cleared-revenue gate and full protected-cash coverage gate.
- [x] Subscription gate remains disabled unless cash gates, product/payment controls, and explicit owner approval are all recorded.
- [x] Workbook calculation is set to recalculate on open.

## Validation limits
This is structural/formula inspection, not a calculation-engine test against live values. The workbook has not been populated with verified financial data, connected to a processor or bank, or independently audited. All monetary readiness results remain HOLD until actual records are entered and reconciled.
