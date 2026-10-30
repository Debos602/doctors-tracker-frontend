import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/features/auth/login-form';
import { CONDITIONS } from '@/lib/constants';

export const metadata: Metadata = { title: 'Sign in' };

// Illustrative census for the brand panel (not real data).
const SAMPLE = [38, 24, 17, 7, 14];

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#0b4f43] p-12 text-white lg:flex">
        <div className="flex items-center gap-2.5 font-semibold tracking-tight">
          <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
            <rect width="32" height="32" rx="8" fill="#ffffff" />
            <path d="M13 8h6v5h5v6h-5v5h-6v-5H8v-6h5z" fill="#0b4f43" />
          </svg>
          Doctor Tracker
        </div>

        <div className="max-w-md">
          <p className="text-[40px] leading-[1.1] font-semibold tracking-tight text-balance">
            Every doctor, every patient, one ward board.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-white/75">
            See who is looking after whom, find any patient in a few keystrokes, and keep an eye on the critical cases.
          </p>
        </div>

        <div aria-hidden>
          <div className="flex h-3 gap-[3px] overflow-hidden rounded-full">
            {CONDITIONS.map((c, i) => (
              <div key={c.value} style={{ flexGrow: SAMPLE[i], backgroundColor: ['#5fd0ac', '#8fb3f0', '#f0c15a', '#ff8a7f', '#b9a9f0'][i] }} />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-white/70">
            {CONDITIONS.map((c) => (
              <span key={c.value}>{c.label}</span>
            ))}
          </div>
        </div>
      </aside>

      <main className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 font-semibold tracking-tight lg:hidden">
            <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
              <rect width="32" height="32" rx="8" fill="var(--primary)" />
              <path d="M13 8h6v5h5v6h-5v5h-6v-5H8v-6h5z" fill="var(--primary-ink)" />
            </svg>
            Doctor Tracker
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-1 mb-8 text-sm text-muted">Use the account your administrator created for you.</p>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
