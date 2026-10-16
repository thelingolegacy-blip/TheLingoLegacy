import fs from 'node:fs';
import path from 'node:path';

const base = path.resolve('containers/k8s');
const required = ['namespace.yaml', 'deployment.yaml', 'service.yaml', 'kustomization.yaml'];
const failures = [];

for (const file of required) {
  if (!fs.existsSync(path.join(base, file))) failures.push(`missing manifest: ${file}`);
}

const deployment = fs.readFileSync(path.join(base, 'deployment.yaml'), 'utf8');
const checks = [
  [deployment.includes('automountServiceAccountToken: false'), 'service account token automount must be disabled'],
  [deployment.includes('runAsNonRoot: true'), 'container must run as non-root'],
  [deployment.includes('readOnlyRootFilesystem: true'), 'root filesystem must be read-only'],
  [deployment.includes('allowPrivilegeEscalation: false'), 'privilege escalation must be disabled'],
  [deployment.includes('capabilities:\n              drop: ["ALL"]'), 'Linux capabilities must be dropped'],
  [deployment.includes('REPLACE_ME') && deployment.includes('REVIEW_REQUIRED'), 'image must remain an explicit placeholder until reviewed'],
];

for (const [ok, message] of checks) if (!ok) failures.push(message);

const result = {
  gate: 'container-kubernetes-scaffold-contract',
  status: failures.length ? 'FAIL' : 'PASS',
  scope: 'manifest text checks only; no Docker build, cluster validation, or deployment',
  required_files: required.length,
  failures,
};
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
