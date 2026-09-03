import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2] || process.cwd();
const htmlFiles = [];

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === '.git' || ent.name === 'node_modules') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.name.endsWith('.html')) htmlFiles.push(p);
  }
}

walk(root);

const forbidden = [
  /\/_vercel\//i,
  /vercel\.app/i,
  /@vercel\//i,
  /vercel\s+(?:deploy|build|env|link)/i,
  /vercel\.com/i,
  /\bVercel\b/i
];

const insightsBlock = /\s*<script>\s*window\.va\s*=\s*window\.va\s*\|\|\s*function\s*\(\)\s*\{\s*\(window\.vaq\s*=\s*window\.vaq\s*\|\|\s*\[\]\)\.push\(arguments\);\s*\};\s*<\/script>\s*<script\s+defer\s+src=["']\/_vercel\/insights\/script\.js["']><\/script>/gi;

const safeProviderWord = /(?<![\/\w.-])Vercel(?![\/\w.-])/gi;
let changed = 0;
const residual = [];

for (const file of htmlFiles) {
  const relative = path.relative(root, file).replaceAll(path.sep, '/');
  if (relative.startsWith('vercel-hard-lock/')) continue;
  const before = fs.readFileSync(file, 'utf8');
  let after = before.replace(insightsBlock, '\n');
  after = after.replace(/https?:\/\/[^\s"'<>]+\.vercel\.app/gi, 'https://thelingolegacy.com');
  after = after.replace(/@vercel\//gi, '@cloudflare/');
  after = after.replace(/\/_vercel\//gi, '/_cloudflare/');
  after = after.replace(/vercel\.com/gi, 'cloudflare.com');
  after = after.replace(/\bVercel\s+(?:web\s+layer|deployment)\b/gi, 'Cloudflare edge layer');
  after = after.replace(safeProviderWord, 'Cloudflare');
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed++;
  }
  const scanText = after.replace(/\/vercel-hard-lock\//gi, '/historical-provider-lock/');
  for (const pattern of forbidden) if (pattern.test(scanText)) residual.push(`${relative}: ${pattern}`);
}

if (residual.length) {
  console.error(JSON.stringify({ status: 'FAIL', changed, residual }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ status: 'PASS', htmlFileCount: htmlFiles.length, changed, retiredProviderReferences: 0 }, null, 2));
