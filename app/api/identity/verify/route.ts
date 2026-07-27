import { type NextRequest } from 'next/server';
import { json, options } from '@/lib/http';
import { verifySession } from '@/lib/auth';

export const runtime = 'nodejs';

export async function OPTIONS() {
  return options();
}

export async function POST(req: NextRequest) {
  const { token } = (await req.json()) as { token?: string };
  const valid = await verifySession(token, process.env.AUTH_PUBLIC_KEY || process.env.SESSION_SECRET);
  return json({ valid });
}
