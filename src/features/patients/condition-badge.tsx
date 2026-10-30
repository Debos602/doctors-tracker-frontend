import { CONDITION_META } from '@/lib/constants';
import type { Condition } from '@/types/api';
import { cn } from '@/lib/utils';

/** Icon carries the colour; the text stays in ink so it is readable on any surface. */
export function ConditionBadge({ condition, className }: { condition: Condition; className?: string }) {
  const meta = CONDITION_META[condition];
  const Icon = meta.icon;
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs font-medium whitespace-nowrap text-ink-2', className)}>
      <Icon className="size-3.5" style={{ color: meta.color }} aria-hidden />
      {meta.label}
    </span>
  );
}
