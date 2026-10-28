# Grok Bot integration contract

Status: implementation contract; provider connectivity and production behavior are not yet verified.

## Product behavior
- Display the name **Grok** on every assistant message and use a distinct charcoal message bubble with a crimson left border.
- Provide entry points from the chat list, an accessible floating action, and contextual Ask Grok chips where useful.
- Offer icebreakers, profile/photo coaching, reply suggestions, filter explanations, premium-feature explanations, community guidelines, safety tips, and event discovery.
- Default to concise, confident, lightly witty responses. Never presume sexual consent, encourage coercion, or expose private user information.

## API boundary
1. The client sends an authenticated conversation request to a Homies-owned server endpoint.
2. The server validates authentication, request size, rate limits, consent, and applicable age/community rules.
3. The server calls the configured provider using a server-only secret (for example, an xAI API key in a secret manager). No key is bundled into browser or mobile code.
4. Stream validated response chunks through the application's authenticated streaming transport. WebSocket is optional; SSE or another transport may be selected based on the real app architecture.
5. Handle provider errors, disconnects, cancellation, timeouts, retries, and rate limiting without leaking provider details or secrets.
6. Record operational metadata minimally; do not log full conversation text by default.

## Privacy and controls
- Store Grok conversations separately from direct messages.
- Offer per-conversation and all-Grok-history deletion. Define and test retention, backup deletion, and audit requirements before launch.
- Never expose one user's prompts, profile, location, or conversation to another user.
- Request explicit permission before using precise location, photos, or profile attributes in a prompt.
- Treat LGBTQ+ identity, sexual orientation, precise location, and intimate preference data as sensitive. Do not repurpose for advertising or unrelated profiling.
- Explain when AI is responding and that advice can be wrong.

## Safety behavior
- Prioritize consent, blocking/reporting, personal safety, and privacy.
- Avoid explicit sexual content by default and adapt to the user's tone only within product policy and age restrictions.
- Do not present event listings as verified until their source, date, location, and availability have been checked.
- Offer a safety check-in only as an opt-in user-controlled feature; do not imply that Grok can monitor physical safety or summon help.

## Acceptance gates
- [ ] Provider secrets are server-side and absent from bundles, logs, and artifacts.
- [ ] Authentication, authorization, rate limiting, and abuse handling are tested.
- [ ] Streaming, cancellation, error, and reconnect behavior are tested.
- [ ] Separate history and deletion behavior is covered by integration tests.
- [ ] Consent and sensitive-data minimization are documented in UI.
- [ ] Keyboard navigation, screen-reader labels, contrast, reduced-motion, and touch target checks pass on actual target platforms.
- [ ] Provider/model/version, data handling, and operational owner are recorded.
- [ ] Independent staging evidence is retained before any production enablement.

A UI scaffold or passing static test is not evidence of provider connectivity, real-time streaming, mobile acceptance, or production readiness.
