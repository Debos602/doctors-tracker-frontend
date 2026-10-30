'use client';

import { useSession } from 'next-auth/react';

export function useCurrentUser() {
  const { data, status } = useSession();
  const user = data?.user;
  return { user, status, isAdmin: user?.role === 'admin' };
}
