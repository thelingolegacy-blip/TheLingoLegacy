# Lingo Legacy Airport — Living Infrastructure

Reference implementation for Airport Sprints 31–35.

## Runtime contract

`observe -> state -> compare -> policy -> reconcile -> verify -> audit`

This service is a digital Lingo Legacy domain. It does not control physical aviation, airport security, aircraft, or other real-world safety-critical systems.

## Initial modules

- `types.ts` — canonical airport resource/state contracts
- `events.ts` — airport event envelope and event catalog
- `reconciliation.ts` — deterministic drift detection and safe repair planning
- `policy.ts` — local policy boundary; platform Policy Engine remains authoritative
- `worker.ts` — worker lifecycle and heartbeat primitives
- `index.ts` — service boundary and health/status handlers
- `config.yaml` — desired runtime configuration

Production activation remains gated by the Lingo certification contract.