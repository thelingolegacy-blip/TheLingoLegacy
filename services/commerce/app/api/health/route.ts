import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({
    service: 'lingo-commerce-api',
    status: 'ok'
  });
}
