'use client';

import { ErrorState } from '@/components/ui/states';

export default function AppError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-xl border border-line bg-surface">
      <ErrorState message={error.message || 'Something unexpected happened on this page.'} onRetry={reset} />
    </div>
  );
}
