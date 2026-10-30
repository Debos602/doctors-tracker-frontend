'use client';

import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronsUpDown, LogOut, Monitor, Moon, Sun } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar } from '@/components/ui/avatar';
import { useCurrentUser } from '@/hooks/use-current-user';
import { cn } from '@/lib/utils';

export function UserMenu({ variant }: { variant: 'sidebar' | 'compact' }) {
  const { user } = useCurrentUser();
  const { theme = 'system', setTheme } = useTheme();
  const queryClient = useQueryClient();
  if (!user) return null;

  const handleSignOut = async () => {
    queryClient.clear();
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex items-center gap-2.5 rounded-lg text-left transition-colors hover:bg-surface-2',
          variant === 'sidebar' ? 'w-full p-2' : 'p-1',
        )}
        // The sidebar button shows the name as its text; the avatar-only button needs a label.
        aria-label={variant === 'compact' ? `Account and settings for ${user.name}` : undefined}
      >
        <Avatar name={user.name ?? ''} className="size-8" />
        {variant === 'sidebar' && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{user.name}</span>
              <span className="block text-xs text-muted capitalize">{user.role}</span>
            </span>
            <ChevronsUpDown className="size-4 text-muted" aria-hidden />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent side={variant === 'sidebar' ? 'top' : 'bottom'} align={variant === 'sidebar' ? 'start' : 'end'} className="w-60">
        <div className="px-2.5 py-2">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light" icon={<Sun />}>Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark" icon={<Moon />}>Dark</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system" icon={<Monitor />}>Match system</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={<LogOut />} onSelect={handleSignOut}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
