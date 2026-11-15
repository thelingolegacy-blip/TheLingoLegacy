import test from 'node:test';
import assert from 'node:assert/strict';
import { transitionHandoff, assertNoHandoffCycle } from '../src/handoff-state-machine.mjs';
const record = { handoffId:'h-1', receiverAgentId:'qa-1', humanOwnerUid:'owner-1', scope:['repo:read'], allowedTools:['github.read'], prohibitedActions:['deploy','delete'], status:'CREATED', expiresAt:'2026-11-16T00:00:00Z', attempt:0, version:1 };
const receiver = { uid:'agent-qa', kind:'agent', agentId:'qa-1' };
const owner = { uid:'owner-1', kind:'human' };
test('rejects accept by non-receiver',()=>assert.equal(transitionHandoff(record,{to:'ACCEPTED',idempotencyKey:'idempotency-0003'}, {uid:'agent-other',kind:'agent',agentId:'engineering-1'}).code,'RECEIVER_ONLY'));
test('rejects scope expansion',()=>assert.equal(transitionHandoff(record,{to:'ACCEPTED',idempotencyKey:'idempotency-0004',scope:['repo:read','prod:write']},receiver).code,'SCOPE_EXPANSION_DENIED'));
test('rejects removal of prohibited actions',()=>assert.equal(transitionHandoff(record,{to:'ACCEPTED',idempotencyKey:'idempotency-0005',prohibitedActions:['deploy']},receiver).code,'PROHIBITION_REMOVAL_DENIED'));
test('accepts receiving agent then progresses',()=>{const accepted=transitionHandoff(record,{to:'ACCEPTED',idempotencyKey:'idempotency-0001'},receiver,{nowMs:now()});assert.equal(accepted.record.status,'ACCEPTED');});
test('rejects human completion without human owner acceptance',()=>assert.equal(transitionHandoff({...record,status:'READY_FOR_REVIEW'},{to:'COMPLETED',idempotencyKey:'idempotency-0006'}, {uid:'other',kind:'human'}).code,'HUMAN_OWNER_ACCEPTANCE_REQUIRED'));
test('rejects invalid transition',()=>assert.equal(transitionHandoff(record,{to:'COMPLETED',idempotencyKey:'idempotency-0007'},owner).code,'INVALID_TRANSITION'));
test('idempotent duplicate transition',()=>{const once=transitionHandoff(record,{to:'ACCEPTED',idempotencyKey:'idempotency-0002'},receiver);const twice=transitionHandoff(once.record,{to:'ACCEPTED',idempotencyKey:'idempotency-0002'},receiver);assert.equal(twice.replayed,true);});
test('detects delegation cycle/depth',()=>assert.equal(assertNoHandoffCycle('h-1',['h-1']).ok,false));
test('rejects expired handoff',()=>assert.equal(transitionHandoff({...record,expiresAt:'2026-11-14T00:00:00Z'},{to:'ACCEPTED',idempotencyKey:'idempotency-0008'},receiver,{nowMs:now()}).code,'HANDOFF_EXPIRED'));
function now(){return Date.parse('2026-11-15T12:00:00Z')}

test('rejects reuse of an idempotency key for a different transition',()=>{const once=transitionHandoff(record,{to:'ACCEPTED',idempotencyKey:'idempotency-0010'},receiver);const changed=transitionHandoff(once.record,{to:'IN_PROGRESS',idempotencyKey:'idempotency-0010'},receiver);assert.equal(changed.code,'IDEMPOTENCY_KEY_REUSE')});
test('rejects blocking by unrelated agent',()=>assert.equal(transitionHandoff(record,{to:'BLOCKED',idempotencyKey:'idempotency-0011'},{uid:'outsider',kind:'agent',agentId:'analytics-1'}).code,'PARTICIPANT_ONLY'));

test('rejects tool scope expansion',()=>assert.equal(transitionHandoff(record,{to:'ACCEPTED',idempotencyKey:'idempotency-0012',allowedTools:['github.read','cloudflare.deploy']},receiver).code,'TOOL_SCOPE_EXPANSION_DENIED'));
test('rejects retry after the bounded attempt budget',()=>assert.equal(transitionHandoff({...record,status:'BLOCKED',attempt:5},{to:'IN_PROGRESS',idempotencyKey:'idempotency-0013'},receiver).code,'RETRY_LIMIT'));
test('full handoff requires receiving agent then human owner acceptance',()=>{
 const accepted=transitionHandoff(record,{to:'ACCEPTED',idempotencyKey:'idempotency-0014'},receiver,{nowMs:now()});
 const active=transitionHandoff(accepted.record,{to:'IN_PROGRESS',idempotencyKey:'idempotency-0015'},receiver,{nowMs:now()});
 const review=transitionHandoff(active.record,{to:'READY_FOR_REVIEW',idempotencyKey:'idempotency-0016'},receiver,{nowMs:now()});
 const done=transitionHandoff(review.record,{to:'COMPLETED',idempotencyKey:'idempotency-0017'},owner,{nowMs:now()});
 assert.equal(done.record.status,'COMPLETED'); assert.equal(done.record.completedByUid,'owner-1');
});
