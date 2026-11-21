import fs from 'node:fs';

const firebaseRc = JSON.parse(fs.readFileSync('.firebaserc', 'utf8'));
const aliases = firebaseRc?.projects ?? {};
const stagingProjectId = process.env.LINGO_FIREBASE_STAGING_PROJECT_ID?.trim();
const optionsSource = fs.readFileSync('lib/firebase_options.dart', 'utf8');
const appSource = fs.readFileSync('lib/main.dart', 'utf8');
const projectIds = [...optionsSource.matchAll(/projectId:\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);
const placeholders = [...new Set(optionsSource.match(/YOUR_[A-Z0-9_]+/g) ?? [])];
const blockers = [];

if (Object.hasOwn(aliases, 'default')) blockers.push('A default Firebase project alias is forbidden; deployment must never fall back to production.');
if (Object.values(aliases).includes('lingo-legacy-production')) blockers.push('The production Firebase project must not appear in any project alias.');
if (Object.keys(aliases).some((alias) => alias !== 'staging')) blockers.push('Only the explicitly approved staging project alias is permitted.');
if (projectIds.length === 0) blockers.push('Firebase options must declare a projectId for each configured platform.');
if (projectIds.includes('lingo-legacy-production')) blockers.push('Firebase options still reference the production project.');

if (!stagingProjectId) {
  if (placeholders.length === 0) blockers.push('Staging identity is missing while non-placeholder Firebase configuration exists.');
  if (Object.keys(aliases).length !== 0) blockers.push('Firebase aliases must remain empty until a staging identity is approved.');
  if (!optionsSource.includes('static bool get isConfigured') || !appSource.includes('if (DefaultFirebaseOptions.isConfigured)')) {
    blockers.push('Placeholder Firebase credentials require an explicit runtime initialization guard.');
  }
  if (projectIds.some((projectId) => projectId !== 'lingo-staging-not-configured')) {
    blockers.push('Unconfigured Firebase options must use only the non-routable staging placeholder project ID.');
  }
  if (blockers.length) {
    console.error('FLUTTER_FIREBASE_CONTRACT=BLOCKED');
    for (const blocker of blockers) console.error('- ' + blocker);
    process.exit(1);
  }
  console.log('FLUTTER_FIREBASE_CONTRACT=PASS');
  console.log('FIREBASE_INTEGRATION=DISABLED_PLACEHOLDER_CREDENTIALS');
  console.log('No Firebase project connection or production credential use is enabled.');
  process.exit(0);
}

if (stagingProjectId === 'lingo-legacy-production') blockers.push('The production project cannot be used as the staging project.');
if (placeholders.length) blockers.push('Firebase configuration placeholders remain: ' + placeholders.join(', ') + '.');
if (aliases.staging !== stagingProjectId) blockers.push('The staging alias must exactly match LINGO_FIREBASE_STAGING_PROJECT_ID.');
if (projectIds.some((projectId) => projectId !== stagingProjectId)) blockers.push('Every Firebase options projectId must exactly match the approved staging project ID.');

if (blockers.length) {
  console.error('FLUTTER_FIREBASE_CONTRACT=BLOCKED');
  for (const blocker of blockers) console.error('- ' + blocker);
  process.exit(1);
}
console.log('FLUTTER_FIREBASE_CONTRACT=PASS');
console.log('FIREBASE_TARGET=staging');
