import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2] || process.cwd();
const requiredFiles = [
  'index.html',
  '404.html',
  'robots.txt',
  'sitemap.xml',
  'worker.js',
  'wrangler.jsonc',
  'tapstich/index.html',
  'outer-crown-expansion/index.html',
  'full-entity-simulcast/index.html',
];

const errors = [];
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`missing required runtime file: ${file}`);
}

const worker = fs.readFileSync(path.join(root, 'worker.js'), 'utf8');
for (const token of [
  "url.pathname === '/healthz'",
  "url.pathname === '/api/v1/platform/status'",
  "url.pathname === '/api/v1/site/context'",
  'renderDynamicHtml',
  'env.ASSETS.fetch(request)',
]) {
  if (!worker.includes(token)) errors.push(`dynamic runtime contract missing: ${token}`);
}

const wrangler = fs.readFileSync(path.join(root, 'wrangler.jsonc'), 'utf8');
if (!wrangler.includes('"main": "worker.js"')) errors.push('Cloudflare Worker entrypoint is not worker.js');
if (!wrangler.includes('"binding": "ASSETS"')) errors.push('Cloudflare asset binding is missing');
if (wrangler.toLowerCase().includes('vercel')) errors.push('retired Vercel reference found in Wrangler configuration');

const robots = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
for (const bot of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Bytespider']) {
  if (!robots.includes(`User-agent: ${bot}`)) errors.push(`robots.txt missing AI crawler guard: ${bot}`);
}

const css = fs.readFileSync(path.join(root, 'assets/lingo-os.css'), 'utf8');
if (/z-index:\s*99999/.test(css)) errors.push('unsafe arbitrary z-index found');

console.log(JSON.stringify({ ok: errors.length === 0, mode: 'dynamic-cloudflare', errors }, null, 2));
if (errors.length) process.exit(1);
