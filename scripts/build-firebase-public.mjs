import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(process.argv[2]||process.cwd());
const manifestPath=path.join(root,'config/firebase/hosting-public-manifest.json');
const buildRoot=path.join(root,'build');
const output=path.join(buildRoot,'firebase-public');
const errors=[];
const forbidden=/(^|\/)\.|\.(?:map|mjs|cjs|js|ts|tsx|jsx|dart|yaml|yml|toml|jsonc?|lock|pem|key|crt|p12|pfx|env|log)$/i;
function fail(message){errors.push(message);}
function inside(parent,candidate){const rel=path.relative(parent,candidate);return rel===''||(!rel.startsWith('..'+path.sep)&&rel!=='..'&&!path.isAbsolute(rel));}
function inspectSource(relative){
 if(typeof relative!=='string'||!relative||path.isAbsolute(relative)||relative.includes('\\')||relative.split('/').some(part=>!part||part==='.'||part==='..')){fail('invalid manifest path: '+String(relative));return null;}
 if(forbidden.test(relative)||relative.includes('\0')){fail('forbidden publication path: '+relative);return null;}
 const absolute=path.resolve(root,relative);if(!inside(root,absolute)){fail('path escapes repository: '+relative);return null;}
 let cursor=root;for(const part of relative.split('/')){cursor=path.join(cursor,part);if(!fs.existsSync(cursor)){fail('missing allowlisted file: '+relative);return null;}if(fs.lstatSync(cursor).isSymbolicLink()){fail('symlink rejected: '+relative);return null;}}
 if(!fs.statSync(absolute).isFile()){fail('not a regular file: '+relative);return null;}return absolute;
}
for (const [index, candidate] of [path.join(root, 'config'), path.dirname(manifestPath), manifestPath].entries()) {
 let stat;
 try { stat = fs.lstatSync(candidate); } catch (error) {
  if (error.code === 'ENOENT') throw new Error('Firebase publication manifest path is incomplete');
  throw error;
 }
 if (stat.isSymbolicLink()) throw new Error('Firebase publication manifest path must not contain symlinks');
 if (index < 2 && !stat.isDirectory()) throw new Error('Firebase publication manifest parent must be a directory');
 if (index === 2 && !stat.isFile()) throw new Error('Firebase publication manifest must be a regular file');
}
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
if(manifest.schemaVersion!=='1.0'||!Array.isArray(manifest.files))throw new Error('Invalid Firebase publication manifest schema');
if(!['QUARANTINED','REVIEWED'].includes(manifest.status))throw new Error('Invalid Firebase publication manifest status');
if(new Set(manifest.files).size!==manifest.files.length)fail('duplicate manifest paths are not allowed');
const sources=manifest.files.map(inspectSource).filter(Boolean);
if(errors.length){console.error(JSON.stringify({ok:false,gate:'FIREBASE_PUBLICATION_BOUNDARY',errors},null,2));process.exit(1);}
if(manifest.status!=='QUARANTINED')throw new Error('Firebase publication remains quarantined; reviewed publication requires a separately approved and verified publisher');
if(manifest.files.length)fail('QUARANTINED manifest must not publish customer files');
if(errors.length){console.error(JSON.stringify({ok:false,gate:'FIREBASE_PUBLICATION_BOUNDARY',errors},null,2));process.exit(1);}
try {
 const buildStat=fs.lstatSync(buildRoot);
 if(buildStat.isSymbolicLink()||!buildStat.isDirectory())throw new Error('build directory must be a real directory, not a symlink or special file');
} catch(error) {
 if(error.code!=='ENOENT')throw error;
 fs.mkdirSync(buildRoot);
}
if(!inside(fs.realpathSync(root),fs.realpathSync(buildRoot)))throw new Error('build directory resolves outside the repository');
fs.rmSync(output,{recursive:true,force:true});fs.mkdirSync(output);
for(let i=0;i<manifest.files.length;i++){const destination=path.resolve(output,manifest.files[i]);if(!inside(output,destination))throw new Error('output path escapes: '+manifest.files[i]);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.copyFileSync(sources[i],destination,fs.constants.COPYFILE_EXCL);}
if(!fs.existsSync(path.join(output,'404.html')))fs.writeFileSync(path.join(output,'404.html'),'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unavailable</title><main><h1>LINGOlegacy</h1><p>This Firebase Hosting surface is not published yet.</p></main></html>\n',{flag:'wx'});
const inventory=[];function walk(dir,prefix=''){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const rel=prefix?prefix+'/'+entry.name:entry.name,full=path.join(dir,entry.name);if(entry.isSymbolicLink())throw new Error('output symlink rejected: '+rel);if(entry.isDirectory())walk(full,rel);else if(entry.isFile())inventory.push(rel);else throw new Error('unsupported output entry: '+rel);}}
walk(output);const expected=[...manifest.files,...(manifest.files.includes('404.html')?[]:['404.html'])].sort();
if(JSON.stringify(inventory.sort())!==JSON.stringify(expected))throw new Error('Generated output inventory does not match manifest');
console.log(JSON.stringify({ok:true,gate:'FIREBASE_PUBLICATION_BOUNDARY',status:manifest.status,output:'build/firebase-public',inventory,publishedCustomerFiles:manifest.files.length},null,2));
