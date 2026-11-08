# Lingo Travel Golden Path Certification v1

## Purpose
Certify one end-to-end sandbox transaction without overstating production readiness.

## Golden path
1. Frontend creates trace context.
2. API validates request.
3. Search event is emitted.
4. Supplier adapter returns a sandbox offer.
5. Offer is normalized.
6. Price and availability are revalidated.
7. Quote is created.
8. Policy Engine evaluates booking action.
9. Approval is obtained when required.
10. Hold is created.
11. Payment reference is accepted; raw card data never enters Travel.
12. Supplier booking is requested.
13. Supplier confirmation is verified.
14. `travel.booking.confirmed.v1` is emitted.
15. Authoritative trip/booking state is persisted.
16. Audit record is written.
17. Command Center trace becomes queryable.
18. Reconciliation compares desired, actual, and observed state.
19. Verification passes or an explicit drift/failure state is recorded.

## Certification evidence
- One correlation ID spanning the entire transaction.
- Supplier sandbox request/response evidence.
- Policy decision evidence.
- Booking verification evidence.
- Event trace.
- Persistence record.
- Audit record.
- Reconciliation result.
- Automated test result.

## Failure tests
The golden path is incomplete unless these cases are exercised:
- supplier unavailable
- price changed during revalidation
- availability changed
- policy denied
- approval expired
- hold expired
- booking failed
- supplier confirmation missing
- persistence failure
- duplicate event
- replayed event
- reconciliation drift

## Certification states
PROPOSED → RUNNING → PASSED | FAILED | BLOCKED

Production activation remains blocked until the complete platform certification gate passes and real production supplier/payment integrations have been independently verified.