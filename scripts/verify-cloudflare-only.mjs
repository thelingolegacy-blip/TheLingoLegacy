import fs from 'node:fs';
import path from 'node:path';

// Protect the active execution/deployment surface. Historical documentation is
// retained for audit context, while executable/configuration paths remain fail-closed.
const forbidden = [
  /vercel\.json/i,
  /@vercel\//i,
  /vercel\.app/i,
  /VERCEL_[A-Z0-9_]+/i,
  /vercel\s+(?:deploy|build|env|link)/i,
  /vercel\.com/i,
  /_vercel\//i,
  /\bVercel web layer\b/i,
  /\bVercel deployment\b/i
];

const root = process.cwd();
const ignored = new Set(['.git', 'node_modules', 'release/evidence']);
const historicalOnly = new Set(['docs']);
const files = [];

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else files.push(path.relative(root, p));
  }
}
walk(root);

const findings = [];
for (const file of files) {
  if ([...historicalOnly].some((x) => file === x || file.startsWith(`${x}/`))) continue;
  if (file === 'scripts/verify-cloudflare-only.mjs') continue;
  let text;
  try { text = fs.readFileSync(path.join(root, file), 'utf8'); }
  catch { continue; }
  text.split('\n').forEach((line, i) => {
    if (forbidden.some((re) => re.test(line))) findings.push({ file, line: i + 1, text: line.trim().slice(0, 240) });
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
