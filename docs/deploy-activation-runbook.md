# Deploy activation runbook

This runbook connects auto mode to Vercel deployment activation.

## Preview verification

- Check the latest branch deployment for `the-lingo-legacy`.
- Confirm deployment state is `READY`.
- Confirm the commit matches the active branch head when possible.
- Keep root, landing, docs, and asset routes stable.

## Promotion rule

Promote only a verified deployment that is:

- `READY` on Vercel.
- From the active auto-mode branch or intended release commit.
- Covered by local static validation.
- Documented in the pull request summary.

## Post-promotion activation

After promotion:

- Check production state in Vercel.
- Record the promoted deployment in the workflow summary.
- Continue the next auto-mode item only after deployment status is clear.

## Blockers

Stop before promotion when:

- Deployment state is not `READY`.
- The deployment commit does not match the intended branch.
- Required links, JSON maps, or activation markers fail validation.
- Access or scope prevents verification.

## deploy activation marker

This runbook is the deploy activation source for auto mode.
