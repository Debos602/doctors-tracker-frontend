'use client';

import { useState } from 'react';
import { Check, ChevronDown, Search, Stethoscope } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useDoctor, useDoctorOptions } from './api';

interface DoctorPickerProps {
  value: string;
  onChange: (id: string) => void;
  /** Filter mode adds an "All doctors" option and a compact trigger. */
  mode?: 'filter' | 'field';
  id?: string;
  invalid?: boolean;
}

/** Searchable doctor list backed by the API, so it scales past what a <select> can hold. */
export function DoctorPicker({ value, onChange, mode = 'field', id, invalid }: DoctorPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { data: options = [], isFetching } = useDoctorOptions(query, open);
  const { data: selected } = useDoctor(value, { enabled: Boolean(value) });

  const pick = (next: string) => {
    onChange(next);
    setOpen(false);
    setQuery('');
  };

  const label = selected?.name ?? (value ? 'Loading…' : mode === 'filter' ? 'All doctors' : 'Choose a doctor');
  const active = mode === 'filter' && Boolean(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          data-invalid={invalid || undefined}
          aria-describedby={invalid && id ? `${id}-error` : undefined}
          className={cn(
            'flex h-10 w-full items-center gap-2 rounded-lg border bg-surface px-3 text-left text-sm transition-colors',
            'hover:border-line-strong data-[invalid=true]:border-danger',
            active ? 'border-primary/40 bg-primary-soft font-medium text-primary' : 'border-line',
            !value && mode === 'field' ? 'text-muted' : !active && 'text-ink-2',
            mode === 'filter' && !active && 'font-medium',
          )}
        >
          <Stethoscope className="size-4 shrink-0 opacity-70" aria-hidden />
          <span className="min-w-0 flex-1 truncate">{label}</span>
          <ChevronDown className="size-4 shrink-0 text-muted" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(22rem,calc(100vw-2rem))] p-1.5">
        <div className="relative mb-1.5">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search doctors"
            aria-label="Search doctors"
            className="h-9 w-full rounded-md border border-line bg-surface-2 pr-2 pl-8 text-sm outline-none focus:border-primary"
          />
        </div>
        <ul role="listbox" aria-label="Doctors" className="max-h-64 overflow-y-auto">
          {mode === 'filter' && !query && (
            <Option selected={!value} onSelect={() => pick('')} title="All doctors" />
          )}
          {options.map((doctor) => (
            <Option
              key={doctor._id}
              selected={doctor._id === value}
              onSelect={() => pick(doctor._id)}
              title={doctor.name}
              subtitle={`${doctor.specialization}, ${doctor.hospital}`}
            />
          ))}
          {!options.length && (
            <li className="px-2.5 py-6 text-center text-sm text-muted">{isFetching ? 'Searching…' : 'No doctors match'}</li>
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function Option({ selected, onSelect, title, subtitle }: { selected: boolean; onSelect: () => void; title: string; subtitle?: string }) {
  return (
    <li role="option" aria-selected={selected}>
      <button type="button" onClick={onSelect} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left hover:bg-surface-2">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm text-ink">{title}</span>
          {subtitle && <span className="block truncate text-xs text-muted">{subtitle}</span>}
        </span>
        {selected && <Check className="size-4 shrink-0 text-primary" aria-hidden />}
      </button>
    </li>
  );
}
