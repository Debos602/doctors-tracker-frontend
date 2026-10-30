import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { PatientsTableSkeleton } from '@/features/patients/patients-table';

export default function Loading() {
  return (
    <>
      <PageHeader title="Patients" description="Everyone under care, with their condition, doctor and admission date" />
      <Skeleton className="mb-3 h-10 w-full rounded-lg" />
      <Skeleton className="mb-4 h-8 w-2/3 rounded-full" />
      <div className="rounded-xl border border-line bg-surface">
        <PatientsTableSkeleton rows={10} />
      </div>
    </>
  );
}
