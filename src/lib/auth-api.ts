import type { User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { Role } from '@/types/api';

/** Calls to the API's /auth routes, shared by NextAuth's callbacks and proxy.ts. */

export const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // matches the API's refresh-token lifetime
/**
 * HTTPS deployments use "__Secure-" cookie names. NextAuth, proxy.ts and the
 * server DAL must all agree on this, so it's decided once here: from
 * NEXTAUTH_URL when set, otherwise from Vercel's deployment environment.
 */
export const SECURE_COOKIES = process.env.NEXTAUTH_URL
  ? process.env.NEXTAUTH_URL.startsWith('https://')
  : process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview';
export const SESSION_COOKIE = SECURE_COOKIES ? '__Secure-next-auth.session-token' : 'next-auth.session-token';

interface BackendSession {
  user: { _id: string; name: string; email: string; role: Role };
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
}

type BackendResult = { ok: true; data: BackendSession } | { ok: false; status: number; code?: string };

export async function callAuthApi(path: string, body: unknown): Promise<BackendResult> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) return { ok: false, status: res.status, code: json?.code };
    return { ok: true, data: json.data };
  } catch {
    return { ok: false, status: 0, code: 'BACKEND_UNREACHABLE' };
  }
}

export function toUser(session: BackendSession): User {
  return {
    id: session.user._id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
    accessToken: session.accessToken,
    accessTokenExpires: Date.parse(session.accessTokenExpiresAt),
    refreshToken: session.refreshToken,
  };
}

/** Rotates the API tokens. Returns the same object when nothing changed. */
export async function refreshAccessToken(token: JWT): Promise<JWT> {
  const result = await callAuthApi('/auth/refresh', { refreshToken: token.refreshToken });

  if (result.ok) {
    const user = toUser(result.data);
    return {
      ...token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken: user.accessToken,
      accessTokenExpires: user.accessTokenExpires,
      refreshToken: user.refreshToken,
      error: undefined,
    };
  }

  // Another request rotated it a moment ago, or the API is briefly down: keep going with what we have.
  if (result.code === 'REFRESH_IN_PROGRESS' || result.status === 0 || result.status >= 500) return token;

  // Expired, revoked or replayed refresh token → the session is over.
  return { ...token, error: 'RefreshTokenError' };
}
