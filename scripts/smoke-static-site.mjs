import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2] || process.cwd();
const requiredFiles = [
  'index.html',
  '404.html',
  'robots.txt',
  'sitemap.xml',
  'healthz',
  'wrangler.jsonc',
  'worker.js',
  'tapstich/index.html',
  'outer-crown-expansion/index.html',
  'full-entity-simulcast/index.html',
];

const errors = [];
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    errors.push(`missing required launch file: ${file}`);
  }
}

if (fs.existsSync(path.join(root, 'wrangler.jsonc'))) {
  const wrangler = fs.readFileSync(path.join(root, 'wrangler.jsonc'), 'utf8');
  for (const token of ['"name": "thelingolegacy"', '"main": "worker.js"', '"binding": "ASSETS"', '"pattern": "thelingolegacy.com/*"', '"pattern": "www.thelingolegacy.com/*"']) {
    if (!wrangler.includes(token)) errors.push(`wrangler contract missing: ${token}`);
  }
}

if (fs.existsSync(path.join(root, 'worker.js'))) {
  const worker = fs.readFileSync(path.join(root, 'worker.js'), 'utf8');
  for (const token of [
    "'strict-transport-security'",
    "'content-security-policy'",
    "'x-frame-options'",
    "'x-content-type-options'",
    "'referrer-policy'",
    "url.pathname === '/healthz'",
    "url.pathname.startsWith('/api/')",
  ]) {
    if (!worker.includes(token)) errors.push(`worker contract missing: ${token}`);
  }
}

if (fs.existsSync(path.join(root, 'robots.txt'))) {
  const robots = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
  for (const bot of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Bytespider']) {
    if (!robots.includes(`User-agent: ${bot}`)) {
      errors.push(`robots.txt missing AI crawler guard: ${bot}`);
    }
  }
}

const cssPath = path.join(root, 'assets/lingo-os.css');
if (fs.existsSync(cssPath)) {
  const css = fs.readFileSync(cssPath, 'utf8');
  if (/z-index:\s*99999/.test(css)) errors.push('unsafe arbitrary z-index found');
}

const legacyProviderFiles = ['vercel.json', 'netlify.toml'];
for (const file of legacyProviderFiles) {
  if (fs.existsSync(path.join(root, file))) errors.push(`retired provider configuration remains active: ${file}`);
}

console.log(JSON.stringify({ ok: errors.length === 0, errors }, null, 2));
if (errors.length) process.exit(1);
