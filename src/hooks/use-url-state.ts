'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { parseUrlState } from '@/lib/url-state';

/**
 * Filter/pagination state that lives in the URL, so it survives reloads,
 * can be shared as a link, and works with the back button. Parsed with the
 * same function server pages use, so both sides agree on the query key.
 */
export function useUrlState<T extends Record<string, string>>(defaults: T) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const query = searchParams.toString();

  // `defaults` is a module-level constant in every caller.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const state = useMemo(() => parseUrlState(defaults, new URLSearchParams(query)), [query]);

  const setState = useCallback(
    (patch: Partial<T>) => {
      const params = new URLSearchParams(query);
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === '' || value === defaults[key]) params.delete(key);
        else params.set(key, value);
      }
      // Any filter change goes back to page 1.
      if (!('page' in patch)) params.delete('page');
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, pathname, router],
  );

  const reset = useCallback(() => router.replace(pathname, { scroll: false }), [pathname, router]);

  const activeCount = useMemo(
    () =>
      (Object.keys(defaults) as (keyof T)[]).filter(
        (k) => !['page', 'limit', 'sort'].includes(k as string) && state[k] !== defaults[k],
      ).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state],
  );

  return { state, setState, reset, activeCount };
}
