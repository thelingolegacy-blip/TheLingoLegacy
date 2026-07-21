import { NextRequest, NextResponse } from 'next/server';

const hostToSite: Record<string, string> = {
  'hq.thelingolegacy.com': 'hq',
  'play.thelingolegacy.com': 'play',
  'shop.thelingolegacy.com': 'shop',
  'market.thelingolegacy.com': 'market',
  'infinity.thelingolegacy.com': 'infinity',
  'profile.thelingolegacy.com': 'profile',
  'media.thelingolegacy.com': 'media',
  'lingo.thelingolegacy.com': 'lingo',
};

function cleanPath(pathname: string) {
  if (pathname === '/') return '';
  return pathname.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0] ?? '';
  const site = hostToSite[host];

  if (!site) return NextResponse.next();

  const url = request.nextUrl.clone();
  const page = cleanPath(url.pathname);
  url.pathname = page ? `/sites/${site}/${page}` : `/sites/${site}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'],
};
