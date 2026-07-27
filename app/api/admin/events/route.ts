import { type NextRequest } from 'next/server';
import { json, options } from '@/lib/http';

export const runtime = 'nodejs';

function isAuthorized(req: NextRequest) {
  const configuredKey = process.env.ADMIN_COMMAND_CENTER_KEY;
  const suppliedKey = req.headers.get('x-admin-key');
  return Boolean(configuredKey && suppliedKey && suppliedKey === configuredKey);
}

export async function OPTIONS() {
  return options();
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return json({ error: 'unauthorized' }, { status: 401 });

  return json({ events: [] });
}
