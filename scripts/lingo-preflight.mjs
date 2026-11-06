import fs from 'node:fs';
import path from 'node:path';

const failures = [];
const checks = [];
const pass = (id, detail) => checks.push({ id, status: 'PASS', detail });
const fail = (id, detail) => { checks.push({ id, status: 'FAIL', detail }); failures.push(id); };
const read = (file) => fs.readFileSync(file, 'utf8');

for (const file of ['wrangler.jsonc', '.assetsignore', 'firebase.json', 'worker.js', 'lib/firebase_options.dart']) {
  if (!fs.existsSync(file)) fail(`required-file:${file}`, 'required file is missing');
  else pass(`required-file:${file}`, 'present');
}

let wrangler = {};
try {
  wrangler = JSON.parse(read('wrangler.jsonc'));
  pass('wrangler-json', 'Wrangler config parses as JSON-compatible configuration');
} catch (error) {
  fail('wrangler-json', error.message);
}

if (wrangler.name !== 'thelingolegacyv-5') fail('worker-name', `unexpected Worker name: ${wrangler.name || 'missing'}`);
else pass('worker-name', wrangler.name);

if (wrangler.main !== 'worker.js') fail('worker-entrypoint', 'production entrypoint must remain worker.js');
else pass('worker-entrypoint', 'worker.js');

const assetsIgnore = fs.existsSync('.assetsignore') ? read('.assetsignore') : '';
for (const pattern of ['**/firebase-functions/', '**/*.rules', '**/tsconfig.json', '**/catalog-seed.json', '**/.env*', '**/service-account*.json', '**/firebase-adminsdk*.json']) {
  if (assetsIgnore.split(/\r?\n/).some((line) => line.trim() === pattern)) pass(`asset-exclusion:${pattern}`, 'present');
  else fail(`asset-exclusion:${pattern}`, 'required exclusion missing from .assetsignore');
}

let firebase = {};
try {
  firebase = JSON.parse(read('firebase.json'));
  pass('firebase-json', 'Firebase config parses as JSON');
} catch (error) {
  fail('firebase-json', error.message);
}
const firebaseIgnore = new Set(firebase.hosting?.ignore || []);
for (const pattern of ['**/firebase-functions/**', '**/*.rules', '**/tsconfig.json', '**/catalog-seed.json', '**/.env*', '**/service-account*.json', '**/firebase-adminsdk*.json']) {
  if (firebaseIgnore.has(pattern)) pass(`firebase-exclusion:${pattern}`, 'present');
  else fail(`firebase-exclusion:${pattern}`, 'required Firebase Hosting exclusion missing');
}

const source = fs.existsSync('lib/firebase_options.dart') ? read('lib/firebase_options.dart') : '';
const firebasePlaceholders = ['YOUR_WEB_API_KEY', 'YOUR_WEB_APP_ID', 'YOUR_MESSAGING_SENDER_ID', 'YOUR_ANDROID_API_KEY', 'YOUR_ANDROID_APP_ID', 'YOUR_IOS_API_KEY', 'YOUR_IOS_APP_ID', 'YOUR_MACOS_API_KEY', 'YOUR_MACOS_APP_ID'];
const unresolved = firebasePlaceholders.filter((value) => source.includes(value));
checks.push({
  id: 'firebase-production-credentials',
  status: unresolved.length ? 'BLOCKED' : 'PASS',
  detail: unresolved.length ? `Production Firebase config is incomplete: ${unresolved.join(', ')}. Do not deploy the app.` : 'No known placeholder credentials remain.'
});

const workflowDir = '.github/workflows';
if (fs.existsSync(workflowDir)) {
  const files = fs.readdirSync(workflowDir).filter((name) => /\.(yml|yaml)$/.test(name));
  let unsafe = [];
  for (const name of files) {
    const content = read(path.join(workflowDir, name));
    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      if (/runs-on:\s*\[self-hosted,\s*linux,\s*x64,\s*lingo-g02\]/.test(lines[i])) {
        const jobPrefix = lines.slice(Math.max(0, i - 12), i).join('\n');
        if (!/if:\s*\$\{\{\s*false\s*\}\}/.test(jobPrefix)) unsafe.push(`${name}:${i + 1}`);
      }
    }
  }
  if (unsafe.length) fail('public-g02-isolation', `public workflows still target persistent G02: ${unsafe.join(', ')}`);
  else pass('public-g02-isolation', 'no active public workflow targets persistent G02');
}

const result = {
  gate: 'LINGO_LOCAL_PREFLIGHT',
  status: failures.length ? 'FAIL' : 'PASS',
  checks,
  failures,
  releaseStatus: unresolved.length ? 'BLOCKED' : 'READY_FOR_SEPARATE_REVIEW',
  releaseNote: unresolved.length ? 'Firebase is still a separate release blocker.' : 'Static preflight does not authorize production deployment.',
  disclaimer: 'Local/static checks only; no cloud account, runner, deployment, live endpoint, or production health is verified.'
};
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
