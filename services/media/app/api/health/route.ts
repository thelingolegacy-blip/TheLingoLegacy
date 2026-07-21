import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({
    service: 'lingo-media-api',
    status: 'ok'
  });
}
