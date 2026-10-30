import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const worker = fs.readFileSync(path.join(root,'worker.js'),'utf8');
const portal = fs.readFileSync(path.join(root,'studio-sites/index.html'),'utf8');
const registry = JSON.parse(fs.readFileSync(path.join(root,'studio-sites/config/studio-world-registry.json'),'utf8'));
const checks = [
  ['registry asset path',worker.includes('/studio-sites/config/studio-world-registry.json')],
  ['asset binding access',worker.includes('env.ASSETS.fetch')],
  ['collection endpoint',worker.includes("url.pathname === '/api/v1/studios/worlds'")],
  ['individual world endpoint',worker.includes('/api/v1/studios/worlds/')],
  ['method guard',worker.includes("request.method !== 'GET'")],
  ['unavailable registry fails closed',worker.includes('Studio world registry is not available')],
  ['missing world returns 404',worker.includes('Studio world not found.')],
  ['portal requests edge registry',portal.includes("fetch('/api/v1/studios/worlds'")],
  ['portal has static preview fallback',portal.includes('/studio-sites/config/studio-world-registry.json')],
  ['portal does not activate unverified external links',portal.includes("String(world.route||'').startsWith('/studio-sites/')")]
];
const failed = checks.filter(([,ok])=>!ok);
if(failed.length){console.error('STUDIO WORLD API CONTRACT FAILED\n- '+failed.map(([name])=>name).join('\n- '));process.exit(1);}
if(!Array.isArray(registry.worlds)||registry.worlds.length<15)throw new Error('Studio world registry is incomplete.');
console.log('STUDIO_WORLD_API_CONTRACT=PASS');
console.log('STUDIO_WORLD_COUNT='+registry.worlds.length);
