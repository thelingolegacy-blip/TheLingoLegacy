import assert from 'node:assert/strict';
import test from 'node:test';
import { listAskLingoAgents, resolveAskLingoAgent, askLingoAgentMayExecute } from '../../src/ai/v2/agents.mjs';

test('registers twelve named specialist agents', () => {
  const agents = listAskLingoAgents();
  assert.equal(agents.length, 12);
  for (const id of ['core-orchestrator','research','architect','product','creative','engineering','data','marketing','support','security','qa-evidence','recovery-archivist']) {
    assert.equal(resolveAskLingoAgent(id)?.id, id);
  }
});

test('rejects unknown agent identities rather than fuzzy matching', () => {
  assert.equal(resolveAskLingoAgent('admin'), null);
  assert.equal(resolveAskLingoAgent(''), null);
  assert.equal(resolveAskLingoAgent(null), null);
});

test('all agents have no enabled tools or execution privileges in the foundation', () => {
  for (const agent of listAskLingoAgents()) {
    assert.deepEqual(agent.allowedTools, []);
    assert.equal(agent.executionEnabled, false);
    assert.equal(agent.mayApprove, false);
    assert.equal(agent.mayAuthorize, false);
    assert.equal(agent.mayPromote, false);
    assert.equal(agent.mayExecute, false);
    assert.equal(askLingoAgentMayExecute(agent), false);
  }
});

test('agent declarations do not replace server-side grants', () => {
  const research = resolveAskLingoAgent('research');
  assert.ok(research.declaredAnalyticalCapabilities.includes('CAN_ANALYZE'));
  assert.equal(research.dataScope, 'caller-provided-or-server-authorized-context-only');
  assert.deepEqual(research.allowedTools, []);
});
