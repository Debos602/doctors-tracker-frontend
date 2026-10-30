'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PageMeta } from '@/types/api';
import { PAGE_SIZES } from '@/lib/constants';
import { cn, formatNumber } from '@/lib/utils';
import { Button } from './button';

function pageItems(page: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: (number | 'gap')[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) items.push('gap');
  for (let i = start; i <= end; i++) items.push(i);
  if (end < total - 1) items.push('gap');
  items.push(total);
  return items;
}

interface PaginationProps {
  meta: PageMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  noun?: string;
}

export function Pagination({ meta, onPageChange, onLimitChange, noun = 'results' }: PaginationProps) {
  const { page, limit, total, totalPages } = meta;
  const first = total === 0 ? 0 : (page - 1) * limit + 1;
  const last = Math.min(total, page * limit);

  return (
    <nav aria-label="Pagination" className="flex flex-col gap-3 border-t border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 text-[13px] text-muted">
        <span className="tabular-nums">
          {formatNumber(first)}–{formatNumber(last)} of {formatNumber(total)} {noun}
        </span>
        <label className="flex items-center gap-1.5">
          <span>Rows</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="h-8 cursor-pointer rounded-md border border-line bg-surface px-1.5 text-[13px] text-ink"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft />
        </Button>
        <span className="px-2 text-[13px] text-muted tabular-nums sm:hidden">
          Page {page} of {totalPages}
        </span>
        <ul className="hidden items-center gap-1 sm:flex">
          {pageItems(page, totalPages).map((item, i) =>
            item === 'gap' ? (
              <li key={`gap-${i}`} className="w-6 text-center text-muted" aria-hidden>
                …
              </li>
            ) : (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => onPageChange(item)}
                  aria-current={item === page ? 'page' : undefined}
                  className={cn(
                    'h-8 min-w-8 rounded-md px-2 text-[13px] tabular-nums transition-colors',
                    item === page ? 'bg-primary-soft font-semibold text-primary' : 'text-ink-2 hover:bg-surface-2',
                  )}
                >
                  {item}
                </button>
              </li>
            ),
          )}
        </ul>
        <Button variant="ghost" size="icon-sm" aria-label="Next page" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <ChevronRight />
        </Button>
      </div>
    </nav>
  );
}
