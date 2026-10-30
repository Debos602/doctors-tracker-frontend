'use client';

import { useEffect, useState, type ReactNode } from 'react';
import type { Session } from 'next-auth';
import { SessionProvider, signOut, useSession } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { ApiError, setAccessToken } from '@/lib/api-client';
import { TimezoneProvider } from '@/lib/timezone';

/** Keeps the API client's token in step with NextAuth's session. */
function SessionSync() {
  const { data } = useSession();

  // Runs during render on purpose: the first queries fire in this same commit.
  setAccessToken(data?.accessToken, data?.accessTokenExpires);

  useEffect(() => {
    if (data?.error === 'RefreshTokenError') void signOut({ callbackUrl: '/login?reason=expired' });
  }, [data?.error]);

  return null;
}

interface ProvidersProps {
  children: ReactNode;
  session: Session | null;
  /** From the `tz` cookie, so the first render matches the server's. */
  timezone: string;
}

export function Providers({ children, session, timezone }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            // Don't retry what the server rejected on purpose (4xx).
            retry: (count, error) =>
              !(error instanceof ApiError && error.status >= 400 && error.status < 500) && count < 2,
          },
        },
      }),
  );

  return (
    <SessionProvider session={session} refetchOnWindowFocus={false}>
      <SessionSync />
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <QueryClientProvider client={queryClient}>
          <TimezoneProvider initial={timezone}>{children}</TimezoneProvider>
          <Toaster position="top-right" closeButton toastOptions={{ className: 'font-sans' }} />
        </QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
