# LINGO Operations Center

A static, read-only operations surface backed by the committed canonical resource registry.

## Route

When the repository is served from its web root, open `/operations-center/`. The page loads `/config/ops/resource-registry.json` relative to its own URL.

## Current behavior

- Reads the committed resource registry and displays aggregate counts by integration state.
- Supports text search and filters by integration state and resource category.
- Displays provider, environment, criticality, owner, last observation, evidence and dependency IDs.
- Uses explicit state labels; missing or unknown states are never rendered as healthy.
- Shows the registry generation timestamp and warns that this is a committed snapshot, not a live provider health probe.
- Provides no write, deploy, restart, billing, DNS, runner, data-migration or secret-management controls.

## Verification checklist

1. Serve the repository root over HTTP (do not open the HTML as a `file://` URL; browser fetch restrictions may block the registry request).
2. Confirm the registry request to `/config/ops/resource-registry.json` returns HTTP 200 and valid JSON.
3. Confirm the resource count matches the registry's `resources.length`.
4. Search for a known resource ID and confirm it filters to the expected record.
5. Filter for `blocked` and `verified`; confirm the state counts and visible cards agree.
6. Disable or rename the registry file in a local test copy; confirm the page reports an explicit load error rather than fabricated zero-resource health.
7. Test keyboard focus, mobile layout, and reduced-motion behavior.

## Security and release boundary

This page is a presentation layer only. It does not authenticate operators or call provider APIs. Do not treat it as an operational authorization surface. Production remains frozen until the separate release process has complete, commit-bound evidence and explicit release acceptance.
