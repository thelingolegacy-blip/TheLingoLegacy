import fs from 'node:fs';
import path from 'node:path';
const configPath = process.argv[2] || 'firebase.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const publicDir = config.hosting?.public;
if (publicDir !== 'build/web') {
  console.error('Firebase Hosting must publish only Flutter build/web; refusing repository-root publication.');
  process.exit(1);
}
const resolved = path.resolve(publicDir);
const root = process.cwd();
if (resolved === root || !resolved.startsWith(root + path.sep)) {
  console.error('Firebase Hosting public directory escapes or equals the repository root.');
  process.exit(1);
}
console.log('Firebase Hosting publication boundary: PASS (build/web only).');
