import { execFileSync } from 'node:child_process';

// Protect the active execution/deployment surface. Historical audit material is
// excluded; executable/configuration paths remain fail-closed.
const forbidden = [
  /vercel\.json/i,
  /@vercel\//i,
  /vercel\.app/i,
  /VERCEL_[A-Z0-9_]+/i,
  /vercel\s+(?:deploy|build|env|link)/i,
  /vercel\.com/i,
  /_vercel\//i
];

const ignored = new Set(['.git', 'node_modules', 'release/evidence']);
const historicalOnly = new Set(['docs/archive']);

const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  .split('\n').filter(Boolean)
  .filter((p) => ![...ignored].some((x) => p === x || p.startsWith(`${x}/`)))
  .filter((p) => ![...historicalOnly].some((x) => p === x || p.startsWith(`${x}/`)));

const findings = [];
for (const file of files) {
  if (file === 'scripts/verify-cloudflare-only.mjs') continue;
  let text;
  try {
    text = execFileSync('git', ['show', `HEAD:${file}`], {
      encoding: 'utf8', maxBuffer: 10 * 1024 * 1024
    });
  } catch { continue; }
  text.split('\n').forEach((line, i) => {
    if (forbidden.some((re) => re.test(line))) {
      findings.push({ file, line: i + 1, text: line.trim().slice(0, 240) });
    }
  });
}

const result = {
  gate: 'cloudflare-only-runtime',
  status: findings.length ? 'FAIL' : 'PASS',
  executionPathClear: findings.length === 0,
  findings,
  checkedFiles: files.length,
  excludedHistoricalPaths: [...historicalOnly]
};
console.log(JSON.stringify(result, null, 2));
if (findings.length) process.exit(1);
