'use client';

import { CONDITIONS } from '@/lib/constants';
import type { Condition } from '@/types/api';
import { cn } from '@/lib/utils';

/** Multi-select chips; the value is a comma list, as the API expects. */
export function ConditionFilter({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const selected = new Set(value ? (value.split(',') as Condition[]) : []);

  const toggle = (condition: Condition) => {
    const next = new Set(selected);
    if (next.has(condition)) next.delete(condition);
    else next.add(condition);
    onChange(CONDITIONS.filter((c) => next.has(c.value)).map((c) => c.value).join(','));
  };

  return (
    <div role="group" aria-label="Filter by condition" className="flex flex-wrap gap-1.5">
      {CONDITIONS.map(({ value: condition, label, color, icon: Icon }) => {
        const on = selected.has(condition);
        return (
          <button
            key={condition}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(condition)}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors',
              on ? 'border-ink/25 bg-surface-2 text-ink' : 'border-line bg-surface text-ink-2 hover:border-line-strong',
            )}
          >
            <Icon className="size-3.5" style={{ color }} aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}
