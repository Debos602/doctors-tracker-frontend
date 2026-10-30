import type { Metadata } from 'next';
import { Suspense } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/page-header';
import { doctorQueries } from '@/features/doctors/queries';
import { PatientList } from '@/features/patients/patient-list';
import { PATIENT_LIST_DEFAULTS, patientQueries } from '@/features/patients/queries';
import { parseUrlState } from '@/lib/url-state';
import { serverApi } from '@/server/api';
import { isObjectId } from '@/server/doctors';
import { getQueryClient } from '@/server/query-client';
import { getTimezone, verifySession } from '@/server/session';

export const metadata: Metadata = { title: 'Patients' };

export default async function PatientsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await verifySession();
  const [params, tz] = await Promise.all([searchParams, getTimezone()]);
  const state = parseUrlState(PATIENT_LIST_DEFAULTS, params);

  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(patientQueries.list(serverApi, state, { tz })),
    // The doctor filter shows the selected doctor's name straight away.
    isObjectId(state.doctor) && queryClient.prefetchQuery(doctorQueries.detail(serverApi, state.doctor)),
  ]);

  return (
    <>
      <PageHeader title="Patients" description="Everyone under care, with their condition, doctor and admission date" />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense>
          <PatientList />
        </Suspense>
      </HydrationBoundary>
    </>
  );
}
