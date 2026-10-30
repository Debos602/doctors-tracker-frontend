import Link from 'next/link';
import { ArrowLeft, UserX } from 'lucide-react';
import { buttonClass } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/states';

export default function DoctorNotFound() {
  return (
    <>
      <Link href="/doctors" className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> All doctors
      </Link>
      <div className="rounded-xl border border-line bg-surface">
        <EmptyState
          icon={UserX}
          title="This doctor doesn’t exist"
          description="They may have been deleted, or the link is wrong. Go back to the list to find someone else."
          action={<Link href="/doctors" className={buttonClass('secondary')}>Back to doctors</Link>}
        />
      </div>
    </>
  );
}
