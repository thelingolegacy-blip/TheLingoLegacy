const TRANSITIONS = Object.freeze({
  CREATED: new Set(['ACCEPTED','REJECTED','BLOCKED','EXPIRED','CANCELLED']),
  ACCEPTED: new Set(['IN_PROGRESS','BLOCKED','EXPIRED','CANCELLED']),
  IN_PROGRESS: new Set(['READY_FOR_REVIEW','BLOCKED','EXPIRED','CANCELLED']),
  READY_FOR_REVIEW: new Set(['COMPLETED','REJECTED','BLOCKED','CANCELLED']),
  COMPLETED: new Set(), REJECTED: new Set(), BLOCKED: new Set(['IN_PROGRESS','CANCELLED']),
  EXPIRED: new Set(), CANCELLED: new Set()
});
const TERMINAL = new Set(['COMPLETED','REJECTED','EXPIRED','CANCELLED']);
function sameSet(a,b) { return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every(x => b.includes(x)); }
function stable(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
  return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + stable(value[k])).join(',') + '}';
}
function commandFingerprint(command) {
  return stable({to:command.to,scope:command.scope ?? null,allowedTools:command.allowedTools ?? null,prohibitedActions:command.prohibitedActions ?? null});
}
export function transitionHandoff(record, command, actor, options = {}) {
  if (!record || !command || !actor?.uid || !actor?.kind) throw new TypeError('handoff, command and authenticated actor are required');
  if (typeof command.idempotencyKey !== 'string' || !/^[A-Za-z0-9_-]{12,128}$/.test(command.idempotencyKey)) return { ok:false, code:'IDEMPOTENCY_KEY_REQUIRED' };
  if (command.idempotencyKey === record.lastIdempotencyKey) return record.lastCommandFingerprint === commandFingerprint(command) ? { ok:true, replayed:true } : { ok:false, code:'IDEMPOTENCY_KEY_REUSE' };
  if (TERMINAL.has(record.status)) return { ok:false, code:'TERMINAL_STATE' };
  if (Date.parse(record.expiresAt) <= (options.nowMs ?? Date.now()) && !['EXPIRED','CANCELLED'].includes(command.to)) return { ok:false, code:'HANDOFF_EXPIRED' };
  if (!TRANSITIONS[record.status]?.has(command.to)) return { ok:false, code:'INVALID_TRANSITION' };
  if (command.scope && !sameSet(command.scope, record.scope)) return { ok:false, code:'SCOPE_EXPANSION_DENIED' };
  if (command.allowedTools && !sameSet(command.allowedTools, record.allowedTools)) return { ok:false, code:'TOOL_SCOPE_EXPANSION_DENIED' };
  if (command.prohibitedActions && !record.prohibitedActions.every(x => command.prohibitedActions.includes(x))) return { ok:false, code:'PROHIBITION_REMOVAL_DENIED' };
  if (record.attempt >= 5 && command.to === 'IN_PROGRESS') return { ok:false, code:'RETRY_LIMIT' };
  if (command.to === 'ACCEPTED' && !(actor.kind === 'agent' && actor.agentId === record.receiverAgentId)) return { ok:false, code:'RECEIVER_ONLY' };
  if (command.to === 'COMPLETED' && !(actor.kind === 'human' && actor.uid === record.humanOwnerUid)) return { ok:false, code:'HUMAN_OWNER_ACCEPTANCE_REQUIRED' };
  if (command.to === 'REJECTED' && !(actor.kind === 'human' && actor.uid === record.humanOwnerUid)) return { ok:false, code:'HUMAN_OWNER_REJECTION_REQUIRED' };
  if (command.to === 'CANCELLED' && !(actor.kind === 'human' && actor.uid === record.humanOwnerUid)) return { ok:false, code:'HUMAN_OWNER_CANCELLATION_REQUIRED' };
  if (command.to === 'IN_PROGRESS' && !(actor.kind === 'agent' && actor.agentId === record.receiverAgentId)) return { ok:false, code:'RECEIVER_ONLY' };
  if (command.to === 'READY_FOR_REVIEW' && !(actor.kind === 'agent' && actor.agentId === record.receiverAgentId)) return { ok:false, code:'RECEIVER_ONLY' };
  if (command.to === 'BLOCKED' && !((actor.kind === 'human' && actor.uid === record.humanOwnerUid) || (actor.kind === 'agent' && [record.senderAgentId,record.receiverAgentId].includes(actor.agentId)))) return { ok:false, code:'PARTICIPANT_ONLY' };
  if (command.to === 'EXPIRED' && !((actor.kind === 'human' && actor.uid === record.humanOwnerUid) || (actor.kind === 'agent' && [record.senderAgentId,record.receiverAgentId].includes(actor.agentId)))) return { ok:false, code:'PARTICIPANT_ONLY' };
  const next = { ...record, status:command.to, version:(record.version || 0)+1,
    acceptedByUid:command.to === 'ACCEPTED' ? actor.uid : record.acceptedByUid,
    completedByUid:command.to === 'COMPLETED' ? actor.uid : record.completedByUid,
    attempt:command.to === 'IN_PROGRESS' ? (record.attempt || 0)+1 : (record.attempt || 0),
    lastIdempotencyKey:command.idempotencyKey,
    lastCommandFingerprint:commandFingerprint(command),
    updatedAt:new Date(options.nowMs ?? Date.now()).toISOString() };
  return { ok:true, replayed:false, record:next, event:{ type:'HANDOFF_TRANSITION', from:record.status, to:command.to, actorUid:actor.uid, handoffId:record.handoffId } };
}
export function assertNoHandoffCycle(parentHandoffId, ancestry = []) {
  if (!parentHandoffId) return { ok:true };
  if (ancestry.includes(parentHandoffId) || ancestry.length >= 8) return { ok:false, code:'DELEGATION_CYCLE_OR_DEPTH' };
  return { ok:true };
}
