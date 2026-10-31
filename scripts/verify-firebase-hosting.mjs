import fs from 'node:fs';
import path from 'node:path';

const config = JSON.parse(fs.readFileSync('firebase.json', 'utf8'));
const publicDir = config?.hosting?.public;

if (publicDir !== 'build/web') {
  throw new Error(
    `Firebase Hosting must publish only the Flutter build output (expected build/web, got ${publicDir || 'missing'}).`,
  );
}

const repositoryRoot = path.resolve('.');
const publishRoot = path.resolve(repositoryRoot, publicDir);
if (!publishRoot.startsWith(repositoryRoot + path.sep)) {
  throw new Error('Firebase Hosting publish directory must remain inside the repository.');
}

const entrypoint = path.join(publishRoot, 'index.html');
if (!fs.existsSync(entrypoint) || !fs.statSync(entrypoint).isFile()) {
  throw new Error('Flutter web build output is missing build/web/index.html.');
}

console.log('FIREBASE_HOSTING_PUBLISH_BOUNDARY=PASS');
console.log('FIREBASE_HOSTING_PUBLIC_DIR=build/web');
console.log('FIREBASE_HOSTING_ENTRYPOINT=build/web/index.html');
