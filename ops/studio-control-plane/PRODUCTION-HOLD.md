# Production Hold

## Current disposition

```text
G02 = FAIL / UNVERIFIED
G03–G11 = BLOCKED
FAIL_CLOSED = ACTIVE
MUTATION_FREEZE = ACTIVE
LKG = PROTECTED
PROMOTION = BLOCKED
ACTIVATION = BLOCKED
```

## Unlock conditions

### G02
A real matching runner must receive a job and produce independently retrievable execution evidence. Required evidence includes a positive runner identity, populated runner name, assigned job, instantiated steps, sentinel execution, generated logs, retrievable logs, and independent verification.

### Firebase
Authenticated evidence for the actual production project must supply real platform configuration values. Placeholders must not be replaced by inference or fabricated values. Resulting configuration must execute validation and receive independent verification.

### Public domain
A real external HTTPS request must provide the actual status, redirect chain, response headers, and responder correlation sufficient to establish which system served the response. Cloudflare configuration trace alone is insufficient.

## Prohibited shortcuts

- No merge solely because a branch is mergeable.
- No promotion solely because AppDeploy reports READY.
- No activation solely because Cloudflare configuration is correct.
- No G02 pass from queue state.
- No Firebase pass from project ID alone.
- No production authorization inferred from user intent alone.
