# Architecture Overview

The current web production path is:

    GitHub source -> CI validation -> evidence/review -> authorized Cloudflare Worker release
                  -> canonical domain -> live probes

The optional future service/capacity plane is separate:

    Containerized service -> isolated Kubernetes capacity lab -> metrics/logs/traces

Do not introduce Kubernetes as a fix for GitHub runner dispatch. It does not resolve the current pre-step failure. Provisioning remains conditional on a concrete workload, approved provider, budget, security review, and rollback plan.

For details, see [Infrastructure Architecture and Orchestration](../INFRASTRUCTURE-ARCHITECTURE-AND-ORCHESTRATION.md).
