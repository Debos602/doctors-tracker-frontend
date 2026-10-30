import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isValid, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const numberFormat = new Intl.NumberFormat('en-US');
export const formatNumber = (value: number) => numberFormat.format(value);

export function formatDate(value?: string | Date | null, pattern = 'd MMM yyyy') {
  if (!value) return '—';
  const date = typeof value === 'string' ? parseISO(value) : value;
  return isValid(date) ? format(date, pattern) : '—';
}

/** Local calendar date as YYYY-MM-DD (never shifted through UTC). */
export function toDateInput(value: Date | string) {
  const date = typeof value === 'string' ? parseISO(value) : value;
  return format(date, 'yyyy-MM-dd');
}

/** YYYY-MM-DD → ISO instant at the start/end of that day in the viewer's timezone. */
export function toApiDate(day: string | undefined, edge: 'start' | 'end') {
  if (!day) return undefined;
  const date = new Date(`${day}T${edge === 'start' ? '00:00:00.000' : '23:59:59.999'}`);
  return isValid(date) ? date.toISOString() : undefined;
}

/** Store a picked calendar day at local noon, so it shows as the same day in any timezone. */
export function dayToIso(day: string) {
  return new Date(`${day}T12:00:00`).toISOString();
}

export function initials(name: string) {
  return name
    .replace(/^dr\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export const plural = (count: number, one: string, many = `${one}s`) =>
  `${formatNumber(count)} ${count === 1 ? one : many}`;

export const timezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
