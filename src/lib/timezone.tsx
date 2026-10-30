'use client';

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from 'react';

const TimezoneContext = createContext('UTC');

const subscribe = () => () => {};
const browserTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

/**
 * Date filters are interpreted in the viewer's timezone. The server renders
 * with the timezone from the `tz` cookie; the browser then uses its own and
 * remembers it in that cookie, so later server renders (and their prefetched
 * query keys) match the browser exactly.
 */
export function TimezoneProvider({ initial, children }: { initial: string; children: ReactNode }) {
  const tz = useSyncExternalStore(subscribe, () => browserTimezone() || initial, () => initial);

  useEffect(() => {
    if (tz !== initial) {
      document.cookie = `tz=${encodeURIComponent(tz)}; path=/; max-age=31536000; samesite=lax`;
    }
  }, [tz, initial]);

  return <TimezoneContext.Provider value={tz}>{children}</TimezoneContext.Provider>;
}

export const useTimezone = () => useContext(TimezoneContext);
