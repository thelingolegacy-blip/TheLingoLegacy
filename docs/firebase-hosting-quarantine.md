# Firebase Hosting and CLI project quarantine

The root repository's public web delivery authority is Cloudflare Workers. Root Firebase Hosting is therefore intentionally unconfigured.

## Controls

- `firebase.json` has no `hosting` target. The former `public: "."` setting could have published repository-root files if Hosting deployment were invoked.
- `.firebaserc` has no implicit default project. Firebase CLI operations must identify a separately approved non-production target explicitly.
- Runtime Firebase client options are unchanged by this quarantine. This change does not migrate Auth, Firestore, Storage, Functions, or application data.
- No Firebase deploy, project selection, credential change, or provider mutation is performed.

## Re-enable requirements

A Hosting target or CLI project may be added only through a separately reviewed change with an explicit allowlisted output directory, staging project identity, authentication, publication tests, rollback plan, and owner approval. Production project selection and Hosting publication remain blocked.
