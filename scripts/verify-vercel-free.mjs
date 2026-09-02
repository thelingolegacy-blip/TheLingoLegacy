import { execFileSync } from 'node:child_process';

// This gate protects the active execution/deployment surface. Historical audit
// documents may mention the migration that is being audited and are excluded
// from the runtime scan; active configuration and executable files are not.
const forbidden = [
  /vercel\.json/i,
  /@vercel\//i,
  /vercel\.app/i,
  /VERCEL_[A-Z0-9_]+/i,
  /vercel\s+(?:deploy|build|env|link)/i,
  /vercel\.com/i
];

const ignored = new Set(['.git', 'node_modules', 'release/evidence']);
const historicalOnly = new Set([
  'docs',
  'vercel-hard-lock'
]);

const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  .split('\n').filter(Boolean)
  .filter((p) => ![...ignored].some((x) => p === x || p.startsWith(`${x}/`)))
  .filter((p) => ![...historicalOnly].some((x) => p === x || p.startsWith(`${x}/`)));

const findings = [];
for (const file of files) {
  // Never scan this gate against its own forbidden-pattern definitions.
  if (file === 'scripts/verify-vercel-free.mjs') continue;
  let text;
  try {
    text = execFileSync('git', ['show', `HEAD:${file}`], {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024
    });
  } catch {
    continue;
  }
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    if (forbidden.some((re) => re.test(line))) {
      findings.push({ file, line: i + 1, text: line.trim().slice(0, 240) });
    }
  });
}

const result = {
  gate: 'vercel-eradication',
  status: findings.length ? 'FAIL' : 'PASS',
  executionPathClear: findings.length === 0,
  findings,
  checkedFiles: files.length,
  excludedHistoricalPaths: [...historicalOnly]
};
console.log(JSON.stringify(result, null, 2));
if (findings.length) process.exit(1);
