import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const registryPath = path.resolve(here, '../studio/enterprise-module-registry.json');
const allowedStatuses = new Set([
  'LIVE_VERIFIED',
  'HISTORICAL_EVIDENCE',
  'SOURCE_DECLARED',
  'PREVIEW_ONLY',
  'BLOCKED',
  'PLANNED',
  'UNKNOWN',
]);
const requiredEvidence = ['source', 'observedAt', 'confidence', 'correlationId'];
const requiredDomainScopes = {
  'workforce-operations': ['workforce:read'],
  'hr-payroll': ['hr:read', 'payroll:read'],
  'residential-property-operations': ['property:read'],
  'hospitality-operations': ['hospitality:read'],
  'transport-infrastructure': ['transport:read'],
  'street-lighting-operations': ['lighting:read'],
  'water-distribution-operations': ['water:read'],
  'wastewater-drainage-operations': ['wastewater:read'],
  'world-engine-studio': ['world:read'],
  'game-liveops-studio': ['gameops:read'],
};

export function validateRegistry(registry) {
  const errors = [];
  if (!registry || typeof registry !== 'object' || Array.isArray(registry)) return ['registry must be an object'];
  if (registry.schema !== 'lingo-studio-enterprise-module-registry') errors.push('invalid registry schema identifier');
  if (registry.mode !== 'read-only-until-separately-authorized') errors.push('registry must remain read-only');
  if (registry.productionMutation !== false) errors.push('productionMutation must be false');
  if (!Array.isArray(registry.statusVocabulary) || new Set(registry.statusVocabulary).size !== registry.statusVocabulary.length || registry.statusVocabulary.some(status => !allowedStatuses.has(status)) || [...allowedStatuses].some(status => !registry.statusVocabulary.includes(status))) errors.push('statusVocabulary must contain the complete unique allowed status set');
  if (!Array.isArray(registry.modules) || registry.modules.length === 0) errors.push('modules must be a non-empty array');
  if (!Array.isArray(registry.providerReadiness) || registry.providerReadiness.length === 0) errors.push('providerReadiness must be a non-empty array');

  const moduleIds = new Set();
  for (const module of registry.modules || []) {
    if (!module || typeof module !== 'object') { errors.push('module entry must be an object'); continue; }
    if (!/^[a-z0-9-]+$/.test(module.id || '')) errors.push('module id must be lowercase kebab-case');
    if (moduleIds.has(module.id)) errors.push(`duplicate module id: ${module.id}`);
    moduleIds.add(module.id);
    if (!module.name || !module.scope) errors.push(`module ${module.id} requires name and scope`);
    if (!allowedStatuses.has(module.status)) errors.push(`module ${module.id} has unknown status`);
    if (module.writeAuthority !== false) errors.push(`module ${module.id} must not have write authority`);
    if (!Array.isArray(module.permissions) || module.permissions.length === 0 || new Set(module.permissions).size !== module.permissions.length) errors.push(`module ${module.id} permissions must be non-empty and unique`);
    if ((module.permissions || []).some(permission => /:write$/.test(permission))) errors.push(`module ${module.id} cannot declare write scopes`);
    const evidence = new Set(module.requiredEvidence || []);
    for (const item of requiredEvidence) if (!evidence.has(item)) errors.push(`module ${module.id} missing required evidence: ${item}`);
    if (module.status === 'LIVE_VERIFIED') {
      const actual = module.evidence;
      if (!actual || typeof actual !== 'object' || Array.isArray(actual)) {
        errors.push(`module ${module.id} LIVE_VERIFIED requires an evidence object`);
      } else {
        for (const item of requiredEvidence) {
          if (typeof actual[item] !== 'string' || actual[item].trim() === '') {
            errors.push(`module ${module.id} LIVE_VERIFIED evidence missing value: ${item}`);
          }
        }
      }
    }
    if (module.route !== null && (typeof module.route !== 'string' || !module.route.startsWith('/'))) errors.push(`module ${module.id} route must be null or an absolute path`);
  }

  for (const [id, scopes] of Object.entries(requiredDomainScopes)) {
    const module = (registry.modules || []).find(item => item.id === id);
    if (!module) { errors.push(`missing bounded operations module: ${id}`); continue; }
    if (module.status !== 'PLANNED' && module.status !== 'BLOCKED' && module.status !== 'SOURCE_DECLARED') errors.push(`operations module ${id} has unsupported readiness status`);
    if (module.writeAuthority !== false) errors.push(`operations module ${id} must remain read-only`);
    for (const scope of scopes) if (!(module.permissions || []).includes(scope)) errors.push(`operations module ${id} missing separate scope: ${scope}`);
    if (!['source','observedAt','confidence','correlationId','dataClassification','auditTrail'].every(item => (module.requiredEvidence || []).includes(item))) errors.push(`operations module ${id} missing privacy/audit evidence`);
  }

  const providerIds = new Set();
  for (const provider of registry.providerReadiness || []) {
    if (!provider || typeof provider !== 'object') { errors.push('provider entry must be an object'); continue; }
    if (!/^[a-z0-9-]+$/.test(provider.id || '') || !provider.provider || !provider.evidence) errors.push('provider entry requires a valid id, name and evidence');
    if (providerIds.has(provider.id)) errors.push(`duplicate provider id: ${provider.id}`);
    providerIds.add(provider.id);
    if (!allowedStatuses.has(provider.status)) errors.push(`provider ${provider.id} has unknown status`);
    if (provider.writeAuthority !== false) errors.push(`provider ${provider.id} must not have write authority`);
  }

  const controls = registry.globalControls || {};
  const requiredControls = {
    defaultMode: 'read-only',
    productionMutation: 'DENY',
    secretValues: 'NEVER_DISPLAY',
    clientProviderCredentials: 'PROHIBITED',
    autonomousMerge: 'DENY',
    autonomousDeploy: 'DENY',
    autonomousBilling: 'DENY',
    autonomousWalletOrRewardMutation: 'DENY',
    autonomousAccessGrant: 'DENY',
    unknownState: 'FAIL_CLOSED',
  };
  for (const [key, value] of Object.entries(requiredControls)) if (controls[key] !== value) errors.push(`global control ${key} must equal ${value}`);
  return errors;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const errors = validateRegistry(registry);
  if (errors.length) {
    for (const error of errors) console.error(`FAIL: ${error}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${registry.modules.length} Studio modules; ${registry.providerReadiness.length} provider records; read-only controls intact.`);
  }
}
