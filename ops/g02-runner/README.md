# G02 Executing Runner

This package defines the host-side execution contract for the Lingo Legacy G02 evidence runner.

## Identity contract

The runner MUST register as:

- name: `lingo-legacy-g02`
- labels: `self-hosted,linux,x64,lingo-g02`
- environment: Linux x64
- repository scope: `thelingolegacy-blip/TheLingoLegacy`

A runner that does not satisfy the exact identity contract is not a G02 runner.

## Execution contract

The runner daemon must be:

1. installed on the controlled Linux x64 host;
2. registered against the repository with the exact name and labels;
3. online and polling for jobs;
4. assigned a G02-qualified workflow job;
5. able to instantiate workflow steps;
6. able to execute the G02 sentinel;
7. able to emit retrievable logs and evidence.

No queue state, registration configuration, or "Online Idle" claim is accepted as execution evidence by itself.

## Fail-closed rules

G02 remains NOT ESTABLISHED unless all required predicates are true:

`P1 real matching runner`
`P2 runner_id > 0`
`P3 runner_name = lingo-legacy-g02`
`P4 job assigned`
`P5 steps instantiated`
`P6 sentinel executed`
`P7 logs generated`
`P8 logs retrievable`
`P9 evidence independently verified`

The runner package MUST NOT:

- change `runs-on` to a hosted runner;
- remove the `lingo-g02` label;
- fabricate runner IDs, names, steps, or logs;
- auto-promote production;
- modify Firebase production configuration;
- bypass certification or promotion gates.

## Installation

Run the bootstrap script as the dedicated runner account with sudo available for service installation.

Required environment:

- `GITHUB_RUNNER_TOKEN`: short-lived repository registration token supplied out-of-band; never commit it.
- `GITHUB_REPOSITORY`: defaults to `thelingolegacy-blip/TheLingoLegacy`.
- `RUNNER_VERSION`: explicitly pinned Actions Runner release, e.g. `2.x.y`.

Example:

```bash
export GITHUB_RUNNER_TOKEN='REDACTED'
export GITHUB_REPOSITORY='thelingolegacy-blip/TheLingoLegacy'
export RUNNER_VERSION='PINNED_VERSION'
sudo -E ./ops/g02-runner/bootstrap-g02-runner.sh
```

The script does not print the registration token.

After installation, the host must show the runner service connected and listening for jobs. Only the GitHub-side job allocation plus actual sentinel execution can establish G02.
