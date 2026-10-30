import fs from 'node:fs';
import path from 'node:path';
const read=p=>fs.readFileSync(p,'utf8');
const registry=JSON.parse(read('studio-sites/assets/world-registry.json'));
const config=JSON.parse(read('studio-sites/config/studio-config.json'));
const worker=read('worker.js');
const portal=read('studio-sites/index.html');
const expected=[
 ['virtual-library','studio-sites/virtual-library/index.html','/studio-sites/virtual-library/'],
 ['virtual-music-studio','studio-sites/virtual-music-studio/index.html','/studio-sites/virtual-music-studio/'],
 ['loyalty-lane-apparel','studio-sites/loyalty-lane-apparel/index.html','/studio-sites/loyalty-lane-apparel/'],
 ['loyalty-lane-designs','studio-sites/loyalty-lane-designs/index.html','/studio-sites/loyalty-lane-designs/'],
 ['loyalty-lane-cycle','studio-sites/loyalty-lane-cycle/index.html','/studio-sites/loyalty-lane-cycle/'],
 ['kottons-code','studio-sites/kottons-code/index.html','/studio-sites/kottons-code/'],
 ['operations','studio-sites/operations/index.html','/studio-sites/operations/']
];
const errors=[];
for(const [id,file,route] of expected){
 if(!fs.existsSync(file))errors.push('Missing surface: '+file);
 if(id!=='operations'&&!registry.worlds.some(w=>w.id===id||w.route===route))errors.push('World registry route missing: '+id);
 if(id==='operations'&&!portal.includes('href="operations/"'))errors.push('Operations Center not linked from flagship.');
}
for(const w of registry.worlds||[]){
 if(['preview-present','local-demo','local-prototype'].includes(w.surfaceState)){
  if(!w.sourcePath||!fs.existsSync(path.join('studio-sites',w.sourcePath)))errors.push('Registry source missing: '+w.id+' -> '+w.sourcePath);
 }
}
for(const key of ['virtualLibrary','virtualMusicStudio','loyaltyLaneApparel','loyaltyLaneDesigns','loyaltyLaneCycle','kottonsCode','operations']){
 if(!config.routes[key])errors.push('Studio route missing from config: '+key);
}
const manifest=JSON.parse(read('studio-sites/manifest.webmanifest'));
const rootManifest=JSON.parse(read('manifest.webmanifest'));
if(rootManifest.scope!=='/'||rootManifest.start_url!=='/')errors.push('Root PWA scope/start URL contract mismatch.');
if(!fs.existsSync('sw.js')||!fs.existsSync('pwa-register.js'))errors.push('Root-scope PWA service worker files missing.');
if(!worker.includes('href="/manifest.webmanifest"')||!worker.includes('src="/pwa-register.js"'))errors.push('Main Worker does not inject root-scope PWA metadata and registration.');
if(manifest.scope!=='/studio-sites/'||manifest.start_url!=='/studio-sites/')errors.push('PWA scope/start URL contract mismatch.');
if(!fs.existsSync('studio-sites/sw.js')||!fs.existsSync('studio-sites/pwa-register.js'))errors.push('PWA service worker registration assets missing.');
if(!fs.existsSync('studio-sites/assets/tv-navigation.js'))errors.push('TV remote navigation script missing.');
if(!fs.existsSync('platforms/webos/appinfo.json')||!fs.existsSync('platforms/tizen/config.xml'))errors.push('TV packaging metadata missing.');
if(!worker.includes('/api/v1/agents/catalog')||!worker.includes('autonomous_execution: false'))errors.push('Governed agent catalog API missing or autonomous execution is not disabled.');
if(config.services?.assistant?.aiInferenceEnabled!==false||config.services?.assistant?.writeAccess!==false)errors.push('askLINGO must remain guided-only until AI and write permissions are approved.');
if(config.services?.agents?.autonomousExecution!==false||config.services?.agents?.backgroundWorkers!==false)errors.push('Agent execution must remain disabled until explicitly provisioned.');
for(const platform of ['web','android','ios','webos','tizen'])if(!config.platforms?.[platform])errors.push('Platform readiness state missing: '+platform);
if(!portal.includes('href="virtual-library/"')||!portal.includes('href="virtual-music-studio/"'))errors.push('Flagship world entry points missing.');
if(errors.length){console.error('PLATFORM SURFACE CONTRACT FAILED\n- '+errors.join('\n- '));process.exit(1);}
console.log('PLATFORM_SURFACE_MATRIX=PASS');
console.log('CORE_WORLD_PAGES=PASS count='+expected.length);
console.log('WORLD_REGISTRY=PASS count='+registry.worlds.length);
console.log('PWA_FOUNDATION=PASS');
console.log('SMART_TV_FOUNDATION=PASS');
console.log('AGENT_GOVERNANCE=PASS');
