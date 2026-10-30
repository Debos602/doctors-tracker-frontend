'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, CalendarPlus, Mail, Pencil, Phone, Trash2, UserX } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button, buttonClass } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { CensusBar } from '@/features/dashboard/census-bar';
import { PatientList } from '@/features/patients/patient-list';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ApiError } from '@/lib/api-client';
import { formatDate, plural } from '@/lib/utils';
import { useDoctor } from './api';
import { DeleteDoctorDialog } from './delete-doctor-dialog';
import { DoctorFormDialog } from './doctor-form-dialog';

export function DoctorDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { isAdmin } = useCurrentUser();
  const { data: doctor, isPending, isError, error, refetch } = useDoctor(id);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const back = (
    <Link href="/doctors" className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
      <ArrowLeft className="size-4" aria-hidden /> All doctors
    </Link>
  );

  if (isPending) return <>{back}<DetailSkeleton /></>;

  if (isError) {
    const notFound = error instanceof ApiError && (error.status === 404 || error.status === 400);
    return (
      <>
        {back}
        <div className="rounded-xl border border-line bg-surface">
          {notFound ? (
            <EmptyState
              icon={UserX}
              title="This doctor doesn’t exist"
              description="They may have been deleted. Go back to the list to find someone else."
              action={<Link href="/doctors" className={buttonClass('secondary')}>Back to doctors</Link>}
            />
          ) : (
            <ErrorState message={error.message} onRetry={() => refetch()} />
          )}
        </div>
      </>
    );
  }

  return (
    <>
      {back}

      <section className="mb-8 grid gap-6 rounded-xl border border-line bg-surface p-5 sm:p-6 lg:grid-cols-[1fr_minmax(0,28rem)]">
        <div className="min-w-0">
          <div className="flex items-start gap-4">
            <Avatar name={doctor.name} className="size-14 text-lg" />
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight">{doctor.name}</h1>
              <p className="text-ink-2">{doctor.specialization}</p>
            </div>
          </div>
          <dl className="mt-5 grid gap-2.5 text-sm text-ink-2 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <dt><Building2 className="size-4 text-muted" aria-label="Hospital" /></dt>
              <dd className="truncate">{doctor.hospital}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt><Phone className="size-4 text-muted" aria-label="Phone" /></dt>
              <dd><a href={`tel:${doctor.phone.replace(/\s/g, '')}`} className="tabular-nums hover:text-primary">{doctor.phone}</a></dd>
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <dt><Mail className="size-4 text-muted" aria-label="Email" /></dt>
              <dd className="truncate"><a href={`mailto:${doctor.email}`} className="hover:text-primary">{doctor.email}</a></dd>
            </div>
            <div className="flex items-center gap-2">
              <dt><CalendarPlus className="size-4 text-muted" aria-label="Added" /></dt>
              <dd>Added {formatDate(doctor.createdAt)}</dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil /> Edit details
            </Button>
            {isAdmin && (
              <Button variant="danger-ghost" size="sm" onClick={() => setDeleteOpen(true)}>
                <Trash2 /> Delete doctor
              </Button>
            )}
          </div>
        </div>

        <div className="border-t border-line pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
          <p className="text-sm text-muted">Current patients</p>
          <p className="mb-4 text-3xl font-semibold tabular-nums">{plural(doctor.patientCount ?? 0, 'patient')}</p>
          <CensusBar data={doctor.conditionBreakdown ?? []} size="sm" />
        </div>
      </section>

      <h2 className="mb-4 text-lg font-semibold tracking-tight">Patients</h2>
      <PatientList doctor={doctor} />

      <DoctorFormDialog open={editOpen} onOpenChange={setEditOpen} doctor={doctor} />
      <DeleteDoctorDialog doctor={deleteOpen ? doctor : null} onClose={() => setDeleteOpen(false)} onDeleted={() => router.replace('/doctors')} />
    </>
  );
}

export function DetailSkeleton() {
  return (
    <div role="status" aria-label="Loading doctor">
      <div className="mb-8 rounded-xl border border-line bg-surface p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-52" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
