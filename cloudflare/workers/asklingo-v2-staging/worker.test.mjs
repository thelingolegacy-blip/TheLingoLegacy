import test from 'node:test';
import assert from 'node:assert/strict';
import worker, { runWorkersAi } from './worker.js';
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
  const configured={FIREBASE_PROJECT_ID:'lingo-staging-test',FIREBASE_WEB_API_KEY:'test-public-config-key',ASKLINGO_DB:{}};
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

test('configured route rejects malformed bearer tokens before database access', async () => {
  const configured={FIREBASE_PROJECT_ID:'lingo-staging-test',FIREBASE_WEB_API_KEY:'test-public-config-key',ASKLINGO_DB:{}};
  const r=await worker.fetch(new Request('https://staging.invalid/api/v1/ask-lingo/query',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer not-a-jwt'},body:JSON.stringify({message:'hello',surface:'web'})}),configured);
  assert.equal(r.status,401); assert.equal((await r.json()).error,'unauthorized');
});

test('query enforces payload limit on streamed bodies without Content-Length', async () => {
  const body=JSON.stringify({message:'x'.repeat(5000),surface:'web'});
  const stream=new ReadableStream({start(controller){controller.enqueue(new TextEncoder().encode(body));controller.close();}});
  const request=new Request('https://staging.invalid/api/v1/ask-lingo/query',{method:'POST',headers:{'Content-Type':'application/json'},body:stream,duplex:'half'});
  assert.equal(request.headers.get('content-length'),null);
  const r=await worker.fetch(request,{});
  assert.equal(r.status,413);
});

test('Workers AI inference remains disabled without explicit zero-spend confirmation', async () => {
  let called=false;
  const env={AI:{run:async()=>{called=true;return {response:'should not run'};}},ASKLINGO_PROVIDER:'cloudflare-workers-ai',ASKLINGO_MODEL_ID:'@cf/google/gemma-4-26b-a4b-it',ASKLINGO_INFERENCE_ENABLED:'true'};
  await assert.rejects(()=>runWorkersAi(env,'hello'),/provider_not_approved_or_configured/);
  assert.equal(called,false);
});

test('Workers AI adapter uses only the approved staging model and bounded output', async () => {
  let call;
  const env={
    AI:{run:async(model,options)=>{call={model,options};return {response:'Hello from askLINGO'};}},
    ASKLINGO_PROVIDER:'cloudflare-workers-ai',
    ASKLINGO_MODEL_ID:'@cf/google/gemma-4-26b-a4b-it',
    ASKLINGO_INFERENCE_ENABLED:'true',
    ASKLINGO_ZERO_SPEND_CONFIRMED:'true'
  };
  const result=await runWorkersAi(env,'hello');
  assert.equal(result.text,'Hello from askLINGO');
  assert.equal(call.model,'@cf/google/gemma-4-26b-a4b-it');
  assert.equal(call.options.max_tokens,512);
  assert.equal(call.options.temperature,0.4);
  assert.equal(call.options.messages[1].content,'hello');
});

test('Workers AI adapter rejects empty and oversized prompts', async () => {
  const env={AI:{run:async()=>({response:'unused'})},ASKLINGO_PROVIDER:'cloudflare-workers-ai',ASKLINGO_MODEL_ID:'@cf/google/gemma-4-26b-a4b-it',ASKLINGO_INFERENCE_ENABLED:'true',ASKLINGO_ZERO_SPEND_CONFIRMED:'true'};
  await assert.rejects(()=>runWorkersAi(env,''),/invalid_message/);
  await assert.rejects(()=>runWorkersAi(env,'x'.repeat(2001)),/invalid_message/);
});
