import 'server-only';
import type { z } from 'zod';
import { API_URL } from '@/lib/auth-api';
import { ApiError, buildUrl, type ActionResult, type Requester } from '@/lib/api-error';
import { requireSession } from './session';

/**
 * Data Access Layer transport: the only place server code talks to the API.
 * Every call is authenticated with the signed-in user's access token, which
 * never has to travel through the browser.
 */
export const serverApi: Requester = async (path, options = {}) => {
  const { method = 'GET', query, body, signal } = options;
  const session = await requireSession();

  let res: Response;
  try {
    res = await fetch(buildUrl(API_URL, path, query), {
      method,
      signal,
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(503, 'Can’t reach the Doctor Tracker server right now. Try again in a moment.', 'BACKEND_UNREACHABLE');
  }

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new ApiError(res.status, json?.message ?? `Request failed (${res.status})`, json?.code, json?.errors);
  }
  return json;
};

/** Validates untrusted action input; failures become a 422 with field errors. */
export function parseInput<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ApiError(
      422,
      'Check the highlighted fields.',
      'VALIDATION_ERROR',
      result.error.issues.map((issue) => ({ field: issue.path.join('.') || null, message: issue.message })),
    );
  }
  return result.data;
}

/** Runs an action body and turns any error into plain, serialisable data. */
export async function runAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, status: error.status, message: error.message, code: error.code, errors: error.errors };
    }
    console.error('Server action failed:', error);
    return { ok: false, status: 500, message: 'Something went wrong. Try again.' };
  }
}
