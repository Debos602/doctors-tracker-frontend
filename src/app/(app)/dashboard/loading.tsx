import { PageHeader } from '@/components/ui/page-header';
import { DashboardSkeleton } from '@/features/dashboard/dashboard-view';

/** Shown instantly on navigation while the server fetches the dashboard. */
export default function Loading() {
  return (
    <>
      <PageHeader title="Dashboard" description="Hospital-wide patient picture" />
      <DashboardSkeleton />
    </>
  );
}
