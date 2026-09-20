import fs from 'node:fs';
import path from 'node:path';

// Fail closed on real executable/configuration coupling to retired Vercel.
// Descriptive references in documentation or UI copy are not execution paths.
const forbidden = [
  { pattern: /vercel\.json/i, reason: 'Vercel configuration file reference' },
  { pattern: /@vercel\//i, reason: 'Vercel package/import reference' },
  { pattern: /https?:\/\/[^\s"'<>]*vercel\.app/i, reason: 'Vercel deployment URL' },
  { pattern: /VERCEL_[A-Z0-9_]+/i, reason: 'Vercel environment variable' },
  { pattern: /\bvercel\s+(?:deploy|build|env|link)\b/i, reason: 'Vercel CLI command' },
  { pattern: /https?:\/\/[^\s"'<>]*vercel\.com/i, reason: 'Vercel service URL' },
  { pattern: /\/_vercel\//i, reason: 'Vercel runtime asset path' },
  { pattern: /window\.va\s*=|window\.vaq\s*=|_vercel\/insights/i, reason: 'Vercel analytics runtime' }
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
    for (const rule of forbidden) {
      if (rule.pattern.test(line)) {
        findings.push({ file, line: i + 1, reason: rule.reason, text: line.trim().slice(0, 240) });
        break;
      }
    }
  });
}

const result = {
  gate: 'cloudflare-only-runtime',
  status: findings.length ? 'FAIL' : 'PASS',
  executionPathClear: findings.length === 0,
  findings,
  checkedFiles: files.length,
  excludedHistoricalPaths: [...historicalOnly],
  policy: 'Only executable/configuration coupling to retired Vercel is blocking; descriptive historical references are non-blocking.'
};
console.log(JSON.stringify(result, null, 2));
if (result.status !== 'PASS') process.exit(1);
