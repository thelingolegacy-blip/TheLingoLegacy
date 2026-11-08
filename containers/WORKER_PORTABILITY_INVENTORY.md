## Canonical Worker Portability Inventory

Source examined: `worker.js` on `main` (blob SHA `e858aa506eab4c9cae96679975d3c62a4f9c0241`). This is a read-only source inventory, not an implemented Node.js port or parity certification.

### Exact path dispatch

| Path | Contract to preserve |
|---|---|
| `/api/beacon-text-alerts` | Port response status, body schema, cache/security headers, environment dependencies, and side-effect behavior as defined by the canonical Worker. |
| `/api/create-checkout-session` | Port response status, body schema, cache/security headers, environment dependencies, and side-effect behavior as defined by the canonical Worker. |
| `/api/v1/platform/gates` | Port response status, body schema, cache/security headers, environment dependencies, and side-effect behavior as defined by the canonical Worker. |
| `/api/v1/platform/manifest` | Port response status, body schema, cache/security headers, environment dependencies, and side-effect behavior as defined by the canonical Worker. |
| `/api/v1/platform/modules` | Port response status, body schema, cache/security headers, environment dependencies, and side-effect behavior as defined by the canonical Worker. |
| `/api/v1/platform/status` | Port response status, body schema, cache/security headers, environment dependencies, and side-effect behavior as defined by the canonical Worker. |
| `/api/v1/runtime` | Port response status, body schema, cache/security headers, environment dependencies, and side-effect behavior as defined by the canonical Worker. |
| `/api/v1/site/context` | Port response status, body schema, cache/security headers, environment dependencies, and side-effect behavior as defined by the canonical Worker. |
| `/healthz` | Port response status, body schema, cache/security headers, environment dependencies, and side-effect behavior as defined by the canonical Worker. |

### Prefix dispatch

- `/api/...`: preserve prefix routing and unknown-path behavior.

### Environment references observed

- `env.ASSETS`
- `env.ASSET_BUCKET`
- `env.BEACON_ALERTS_WEBHOOK_SECRET`
- `env.BEACON_ALERTS_WEBHOOK_URL`
- `env.CANONICAL_DOMAIN`
- `env.DB`
- `env.FIREBASE_PROJECT_ID`
- `env.PUBLIC_SITE_URL`
- `env.REALTIME_ENABLED`
- `env.STRIPE_SECRET_KEY`
- `env.STUDIO_KV`
- `env.TWILIO_ACCOUNT_SID`
- `env.TWILIO_AUTH_TOKEN`
- `env.TWILIO_FROM_NUMBER`

These are names referenced by source, not a declaration that corresponding resources/secrets exist or that the container should receive them. Production credentials must not be copied. Each integration needs a separately reviewed staging-only adapter or must remain disabled.

### Porting gates

1. Define the canonical expected response contract for every route above, including method validation and failure paths.
2. Separate pure runtime-manifest/status logic from Cloudflare-specific interfaces (assets, D1/DB, KV, R2, and service bindings).
3. Port static assets with a strict allowlist and traversal-safe path resolution; do not mount the full repository into a public web root.
4. Keep checkout and beacon integrations disabled by default in container staging; test-only keys/endpoints must be isolated and not be provisioned from production.
5. Add contract tests against the Worker and Node runtime for status, headers, schemas, redirects, CORS, and side effects.
6. Build and scan an immutable image; record source SHA and image digest.
7. Validate Kubernetes manifests against an actual isolated API server, then run private-only staging probes.
8. Preserve G02: local tests do not qualify as the required GitHub Actions runner evidence; no merge/promotion until the external runner diagnosis and approved gates are complete.

### Current gap

The current `containers/server.mjs` remains a health-only harness. It does not implement the listed API routes or Worker asset delivery. Therefore the Node/Kubernetes platform is not application-equivalent and must not be called complete for production. The inventory exists to prevent omission during a deliberate port.
