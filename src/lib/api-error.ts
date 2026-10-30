import type { ApiResponse, FieldError } from '@/types/api';

/** Isomorphic: used by the browser API client, the server API client and server actions. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public errors?: FieldError[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  query?: object;
  body?: unknown;
  signal?: AbortSignal;
}

/** Anything that can call the API: `api` in the browser, `serverApi` on the server. */
export type Requester = <T>(path: string, options?: RequestOptions) => Promise<ApiResponse<T>>;

export function buildUrl(base: string, path: string, query?: object) {
  const url = new URL(`${base}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === '') continue;
    url.searchParams.set(key, String(value));
  }
  return url;
}

/** What a server action returns — plain data, since thrown errors are redacted in production. */
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string; code?: string; errors?: FieldError[] };
