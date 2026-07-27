import { NextResponse } from 'next/server';

export function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, withCors(init));
}

export function withCors(init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Key, X-OS-Internal-Key');
  return { ...init, headers };
}

export function options() {
  return new NextResponse(null, withCors({ status: 204 }));
}
