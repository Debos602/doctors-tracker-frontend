import Link from 'next/link';
import { buttonClass } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="text-sm text-muted">404</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">This page doesn’t exist</h1>
        <p className="mt-2 text-muted">Check the address, or go back to the dashboard.</p>
        <Link href="/dashboard" className={buttonClass('primary', 'md', 'mt-6')}>
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}
