import fs from 'node:fs';

function evaluateEvidenceSignature(bundle, expectedSha) {
  const verdict = {
    evidence: 'INCOMPLETE',
    verification: 'BLOCKED',
    acceptance: 'BLOCKED',
    contractAuth: 'BLOCKED',
    promotion: 'BLOCKED',
    lkg: 'PROTECTED',
    failures: []
  };

  const checks = [
    ['runner.id', Number(bundle?.runner?.id) > 0],
    ['runner.name', typeof bundle?.runner?.name === 'string' && bundle.runner.name.trim() !== ''],
    ['runner.os', bundle?.runner?.os === 'Linux'],
    ['runner.arch', typeof bundle?.runner?.arch === 'string' && bundle.runner.arch.trim() !== ''],
    ['executed_step_count', Number(bundle?.executed_step_count) > 0],
    ['verifier_invoked', bundle?.verifier_invoked === true],
    ['verifier_exit_code', bundle?.verifier_exit_code === 0],
    ['verifier_gate', bundle?.verifier_gate === 'PASS'],
    ['logs_present', bundle?.logs_present === true],
    ['workflow_conclusion', bundle?.workflow_conclusion === 'success'],
    ['commit_sha', bundle?.commit_sha === expectedSha],
    ['synthetic_evidence', bundle?.synthetic_evidence === false]
  ];

  for (const [field, pass] of checks) if (!pass) verdict.failures.push(field);

  if (verdict.failures.length === 0) {
    verdict.evidence = 'PRESENT';
    verdict.verification = 'PASS';
    verdict.acceptance = 'PASS';
    verdict.contractAuth = 'READY';
  }

  return verdict;
}

if (process.argv[1]?.endsWith('evaluate-runner-evidence.mjs')) {
  const inputPath = process.argv[2];
  const expectedSha = process.argv[3];
  if (!inputPath || !expectedSha) {
    console.error('usage: node scripts/evaluate-runner-evidence.mjs <bundle.json> <expected-sha>');
    process.exit(2);
  }
  const bundle = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  console.log(JSON.stringify(evaluateEvidenceSignature(bundle, expectedSha), null, 2));
}

export { evaluateEvidenceSignature };
