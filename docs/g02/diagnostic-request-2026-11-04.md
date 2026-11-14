# G02 Hosted Diagnostic Request — 2026-11-04

This evidence-only change triggers the isolated GitHub-hosted diagnostic lane in PR #425.

- Intended lane: GitHub-hosted ubuntu-latest diagnostic only.
- Canonical self-hosted G02 assignment probe: NOT REQUESTED / remains disabled.
- Production, DNS, Worker routes, secrets, billing, and payment settings: unchanged.
- This run is diagnostic evidence only; it cannot qualify or accept G02.
- Required output: run/attempt/commit correlation, hosted runner identity, instantiated steps, retrievable logs, evidence artifact, and SHA-256 sidecars where the collector supplies them.

A successful hosted diagnostic does not replace the dedicated lingo-legacy-g02 host and sentinel requirements.
