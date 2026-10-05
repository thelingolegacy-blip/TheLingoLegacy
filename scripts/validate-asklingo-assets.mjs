import fs from 'node:fs';

const files = [
  'ai/asklingo-modes.json',
  'assets/studio/manifests/books-audio.json',
  'assets/studio/manifests/asklingo-voice.json',
  'library/manifest.webmanifest'
];

for (const file of files) {
  const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!parsed.schema || !parsed.version) throw new Error(`${file}: schema/version missing`);
}

const modes = JSON.parse(fs.readFileSync('ai/asklingo-modes.json', 'utf8'));
for (const required of ['chat','research','generation','help','training','examples','teach','govern','law','medicine','firefighter','emt','law_enforcement']) {
  if (!modes.modes[required]) throw new Error(`Missing askLINGO mode: ${required}`);
}

const books = JSON.parse(fs.readFileSync('assets/studio/manifests/books-audio.json', 'utf8'));
if (books.books.length !== 7) throw new Error(`Expected 7 canonical books, found ${books.books.length}`);

const worker = fs.readFileSync('worker.js', 'utf8');
if (!worker.includes('/api/asklingo/realtime-token')) throw new Error('Realtime route missing');
if (!worker.includes('/api/asklingo/respond')) throw new Error('Response route missing');
if (!worker.includes('OPENAI_API_KEY')) throw new Error('OpenAI secret contract missing');

console.log('ASKLINGO_ASSET_CONTRACT=PASS');
console.log('ASKLINGO_MODES=13');
console.log('LINGO_BOOKS=7');

const libraryManifest = JSON.parse(fs.readFileSync('library/manifest.webmanifest', 'utf8'));
if (libraryManifest.short_name !== 'LINGOlibrary') throw new Error('LINGOlibrary manifest identity mismatch');
if (!Array.isArray(libraryManifest.icons) || libraryManifest.icons.length < 2) throw new Error('LINGOlibrary icon set incomplete');
for (const icon of ['assets/brand/lingolibrary/icon.svg','assets/brand/lingolibrary/icon-maskable.svg']) {
  const svg = fs.readFileSync(icon, 'utf8');
  if (!svg.includes('<svg')) throw new Error(`Invalid icon asset: ${icon}`);
}
if (workerHasLiteralEscapes(worker)) throw new Error('Worker contains literal escaped newlines in executable source');
const realtimeClient = fs.readFileSync('ai/asklingo-runtime.js', 'utf8');
if (realtimeClient.includes("type: 'session.update'")) throw new Error('Client must not override server-authoritative realtime instructions');
function workerHasLiteralEscapes(source) {
  return source.includes("\\\\n      if (url.pathname === '/api/asklingo");
}
