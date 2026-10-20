import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || process.cwd());
const errors = [];
function readJson(relativePath) {
  const file = path.join(root, relativePath);
  if (!fs.existsSync(file)) {
    errors.push(`${relativePath}: missing`);
    return null;
  }
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) {
    errors.push(`${relativePath}: invalid JSON: ${error.message}`);
    return null;
  }
}

const tokens = readJson('config/design/design-tokens.json');
const registry = readJson('config/icons/icon-registry.json');
const cssPath = path.join(root, 'assets/lingo-design-tokens.css');
let css = '';
if (!fs.existsSync(cssPath)) errors.push('assets/lingo-design-tokens.css: missing');
else css = fs.readFileSync(cssPath, 'utf8');

const requiredColors = {
  obsidian: '#050507',
  gold: '#f7c84b',
  royalPurple: '#6b2dff',
  cyan: '#56efff',
};
for (const [key, expected] of Object.entries(requiredColors)) {
  const actual = tokens?.colors?.[key];
  if (typeof actual !== 'string' || actual.toLowerCase() !== expected) errors.push(`design tokens color ${key}: expected ${expected}`);
}
const minimumTouchTarget = tokens?.spacing?.minimumTouchTargetPx;
if (typeof minimumTouchTarget !== 'number' || !Number.isFinite(minimumTouchTarget) || minimumTouchTarget < 48) {
  errors.push('design tokens: minimumTouchTargetPx must be a finite number of at least 48');
}
if (!tokens?.motion || tokens.motion.reducedMotion !== 'honor-prefers-reduced-motion') {
  errors.push('design tokens: reduced-motion policy missing');
}
for (const variable of [
  '--lingo-color-obsidian', '--lingo-color-gold', '--lingo-color-royal-purple',
  '--lingo-color-cyan', '--lingo-touch-target-min', '--lingo-motion-standard',
]) {
  if (!css.includes(variable)) errors.push(`shared CSS token missing: ${variable}`);
}
if (!css.includes('prefers-reduced-motion: reduce')) errors.push('shared CSS must honor prefers-reduced-motion');

if (registry && !Array.isArray(registry.icons)) errors.push('config/icons/icon-registry.json: icons must be an array');
const icons = Array.isArray(registry?.icons) ? registry.icons : [];
const ids = new Set();
for (const icon of icons) {
  if (!icon || typeof icon !== 'object' || Array.isArray(icon)) {
    errors.push('icon registry entries must be objects');
    continue;
  }
  if (typeof icon.id !== 'string' || !icon.id.trim() || ids.has(icon.id)) errors.push(`icon registry has missing or duplicate id: ${icon.id || '(empty)'}`);
  if (typeof icon.id === 'string' && icon.id.trim()) ids.add(icon.id);
  const relative = typeof icon.path === 'string' ? icon.path.replace(/^\//, '') : '';
  if (!relative || !fs.existsSync(path.join(root, relative))) errors.push(`icon asset missing for ${icon.id || '(unknown)'}: ${icon.path}`);
}
for (const id of ['home', 'wallet', 'games', 'shop', 'studio', 'profile', 'rewards']) {
  if (!ids.has(id)) errors.push(`canonical icon registry entry missing: ${id}`);
}

if (errors.length) {
  console.error(JSON.stringify({ ok: false, gate: 'SHARED_DESIGN_SYSTEM', errors }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({
  ok: true,
  gate: 'SHARED_DESIGN_SYSTEM',
  palette: ['obsidian', 'gold', 'royalPurple', 'cyan'],
  iconCount: ids.size,
  minimumTouchTargetPx: minimumTouchTarget,
  reducedMotion: 'verified',
  note: 'Static contract check only; browser visual, keyboard and screen-reader QA remain required.',
}, null, 2));
