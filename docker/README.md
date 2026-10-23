# Docker packaging boundary

Status: application image intentionally not defined yet.

The current production application surface includes Cloudflare Worker configuration. A generic Node or web-server Dockerfile would risk packaging the wrong runtime and creating a misleading deployment artifact.

Before adding an application Dockerfile, identify and verify:
- the exact application entry point and runtime contract;
- required build output and static/runtime asset boundaries;
- a supported base image and pinned dependency lockfile;
- non-root execution, health checks, signal handling, and writable-path requirements;
- image scanning, provenance, registry, immutable digest, and rollback policy.

The Docker CI workflow builds and inspects only `ops/github-runner/Dockerfile` for the dedicated G02 runner. It does not publish an image, build an application image, or deploy an application.
