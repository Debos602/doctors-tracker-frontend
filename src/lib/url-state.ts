type Source = URLSearchParams | Record<string, string | string[] | undefined>;

/**
 * Reads filter state from the URL, filling in defaults. Server pages (from
 * `searchParams`) and `useUrlState` in the browser both use it, so they build
 * the exact same object — and therefore the same query key.
 */
export function parseUrlState<T extends Record<string, string>>(defaults: T, source: Source): T {
  const state = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T & string)[]) {
    const raw = source instanceof URLSearchParams ? source.get(key) : source[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value !== undefined && value !== null && value !== '') state[key] = value as T[typeof key];
  }
  return state;
}
