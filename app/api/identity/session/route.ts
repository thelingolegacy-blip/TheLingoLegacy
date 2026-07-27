import { type NextRequest } from 'next/server';
import { createSession } from '@/lib/auth';
import { json, options } from '@/lib/http';

export const runtime = 'nodejs';

export async function OPTIONS() {
  return options();
}

export async function POST(req: NextRequest) {
  const { user } = (await req.json()) as { user?: string };
  if (!user) return json({ error: 'user is required' }, { status: 400 });

  const token = await createSession(user);
  return json({ token });
}
