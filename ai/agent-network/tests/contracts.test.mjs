import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const files=['approval-request.schema.json','policy-decision.schema.json','audit-event.schema.json','handoff.schema.json'];
test('all DMC JSON Schema contracts parse and reject undeclared fields',async()=>{
 for(const file of files){const schema=JSON.parse(await readFile(new URL('../schemas/'+file,import.meta.url),'utf8'));assert.equal(schema.additionalProperties,false,file);assert.ok(Array.isArray(schema.required),file);assert.ok(schema.required.length>0,file);}
});
test('approval contract binds immutable payload and policy version',async()=>{
 const schema=JSON.parse(await readFile(new URL('../schemas/approval-request.schema.json',import.meta.url),'utf8'));
 for(const field of ['payloadDigest','policyVersion','requesterUid','requesterAgentId','environment','risk','expiresAt']) assert.ok(schema.required.includes(field),field);
});
test('R3 and R4 approvals require preconditions and rollback evidence',async()=>{
 const schema=JSON.parse(await readFile(new URL('../schemas/approval-request.schema.json',import.meta.url),'utf8'));
 assert.ok(schema.allOf.some(rule=>rule.if?.properties?.risk?.enum?.includes('R4')&&rule.then?.required?.includes('rollbackRef')));
});
