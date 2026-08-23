export type AutoE2EAction = 'status' | 'policies' | 'simulate' | 'enable' | 'disable' | 'dry-run';

export type AutoE2EResult = {
  action: AutoE2EAction;
  environment: 'dev' | 'staging' | 'prod';
  decision: 'ALLOW' | 'DENY' | 'LIMIT' | 'REQUIRE_APPROVAL';
  registrationStatus: 'PENDING' | 'REGISTERED' | 'REJECTED';
  approvalRequired: true;
  auditRequired: true;
};

export const autoE2ECommands = [
  'lingo auto e2e status',
  'lingo auto e2e policies',
  'lingo auto e2e simulate <event>',
  'lingo auto e2e enable',
  'lingo auto e2e disable',
  'lingo auto e2e dry-run',
] as const;

export function guardAutoE2E(action: AutoE2EAction, environment: AutoE2EResult['environment']): AutoE2EResult {
  const approvalRequired = true as const;
  const auditRequired = true as const;
  if (action === 'dry-run' || action === 'simulate' || action === 'status' || action === 'policies') {
    return { action, environment, decision: 'ALLOW', registrationStatus: 'PENDING', approvalRequired, auditRequired };
  }
  return { action, environment, decision: 'REQUIRE_APPROVAL', registrationStatus: 'PENDING', approvalRequired, auditRequired };
}
