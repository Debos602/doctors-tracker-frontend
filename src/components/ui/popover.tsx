'use client';

import * as RadixPopover from '@radix-ui/react-popover';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const Popover = RadixPopover.Root;
export const PopoverTrigger = RadixPopover.Trigger;
export const PopoverClose = RadixPopover.Close;

export function PopoverContent({ className, align = 'start', ...props }: ComponentProps<typeof RadixPopover.Content>) {
  return (
    <RadixPopover.Portal>
      <RadixPopover.Content
        align={align}
        sideOffset={6}
        collisionPadding={12}
        className={cn('z-50 rounded-xl border border-line bg-surface p-3 shadow-xl data-[state=open]:animate-fade-in', className)}
        {...props}
      />
    </RadixPopover.Portal>
  );
}
