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
