# askLINGO v2.0 — Voice and Multimodal Architecture

## Preserved source direction

The LINGO Master Blueprint defines the voice sequence as askLINGO → Voice → WebRTC → Realtime Model → Server-Authoritative Policy. This is preserved as the target architecture, not evidence that realtime voice or a provider is currently configured.

## Logical flow

```text
WEB / FLUTTER / APPROVED CLIENT
            |
      EXPLICIT USER GESTURE
            |
     AUTHENTICATED SESSION
            |
    SERVER POLICY / CONSENT
            |
    REALTIME SESSION BROKER
            |
       WEBRTC TRANSPORT
            |
   APPROVED REALTIME PROVIDER
            |
     SERVER TOOL / ACTION GATE
            |
    RESPONSE / TRANSCRIPT POLICY
```

## Requirements

- Realtime session credentials are minted server-side, short-lived, audience-restricted, and never expose provider master keys to clients.
- The client obtains microphone permission only after an explicit user action and clear purpose notice.
- Voice and text requests share the same identity, product scope, SAAAE policy, approval, and audit rules.
- Tool calls generated during speech are untrusted proposals. The server revalidates each tool request independently.
- High-impact actions require the same exact-action approval flow as text interactions.
- A voice session cannot inherit authority from a previous session, device, or user.
- Provide visible microphone state, mute/stop controls, interruption handling, and clear recording/transcription indicators.
- Support text fallback, captions/transcripts where enabled, reduced-motion behavior, accessibility, and mobile-safe controls.
- Do not store audio, transcripts, or derived voice profiles by default. Any persistence requires separate consent, retention, access, deletion, and privacy review.
- Define provider outage, network loss, session expiry, revoked identity, and consent withdrawal behavior. Protected actions stop immediately when required authorization is unavailable.

## Provider and protocol decisions

WebRTC is the preserved transport direction. A specific realtime model/provider, token-minting protocol, regional processing arrangement, retention posture, and cost ceiling remain unselected. No paid provider or production voice service is enabled by this architecture document.

## Security and privacy tests

Test forged session requests, expired session tokens, cross-user session reuse, microphone denial, consent withdrawal, prompt injection in transcripts, tool escalation, revoked grants, approval digest mismatch, provider outage, transcript leakage, and audio persistence defaults.

## Current state

Voice is SPECIFIED at architecture level. Runtime implementation, provider connection, client integration, live validation, and production activation remain UNVERIFIED / NOT ENABLED.
