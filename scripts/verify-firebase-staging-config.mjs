const required = [
  'FIREBASE_STAGING_PROJECT_ID',
  'FIREBASE_STAGING_AUTH_DOMAIN',
  'FIREBASE_STAGING_API_KEY',
  'FIREBASE_STAGING_APP_ID',
  'FIREBASE_STAGING_MESSAGING_SENDER_ID',
];
const missing = required.filter((key) => {
  const value = process.env[key];
  return typeof value !== 'string' || !value.trim() || /REPLACE_WITH|YOUR_|CHANGE_ME/i.test(value);
});
if (missing.length) {
  console.error('FIREBASE_STAGING_CONFIG=BLOCKED');
  console.error('Missing or placeholder values: ' + missing.join(', '));
  process.exitCode = 1;
} else if (process.env.FIREBASE_STAGING_PROJECT_ID === 'lingo-legacy-production') {
  console.error('FIREBASE_STAGING_CONFIG=BLOCKED');
  console.error('Production Firebase project is forbidden for staging.');
  process.exitCode = 1;
} else {
  const projectId = process.env.FIREBASE_STAGING_PROJECT_ID;
  if (!/^[a-z0-9][a-z0-9-]{4,62}$/.test(projectId)) {
    console.error('FIREBASE_STAGING_CONFIG=BLOCKED');
    console.error('Staging project ID has an invalid format.');
    process.exitCode = 1;
  } else {
    console.log('FIREBASE_STAGING_CONFIG=PASS');
    console.log('FIREBASE_STAGING_PROJECT_ID=' + projectId);
  }
}
