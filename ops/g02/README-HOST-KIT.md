# G02 Host Bootstrap Kit

This directory contains the minimum host-side tooling required to bring `lingo-legacy-g02` from an unprepared Linux host to an active GitHub Actions runner.

## Build boundary

The kit can prepare:
- Linux prerequisites
- DNS and outbound HTTPS preflight
- Actions Runner installation
- repository registration
- runner name and labels
- systemd service
- bounded automatic service restart
- final host preflight

It cannot and must not fabricate:
- GitHub runner registration credentials
- runner assignment
- runner execution
- workflow logs
- G02 acceptance

## Run

Use a short-lived GitHub Actions runner registration token supplied only through the process environment:

```bash
export RUNNER_TOKEN="<short-lived-registration-token>"
sudo --preserve-env=RUNNER_TOKEN bash ops/g02/bootstrap-host.sh
```

If sudo environment preservation is unavailable, run the script from a root shell after exporting the token.

## Expected host result

```text
HOST_PREFLIGHT=PASS
RUNNER_REGISTRATION=present
RUNNER_DAEMON_STATE=active
Connected to GitHub
Listening for Jobs
```

These are host-readiness indicators, not G02 acceptance.

## G02 evidence handoff

After the daemon is actually polling, GitHub must independently show:

```text
job assigned
runner_id > 0
runner_name populated
steps instantiated
sentinel executed
logs generated
logs retrievable
independent verification
```

Only then can G02 transition from `FAIL_UNVERIFIED` to an established state.

## Safety

The kit intentionally does not open inbound ports, install a proxy, intercept TLS, modify the LINGO domain DNS, expose the runner publicly, or alter production deployment state.
