import fs from 'node:fs';

const wrapperPath = '.github/workflows/g02-run-wrapper.yml';
const sentinelPath = '.github/workflows/g02-aws-sentinel.yml';
const wrapper = fs.readFileSync(wrapperPath, 'utf8');
const sentinel = fs.readFileSync(sentinelPath, 'utf8');
const errors = [];

const required = [
  ['canonical target', wrapper.includes('TARGET_WORKFLOW: ".github/workflows/g02-aws-sentinel.yml"')],
  ['fixed trusted ref', wrapper.includes('TARGET_REF: "main"') && !wrapper.includes('inputs.ref')],
  ['canonical job filter', wrapper.includes('select(.name == "g02-aws-runner-sentinel")')],
  ['canonical runner name assertion', sentinel.includes('test "$RUNNER_NAME" = "lingo-legacy-g02"')],
  ['canonical Linux/x64 assertions', sentinel.includes('test "$RUNNER_OS" = "Linux"') && sentinel.includes('test "$RUNNER_ARCH" = "X64"')],
  ['canonical runner labels', sentinel.includes('runs-on: [self-hosted, linux, x64, lingo-g02]')],
  ['manual dispatch available', /workflow_dispatch:\s*\n/.test(sentinel)],
  ['allocation API evidence check', sentinel.includes('runner_id') && sentinel.includes('runner_name') && sentinel.includes('steps')],
];

for (const [name, ok] of required) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  if (!ok) errors.push(name);
}

if (errors.length) {
  console.error(`G02_WRAPPER_CONTRACT=FAIL (${errors.join(', ')})`);
  process.exit(1);
}
console.log('G02_WRAPPER_CONTRACT=PASS');
