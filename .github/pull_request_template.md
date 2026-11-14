## Change classification

- [ ] Documentation-only
- [ ] Application source
- [ ] Backend/schema
- [ ] Security or identity
- [ ] Staging deployment
- [ ] Production deployment

## Verification evidence

- [ ] Exact head SHA is recorded.
- [ ] Relevant CI jobs executed and logs/artifacts are retrievable.
- [ ] Unit/integration tests passed; unexecuted checks are explicitly listed.
- [ ] Firebase project, platform app IDs, Auth/App Check, and rules were verified when applicable.
- [ ] D1 migrations were applied in the intended environment and schema read back.
- [ ] Cloudflare Worker bindings, routes, and asset publication scope were verified.
- [ ] No service-account key, private key, ID token, or other secret is committed.
- [ ] Rollback/recovery procedure is documented.

## Independent release review

- [ ] A reviewer other than the PR author approved the change.
- [ ] All review conversations are resolved.
- [ ] Staging acceptance is independently evidenced.
- [ ] Production promotion is explicitly authorized.

For items that do not apply, state why. A green build, mergeable state, or source-level test alone does not establish production acceptance.
