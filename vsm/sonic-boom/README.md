# Sonic Boom Lane — Phase 1 foundation

Sonic Boom is a priority and concurrency lane, not an authorization bypass.

- Disabled by default.
- When enabled, it supports bounded parallelism (1–16 jobs; default 4).
- Owner-priority ordering applies only when the lane is enabled.
- Every state change must be owner-authorized and audited by the VSM API.
- It does not bypass SAAAE, G02, release gates, evidence requirements, or production approval.
- Jobs remain constrained by each center's own policy and capability allowlist.

The first implementation is an in-process queue. Durable distributed workers, GPU scheduling, real-time audio/image generation, and cross-center dispatch are not yet implemented.
