# LINGO edge gateway and Cloudflare Tunnel architecture

**Status: target architecture and deployment runbook — not deployed or connected.**

## Intended topology

```text
Internet clients
      |
Cloudflare DNS / TLS / WAF / rate limits
      |
Cloudflare Worker — public API gateway
      |  explicit route and method allowlist
      +---- public static assets (curated allowlist)
      +---- authenticated application APIs
      |
Cloudflare Tunnel (outbound-only connector)
      |
Traefik on the private host
      |
Private service network
      +---- approved internal services
      +---- observability / DUSSE staging endpoint
```

The public Worker remains the edge authority. Tunnel provides a private origin path; it is not a substitute for application authentication. Traefik is an internal reverse proxy, not a public ingress target.

## Non-negotiable trust boundaries

- Do not publish Proxmox, Traefik dashboard/API, SSH, Docker socket, databases, admin panels, or service ports directly to the Internet.
- Tunnel connectors initiate outbound connections. Do not add inbound firewall/NAT exposure as a workaround.
- Use Cloudflare Access or equivalent identity-aware policy for operator-only routes, with MFA and short-lived sessions.
- Require service-to-service authentication between Worker/API gateway and internal services. Network location alone is not authentication.
- Use separate hostnames and policies for public application traffic, operator access, and staging.
- Keep the Traefik dashboard disabled or bound to a private management network; never expose its unauthenticated API.
- Use explicit Traefik routers/services and exact host/path/method rules. No wildcard catch-all to internal admin services.
- Keep internal services on isolated Docker/network segments; do not mount the Docker socket into general application containers.
- Restrict egress from private services and log outbound destinations.
- Store Tunnel, Access, origin, and application secrets in the platform secret store; never commit credentials or tokens.

## Gateway contract

The Worker/API gateway must:

1. Route only documented `/api/v1/*` paths and supported methods.
2. Return JSON 404 for unknown API paths and 405 with an accurate `Allow` header for unsupported methods.
3. Authenticate before forwarding protected requests; enforce authorization at the service as well.
4. Apply per-route request-size limits, rate limits, timeouts, and bounded retries.
5. Strip hop-by-hop headers and untrusted identity headers; inject verified identity context only after authentication.
6. Set `Cache-Control: no-store` for authenticated or sensitive API responses.
7. Propagate a generated request/correlation ID and preserve it across Worker, Tunnel, Traefik, and service logs.
8. Fail closed when the tunnel/origin is unavailable. Do not fall back to an unprotected origin or silently route to a different environment.

## Mail and domain security

Mail security is a separate control plane from the application gateway. Preserve the existing Google Workspace MX/SPF configuration until the sending sources are inventoried. Publish DKIM only from the actual mail provider's generated selector and key. Move DMARC from monitoring to enforcement only after SPF/DKIM alignment, legitimate senders, and aggregate reports are reviewed. Do not invent a `mail` hostname or DKIM record.

## Staged implementation

1. Inventory the Proxmox host, private subnets, running services, ports, owners, and data classifications.
2. Confirm host OS patch level, firewall policy, backup/restore, admin MFA, and separate service accounts.
3. Create a dedicated Tunnel and connector identity for a non-production service only; do not reuse a personal token.
4. Install Traefik on an isolated network with dashboard disabled and explicit routes.
5. Add one non-sensitive staging health endpoint and verify request/correlation IDs end-to-end.
6. Test denied access, invalid identity, unknown route, unsupported method, oversized body, origin timeout, tunnel disconnect, and log redaction.
7. Complete security review and restore test before considering production services.
8. Migrate one service at a time with an approved rollback plan; never change apex/www routing as part of a tunnel experiment.

## Current verified constraints

- The existing Cloudflare Tunnel named `Legacy Loop` was previously observed inactive with no active connections. This document does not activate it.
- No verified Traefik deployment or Proxmox host session is available in this workflow.
- Current production Worker routing and bindings must be reconciled against the live Cloudflare configuration before any Wrangler deployment. Do not deploy the root `wrangler.jsonc` configuration blindly because its route declarations may overlap live routes.
- DNSSEC, registrar DS records, mail DNS, billing, and production routes are outside this change.

## Acceptance evidence

Require host inventory, network diagram, Tunnel connector status, Access policy export, Traefik static/dynamic configuration, secret reference inventory, route/method test results, negative security tests, end-to-end logs with correlation IDs, backup/restore evidence, and independent approval.

**Current state:** architecture documentation only. No Tunnel, Traefik, Proxmox, DNS, Worker, mail, or firewall configuration was changed.
