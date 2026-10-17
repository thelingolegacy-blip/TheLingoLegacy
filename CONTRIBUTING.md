# Contributing to The Lingo Legacy

Thank you for helping improve The Lingo Legacy. This repository contains the flagship web experience, Cloudflare Worker runtime, studio surfaces, release workflows, recovery tooling, and product documentation. Changes must be reviewable, testable, and traceable to evidence.

## Before changing code

1. Read README.md, the architecture, the release roadmap, and the relevant runbook.
2. Identify the affected surface and owner: web/Worker, studio, Firebase, commerce, game, infrastructure, or governance.
3. Check existing open pull requests and recovery branches before duplicating work.
4. Keep production credentials and tokens out of source, logs, issues, and artifacts.

## Branch and pull-request rules

- Use a short, descriptive branch name, for example fix/worker-health-contract, docs/observability-runbook, or infra/capacity-lab.
- Make focused commits with clear messages.
- Open a pull request against main; include purpose, scope, test results, operational risk, rollback plan, and evidence links.
- Keep infrastructure provisioning, application changes, and production promotion as separate reviewed changes.
- Do not merge draft recovery PRs or claim checks passed when the runner never initialized a step.
- Do not change production DNS, Worker routes, secrets, billing, or live infrastructure as an incidental effect of documentation or test changes.

## Minimum validation

For Worker or runtime changes:

~~~bash
node --check worker.js
~~~

For runner/bootstrap shell changes:

~~~bash
bash -n ops/g02/diagnose-runner.sh
bash -n ops/github-runner/bootstrap.sh
bash -n ops/github-runner/entrypoint.sh
~~~

For recovery gate code:

~~~bash
python -m unittest discover -s ops/recovery/tests -v
~~~

Run the checks relevant to the changed files and report actual output. If a command cannot run in the available environment, state that explicitly instead of marking it passed.

## CI and evidence

- Prefer least-privilege workflow permissions and pin third-party actions to reviewed versions or immutable SHAs according to repository policy.
- Separate read-only validation from deployment credentials and production environments.
- Every release evidence record should identify repository, commit SHA, workflow run, attempt, job, actor, timestamp, artifact, and environment where applicable.
- A queued job, empty steps, missing logs, or absent artifact is not a successful execution.
- A CI pass is necessary but not sufficient for production promotion.

## Infrastructure and Kubernetes

- Cloudflare Workers/Pages remains the current web production plane.
- Kubernetes work belongs in an isolated non-production capacity lab until a concrete service, provider, owner, security review, budget, and rollback path are approved.
- Never commit cloud credentials, kubeconfig, Terraform state, runner registration tokens, .env files, or generated secrets.
- Review network egress, workload identity, resource requests/limits, autoscaling bounds, disruption budgets, and observability before provisioning.
- Do not run untrusted pull-request code on the privileged G02 host.

## Documentation

Update CHANGELOG.md for meaningful changes. Keep runbooks operational and specific. If a workflow, endpoint, or architecture decision changes, update the corresponding docs/wiki page in the same pull request.

## Definition of done

A change is done only when its scope is reviewed, relevant checks actually execute, results are inspectable, docs are updated, known risks are recorded, and no unrelated production mutation occurred.
