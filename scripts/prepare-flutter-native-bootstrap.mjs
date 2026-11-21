import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const target = path.join(root, 'build', 'native-bootstrap');
fs.mkdirSync(target, { recursive: true });

for (const entry of ['pubspec.yaml', 'lib', 'assets', 'test']) {
  const source = path.join(root, entry);
  if (!fs.existsSync(source)) {
    throw new Error(`Required Flutter source entry is missing: ${entry}`);
  }
  const destination = path.join(target, entry);
  fs.rmSync(destination, { recursive: true, force: true });
  fs.cpSync(source, destination, { recursive: true, force: true });
}

console.log('FLUTTER_NATIVE_BOOTSTRAP_SOURCE=PREPARED');
console.log(`FLUTTER_NATIVE_BOOTSTRAP_PATH=${path.relative(root, target)}`);
