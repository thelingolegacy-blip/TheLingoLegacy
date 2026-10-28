# Homies — isolated implementation

Status: **IMPLEMENTATION SCAFFOLD — NOT RELEASE-CERTIFIED**  
Branch: `feature/homies-design-system-grok`  
Scope: design tokens, icon primitives, buttons, navigation, Grok service contract, tests, and CI.

## Boundaries
- This package is isolated under `homies/`; it does not change production routes, hosting, DNS, Firebase configuration, or release policy.
- No production deployment or merge is authorized by this work.
- Grok's provider credentials must be stored server-side. Never ship an xAI API key to a client.
- User profile data and conversation history are private by default. Deletion must remove the app's stored history according to the documented retention contract.
- LGBTQ+ identity and sexual preferences are sensitive data: collect only what is necessary, provide clear controls, and never use sensitive data for unrelated model training.
- All AI replies must be clearly labeled **Grok**, and AI output is advisory rather than a safety guarantee.

## Files
- `design-system/tokens.css`: color, type, radius, elevation, and motion tokens.
- `design-system/icons.tsx`: typed SVG icon primitives with outline/filled states.
- `design-system/components.tsx`: accessible button and five-tab navigation primitives.
- `grok/CONTRACT.md`: server-side API, streaming, privacy, safety, and acceptance contract.
- `tests/design-system.test.mjs`: dependency-free static contract tests.
- `.github/workflows/homies-validation.yml`: path-scoped validation with read-only permissions.

## Local validation
Run from the repository root:

```sh
node --test homies/tests/design-system.test.mjs
```

This repository snapshot does not establish a Homies-specific React Native/Next.js build target or dependency manifest. The TSX files are implementation primitives and must be integrated into the actual app package before claiming a framework build or device-level acceptance.

## Runner and release diagnostics
For G02, use the canonical runbook and existing tools rather than creating duplicate runner registrations:
- `docs/G02-ACCEPTANCE-CONTRACT.md`
- `docs/G02-SELF-HOSTED-RUNNER-RECOVERY.md`
- `ops/g02/diagnose-actions-dispatch.sh`
- `ops/g02/runner-control.sh status` (on the authorized runner host)

Homies validation uses GitHub-hosted `ubuntu-latest` only; it does not depend on the blocked canonical self-hosted runner. A successful Homies test does **not** imply G02 passes. Production remains protected until all independent release gates pass.
