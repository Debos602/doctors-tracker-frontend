import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  /** Label of the "no filter" option. Omit for selects that always have a value (e.g. sort). */
  allLabel?: string;
  className?: string;
}

export function FilterSelect({ label, value, onChange, options, allLabel, className }: FilterSelectProps) {
  const active = allLabel !== undefined && value !== '';
  return (
    <label className={cn('relative block', className)}>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-10 w-full cursor-pointer appearance-none rounded-lg border bg-surface pr-9 pl-3 text-sm font-medium transition-colors',
          active ? 'border-primary/40 bg-primary-soft text-primary' : 'border-line text-ink-2 hover:border-line-strong',
        )}
      >
        {allLabel !== undefined && <option value="">{allLabel}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
    </label>
  );
}
