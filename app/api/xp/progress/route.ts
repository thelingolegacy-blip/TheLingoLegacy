import { type NextRequest } from 'next/server';
import { json, options } from '@/lib/http';
import { addXP } from '@/lib/os';

export const runtime = 'nodejs';

export async function OPTIONS() {
  return options();
}

export async function POST(req: NextRequest) {
  const { user, amount } = (await req.json()) as { user?: string; amount?: number };
  const result = addXP(user || '', Number(amount));
  return json(result, { status: result.ok ? 200 : 400 });
}
