# Lingo Legacy Cash Readiness & Repayment Controls

This directory contains the governance and operating specification for the cash-readiness workbook.

## Scope
- Record cash receipts by status; only cleared and available funds count.
- Reconcile verified debts and upcoming essential bills.
- Protect taxes, refunds/chargebacks, contingency, and minimum operating runway.
- Apply configurable pre-due funding lead time, processor settlement lag, and post-due escalation watch.
- Gate optional debt acceleration and subscription activation.
- Preserve an evidence and approval trail.

## Artifacts
- [Cash control policy](./cash-control-policy.md)
- [Timing and buffer specification](./timing-buffer-specification.md)

The companion workbook is maintained as a separate downloadable artifact in the project handoff. The workbook does not connect to bank accounts, move money, schedule payments, or activate subscriptions.

## Status
**Planning/control specification — NOT a certification of live collections, accounting completeness, payment processing, or subscription readiness.**

## Safety
Never commit bank account numbers, card data, passwords, API keys, tax IDs, customer personal data, or raw processor exports. Use redacted evidence references and least-privilege access.
