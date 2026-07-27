import { json, options } from '@/lib/http';

export const runtime = 'nodejs';

export async function OPTIONS() {
  return options();
}

export async function GET() {
  return json({ sync: 'ok', eventId: crypto.randomUUID() });
}
