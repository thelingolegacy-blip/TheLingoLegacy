import fs from 'node:fs';
import path from 'node:path';

const base = path.resolve('containers/k8s');
const required = ['namespace.yaml', 'deployment.yaml', 'service.yaml', 'kustomization.yaml'];
const failures = [];

for (const file of required) {
  if (!fs.existsSync(path.join(base, file))) failures.push(`missing manifest: ${file}`);
}

if (failures.length) {
  console.error(JSON.stringify({ gate: 'container-kubernetes-scaffold-contract', status: 'FAIL', failures }, null, 2));
  process.exit(1);
}

const deployment = fs.readFileSync(path.join(base, 'deployment.yaml'), 'utf8');
const service = fs.readFileSync(path.join(base, 'service.yaml'), 'utf8');
const namespace = fs.readFileSync(path.join(base, 'namespace.yaml'), 'utf8');
const kustomization = fs.readFileSync(path.join(base, 'kustomization.yaml'), 'utf8');
const checks = [
  [namespace.includes('name: lingo-staging'), 'namespace must be isolated as lingo-staging'],
  [deployment.includes('automountServiceAccountToken: false'), 'service account token automount must be disabled'],
  [deployment.includes('runAsNonRoot: true'), 'container must run as non-root'],
  [deployment.includes('readOnlyRootFilesystem: true'), 'root filesystem must be read-only'],
  [deployment.includes('allowPrivilegeEscalation: false'), 'privilege escalation must be disabled'],
  [deployment.includes('capabilities:\n              drop: ["ALL"]'), 'Linux capabilities must be dropped'],
  [deployment.includes('REPLACE_ME') && deployment.includes('REVIEW_REQUIRED'), 'image must remain a placeholder until reviewed'],
  [service.includes('type: ClusterIP'), 'service must remain internal-only'],
  [!fs.existsSync(path.join(base, 'ingress.yaml')), 'no public ingress manifest may be introduced by this scaffold'],
  [kustomization.includes('deployment.yaml') && kustomization.includes('service.yaml'), 'Kustomize bundle must include deployment and service'],
];

for (const [ok, message] of checks) if (!ok) failures.push(message);

const result = {
  gate: 'container-kubernetes-scaffold-contract',
  status: failures.length ? 'FAIL' : 'PASS',
  scope: 'source text contract only; no Docker build, image scan, Kubernetes API-server validation, or deployment',
  required_files: required.length,
  checks: checks.length,
  failures,
};
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
