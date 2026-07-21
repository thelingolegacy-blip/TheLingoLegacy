import { NextResponse } from 'next/server';
import { routeIntent } from '../../../src/router';

export async function POST(request: Request) {
  const { userId, intent, context } = await request.json();

  if (typeof intent !== 'string' || intent.length === 0) {
    return NextResponse.json({ error: 'Missing intent' }, { status: 400 });
  }

  const result = await routeIntent({ userId, intent, context });
  return NextResponse.json(result);
}
