/**
 * Lingo Legacy Operations Worker
 *
 * Non-production orchestration layer for paperwork, implementation,
 * configuration, interface, interpreter, integration, build, rebuild,
 * enhancement, and controlled demolition tasks.
 *
 * This worker does not deploy, activate, delete production resources,
 * bypass gates, or override the LKG. It produces deterministic work plans
 * that can be reviewed and executed by an authorized release process.
 */

const TASK_TYPES = Object.freeze([
  'paperwork',
  'coding',
  'configuration',
  'interface',
  'interpreter',
  'integration',
  'build',
  'demolish',
  'rebuild',
  'enhancement',
]);

const DESTRUCTIVE_TYPES = new Set(['demolish']);

function normalizeTask(input = {}) {
  const type = String(input.type || '').trim().toLowerCase();
  const description = String(input.description || '').trim();
  const target = String(input.target || '').trim();

  if (!TASK_TYPES.includes(type)) {
    throw new Error(`Unsupported operations task type: ${type || 'empty'}`);
  }
  if (!description) throw new Error('Task description is required.');
  if (!target) throw new Error('Task target is required.');

  return {
    id: String(input.id || `ops-${Date.now()}`),
    type,
    description,
    target,
    production: input.production === true,
    requested_at: new Date().toISOString(),
  };
}

function planTask(task) {
  const destructive = DESTRUCTIVE_TYPES.has(task.type);
  const protectedState = task.production || destructive;

  const phases = [
    'intake',
    'scope',
    'inspect',
    'implement',
    'validate',
    'evidence',
  ];

  if (destructive) phases.splice(4, 0, 'approval');

  return {
    ...task,
    policy: {
      fail_closed: true,
      production_change_allowed: false,
      lkg_protected: protectedState,
      destructive_change_requires_explicit_approval: destructive,
    },
    phases,
    next_gate: destructive || task.production ? 'approval' : 'validation',
  };
}

export function createOperationsPlan(input) {
  return planTask(normalizeTask(input));
}

export function createBatchPlan(tasks = []) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    throw new Error('At least one operations task is required.');
  }

  return {
    ok: true,
    worker: 'lingo-legacy-operations-worker',
    mode: 'non-production-orchestration',
    generated_at: new Date().toISOString(),
    tasks: tasks.map(createOperationsPlan),
  };
}

export function classifyWork(description = '') {
  const text = String(description).toLowerCase();
  const matches = [];

  const keywords = {
    paperwork: ['paperwork', 'document', 'form', 'record'],
    coding: ['code', 'coding', 'implementation', 'bug', 'function'],
    configuration: ['config', 'configuration', 'wrangler', 'binding', 'dns'],
    interface: ['interface', 'ui', 'ux', 'screen', 'page'],
    interpreter: ['interpret', 'parser', 'translate', 'registry', 'manifest'],
    integration: ['integration', 'api', 'firebase', 'cloudflare', 'stripe'],
    build: ['build', 'compile', 'bundle', 'ci', 'workflow'],
    demolish: ['demolish', 'remove', 'retire', 'decommission'],
    rebuild: ['rebuild', 'restore', 'reconstruct', 'migrate'],
    enhancement: ['enhance', 'improve', 'upgrade', 'optimize'],
  };

  for (const [type, terms] of Object.entries(keywords)) {
    if (terms.some((term) => text.includes(term))) matches.push(type);
  }

  return [...new Set(matches)];
}

export default {
  createOperationsPlan,
  createBatchPlan,
  classifyWork,
};
