import type { Metadata, Viewport } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTimezone } from '@/server/session';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Doctor Tracker', template: '%s | Doctor Tracker' },
  description: 'Manage doctors, their patients and hospital-wide patient statistics.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f2f5f4' },
    { media: '(prefers-color-scheme: dark)', color: '#0f1715' },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [session, timezone] = await Promise.all([getServerSession(authOptions), getTimezone()]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers session={session} timezone={timezone}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
