'use client';

import * as RadixDialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export const Dialog = RadixDialog.Root;
export const DialogClose = RadixDialog.Close;

const widths = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl' };

interface DialogContentProps {
  title: string;
  description?: ReactNode;
  size?: keyof typeof widths;
  children: ReactNode;
  className?: string;
}

/** Bottom sheet on phones, centred dialog from `sm` up. */
export function DialogContent({ title, description, size = 'md', children, className }: DialogContentProps) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-50 bg-(--overlay) data-[state=open]:animate-fade-in" />
      <RadixDialog.Content
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] overflow-y-auto rounded-t-2xl border border-line bg-surface p-5 shadow-2xl',
          'data-[state=open]:animate-sheet-in sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-[calc(100%-2rem)]',
          'sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:p-6 sm:data-[state=open]:animate-dialog-in',
          widths[size],
          className,
        )}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line sm:hidden" aria-hidden />
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <RadixDialog.Title className="text-lg font-semibold tracking-tight">{title}</RadixDialog.Title>
            <RadixDialog.Description className={description ? 'mt-1 text-sm text-muted' : 'sr-only'}>
              {description ?? title}
            </RadixDialog.Description>
          </div>
          <RadixDialog.Close asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Close" className="-mt-1 -mr-2">
              <X />
            </Button>
          </RadixDialog.Close>
        </div>
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}

export function DialogFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end [&>button]:w-full sm:[&>button]:w-auto', className)}>
      {children}
    </div>
  );
}
