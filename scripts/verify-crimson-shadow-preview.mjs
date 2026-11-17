import fs from 'node:fs';
const file = 'design-previews/crimson-shadow/index.html';
const errors = [];
if (!fs.existsSync(file)) errors.push(file + ': missing');
const html = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
for (const text of ['data-lingo-theme="crimson-shadow"', '../../assets/lingo-design-tokens.css', '../../assets/themes/crimson-shadow.css', 'Skip to content', 'aria-label="Primary navigation"', 'prefers-reduced-motion', 'non-redeemable', 'LINGOlegacy', 'LINGOlane', 'LINGOslots', 'LINGOarcade', 'LINGOlibrary', 'LINGOmedia', 'LINGOworld', 'LegacyXclub']) if (!html.includes(text)) errors.push('preview missing required contract: ' + text);
for (const prohibited of ['cash out', 'cash payout', 'real-money betting', 'win cash']) if (html.toLowerCase().includes(prohibited)) errors.push('preview contains prohibited wagering language: ' + prohibited);
if (errors.length) { console.error(JSON.stringify({ ok: false, gate: 'CRIMSON_SHADOW_PREVIEW', errors }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok: true, gate: 'CRIMSON_SHADOW_PREVIEW', staticOnly: true, productionIntegration: false }, null, 2));
