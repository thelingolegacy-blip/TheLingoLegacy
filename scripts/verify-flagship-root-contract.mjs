import fs from 'node:fs';
const source=fs.readFileSync('cloudflare/lingo-flagship-root.js','utf8');
const checks=[
 ['root worker handler',source.includes('export default { async fetch(request)')],
 ['crimson flagship palette',source.includes('--gold:#EF334B')&&source.includes('--gold2:#F5F5F6')],
 ['universal askLINGO dock',source.includes('/studio-sites/assets/asklingo-dock.js')&&source.includes('/studio-sites/assets/asklingo-dock.css')],
 ['root PWA manifest',source.includes('/manifest.webmanifest')&&source.includes('/pwa-register.js')],
 ['virtual library route',source.includes('/studio-sites/virtual-library/')],
 ['virtual music route',source.includes('/studio-sites/virtual-music-studio/')],
 ['Kottons Code route',source.includes('/studio-sites/kottons-code/')],
 ['Loyalty Lane apparel route',source.includes('/studio-sites/loyalty-lane-apparel/')],
 ['Loyalty Lane Designs route',source.includes('/studio-sites/loyalty-lane-designs/')],
 ['Loyalty Lane Cycle route',source.includes('/studio-sites/loyalty-lane-cycle/')],
 ['operations route',source.includes('/studio-sites/operations/')],
 ['assistant opens from catalog',source.includes("document.getElementById('ask-l-dock')?.click()")]
];
const failed=checks.filter(([,ok])=>!ok);
if(failed.length){console.error('FLAGSHIP ROOT CONTRACT FAILED\n- '+failed.map(([name])=>name).join('\n- '));process.exit(1)}
console.log('FLAGSHIP_ROOT_CONTRACT=PASS');
console.log('ASKLINGO_ROOT_INTEGRATION=PASS');
console.log('CORE_DESTINATION_ROUTES=PASS');
