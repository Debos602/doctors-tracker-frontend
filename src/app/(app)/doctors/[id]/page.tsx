import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { DoctorDetailView } from '@/features/doctors/doctor-detail-view';
import { doctorQueries } from '@/features/doctors/queries';
import { PATIENT_LIST_DEFAULTS, patientQueries } from '@/features/patients/queries';
import { parseUrlState } from '@/lib/url-state';
import { serverApi } from '@/server/api';
import { getDoctor } from '@/server/doctors';
import { getQueryClient } from '@/server/query-client';
import { getTimezone, verifySession } from '@/server/session';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const doctor = await getDoctor(id).catch(() => undefined);
  if (doctor === null) return { title: 'Doctor not found' };
  return { title: doctor ? `${doctor.name}, ${doctor.specialization}` : 'Doctor' };
}

export default async function DoctorPage({ params, searchParams }: Props) {
  await verifySession();
  const [{ id }, query, tz] = await Promise.all([params, searchParams, getTimezone()]);

  // A failed request (e.g. the API is down) is left to the client, which shows a retryable error.
  const doctor = await getDoctor(id).catch(() => undefined);
  if (doctor === null) notFound();

  const queryClient = getQueryClient();
  if (doctor) {
    queryClient.setQueryData(doctorQueries.detail(serverApi, id).queryKey, doctor);
    await queryClient.prefetchQuery(
      patientQueries.list(serverApi, parseUrlState(PATIENT_LIST_DEFAULTS, query), { tz, doctorId: id }),
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <DoctorDetailView id={id} />
      </Suspense>
    </HydrationBoundary>
  );
}
