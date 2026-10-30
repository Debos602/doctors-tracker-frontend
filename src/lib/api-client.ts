import { getSession, signOut } from 'next-auth/react';
import type { ApiResponse } from '@/types/api';
import { ApiError, buildUrl, type ActionResult, type RequestOptions, type Requester } from './api-error';

export { ApiError };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

// ── Access token cache ─────────────────────────────────────────────────────
// The session (and its access token) is pushed in by <SessionSync/>; we only
// ask NextAuth again when the cached token is about to expire. Concurrent
// callers share one in-flight getSession(), which is what triggers the
// server-side refresh — so a burst of requests causes a single refresh.
let cached: { token: string; expires: number } | null = null;
let pending: Promise<string> | null = null;
let signingOut = false;

export function setAccessToken(token: string | undefined, expires: number | undefined) {
  cached = token && expires ? { token, expires } : null;
}

async function endSession(): Promise<never> {
  if (!signingOut) {
    signingOut = true;
    await signOut({ callbackUrl: '/login?reason=expired' });
  }
  throw new ApiError(401, 'Your session has expired. Sign in again.', 'SESSION_EXPIRED');
}

async function getAccessToken(force = false): Promise<string> {
  if (!force && cached && cached.expires - 30_000 > Date.now()) return cached.token;

  pending ??= getSession()
    .then((session) => {
      if (!session?.accessToken || session.error) return endSession();
      setAccessToken(session.accessToken, session.accessTokenExpires);
      return session.accessToken;
    })
    .finally(() => {
      pending = null;
    });

  return pending;
}

async function request<T>(path: string, options: RequestOptions, retried: boolean): Promise<ApiResponse<T>> {
  const { method = 'GET', query, body, signal } = options;
  const token = await getAccessToken();

  let res: Response;
  try {
    res = await fetch(buildUrl(API_URL, path, query), {
      method,
      signal,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    throw new ApiError(0, "Can't reach the server. Check your connection and that the API is running.", 'NETWORK_ERROR');
  }

  const json = await res.json().catch(() => null);

  if (res.status === 401) {
    // Token expired between our check and the request: refresh once and retry.
    if (!retried && json?.code === 'TOKEN_EXPIRED') {
      await getAccessToken(true);
      return request<T>(path, options, true);
    }
    return endSession();
  }

  if (!res.ok || !json?.success) {
    throw new ApiError(res.status, json?.message ?? `Request failed (${res.status})`, json?.code, json?.errors);
  }
  return json;
}

/**
 * Browser client for client-side reads (filters, pagination, search after the
 * first server render). Writes go through Server Actions — see each feature's actions.ts.
 */
export const api: Requester = <T,>(path: string, options: RequestOptions = {}) => request<T>(path, options, false);

/** Unwraps a server action's result: data on success, an ApiError otherwise. */
export async function callAction<T>(action: Promise<ActionResult<T>>): Promise<T> {
  const result = await action;
  if (result.ok) return result.data;
  if (result.status === 401) return endSession();
  throw new ApiError(result.status, result.message, result.code, result.errors);
}
