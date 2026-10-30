# Studio Operations Integration Contract

## Data trust labels

- `LIVE_VERIFIED`: response from an authenticated authoritative service with freshness and provenance.
- `RESPONDED`: HTTP endpoint responded; this says nothing about business correctness.
- `STALE`: last successful observation is outside its configured freshness window.
- `UNAVAILABLE`: endpoint could not be reached or returned an error.
- `UNVERIFIED`: no authoritative evidence was collected.
- `BLOCKED`: prerequisite is known not to be satisfied.
- `ILLUSTRATIVE`: static visual only; never use as operational telemetry.

## Minimum common envelope

```json
{
  "schema_version": "1.0",
  "service": "g02-evidence",
  "environment": "staging",
  "status": "UNVERIFIED",
  "observed_at": "RFC3339 timestamp",
  "source": "authoritative service identifier",
  "correlation_id": "opaque id",
  "evidence_refs": [],
  "freshness_seconds": null,
  "reason_code": "NO_EXECUTION_EVIDENCE"
}
```

Never include secret values, bearer tokens, private keys, raw camera streams, public media links, or unrestricted personal location histories in the common envelope.

## G02 evidence envelope

A G02 evidence response must reference workflow run ID, job ID, positive runner ID, runner name, exact commit SHA, job steps, log reference, artifact reference, artifact SHA-256, independent verification result, and acceptance record. Every reference must be retrievable by an authorized reviewer.

## LINGOeye envelope

Device, recording, location and beacon events require event ID, schema version, tenant/realm, source device/asset, occurred/received timestamps, purpose/consent reference, retention class, source freshness, confidence/accuracy, correlation ID and opaque media reference. Media access is separately authorized and time-limited.

## LINGOmove envelope

Trip, delivery, dispatch and fleet events require event ID, schema version, tenant/realm, aggregate ID, server-authoritative lifecycle transition, actor, occurred/received timestamps, provider reference where applicable, idempotency key, correlation ID and access scope. Provider booking/payment/fulfillment states remain distinct and reconciled.

## Authorization

Every operational read is tenant/realm/role/purpose scoped. Every mutation (when later implemented) requires explicit server-side policy, CSRF protection where applicable, idempotency, audit trail, rate limit and environment-level approval. The current dashboard has no mutation controls.
