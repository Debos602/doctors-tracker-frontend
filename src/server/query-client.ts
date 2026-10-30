import 'server-only';
import { cache } from 'react';
import { QueryClient } from '@tanstack/react-query';

/** One QueryClient per request (React `cache`), never shared between users. */
export const getQueryClient = cache(
  () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } }),
);
