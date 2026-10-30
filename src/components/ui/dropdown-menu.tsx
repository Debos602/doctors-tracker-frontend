'use client';

import * as Menu from '@radix-ui/react-dropdown-menu';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const DropdownMenu = Menu.Root;
export const DropdownMenuTrigger = Menu.Trigger;
export const DropdownMenuRadioGroup = Menu.RadioGroup;

export function DropdownMenuContent({ className, align = 'end', ...props }: ComponentProps<typeof Menu.Content>) {
  return (
    <Menu.Portal>
      <Menu.Content
        align={align}
        sideOffset={6}
        className={cn(
          'z-50 min-w-48 rounded-xl border border-line bg-surface p-1.5 shadow-xl data-[state=open]:animate-fade-in',
          className,
        )}
        {...props}
      />
    </Menu.Portal>
  );
}

interface ItemProps extends ComponentProps<typeof Menu.Item> {
  icon?: ReactNode;
  danger?: boolean;
}

const itemClass =
  'flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm outline-none select-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0';

export function DropdownMenuItem({ icon, danger, className, children, ...props }: ItemProps) {
  return (
    <Menu.Item
      className={cn(
        itemClass,
        danger ? 'text-danger data-[highlighted]:bg-danger-soft' : 'text-ink-2 data-[highlighted]:bg-surface-2 data-[highlighted]:text-ink',
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </Menu.Item>
  );
}

export function DropdownMenuRadioItem({ className, children, icon, ...props }: ComponentProps<typeof Menu.RadioItem> & { icon?: ReactNode }) {
  return (
    <Menu.RadioItem
      className={cn(itemClass, 'text-ink-2 data-[highlighted]:bg-surface-2 data-[state=checked]:font-medium data-[state=checked]:text-primary', className)}
      {...props}
    >
      {icon}
      {children}
    </Menu.RadioItem>
  );
}

export function DropdownMenuSeparator() {
  return <Menu.Separator className="-mx-1.5 my-1.5 h-px bg-line" />;
}

export function DropdownMenuLabel({ children }: { children: ReactNode }) {
  return <Menu.Label className="px-2.5 pt-1.5 pb-1 text-xs text-muted">{children}</Menu.Label>;
}
