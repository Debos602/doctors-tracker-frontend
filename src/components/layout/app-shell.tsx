'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as RadixDialog from '@radix-ui/react-dialog';
import { LayoutDashboard, Menu, Stethoscope, Users, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UserMenu } from './user-menu';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/doctors', label: 'Doctors', icon: Stethoscope },
  { href: '/patients', label: 'Patients', icon: Users },
];

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/dashboard" className={cn('flex items-center gap-2.5 font-semibold tracking-tight', className)}>
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <rect width="32" height="32" rx="8" fill="var(--primary)" />
        <path d="M13 8h6v5h5v6h-5v5h-6v-5H8v-6h5z" fill="var(--primary-ink)" />
      </svg>
      Doctor Tracker
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="grid gap-0.5">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                active ? 'bg-primary-soft text-primary' : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
              )}
            >
              {active && <span className="absolute top-2 bottom-2 -left-3 w-[3px] rounded-r-full bg-primary" aria-hidden />}
              <Icon className="size-[18px]" aria-hidden />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_1fr]">
      <a href="#main" className="sr-only z-50 rounded-md bg-surface px-3 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-surface px-3 py-5 lg:flex">
        <Logo className="mb-8 px-2" />
        <nav aria-label="Main">
          <NavLinks />
        </nav>
        <div className="mt-auto">
          <UserMenu variant="sidebar" />
        </div>
      </aside>

      <div className="min-w-0">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-surface/90 px-3 backdrop-blur lg:hidden">
          <RadixDialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
            <RadixDialog.Trigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu />
              </Button>
            </RadixDialog.Trigger>
            <RadixDialog.Portal>
              <RadixDialog.Overlay className="fixed inset-0 z-50 bg-(--overlay) data-[state=open]:animate-fade-in" />
              <RadixDialog.Content className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-line bg-surface px-3 py-4 shadow-2xl data-[state=open]:animate-drawer-in">
                <RadixDialog.Title className="sr-only">Navigation</RadixDialog.Title>
                <RadixDialog.Description className="sr-only">Go to a section of Doctor Tracker</RadixDialog.Description>
                <div className="mb-6 flex items-center justify-between px-2">
                  <Logo />
                  <RadixDialog.Close asChild>
                    <Button variant="ghost" size="icon-sm" aria-label="Close menu">
                      <X />
                    </Button>
                  </RadixDialog.Close>
                </div>
                <nav aria-label="Main" className="px-3">
                  <NavLinks onNavigate={() => setMenuOpen(false)} />
                </nav>
              </RadixDialog.Content>
            </RadixDialog.Portal>
          </RadixDialog.Root>
          <Logo className="text-[15px]" />
          <div className="ml-auto">
            <UserMenu variant="compact" />
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-[90rem] px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
          {children}
        </main>
      </div>
    </div>
  );
}
