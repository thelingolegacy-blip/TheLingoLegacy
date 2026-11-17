# OpenAI Developers — Codex Setup for LINGO Engineering

Status: setup guide; the account holder must complete the local Codex installation.

## Purpose

Use the OpenAI Developers plugin as development tooling for current OpenAI API documentation, API-key setup guidance, Agents SDK implementation support, and troubleshooting. It is not a runtime dependency of LINGO applications and does not grant free model inference.

## Codex installation

1. Install and open the ChatGPT desktop app on macOS or Windows.
2. Start Codex from a terminal with `codex`.
3. Open the plugin browser with `/plugins`.
4. Search for **OpenAI Developers** and choose **Install plugin**.
5. If prompted, connect the OpenAI Platform app.
6. Start a new Codex chat before using the plugin for the first time.

## Zero-spend policy

- Do not create or use an API key for live inference during the $0 phase.
- Do not purchase API credits or enable automatic recharge.
- Keep both `LINGO_AI_PAID_API_ENABLED` and `LINGO_AI_BILLING_APPROVED` false/unset.
- Use documentation lookup, local code review, mock providers, and local tests only.
- Plugin setup is distinct from API billing and does not bypass Platform usage charges.

## Safe first tasks

- Review the LINGO OpenAI gateway and its security tests.
- Compare the implementation with current official OpenAI Responses API documentation.
- Draft an Agents SDK architecture without executing model calls.
- Review the cross-platform contract and identify missing identity, privacy, and quota controls.
- Do not merge, deploy, enable secrets, or alter production settings without the repository's human approval gates.

## Key handling

When paid usage is separately authorized in the future, use a project-scoped key and a trusted local or platform secret-creation flow. Store the credential only in an approved server-side secret store. Never paste it into chat, commit it, include it in a mobile/game bundle, or write it to CI logs.
