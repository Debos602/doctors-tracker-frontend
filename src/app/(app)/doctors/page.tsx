import type { Metadata } from 'next';
import { Suspense } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { DoctorsView } from '@/features/doctors/doctors-view';
import { DOCTOR_LIST_DEFAULTS, doctorQueries } from '@/features/doctors/queries';
import { parseUrlState } from '@/lib/url-state';
import { serverApi } from '@/server/api';
import { getQueryClient } from '@/server/query-client';
import { getTimezone, verifySession } from '@/server/session';

export const metadata: Metadata = { title: 'Doctors' };

export default async function DoctorsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await verifySession();
  const [params, tz] = await Promise.all([searchParams, getTimezone()]);
  const state = parseUrlState(DOCTOR_LIST_DEFAULTS, params);

  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(doctorQueries.list(serverApi, state, tz)),
    queryClient.prefetchQuery(doctorQueries.filters(serverApi)),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <DoctorsView />
      </Suspense>
    </HydrationBoundary>
  );
}
