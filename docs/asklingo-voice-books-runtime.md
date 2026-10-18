# askLINGO Voice + LINGO Books Runtime

## Scope

This change adds the source-level contract for:

- realtime two-way askLINGO voice
- research mode
- generation mode
- help mode
- training mode
- examples mode
- teach mode
- governance mode
- law, medicine/Dr, firefighter, EMT, and law-enforcement educational modes
- seven LINGO books with narrated-audio delivery contracts
- Flutter WebRTC client contract
- Cloudflare Worker server boundary
- CI validation

## Runtime

Browser and Flutter clients request a short-lived realtime client secret from:

`POST /api/asklingo/realtime-token`

The Worker keeps `OPENAI_API_KEY` server-side and creates the realtime session. The client then establishes the WebRTC session directly with the realtime service.

Text/research requests use:

`POST /api/asklingo/respond`

Research mode enables web search at the model boundary. Professional-domain modes remain educational and must not be represented as professional licensure, diagnosis, legal representation, incident command, medical direction, or agency authority.

## Books

Canonical titles:

1. KottonsCode
2. The Block I Grew Up On
3. Say It Again
4. Lightborne
5. Dice Shift Hotel
6. Lowdown
7. Legacy Legend: Lingo City

Book audio follows:

`manuscript → chapter split → narration script → voice generation → audio QC → normalization → metadata → R2 → CDN → Flutter/web player → acceptance`

No book text is invented by the runtime. Chapter narration is generated only from the authoritative manuscript.

## Governance

Source/configuration does not equal live runtime proof.

The implementation remains:

`DEFINED → BUILT → EXECUTED → PROVEN → VERIFIED → ACCEPTED → ESTABLISHED`

G02 and downstream release gates remain independently governed. Creating this branch or its source artifacts does not constitute a G02 PASS, production promotion, or activation.

## Secrets

Never place `OPENAI_API_KEY` in browser code, Flutter source, Git history, or static assets. Configure it only as a protected Cloudflare Worker secret.
