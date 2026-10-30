import Link from 'next/link';
import { formatNumber } from '@/lib/utils';

interface BarListProps {
  items: { key: string; label: string; sublabel?: string; value: number; href?: string }[];
  /** Accessible name of the list, e.g. "Patients per doctor". */
  label: string;
}

/**
 * Ranked horizontal bars built from HTML: every row is readable text with its
 * value at the tip, and rows can be links (a chart you can click through).
 */
export function BarList({ items, label }: BarListProps) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ol aria-label={label} className="grid gap-1">
      {items.map((item) => {
        const row = (
          <>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-ink">
                {item.label}
                {item.sublabel && <span className="ml-2 text-[13px] text-muted">{item.sublabel}</span>}
              </span>
              <span className="font-medium tabular-nums">{formatNumber(item.value)}</span>
            </div>
            <div className="mt-1.5 h-2 rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }} />
            </div>
          </>
        );
        return (
          <li key={item.key}>
            {item.href ? (
              <Link href={item.href} className="-mx-2 block rounded-md px-2 py-1.5 transition-colors hover:bg-surface-2">
                {row}
              </Link>
            ) : (
              <div className="py-1.5">{row}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
