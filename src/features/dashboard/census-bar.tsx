import Link from 'next/link';
import { CONDITIONS } from '@/lib/constants';
import { cn, formatNumber } from '@/lib/utils';
import type { ConditionCount } from '@/types/api';

interface CensusBarProps {
  data: ConditionCount[];
  size?: 'lg' | 'sm';
  /** Make each legend item a link to the filtered patient list. */
  linkTo?: (condition: string) => string;
  animate?: boolean;
}

/**
 * The ward census: every patient as one bar, split by condition in a fixed
 * order, with a 2px gap between segments. Identity never relies on colour
 * alone — the legend repeats each condition with its icon, count and share.
 */
export function CensusBar({ data, size = 'lg', linkTo, animate }: CensusBarProps) {
  const counts = new Map(data.map((d) => [d.condition, d.count]));
  const rows = CONDITIONS.map((meta) => ({ ...meta, count: counts.get(meta.value) ?? 0 }));
  const total = rows.reduce((sum, r) => sum + r.count, 0);

  return (
    <div>
      <div
        role="img"
        aria-label={total ? rows.filter((r) => r.count).map((r) => `${r.label}: ${r.count}`).join(', ') : 'No patients yet'}
        className={cn('flex w-full gap-[2px] overflow-hidden rounded-md bg-surface-2', size === 'lg' ? 'h-12' : 'h-3', animate && 'animate-census')}
      >
        {rows
          .filter((r) => r.count > 0)
          .map((r) => (
            <div key={r.value} className="h-full min-w-1" style={{ flexGrow: r.count, backgroundColor: r.color }} title={`${r.label}: ${r.count}`} />
          ))}
      </div>

      <ul className={cn('grid gap-x-6', size === 'lg' ? 'mt-4 grid-cols-2 gap-y-3 sm:grid-cols-3 xl:grid-cols-5' : 'mt-3 gap-y-1.5')}>
        {rows.map((r) => {
          const Icon = r.icon;
          const share = total ? Math.round((r.count / total) * 100) : 0;
          const body = (
            <>
              <Icon className="size-4 shrink-0" style={{ color: r.color }} aria-hidden />
              <span className={cn('min-w-0 flex-1 truncate', size === 'lg' ? 'text-[13px] text-ink-2' : 'text-[13px] text-ink-2')}>{r.label}</span>
              <span className="font-semibold tabular-nums">{formatNumber(r.count)}</span>
              <span className="w-9 text-right text-[13px] text-muted tabular-nums">{share}%</span>
            </>
          );
          return (
            <li key={r.value}>
              {linkTo ? (
                <Link href={linkTo(r.value)} className="-mx-2 flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-surface-2">
                  {body}
                </Link>
              ) : (
                <div className="flex items-center gap-2 py-0.5">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
