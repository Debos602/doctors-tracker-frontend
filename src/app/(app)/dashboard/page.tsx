import type { Metadata } from 'next';
import { Suspense } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { DashboardView } from '@/features/dashboard/dashboard-view';
import { DASHBOARD_DEFAULTS, dashboardQueries, toRange } from '@/features/dashboard/queries';
import { parseUrlState } from '@/lib/url-state';
import { serverApi } from '@/server/api';
import { getQueryClient } from '@/server/query-client';
import { getTimezone, verifySession } from '@/server/session';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await verifySession();
  const [params, tz] = await Promise.all([searchParams, getTimezone()]);
  const range = toRange(parseUrlState(DASHBOARD_DEFAULTS, params).range);

  // Fetched on the server and handed to the client cache: the first paint already has data.
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(dashboardQueries.summary(serverApi, range, tz));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <DashboardView />
      </Suspense>
    </HydrationBoundary>
  );
}
