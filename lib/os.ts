export type OSCommand = 'wallet.audit' | 'xp.sync' | 'asset.refresh' | 'system.status';

type CommandPayload = Record<string, unknown> | undefined;

export function runOSCommand(command: OSCommand, payload: CommandPayload = {}) {
  switch (command) {
    case 'wallet.audit':
      return { ok: true, command, queued: true, payload };
    case 'xp.sync':
      return { ok: true, command, synced: true, payload };
    case 'asset.refresh':
      return { ok: true, command, refreshed: true, payload };
    case 'system.status':
      return { ok: true, command, status: 'ready', payload };
    default:
      return { ok: false, error: 'Unsupported OS command' };
  }
}

export function addXP(user: string, amount: number) {
  if (!user) return { ok: false, error: 'user is required' };
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: 'amount must be greater than zero' };

  return { ok: true, user, xpAdded: amount, eventId: crypto.randomUUID() };
}
