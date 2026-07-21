import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({
    service: 'lingo-games-api',
    status: 'ok'
  });
}
