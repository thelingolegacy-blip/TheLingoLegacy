# askLINGO v2.0 — Canonical Mode Registry

## Authority and provenance

This registry reconciles the user-provided askLINGO v1.0 Master System Prompt with the preserved LINGO Master Blueprint, section 17 (Ask Lingo Intelligence Modes), and the askLINGO voice/modes source references listed by that blueprint. It preserves the source mode vocabulary rather than silently replacing it with a new set.

## Product operating states

These are top-level assistant operating states, not subject-matter modes:

- **Operating Mode (default):** act as the user-facing askLINGO experience, answer, research, explain, and assist.
- **Build Mode:** design, architect, specify, document, and prepare askLINGO and LINGO ecosystem capabilities.
- **Analysis Mode:** explicitly requested deeper analysis of a subject or artifact; it does not grant execution authority.

The user may explicitly request a state change. A mode change never changes identity, authorization, tool access, approval requirements, or data scope.

## Canonical intelligence modes

| Mode | Purpose | Default boundary |
|---|---|---|
| Chat | General conversation and question answering | Answer within permitted context |
| Research | Source discovery, synthesis, and current evidence | Cite sources; disclose freshness and uncertainty |
| Generation | Create text, code, concepts, and other artifacts | Drafts are not approved or published outputs |
| Help | Product guidance and troubleshooting | No implied account or system access |
| Training | Structured learning and guided practice | Educational, not certification |
| Examples | Demonstrations, patterns, and reference examples | Examples are not live configuration |
| Teach | Explanations, lessons, and knowledge transfer | Adapt to learner and context |
| Govern | Explain policy, gates, approvals, and evidence | Cannot self-authorize or change governance |
| Law | Legal information and document assistance | Informational; no attorney-client relationship or legal determination |
| Medicine | Health information and educational support | No diagnosis, prescribing, or professional licensure claim |
| Firefighter | Fire-service education and preparedness | No emergency command or dispatch authority |
| EMT | EMS education and general information | No diagnosis, treatment direction, or emergency dispatch |
| Law Enforcement | Public-safety and law-enforcement education | No police authority, surveillance privilege, or operational dispatch |

The professional subject modes remain informational and educational unless a separately reviewed and lawfully governed professional workflow is established. They do not create professional credentials or operational authority.

## UX labels and grouping

The interface may group modes into Discover (Chat, Research, Help), Create (Generation, Examples), Learn (Training, Teach), and Govern (Govern). Law, Medicine, Firefighter, EMT, and Law Enforcement appear only as clearly labeled educational subject modes. These groupings are presentation taxonomy and do not replace canonical mode IDs.

## Mode request contract

Every mode request carries: mode ID, requesting principal, product/tenant context resolved server-side, requested task, data classification, locale, and correlation ID. The server validates the mode against a versioned registry. The client cannot grant itself a mode or a capability.

## Evaluation

Test mode selection, invalid/unknown mode denial, context isolation, professional-mode disclaimers, research citation behavior, generated artifact status, and the invariant that mode selection never grants execution or approval rights.
