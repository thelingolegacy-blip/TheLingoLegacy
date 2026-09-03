import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2] || process.cwd();
const htmlFiles = [];

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === '.git' || ent.name === 'node_modules' || ent.name === 'release') continue;
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

let changed = 0;
const residual = [];

for (const file of htmlFiles) {
  const before = fs.readFileSync(file, 'utf8');
  let after = before.replace(insightsBlock, '\n');
  after = after.replace(/\bVercel\b/gi, 'Cloudflare');
  after = after.replace(/vercel\.app/gi, 'pages.dev');
  after = after.replace(/@vercel\//gi, '@cloudflare/');
  after = after.replace(/\/_vercel\//gi, '/_cloudflare/');
  after = after.replace(/vercel\.com/gi, 'cloudflare.com');
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed++;
  }
  for (const pattern of forbidden) if (pattern.test(after)) residual.push(`${path.relative(root, file)}: ${pattern}`);
}

if (residual.length) {
  console.error(JSON.stringify({ status: 'FAIL', changed, residual }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ status: 'PASS', htmlFileCount: htmlFiles.length, changed, retiredProviderReferences: 0 }, null, 2));
