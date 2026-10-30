'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useTimezone } from '@/lib/timezone';
import { dashboardQueries, type DashboardRange } from './queries';

export function useDashboard(range: DashboardRange) {
  const tz = useTimezone();
  return useQuery({ ...dashboardQueries.summary(api, range, tz), placeholderData: keepPreviousData });
}
