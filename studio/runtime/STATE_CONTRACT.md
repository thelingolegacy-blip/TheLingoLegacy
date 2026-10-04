# Studio Runtime State Contract

Every shared surface must distinguish these UI/runtime states:

`BOOT → LOADING → READY`

Exceptional branches:

`LOADING → EMPTY`
`LOADING → ERROR`
`READY → DEGRADED`

Recovery:

`ERROR/DEGRADED → RETRY → LOADING → READY`

## Rules

- READY means the client-side surface initialized successfully; it does not mean production acceptance.
- DEGRADED means the surface remains usable with one or more noncritical capabilities unavailable.
- ERROR means the required surface cannot initialize.
- EMPTY means initialization succeeded but there is no content/data to render.
- A media error must not automatically become an application error.
- Runtime state must never be used as a substitute for deployment or production evidence.
