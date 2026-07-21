const fs = require('fs');
const path = require('path');

const root = process.cwd();
const outDir = path.join(root, 'public');
const exclude = new Set(['.git', '.github', 'api', 'node_modules', 'public']);
const copyExtensions = new Set(['.html', '.css', '.js', '.mjs', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.ico', '.txt', '.xml', '.json', '.webmanifest', '.md', '.mp3', '.wav', '.aac', '.m4a', '.mp4', '.mov', '.webm', '.lottie', '.ttf', '.otf', '.woff', '.woff2', '.glb', '.fbx']);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function shouldCopy(file) {
  const relative = path.relative(root, file);
  const first = relative.split(path.sep)[0];
  if (exclude.has(first)) return false;
  return copyExtensions.has(path.extname(file));
}

function copyRecursive(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const src = path.join(dir, entry.name);
    const relative = path.relative(root, src);
    const first = relative.split(path.sep)[0];
    if (exclude.has(first)) continue;

    if (entry.isDirectory()) {
      copyRecursive(src);
      continue;
    }

    if (!entry.isFile() || !shouldCopy(src)) continue;

    const dest = path.join(outDir, relative);
    ensureDir(path.dirname(dest));
    fs.copyFileSync(src, dest);
  }
}

fs.rmSync(outDir, { recursive: true, force: true });
ensureDir(outDir);
copyRecursive(root);

if (!fs.existsSync(path.join(outDir, 'index.html'))) {
  throw new Error('public/index.html was not generated');
}

console.log(`Static site copied to ${path.relative(root, outDir)}`);
