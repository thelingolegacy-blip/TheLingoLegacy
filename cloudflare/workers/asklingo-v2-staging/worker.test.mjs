import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.js';
const env = {};
test('health is fail-closed when identity and D1 are not configured', async () => {
  const r=await worker.fetch(new Request('https://staging.invalid/_health'),env);
  assert.equal(r.status,503); const body=await r.json();
  assert.equal(body.inference,false); assert.equal(body.conversation_persistence,false); assert.equal(body.operational_actions,false); assert.equal(body.ready_for_query,false);
});
test('unknown routes do not expose an execution surface', async () => {
  const r=await worker.fetch(new Request('https://staging.invalid/api/v1/unknown'),env);
  assert.equal(r.status,404); assert.equal((await r.json()).error,'not_found');
});
test('query route rejects non-POST methods', async () => {
  const r=await worker.fetch(new Request('https://staging.invalid/api/v1/ask-lingo/query'),env);
  assert.equal(r.status,405);
});
test('query route requires JSON content type', async () => {
  const r=await worker.fetch(new Request('https://staging.invalid/api/v1/ask-lingo/query',{method:'POST',body:'hello'}),env);
  assert.equal(r.status,415);
});
test('query route rejects malformed JSON', async () => {
  const r=await worker.fetch(new Request('https://staging.invalid/api/v1/ask-lingo/query',{method:'POST',headers:{'Content-Type':'application/json'},body:'{' }),env);
  assert.equal(r.status,400);
});
test('query route rejects oversized requests', async () => {
  const body=JSON.stringify({message:'x'.repeat(5000),surface:'web'});
  const r=await worker.fetch(new Request('https://staging.invalid/api/v1/ask-lingo/query',{method:'POST',headers:{'Content-Type':'application/json'},body}),env);
  assert.equal(r.status,413);
});
test('query route refuses to operate without identity and database configuration', async () => {
  const r=await worker.fetch(new Request('https://staging.invalid/api/v1/ask-lingo/query',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:'hello',surface:'web'})}),env);
  assert.equal(r.status,503); assert.equal((await r.json()).error,'identity_or_database_not_configured');
});
test('configured route rejects missing bearer identity', async () => {
  const configured={FIREBASE_PROJECT_ID:'lingo-staging-test',ASKLINGO_DB:{}};
  const r=await worker.fetch(new Request('https://staging.invalid/api/v1/ask-lingo/query',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:'hello',surface:'web'})}),configured);
  assert.equal(r.status,401);
});
test('CORS rejects an unconfigured origin', async () => {
  const r=await worker.fetch(new Request('https://staging.invalid/_health',{headers:{Origin:'https://attacker.invalid'}}),env);
  assert.equal(r.status,403);
});
test('configured CORS preflight is explicit and bodyless', async () => {
  const r=await worker.fetch(new Request('https://staging.invalid/api/v1/ask-lingo/query',{method:'OPTIONS',headers:{Origin:'https://staging.thelingolegacy.com'}}),{ASKLINGO_ALLOWED_ORIGINS:'https://staging.thelingolegacy.com'});
  assert.equal(r.status,204); assert.equal(r.headers.get('Access-Control-Allow-Origin'),'https://staging.thelingolegacy.com');
  assert.equal(await r.text(),'');
});
test('query rejects client-supplied conversation identifiers and extra fields', async () => {
  const configured={FIREBASE_PROJECT_ID:'lingo-staging-test',ASKLINGO_DB:{}};
  for (const payload of [{message:'hello',surface:'web',conversation_id:'client-id'},{message:'hello',surface:'web',user_id:'forged'}]) {
    const r=await worker.fetch(new Request('https://staging.invalid/api/v1/ask-lingo/query',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}),configured);
    assert.equal(r.status,400);
  }
});
