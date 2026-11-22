const MODE_GROUPS = Object.freeze({
  discover: ['chat', 'research', 'help'],
  create: ['generation', 'examples'],
  learn: ['training', 'teach'],
  govern: ['govern'],
  professional_education: ['law', 'medicine', 'firefighter', 'emt', 'law_enforcement']
});

const MODES = Object.freeze({
  chat: Object.freeze({ id: 'chat', label: 'Chat', group: 'discover', research: false, educationalOnly: false }),
  research: Object.freeze({ id: 'research', label: 'Research', group: 'discover', research: true, educationalOnly: false }),
  generation: Object.freeze({ id: 'generation', label: 'Generation', group: 'create', research: false, educationalOnly: false }),
  help: Object.freeze({ id: 'help', label: 'Help', group: 'discover', research: false, educationalOnly: false }),
  training: Object.freeze({ id: 'training', label: 'Training', group: 'learn', research: false, educationalOnly: false }),
  examples: Object.freeze({ id: 'examples', label: 'Examples', group: 'create', research: false, educationalOnly: false }),
  teach: Object.freeze({ id: 'teach', label: 'Teach', group: 'learn', research: false, educationalOnly: false }),
  govern: Object.freeze({ id: 'govern', label: 'Govern', group: 'govern', research: false, educationalOnly: false }),
  law: Object.freeze({ id: 'law', label: 'Law', group: 'professional_education', research: true, educationalOnly: true }),
  medicine: Object.freeze({ id: 'medicine', label: 'Medicine', group: 'professional_education', research: true, educationalOnly: true }),
  firefighter: Object.freeze({ id: 'firefighter', label: 'Firefighter', group: 'professional_education', research: true, educationalOnly: true }),
  emt: Object.freeze({ id: 'emt', label: 'EMT', group: 'professional_education', research: true, educationalOnly: true }),
  law_enforcement: Object.freeze({ id: 'law_enforcement', label: 'Law Enforcement', group: 'professional_education', research: true, educationalOnly: true })
});

const OPERATING_STATES = Object.freeze(['operating', 'build', 'analysis']);

export function resolveAskLingoMode(value) {
  if (typeof value !== 'string') return null;
  const key = value.trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(MODES, key) ? MODES[key] : null;
}

export function listAskLingoModes() {
  return Object.values(MODES);
}

export function getAskLingoModeGroups() {
  return MODE_GROUPS;
}

export function resolveAskLingoOperatingState(value) {
  if (typeof value !== 'string') return null;
  const key = value.trim().toLowerCase();
  return OPERATING_STATES.includes(key) ? key : null;
}

/**
 * Mode and operating-state selection are presentation/context choices only.
 * They never confer identity, capabilities, product scope, approval, or access.
 */
export function modeGrantsAuthority() {
  return false;
}
