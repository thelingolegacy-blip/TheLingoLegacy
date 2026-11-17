import fs from 'node:fs';

const firebaseRc = JSON.parse(fs.readFileSync('.firebaserc', 'utf8'));
const aliases = firebaseRc?.projects ?? {};
const stagingProjectId = process.env.LINGO_FIREBASE_STAGING_PROJECT_ID?.trim();
const source = fs.readFileSync('lib/firebase_options.dart', 'utf8');
const blockers = [];

if (!stagingProjectId) {
  blockers.push('LINGO_FIREBASE_STAGING_PROJECT_ID is not configured; staging identity has not been approved.');
}
if (stagingProjectId === 'lingo-legacy-production') {
  blockers.push('The production project cannot be used as the staging project.');
}
if (Object.hasOwn(aliases, 'default')) {
  blockers.push('A default Firebase project alias is forbidden; deployment must never fall back to production.');
}
if (Object.values(aliases).includes('lingo-legacy-production')) {
  blockers.push('The production Firebase project must not appear in any project alias.');
}
if (stagingProjectId && aliases.staging !== stagingProjectId) {
  blockers.push('The staging alias must exactly match LINGO_FIREBASE_STAGING_PROJECT_ID.');
}
if (Object.keys(aliases).some((alias) => alias !== 'staging')) {
  blockers.push('Only the explicitly approved staging project alias is permitted.');
}

const placeholders = [...new Set(source.match(/YOUR_[A-Z0-9_]+/g) ?? [])];
if (placeholders.length) {
  blockers.push(`Firebase configuration placeholders remain: ${placeholders.join(', ')}.`);
}

if (blockers.length) {
  console.error('FLUTTER_FIREBASE_CONTRACT=BLOCKED');
  for (const blocker of blockers) console.error(`- ${blocker}`);
  process.exit(1);
}

console.log('FLUTTER_FIREBASE_CONTRACT=PASS');
console.log('FIREBASE_TARGET=staging');
