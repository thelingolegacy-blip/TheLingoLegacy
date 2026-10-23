import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const htmlFiles = [];
const failures = [];
const forbidden = [
  /\/_vercel\//i,
  /vercel\.app/i,
  /@vercel\//i,
  /vercel\s+(?:deploy|build|env|link)/i,
  /vercel\.com/i,
  /\bVercel\b/i,
];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    const relative = path.relative(root, full).split(path.sep).join('/');
    if (entry.isDirectory()) {
      if (relative === 'vercel-hard-lock' || relative.startsWith('vercel-hard-lock/')) continue;
      walk(full);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      htmlFiles.push({ full, relative });
    }
  }
}

walk(root);
for (const file of htmlFiles) {
  const source = fs.readFileSync(file.full, 'utf8');
  const scanText = source.replace(/\/vercel-hard-lock\//gi, '/historical-provider-lock/');
  for (const pattern of forbidden) {
    if (pattern.test(scanText)) {
      failures.push({ file: file.relative, pattern: String(pattern) });
    }
  }
}

const report = {
  gate: 'cloudflare-only-static-surface',
  mode: 'read-only',
  status: failures.length ? 'FAIL' : 'PASS',
  htmlFileCount: htmlFiles.length,
  changed: 0,
  failures,
  note: 'This gate never rewrites the working tree. Remove or update retired provider references in source and commit them before release.'
};
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exit(1);
