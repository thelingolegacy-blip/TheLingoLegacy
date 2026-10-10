#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const checks = [];
function check(name, ok, detail = "") {
  checks.push({ name, ok: Boolean(ok), detail });
}
function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

const statePath = "ops/g02/control-plane/runner-state-machine.json";
const assignmentPath = "ops/g02/control-plane/runner-assignment.yaml";
const triggerPath = "ops/g02/control-plane/trigger-rules.yaml";
const watchPath = "ops/g02/control-plane/assignment-watch.sh";
const controlPath = "ops/g02/control-plane/assignment-timer-control.sh";
const servicePath = "ops/g02/control-plane/assignment-watch.service";
const timerPath = "ops/g02/control-plane/assignment-watch.timer";
const workflowPath = ".github/workflows/g02-runner-sentinel-control-plane.yml";

for (const rel of [statePath, assignmentPath, triggerPath, watchPath, controlPath, servicePath, timerPath, workflowPath]) {
  check(`file exists: ${rel}`, fs.existsSync(path.join(root, rel)));
}
const state = JSON.parse(read(statePath));
check("state machine schema", state.schema === "lingo.g02.runner-state-machine.v1");
check("fail-closed initial state", state.initial_state === "BLOCKED_HOST_UNVERIFIED");
check("G02 remains specification-only", state.status === "SPECIFICATION_ONLY_NOT_A_LIVE_RUNNER");
check("all P1-P9 predicates exist", ["P1","P2","P3","P4","P5","P6","P7","P8","P9"].every(k => Boolean(state.acceptance_predicates?.[k])));
check("canonical runner identity", state.runner?.name === "lingo-legacy-g02");
check("canonical labels", ["self-hosted","linux","x64","lingo-g02"].every(x => state.runner?.labels?.includes(x)));

const assignment = read(assignmentPath);
check("assignment remains unprovisioned until evidence", /status:\s*NOT_PROVISIONED/.test(assignment));
check("assignment production deployment denied", /deployment_allowed:\s*false/.test(assignment));
const triggers = read(triggerPath);
check("trigger default-deny", /default_decision:\s*DENY/.test(triggers));
check("sentinel manual only", /mode:\s*manual_only/.test(triggers) && /github_event:\s*workflow_dispatch/.test(triggers));
check("no production promotion", /allowed:\s*false/.test(triggers) && /production_mutation_freeze:\s*ACTIVE/.test(triggers));

const workflow = read(workflowPath);
check("sentinel workflow manual dispatch only", /workflow_dispatch:/.test(workflow) && !/^\s*(push|pull_request|schedule):/m.test(workflow));
check("sentinel exact runner labels", /runs-on:\s*\[self-hosted, linux, x64, lingo-g02\]/.test(workflow));
check("sentinel only on main", /github\.ref == 'refs\/heads\/main'/.test(workflow));
check("artifact upload present", /actions\/upload-artifact@v4/.test(workflow));

const service = read(servicePath);
const timer = read(timerPath);
check("service uses systemd DynamicUser", /DynamicUser=yes/.test(service));
check("service persists to state directory", /StateDirectory=lingo-g02/.test(service) && /LINGO_G02_STATE_DIR=\/var\/lib\/lingo-g02/.test(service));
check("timer remains disabled by default", /WantedBy=timers\.target/.test(timer) && !/Persistent=true/.test(timer));
const ctl = read(controlPath);
check("timer create installs units without enabling", /install .*assignment-watch\.service/.test(ctl) && /activation requires separate operator review/.test(ctl));
check("reset targets timer only", /systemctl restart "\$UNIT"/.test(ctl) && !/systemctl restart .*actions\.runner/.test(ctl));
check("enable command is fail-closed", /enabling the timer requires separate operator review/.test(ctl));

for (const rel of [watchPath, controlPath]) {
  const result = spawnSync("bash", ["-n", rel], { cwd: root, encoding: "utf8" });
  check(`bash syntax: ${rel}`, result.status === 0, (result.stderr || result.stdout || "").trim());
}
const rootPackage = fs.existsSync(path.join(root, "package.json"));
check("scope accurately identifies app build status", !rootPackage, rootPackage ? "root package exists; app build needs separate config" : "no root package.json: application build is out of scope for this infra validator");

for (const item of checks) {
  console.log(`${item.ok ? "PASS" : "FAIL"} | ${item.name}${item.detail ? " | " + item.detail : ""}`);
}
const failures = checks.filter(x => !x.ok);
console.log(`SUMMARY passed=${checks.length - failures.length} failed=${failures.length}`);
console.log("SCOPE: static control-plane validation only; this does not prove host provisioning, live runner assignment, or G02 acceptance.");
if (failures.length) process.exit(1);
