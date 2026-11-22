const DECLARED_ANALYTICAL_CAPABILITIES = Object.freeze([
  'CAN_ANSWER', 'CAN_ANALYZE', 'CAN_RECOMMEND', 'CAN_PREPARE', 'CAN_REQUEST_AUTHORIZATION'
]);

const DEFINITIONS = [
  ['core-orchestrator', 'Core Orchestrator', 'Classify intent, route bounded analysis, and synthesize responses.'],
  ['research', 'Research', 'Discover and synthesize authorized sources with provenance.'],
  ['architect', 'Architect', 'Design product, platform, and system architecture.'],
  ['product', 'Product', 'Develop requirements, roadmaps, and acceptance criteria.'],
  ['creative', 'Creative', 'Prepare writing, story, brand, and media concepts.'],
  ['engineering', 'Engineering', 'Inspect code and prepare scoped implementation proposals.'],
  ['data', 'Data', 'Analyze approved datasets and validate analytical methods.'],
  ['marketing', 'Marketing', 'Prepare campaign, audience, and content strategies.'],
  ['support', 'Support', 'Explain products and assist with approved public knowledge.'],
  ['security', 'Security', 'Perform threat modeling and policy analysis.'],
  ['qa-evidence', 'QA and Evidence', 'Prepare tests and assess evidence against declared criteria.'],
  ['recovery-archivist', 'Recovery Archivist', 'Inventory assets, preserve provenance, and prepare recovery plans.']
];

const REGISTRY = Object.freeze(Object.fromEntries(DEFINITIONS.map(([id, name, purpose]) => [
  id,
  Object.freeze({
    id,
    name,
    purpose,
    declaredAnalyticalCapabilities: DECLARED_ANALYTICAL_CAPABILITIES,
    dataScope: 'caller-provided-or-server-authorized-context-only',
    allowedTools: Object.freeze([]),
    executionEnabled: false,
    mayApprove: false,
    mayAuthorize: false,
    mayPromote: false,
    mayExecute: false
  })
])));

export function listAskLingoAgents() {
  return Object.values(REGISTRY);
}

export function resolveAskLingoAgent(value) {
  if (typeof value !== 'string') return null;
  const id = value.trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(REGISTRY, id) ? REGISTRY[id] : null;
}

/**
 * Agent role declarations never establish effective permissions.
 * This v2 foundation registry enables no tool execution or approvals.
 */
export function askLingoAgentMayExecute() {
  return false;
}
