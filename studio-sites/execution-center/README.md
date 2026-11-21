# LINGO Execution Center Preview

This directory contains the read-only Execution Center preview.

## Runtime contract

- The dashboard is an observational view of public GitHub repository metadata and fixed public HTTPS probes.
- The Pages Function at `/api/snapshot` performs GET-only requests.
- No GitHub token, Cloudflare API token, account credential, or secret is required or embedded.
- No GitHub writes, deployments, DNS changes, payments, wallet operations, or production controls are exposed.
- GitHub and probe failures are returned as explicit error data; an unavailable source is never treated as a passing gate.
- Gate status is informational and cannot be self-certified from the dashboard.
- Dynamic API content must be escaped before rendering.

## Build

Cloudflare Pages uses this directory as its root, copies `index.html` into `dist/index.html`, and discovers the `functions/` directory for Pages Functions.

## Release boundary

This is a preview-only dashboard. It is not a release authority and does not replace the canonical GitHub evidence package or independent acceptance review. Production Pages deployments remain disabled for this project.
