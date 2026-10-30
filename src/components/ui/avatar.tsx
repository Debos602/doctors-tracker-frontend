import type { SVGProps } from 'react';
import { cn, initials } from '@/lib/utils';

const circle = 'grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft text-primary';

/** Initials — used for patients and the signed-in user. */
export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span aria-hidden className={cn(circle, 'text-[13px] font-semibold', className)}>
      {initials(name)}
    </span>
  );
}

/** A doctor: head and shoulders with a stethoscope, drawn to match the Lucide icon set. */
export function DoctorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <circle cx="12" cy="7" r="4" />
      <path d="M4.5 21v-.5a7.5 7.5 0 0 1 4.5-6.9" />
      <path d="M19.5 21v-.5a7.5 7.5 0 0 0-4.5-6.9" />
      <path d="M9 13.6v2.9a3 3 0 0 0 6 0v-2.9" />
      <circle cx="12" cy="19.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Same circle as Avatar, with the doctor icon — so doctors and patients are told apart at a glance. */
export function DoctorAvatar({ className, iconClassName }: { className?: string; iconClassName?: string }) {
  return (
    <span aria-hidden className={cn(circle, className)}>
      <DoctorIcon className={cn('size-5', iconClassName)} />
    </span>
  );
}
