import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || process.cwd());
const configPath = path.join(root, 'wrangler.jsonc');
const errors = [];
const requiredExclusions = [
  '.github/', '.git/', '.wrangler/', 'config/', 'docs/', 'ops/', 'scripts/',
  'tests/', 'node_modules/', '.env*', '*.env', '*.md', '*.mjs', '*.cjs',
  '*.sh', '*.py', '*.yml', '*.yaml', '*.toml', '*.jsonc', '*.lock', '*.map',
  'worker.js', 'wrangler.jsonc',
];
const requiredPublicFiles = [
  'index.html', '404.html', 'robots.txt', 'sitemap.xml', 'manifest.webmanifest',
];

if (!fs.existsSync(configPath)) {
  errors.push('wrangler.jsonc: missing configuration');
} else {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const directory = config.assets?.directory;
    if (typeof directory !== 'string' || !directory.trim()) {
      errors.push('wrangler.jsonc: assets.directory is missing');
    } else {
      const assetRoot = path.resolve(root, directory);
      const ignorePath = path.join(assetRoot, '.assetsignore');
      if (!fs.existsSync(ignorePath)) {
        errors.push(`missing .assetsignore at configured asset root: ${path.relative(root, ignorePath)}`);
      } else {
        const entries = fs.readFileSync(ignorePath, 'utf8')
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter((line) => line && !line.startsWith('#'));
        const set = new Set(entries);
        for (const pattern of requiredExclusions) {
          if (!set.has(pattern)) errors.push(`.assetsignore missing required exclusion: ${pattern}`);
        }
        for (const publicPath of requiredPublicFiles) {
          if (set.has(publicPath) || set.has(`/${publicPath}`)) {
            errors.push(`.assetsignore must not exclude required public file: ${publicPath}`);
          }
        }
        if (set.has('assets/') || set.has('/assets/')) {
          errors.push('.assetsignore must not exclude the public assets/ directory');
        }
      }
    }
  } catch (error) {
    errors.push(`wrangler.jsonc: unable to parse configuration: ${error.message}`);
  }
}

if (errors.length) {
  console.error(JSON.stringify({ ok: false, gate: 'ASSET_PUBLICATION_SCOPE', errors }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({
  ok: true,
  gate: 'ASSET_PUBLICATION_SCOPE',
  assetDirectory: JSON.parse(fs.readFileSync(configPath, 'utf8')).assets.directory,
  requiredExclusionsVerified: requiredExclusions.length,
  publicEntrypointsPreserved: requiredPublicFiles,
  note: 'Static config guard only; a Wrangler dry-run and deployed-path probes remain required before release.',
}, null, 2));
