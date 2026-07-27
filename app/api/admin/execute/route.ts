import { type NextRequest } from 'next/server';
import { json, options } from '@/lib/http';
import { runOSCommand, type OSCommand } from '@/lib/os';

export const runtime = 'nodejs';

const commands = new Set<OSCommand>(['wallet.audit', 'xp.sync', 'asset.refresh', 'system.status']);

function isAuthorized(req: NextRequest) {
  const configuredKey = process.env.ADMIN_COMMAND_CENTER_KEY;
  const suppliedKey = req.headers.get('x-admin-key');
  return Boolean(configuredKey && suppliedKey && suppliedKey === configuredKey);
}

export async function OPTIONS() {
  return options();
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return json({ error: 'unauthorized' }, { status: 401 });

  const { command, payload } = (await req.json()) as { command?: string; payload?: Record<string, unknown> };
  if (!command || !commands.has(command as OSCommand)) {
    return json({ error: 'unsupported command' }, { status: 400 });
  }

  return json(runOSCommand(command as OSCommand, payload));
}
