import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2] || process.cwd();
const requiredFiles = [
  'index.html',
  '404.html',
  'robots.txt',
  'sitemap.xml',
  'healthz',
  'vercel.json',
  'tapstich/index.html',
  'outer-crown-expansion/index.html',
];

const errors = [];
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    errors.push(`missing required launch file: ${file}`);
  }
}

const vercelConfig = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
const headers = vercelConfig.headers?.[0]?.headers ?? [];
const headerKeys = new Set(headers.map((header) => header.key.toLowerCase()));
for (const key of [
  'strict-transport-security',
  'content-security-policy',
  'x-frame-options',
  'x-content-type-options',
  'referrer-policy',
]) {
  if (!headerKeys.has(key)) errors.push(`missing security header: ${key}`);
}

const robots = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
for (const bot of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Bytespider']) {
  if (!robots.includes(`User-agent: ${bot}`)) {
    errors.push(`robots.txt missing AI crawler guard: ${bot}`);
  }
}

const css = fs.readFileSync(path.join(root, 'assets/lingo-os.css'), 'utf8');
if (/z-index:\s*99999/.test(css)) errors.push('unsafe arbitrary z-index found');

console.log(JSON.stringify({ ok: errors.length === 0, errors }, null, 2));
if (errors.length) process.exit(1);
