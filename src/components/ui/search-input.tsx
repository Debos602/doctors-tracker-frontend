'use client';

import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { controlClass } from './input';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  delay?: number;
}

/** Debounced: the URL (and the request) only update once typing pauses. */
export function SearchInput({ value, onChange, placeholder, className, delay = 300 }: SearchInputProps) {
  const [text, setText] = useState(value);
  const [synced, setSynced] = useState(value);

  // Follow outside changes (e.g. "Clear filters") without an effect.
  if (value !== synced) {
    setSynced(value);
    if (value !== text.trim()) setText(value);
  }

  useEffect(() => {
    const next = text.trim();
    if (next === value) return;
    const timer = setTimeout(() => onChange(next), delay);
    return () => clearTimeout(timer);
  }, [text, value, onChange, delay]);

  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
      <input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && setText('')}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(controlClass, 'h-10 pr-9 pl-9 [&::-webkit-search-cancel-button]:hidden')}
      />
      {text && (
        <button
          type="button"
          onClick={() => setText('')}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-ink"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
