import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { DoctorsSkeleton } from '@/features/doctors/doctors-view';

export default function Loading() {
  return (
    <>
      <PageHeader title="Doctors" description="Everyone on staff and the patients they look after" />
      <Skeleton className="mb-4 h-10 w-full rounded-lg" />
      <div className="rounded-xl border border-line bg-surface">
        <DoctorsSkeleton rows={10} />
      </div>
    </>
  );
}
