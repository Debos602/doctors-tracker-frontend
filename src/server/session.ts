import 'server-only';
import { cache } from 'react';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getToken, type JWT } from 'next-auth/jwt';
import { SECURE_COOKIES } from '@/lib/auth-api';
import { ApiError } from '@/lib/api-error';
import { isValidTimezone } from '@/lib/dates';
import type { Role } from '@/types/api';

/**
 * Reads NextAuth's encrypted session cookie directly (no callbacks), once per
 * request thanks to React `cache`. proxy.ts has already refreshed the access
 * token if it was about to expire, so what we read here is current.
 */
const readSession = cache(async (): Promise<JWT | null> => {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const token = await getToken({
    req: { cookies: cookieStore, headers: headerStore } as unknown as Parameters<typeof getToken>[0]['req'],
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: SECURE_COOKIES,
  });
  return token?.accessToken && !token.error ? token : null;
});

/** For Server Components: signed-out visitors are sent to the login page. */
export async function verifySession() {
  const session = await readSession();
  if (!session) redirect('/login?reason=expired');
  return session;
}

/**
 * For Server Actions, which are reachable by direct POST and must re-check
 * auth themselves. Throws a 401/403 that runAction() turns into a result.
 */
export async function requireSession(role?: Role) {
  const session = await readSession();
  if (!session) throw new ApiError(401, 'Your session has expired. Sign in again.', 'SESSION_EXPIRED');
  if (role && session.user.role !== role) {
    throw new ApiError(403, 'Only administrators can do this.', 'FORBIDDEN');
  }
  return session;
}

/** The viewer's timezone, remembered in a cookie by <TimezoneProvider/>. */
export async function getTimezone() {
  const tz = (await cookies()).get('tz')?.value;
  return isValidTimezone(tz) ? tz : 'UTC';
}
