import assert from 'node:assert/strict';
import test from 'node:test';
import worker,{bearerTokenFromRequest,consumeApiRateLimit} from '../../cloudflare/workers/lingo-game-engine-staging.mjs';
function fakeDb(){const calls=[];return{calls,prepare(sql){calls.push(sql);return{bind(){return this;},async first(){if(sql.startsWith('SELECT 1'))return{ok:1};if(sql.includes('sqlite_master'))return{count:6};return null;}};}};}
test('Firebase bearer parser accepts standard and case-insensitive headers',()=>{const a=new Request('https://staging.invalid/',{headers:{authorization:'Bearer abc.def.ghi'}});const b=new Request('https://staging.invalid/',{headers:{authorization:'bearer   abc.def.ghi'}});assert.equal(bearerTokenFromRequest(a),'abc.def.ghi');assert.equal(bearerTokenFromRequest(b),'abc.def.ghi');});
test('Firebase bearer parser rejects absent or malformed credentials',()=>{assert.equal(bearerTokenFromRequest(new Request('https://staging.invalid/')),null);assert.equal(bearerTokenFromRequest(new Request('https://staging.invalid/',{headers:{authorization:'Bearer'}})),null);assert.equal(bearerTokenFromRequest(new Request('https://staging.invalid/',{headers:{authorization:'Basic abc'}})),null);});
test('health endpoint confirms staging D1 reachability without authentication',async()=>{const DB=fakeDb();const r=await worker.fetch(new Request('https://staging.invalid/healthz'),{DB,ENVIRONMENT:'staging'});assert.equal(r.status,200);assert.deepEqual(await r.json(),{status:'ok',environment:'staging',database:'connected',tableCount:6,rulesVersion:'staging-5x3-demo-v3'});});
test('wallet and game routes fail closed without a valid staging Firebase tenant',async()=>{for(const project of [undefined,'lingo-legacy-production']){const DB=fakeDb(),env={DB,ENVIRONMENT:'staging'};if(project)env.FIREBASE_PROJECT_ID=project;const r=await worker.fetch(new Request('https://staging.invalid/api/v1/wallet/balance',{headers:{authorization:'Bearer syntactically.valid.but.untrusted'}}),env);assert.equal(r.status,401);assert.deepEqual(await r.json(),{error:'UNAUTHORIZED'});assert.equal(DB.calls.length,0);}});
test('unknown routes return 404',async()=>{const r=await worker.fetch(new Request('https://staging.invalid/no-such-route'),{DB:fakeDb(),ENVIRONMENT:'staging'});assert.equal(r.status,404);});

test('CORS preflight allows only explicitly configured staging origins',async()=>{const env={DB:fakeDb(),ENVIRONMENT:'staging',STAGING_ALLOWED_ORIGINS:'https://thelingolegacy.com,https://www.thelingolegacy.com'};const allowed=await worker.fetch(new Request('https://staging.invalid/api/v1/wallet/balance',{method:'OPTIONS',headers:{Origin:'https://thelingolegacy.com','Access-Control-Request-Method':'GET'}}),env);assert.equal(allowed.status,204);assert.equal(allowed.headers.get('access-control-allow-origin'),'https://thelingolegacy.com');const denied=await worker.fetch(new Request('https://staging.invalid/api/v1/wallet/balance',{method:'OPTIONS',headers:{Origin:'https://evil.invalid'}}),env);assert.equal(denied.status,403);});


test('per-user D1 rate limiter allows 60 requests and rejects the 61st in a fixed window',async()=>{
 let activeWindow=null,count=0,lastSql='';
 const DB={prepare(sql){lastSql=sql;return{bind(uid,windowEpoch){if(uid!=='firebase-user-001')throw new Error('unexpected uid');if(activeWindow!==windowEpoch){activeWindow=windowEpoch;count=0;}return this;},async first(){count+=1;return{request_count:count};}};}};
 for(let i=0;i<60;i++)assert.equal(await consumeApiRateLimit(DB,'firebase-user-001',1_800_000_000_000),true);
 assert.equal(await consumeApiRateLimit(DB,'firebase-user-001',1_800_000_000_000),false);
 assert.equal(await consumeApiRateLimit(DB,'firebase-user-001',1_800_000_060_000),true);
 assert.match(lastSql,/ON CONFLICT\\(firebase_uid\\) DO UPDATE/);
 assert.match(lastSql,/RETURNING request_count/);
});
