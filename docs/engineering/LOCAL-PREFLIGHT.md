# LINGO Local Preflight

The repository provides a dependency-free Node.js preflight script shared by developer machines and GitHub Actions.

## Install the local Git hook

From the repository root:

```sh
git config core.hooksPath .githooks
```

This is a local Git setting and does not modify the user's global Git configuration. The hook runs automatically before each commit after installation.

Run it manually at any time:

```sh
node scripts/lingo-preflight.mjs
```

## What it checks

- Wrangler configuration syntax and canonical Worker identity.
- Required Cloudflare Worker asset exclusions for nested backend code, rules, build configs, and secret-bearing files.
- Equivalent Firebase Hosting exclusions.
- Public repository workflows do not actively dispatch to the persistent G02 runner.
- Reports unresolved Firebase placeholder credentials as a separate release blocker.

## Limits

This is a local/static contract check. It does not prove Cloudflare bindings, Firebase project registration, secrets, DNS, runner health, runtime health, or production deployment. A passing preflight is not production authorization.

The GitHub workflow uses GitHub-hosted `ubuntu-latest` only for this unprivileged static check. It never targets G02 and never deploys.
