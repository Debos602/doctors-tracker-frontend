'use client';

import { useState } from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { startOfYear, subDays } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatDate, toDateInput } from '@/lib/utils';

interface Range {
  from: string;
  to: string;
}

const presets: { label: string; range: () => Range }[] = [
  { label: 'Today', range: () => ({ from: toDateInput(new Date()), to: toDateInput(new Date()) }) },
  { label: 'Last 7 days', range: () => ({ from: toDateInput(subDays(new Date(), 6)), to: toDateInput(new Date()) }) },
  { label: 'Last 30 days', range: () => ({ from: toDateInput(subDays(new Date(), 29)), to: toDateInput(new Date()) }) },
  { label: 'Last 90 days', range: () => ({ from: toDateInput(subDays(new Date(), 89)), to: toDateInput(new Date()) }) },
  { label: 'This year', range: () => ({ from: toDateInput(startOfYear(new Date())), to: toDateInput(new Date()) }) },
];

function describe({ from, to }: Range, emptyLabel: string) {
  if (!from && !to) return emptyLabel;
  const preset = presets.find((p) => {
    const r = p.range();
    return r.from === from && r.to === to;
  });
  if (preset) return preset.label;
  if (from && to) return from === to ? formatDate(from) : `${formatDate(from, 'd MMM')} – ${formatDate(to)}`;
  return from ? `From ${formatDate(from)}` : `Until ${formatDate(to)}`;
}

interface DateRangeFilterProps extends Range {
  onChange: (range: Range) => void;
  /** What the dates refer to, e.g. "Admitted" or "Added". */
  label: string;
}

export function DateRangeFilter({ from, to, onChange, label }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Range>({ from, to });
  const active = Boolean(from || to);

  const apply = (range: Range) => {
    onChange(range);
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft({ from, to });
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="secondary" className={cn('justify-between', active && 'border-primary/40 bg-primary-soft text-primary hover:bg-primary-soft')}>
          <CalendarDays />
          <span>
            {label}: {describe({ from, to }, 'any date')}
          </span>
          <ChevronDown className="text-muted" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(20rem,calc(100vw-2rem))]">
        <div className="grid gap-0.5">
          {presets.map((preset) => {
            const range = preset.range();
            const selected = range.from === from && range.to === to;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => apply(range)}
                className={cn(
                  'rounded-md px-2.5 py-2 text-left text-sm transition-colors',
                  selected ? 'bg-primary-soft font-medium text-primary' : 'text-ink-2 hover:bg-surface-2',
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
        <div className="my-3 h-px bg-line" />
        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            apply(draft);
          }}
        >
          <div className="grid grid-cols-2 gap-2">
            <label className="grid gap-1 text-xs text-muted">
              From
              <Input type="date" value={draft.from} max={draft.to || undefined} onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))} className="h-9 px-2" />
            </label>
            <label className="grid gap-1 text-xs text-muted">
              To
              <Input type="date" value={draft.to} min={draft.from || undefined} onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))} className="h-9 px-2" />
            </label>
          </div>
          <div className="flex justify-between gap-2">
            <Button variant="ghost" size="sm" disabled={!active} onClick={() => apply({ from: '', to: '' })}>
              Any date
            </Button>
            <Button type="submit" size="sm" disabled={!draft.from && !draft.to}>
              Apply dates
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
