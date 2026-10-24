import fs from 'node:fs';

const EXPECTED_PROJECT_ID = 'lingo-legacy-production';
const PLATFORMS = ['web', 'android', 'ios', 'macos'];
const REQUIRED_FIELDS = ['apiKey', 'appId', 'messagingSenderId', 'projectId'];
const PLACEHOLDERS = [
  'YOUR_WEB_API_KEY',
  'YOUR_WEB_APP_ID',
  'YOUR_ANDROID_API_KEY',
  'YOUR_ANDROID_APP_ID',
  'YOUR_IOS_API_KEY',
  'YOUR_IOS_APP_ID',
  'YOUR_MACOS_API_KEY',
  'YOUR_MACOS_APP_ID',
  'YOUR_MESSAGING_SENDER_ID',
];

function fail(messages) {
  console.error('FLUTTER_FIREBASE_CONTRACT=FAIL');
  for (const message of messages) console.error('- ' + message);
  process.exitCode = 1;
}

let firebaseRc;
let source;
try {
  firebaseRc = JSON.parse(fs.readFileSync('.firebaserc', 'utf8'));
  source = fs.readFileSync('lib/firebase_options.dart', 'utf8');
} catch (error) {
  fail(['Required Firebase configuration could not be read (' + (error.code || error.name) + ').']);
  process.exit();
}

const errors = [];
const projectId = firebaseRc && firebaseRc.projects && firebaseRc.projects.default;
if (projectId !== EXPECTED_PROJECT_ID) {
  errors.push('.firebaserc must select ' + EXPECTED_PROJECT_ID + '.');
}

const foundPlaceholders = PLACEHOLDERS.filter((value) => source.includes(value));
if (foundPlaceholders.length) {
  errors.push('Firebase configuration contains placeholders: ' + foundPlaceholders.join(', ') + '.');
}

const declarations = [...source.matchAll(
  /static\s+const\s+FirebaseOptions\s+(web|android|ios|macos)\s*=\s*FirebaseOptions\s*\(([\s\S]*?)\);/g,
)];
const byPlatform = new Map();
for (const [, platform, body] of declarations) {
  if (byPlatform.has(platform)) {
    errors.push('Duplicate FirebaseOptions declaration for ' + platform + '.');
    continue;
  }
  const fields = new Map();
  for (const [, field, value] of body.matchAll(/\b(apiKey|appId|messagingSenderId|projectId)\s*:\s*['"]([^'"]*)['"]/g)) {
    fields.set(field, value);
  }
  byPlatform.set(platform, fields);
}

for (const platform of PLATFORMS) {
  const fields = byPlatform.get(platform);
  if (!fields) {
    errors.push('Missing FirebaseOptions declaration for ' + platform + '.');
    continue;
  }
  for (const field of REQUIRED_FIELDS) {
    const value = fields.get(field);
    if (!value || /^YOUR_[A-Z0-9_]+$/.test(value)) {
      errors.push(platform + '.' + field + ' is missing or still a placeholder.');
    }
  }
  if (fields.has('projectId') && fields.get('projectId') !== EXPECTED_PROJECT_ID) {
    errors.push(platform + '.projectId does not match ' + EXPECTED_PROJECT_ID + '.');
  }
}

if (errors.length) {
  fail(errors);
} else {
  console.log('FLUTTER_FIREBASE_CONTRACT=PASS');
  console.log('FIREBASE_PROJECT_ID=' + EXPECTED_PROJECT_ID);
  console.log('FIREBASE_PLATFORM_CONFIGS=' + PLATFORMS.join(','));
}
