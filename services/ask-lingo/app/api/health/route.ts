import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({
    service: 'ask-lingo-api',
    status: 'ok'
  });
}
