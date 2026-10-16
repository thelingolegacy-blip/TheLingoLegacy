import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || process.cwd());
const configPath = path.join(root, 'wrangler.jsonc');
const errors = [];
const requiredExclusions = [
  '.github/', '.git/', '.wrangler/', 'config/', 'docs/', 'ops/', 'scripts/',
  'tests/', 'node_modules/', '.env*', '*.env', '*.md', '*.mjs', '*.cjs',
  '*.sh', '*.py', '*.yml', '*.yaml', '*.toml', '*.jsonc', '*.lock', '*.map',
  'worker.js', 'wrangler.jsonc', 'android/', 'ios/', 'lib/', 'infra/', 'cloudflare/',
  'diagnostics/', 'integration-os/', 'admin-command-center/', 'economy-command-center/',
  'firebase.json', 'firebase.client.json', 'firebase-worker.js', 'gateway-router.js',
  'pubspec.yaml', '_headers', '_redirects',
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

        // Preserve every route explicitly included by the release manifest.
        // This catches accidental exclusion of public operator/readiness pages
        // even when the required root entrypoints remain present.
        const manifestPath = path.join(root, 'config/release/lingo-legacy-v1.0.0-rc.json');
        if (!fs.existsSync(manifestPath)) {
          errors.push('release manifest missing: config/release/lingo-legacy-v1.0.0-rc.json');
        } else {
          try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            const routes = manifest.includedSurfaces;
            if (!Array.isArray(routes)) {
              errors.push('release manifest includedSurfaces must be an array');
            } else {
              for (const route of routes) {
                const normalizedRoute = String(route).replace(/^\\/+|\\/+$/g, '');
                for (const entry of entries) {
                  const normalizedEntry = entry.replace(/^\\/+|\\/+$/g, '');
                  if (!normalizedEntry) continue;
                  const excludesRoute = entry.endsWith('/')
                    ? normalizedRoute === normalizedEntry || normalizedRoute.startsWith(normalizedEntry + '/')
                    : normalizedRoute === normalizedEntry;
                  if (excludesRoute) {
                    errors.push(`.assetsignore entry "${entry}" conflicts with release-manifest route "${route}"`);
                  }
                }
              }
            }
          } catch (error) {
            errors.push(`release manifest parse failed: ${error.message}`);
          }
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
