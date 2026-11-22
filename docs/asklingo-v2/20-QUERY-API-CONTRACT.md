# askLINGO v2.0 — Query API Contract

**Status:** Proposed versioned contract; not implemented in the current production Worker.

## Endpoint

`POST /api/v1/ask-lingo/query`

All clients (web, Flutter, desktop, and approved embedded surfaces) use the first-party API. Provider calls are server-side only.

## Authentication

- Require a verified bearer token from the selected staging identity provider.
- Verify signature, issuer, audience, expiry, not-before, and revocation/session state server-side.
- Do not trust client-supplied subject IDs, roles, grants, tenant IDs, approval state, or product permissions.
- Current Firebase configuration is not verified; this contract does not assume it is active.

## Request

Content type: `application/json`

```json
{
  "message": "A user question",
  "mode": "chat",
  "surface": "web",
  "locale": "en-US",
  "client_request_id": "optional-opaque-correlation-id"
}
```

Validation:
- `message`: required string, trimmed, non-empty, bounded by the server (proposed maximum 12,000 characters).
- `mode`: required canonical mode ID from the v2 registry; unknown values are rejected, not silently mapped to chat.
- `surface`: one of `web`, `ios`, `android`, `desktop`, `tv`, or an explicitly registered runtime surface.
- `locale`: bounded BCP-47 language tag.
- `client_request_id`: optional untrusted correlation hint; the server generates the authoritative request ID.
- Reject unknown fields and oversized bodies.
- Do not accept raw grants, user IDs, product authorization claims, provider options, or tool permissions.

No `conversation_id` is accepted while conversation persistence remains disabled. Product context is resolved server-side from authorized session and route metadata, not trusted from arbitrary client context.

## Success response

```json
{
  "request_id": "server-generated-id",
  "status": "ok",
  "mode": "chat",
  "answer": "Assistant response",
  "citations": [],
  "artifacts": [],
  "suggested_actions": []
}
```

Suggested actions are proposals only. Each proposed action requires a separate server-side authorization and approval path before execution.

## Error contract

| HTTP | Code | Meaning |
|---|---|---|
| 400 | `INVALID_REQUEST` | Invalid JSON, schema, or mode |
| 401 | `AUTHENTICATION_REQUIRED` | Missing or invalid identity |
| 403 | `POLICY_DENIED` | No authorized access to requested scope |
| 409 | `APPROVAL_REQUIRED` | Action requires a separate approval flow |
| 413 | `REQUEST_TOO_LARGE` | Request exceeds configured bound |
| 429 | `RATE_LIMITED` | Shared rate limit exceeded |
| 503 | `SERVICE_UNAVAILABLE` | Identity, policy, audit, provider, or dependency unavailable |
| 500 | `INTERNAL_ERROR` | Generic unexpected failure |

Responses never expose provider stack traces, secret values, internal prompts, or raw policy internals.

## Execution boundary

The query endpoint is read/answer-only by default. It does not execute tools, mutate product state, publish content, send communications, transfer funds, modify access, or deploy code. Any future action API must be separately versioned and enforce SAAAE with exact-action approval, atomic consumption, idempotency, durable audit, and independent verification.

## Privacy and retention

No conversation persistence by default. Requests and responses must not be written to durable conversation storage until the retention/consent/deletion/age/privacy review is approved. Operational logs must be minimized and must not include credentials or full sensitive message bodies by default.

## Isolated validation implementation

`src/ai/v2/request.mjs` implements strict schema validation for the proposed request body, including canonical mode resolution, surface/locale checks, bounded message length, rejection of unknown fields, and rejection of client-supplied identity, scope, approval, tool, conversation, or arbitrary context fields. It is not wired to a Worker route and does not authenticate a user or authorize product data access.

## Current implementation status

The query endpoint is not implemented in the current production Worker. The existing askLINGO facade remains disabled and the site-context feature flag remains false. This contract is a design artifact only.
