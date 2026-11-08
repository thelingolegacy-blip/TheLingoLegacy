import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourcePath = 'cloudflare/flagship-root/worker.candidate.js';
const source = fs.readFileSync(path.join(root, sourcePath), 'utf8');
const homeMatch = source.match(/const HOME = ("(?:\\.|[^"\\])*");/);
if (!homeMatch) throw new Error('Could not parse HOME HTML string from ' + sourcePath);

const html = JSON.parse(homeMatch[1]);
const references = [...html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)]
  .map((match) => match[1])
  .filter((value) => value.startsWith('/') && !value.startsWith('//'));

const checked = [];
const missing = [];
for (const reference of references) {
  const pathname = reference.split(/[?#]/, 1)[0];
  if (!pathname || pathname === '/') continue; // The exact-root Worker serves this document.
  const relative = pathname.replace(/^\/+/, '');
  const base = path.resolve(root, relative);
  const candidates = pathname.endsWith('/')
    ? [path.join(base, 'index.html')]
    : [base, path.join(base, 'index.html')];
  const exists = candidates.some((candidate) => fs.existsSync(candidate));
  checked.push({ reference, exists });
  if (!exists) missing.push(reference);
}

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
for (const icon of manifest.icons || []) {
  const pathname = String(icon.src || '');
  if (!pathname.startsWith('/') || pathname.startsWith('//')) continue;
  const file = path.resolve(root, pathname.replace(/^\/+/, ''));
  const exists = fs.existsSync(file);
  checked.push({ reference: pathname, exists, source: 'manifest-icon' });
  if (!exists) missing.push(pathname);
}

const report = {
  gate: 'flagship-root-navigation',
  status: missing.length ? 'FAIL' : 'PASS',
  source: sourcePath,
  referencesChecked: checked.length,
  missing,
  note: 'Static path existence only; this does not prove live route behavior, backend availability, or production acceptance.'
};
console.log(JSON.stringify(report, null, 2));
if (missing.length) process.exitCode = 1;
