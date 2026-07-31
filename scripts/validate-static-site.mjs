import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.argv[2] || process.cwd();
const htmlFiles = [];
function walk(dir){
  for (const ent of fs.readdirSync(dir, {withFileTypes:true})){
    if (ent.name === '.git') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.name.endsWith('.html')) htmlFiles.push(p);
  }
}
walk(root);
const errors=[];
const warn=[];
function rel(p){return path.relative(root,p)||'.'}



function requireJsonObject(file, requiredTopLevelKeys = []) {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) { errors.push(`${file}: missing registry file`); return null; }
  try {
    const parsed = JSON.parse(fs.readFileSync(p, 'utf8'));
    for (const key of requiredTopLevelKeys) if (!(key in parsed)) errors.push(`${file}: missing top-level key ${key}`);
    return parsed;
  } catch (e) {
    errors.push(`${file}: invalid JSON: ${e.message}`);
    return null;
  }
}

const releaseManifest = requireJsonObject('config/release/lingo-legacy-v1.0.0-rc.json', ['schemaVersion', 'releaseName', 'includedSurfaces', 'verifiedGates', 'pendingHardLocks', 'rollbackReferences']);
if (releaseManifest) {
  if (releaseManifest.releaseName !== 'LINGO_LEGACY_v1.0.0_RC') errors.push('release manifest: unexpected releaseName');
  for (const route of ['/', '/living-universe/', '/studio-os/', '/production-lock/', '/launch-verification/', '/post-launch-ops/', '/release-notes/', '/live-test-run/', '/tester-feedback/', '/tester-invite/', '/social-launch-rollout/', '/launch-media-kit/', '/email-announcement/', '/day-one-monitoring/', '/launch-countdown/', '/live-beta-faq/', '/post-launch-recap/', '/beta-support/', '/rollback-drill/', '/content-calendar/']) {
    if (!(releaseManifest.includedSurfaces || []).includes(route)) errors.push(`release manifest missing surface: ${route}`);
  }
}

const canonRegistry = requireJsonObject('config/canon/canon-registry.json', ['schemaVersion', 'characters', 'brandRules']);
if (canonRegistry) {
  for (const character of ['Kotton', 'Kimba', 'Jada']) {
    if (!canonRegistry.characters?.[character]?.approved) errors.push(`canon registry: ${character} must be approved`);
  }
}
const designTokens = requireJsonObject('config/design/design-tokens.json', ['schemaVersion', 'colors', 'typography', 'spacing', 'breakpoints']);
if (designTokens && Number(designTokens.spacing?.minimumTouchTargetPx) < 48) errors.push('design tokens: minimum touch target must be at least 48px');
const iconRegistry = requireJsonObject('config/icons/icon-registry.json', ['schemaVersion', 'icons']);
if (iconRegistry) {
  const iconEntries = iconRegistry.icons || [];
  const icons = new Set(iconEntries.map((icon) => icon.id));
  for (const icon of ['home', 'wallet', 'games', 'shop', 'studio', 'profile', 'rewards']) if (!icons.has(icon)) errors.push(`icon registry missing ${icon}`);
  for (const icon of iconEntries) {
    if (!icon.path) errors.push(`icon registry ${icon.id || 'unknown'} missing path`);
    const iconPath = String(icon.path || '').replace(/^\//, '');
    if (iconPath && !fs.existsSync(path.join(root, iconPath))) errors.push(`icon registry path missing for ${icon.id}: ${icon.path}`);
  }
}
const assetRegistry = requireJsonObject('config/assets/asset-registry.json', ['schemaVersion', 'assets', 'requiredFields']);
if (assetRegistry) {
  for (const asset of assetRegistry.assets || []) {
    for (const field of assetRegistry.requiredFields || []) if (!(field in asset)) errors.push(`asset registry ${asset.assetId || 'unknown'} missing ${field}`);
  }
}

const envContractPath = path.join(root, 'config/production/env-contract.json');
if (fs.existsSync(envContractPath)) {
  let contract;
  try { contract = JSON.parse(fs.readFileSync(envContractPath, 'utf8')); }
  catch (e) { errors.push(`config/production/env-contract.json: invalid JSON: ${e.message}`); }
  if (contract) {
    const required = new Set((contract.requiredProduction || []).map((item) => item.key));
    for (const key of [
      'SITE_URL',
      'PUBLIC_SITE_URL',
      'STRIPE_SECRET_KEY',
      'STRIPE_PRICE_XP_PACK',
      'STRIPE_PRICE_MYSTERY_KEY_PACK',
      'STRIPE_PRICE_AVALON_BADGE_SET',
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_APP_ID',
    ]) {
      if (!required.has(key)) errors.push(`env contract missing required key: ${key}`);
    }
  }
}

for (const file of ['manifest.webmanifest','vercel.json']) {
  const p = path.join(root,file);
  if (fs.existsSync(p)) {
    try { JSON.parse(fs.readFileSync(p,'utf8')); } catch(e) { errors.push(`${file}: invalid JSON: ${e.message}`); }
  }
}
const sitemap = path.join(root,'sitemap.xml');
if (fs.existsSync(sitemap)) {
  const text = fs.readFileSync(sitemap,'utf8');
  const sitemapRoutes = new Set();
  let sitemapOrigin = '';
  for (const m of text.matchAll(/<loc>(.*?)<\/loc>/g)) {
    try {
      const url = new URL(m[1]);
      sitemapOrigin ||= url.origin;
      sitemapRoutes.add(url.pathname);
    } catch {
      errors.push(`sitemap.xml: invalid loc ${m[1]}`);
    }
  }
  for (const file of htmlFiles) {
    if (path.basename(file) !== 'index.html') continue;
    const routePath = rel(file).replace(/(^|\/)index\.html$/, '$1');
    const route = routePath ? `/${routePath}` : '/';
    if (!sitemapRoutes.has(route)) {
      errors.push(`sitemap.xml: missing route ${sitemapOrigin}${route}`);
    }
  }
}

for (const file of htmlFiles) {
  const text = fs.readFileSync(file,'utf8');
  const ids = new Set([...text.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]));
  let i=0;
  for (const m of text.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)) {
    i++;
    const code = m[1].trim();
    if (!code) continue;
    try { new vm.Script(code, {filename:`${rel(file)}#script${i}`}); }
    catch(e) { errors.push(`${rel(file)} script ${i}: ${e.message}`); }
  }
  for (const m of text.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)) {
    const raw = m[1];
    if (raw.includes('${')) continue;
    if (/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(raw)) continue;
    if (raw.startsWith('/_vercel/')) continue;
    if (raw.startsWith('#')) { if (raw.length > 1 && !ids.has(raw.slice(1))) errors.push(`${rel(file)}: missing anchor target ${raw}`); continue; }
    const [urlPath, hash] = raw.split('#');
    if (hash && !ids.has(hash) && (urlPath === '' || urlPath === path.posix.join('/', path.relative(root, file)).replace(/index\.html$/,''))) {
      errors.push(`${rel(file)}: missing anchor target #${hash}`);
    }
    if (!urlPath || urlPath.startsWith('//')) continue;
    let target;
    if (urlPath.startsWith('/')) target = path.join(root, urlPath);
    else target = path.join(path.dirname(file), urlPath);
    const exists = fs.existsSync(target) || fs.existsSync(path.join(target,'index.html')) || fs.existsSync(`${target}.html`);
    if (!exists) errors.push(`${rel(file)}: missing local asset/page ${raw}`);
  }
  if (!/<title>[^<]+<\/title>/i.test(text)) warn.push(`${rel(file)}: missing <title>`);
  if (!/name=["']description["']/i.test(text)) warn.push(`${rel(file)}: missing meta description`);
}

console.log(JSON.stringify({htmlFileCount: htmlFiles.length, errors, warn}, null, 2));
if (errors.length) process.exit(1);
