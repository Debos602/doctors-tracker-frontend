import { NextResponse, type NextRequest } from 'next/server';
import { encode, getToken } from 'next-auth/jwt';
import { SECURE_COOKIES, SESSION_COOKIE, SESSION_MAX_AGE, refreshAccessToken } from '@/lib/auth-api';

/**
 * Runs before every page request and server action:
 *
 * 1. Route guard — every page except /login needs a live session, so
 *    protected pages never flash for signed-out visitors.
 * 2. Token refresh — Server Components can read cookies but not write them,
 *    so an access token that is about to expire is rotated here and the new
 *    session cookie is passed both to the browser and to this request's render.
 */

/** Wider than the jwt callback's margin, so server renders always get a fresh token. */
const PROXY_REFRESH_MARGIN_MS = 2 * 60_000;
const secret = process.env.NEXTAUTH_SECRET;

export async function proxy(request: NextRequest) {
  let token = await getToken({ req: request, secret, secureCookie: SECURE_COOKIES });
  let refreshedCookie: string | null = null;

  if (token && !token.error && token.accessTokenExpires - Date.now() < PROXY_REFRESH_MARGIN_MS) {
    const next = await refreshAccessToken(token);
    if (next !== token) {
      token = next;
      if (!next.error) refreshedCookie = await encode({ token: next, secret: secret!, maxAge: SESSION_MAX_AGE });
    }
  }

  const signedIn = Boolean(token) && !token?.error;
  const { pathname, search } = request.nextUrl;
  const onLoginPage = pathname === '/login';

  if (!signedIn && !onLoginPage) {
    const url = new URL('/login', request.url);
    if (pathname !== '/') url.searchParams.set('callbackUrl', `${pathname}${search}`);
    if (token?.error) url.searchParams.set('reason', 'expired');
    const response = NextResponse.redirect(url);
    if (token?.error) response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  if (signedIn && onLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!refreshedCookie) return NextResponse.next();

  // Hand the new cookie to this request (so the page renders with the fresh token)…
  request.cookies.set(SESSION_COOKIE, refreshedCookie);
  const headers = new Headers(request.headers);
  headers.set('cookie', request.cookies.toString());
  const response = NextResponse.next({ request: { headers } });
  // …and to the browser for the requests that follow.
  response.cookies.set(SESSION_COOKIE, refreshedCookie, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: SECURE_COOKIES,
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}

export const config = {
  matcher: [
    {
      // Everything except NextAuth's own routes, Next internals and static files…
      source: '/((?!api/auth|_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)',
      // …and link prefetches. A page full of links would otherwise rotate the token
      // once per prefetch. Prefetched pages still check the session themselves (DAL).
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
