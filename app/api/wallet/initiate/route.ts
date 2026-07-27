import { type NextRequest } from 'next/server';
import { json, options } from '@/lib/http';

export const runtime = 'nodejs';

export async function OPTIONS() {
  return options();
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  return json({ status: 'initiated', eventId: crypto.randomUUID(), body });
}
