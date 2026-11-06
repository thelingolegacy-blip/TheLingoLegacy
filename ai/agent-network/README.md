# LINGOlegacy AI Agent Network

## Purpose
A versioned multi-agent platform for Dusse, Zay, and Ava. The initial release establishes the agent identity registry, permission model, user-facing console preview, and integration boundaries. The six agents are distinct configurations and release units, not aliases for one shared persona.

## Initial roster
- **Dusse 1.0** — founding conversational assistant, voice interaction, and user support.
- **Dusse 2.0** — advanced reasoning, orchestration, research, and complex task planning.
- **Zay 1.0** — founding companion, knowledge retrieval, conversation, and independent second opinions.
- **Zay 2.0** — advanced analysis, technical assistance, and cross-agent collaboration.
- **Ava 1.0** — administration, organization, scheduling, and operational assistance.
- **Ava 2.0** — workflow automation, coordination, and specialized operations.

## Platform boundaries
- GitHub remains the source of truth for code, agent definitions, policies, prompts, and release evidence.
- Cloudflare is the intended edge/runtime boundary; Firebase is the intended identity and application-data layer, subject to a reviewed integration design.
- Web UI is responsive. Flutter is the intended mobile client target.
- Model providers, speech-to-text, text-to-speech, avatar rendering, and retrieval providers are adapters, not hard-coded agent identities.
- No provider credential, Firebase service account, signing key, or production secret belongs in this directory or in client code.

## Current implementation state
The index.html file is an interface preview only. It has local agent selection and responsive presentation, but deliberately does not call a model, store chat history, authenticate users, access project data, capture audio, or execute agent tools. The registry marks all agents as planned; this is intentional and must not be interpreted as activation.

## Production workstreams
1. Identity, authentication, account roles, and session lifecycle.
2. Agent runtime contracts, model routing, version pinning, fallback, and token/cost controls.
3. Policy enforcement and scoped tool authorization on the server.
4. Conversation persistence, retention, export, deletion, and audit trails.
5. Retrieval connectors with per-project and per-user authorization.
6. Speech pipeline, voice selection, interruption handling, and audio preferences.
7. Avatar pipeline, expression state, animation assets, and accessibility fallbacks.
8. Admin console, approvals, rate limits, observability, incident response, and release controls.
9. Responsive web client and Flutter mobile client.
10. Security, privacy, abuse, reliability, and performance validation.

## Acceptance standard
A visual preview is not a live agent. A configured adapter is not a connected provider. A successful build is not production acceptance. Each integration must have executable tests, retrievable evidence, independent verification, and explicit human authorization before production activation.
