import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export function validateFirebaseHostingScope(config) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new TypeError('firebase.json must contain a JSON object.');
  }
  if (Object.hasOwn(config, 'hosting')) {
    throw new Error('Firebase Hosting must remain unconfigured; Cloudflare is the canonical web delivery platform.');
  }
  return true;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const config = JSON.parse(fs.readFileSync('firebase.json', 'utf8'));
  validateFirebaseHostingScope(config);
  console.log('FIREBASE_HOSTING_SCOPE=PASS');
  console.log('FIREBASE_HOSTING=NOT_CONFIGURED');
}
