import test from 'node:test';
import assert from 'node:assert/strict';
import { createDmcAgentGateway } from '../src/agent-runtime-gateway.mjs';
test('gateway denies when no runtime transport is connected',async()=>assert.deepEqual(await createDmcAgentGateway(null).authorizeToolCall({action:'repo.write'}),{allowed:false,reason:'DMC_TRANSPORT_NOT_CONNECTED'}));
test('gateway denies transport failure',async()=>assert.deepEqual(await createDmcAgentGateway(async()=>{throw new Error('offline')}).authorizeToolCall({action:'repo.write'}),{allowed:false,reason:'DMC_GATEWAY_UNAVAILABLE'}));
test('gateway denies malformed response',async()=>assert.deepEqual(await createDmcAgentGateway(async()=>null).authorizeToolCall({action:'repo.write'}),{allowed:false,reason:'DMC_INVALID_RESPONSE'}));
test('gateway returns the server decision unchanged',async()=>assert.deepEqual(await createDmcAgentGateway(async()=>({data:{allowed:false,reason_code:'PRODUCTION_HOLD'}})).authorizeToolCall({action:'deploy'}),{allowed:false,reason_code:'PRODUCTION_HOLD'}));
