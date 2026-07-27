import { NextResponse, type NextRequest } from 'next/server';
import { verifySession } from './lib/auth';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('session')?.value;
  const loginUrl = new URL('/identity/login', req.url);

  if (req.nextUrl.pathname.startsWith('/admin')) {
    const valid = await verifySession(token, process.env.ADMIN_COMMAND_CENTER_KEY || process.env.SESSION_SECRET);
    if (!valid) return NextResponse.redirect(loginUrl);
  }

  if (token) {
    const valid = await verifySession(token);
    if (!valid) return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/wallet/:path*', '/xp/:path*']
};
