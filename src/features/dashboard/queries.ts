import { queryOptions } from '@tanstack/react-query';
import type { Requester } from '@/lib/api-error';
import { addDays, addMonths, todayIn, zonedDayToIso } from '@/lib/dates';
import { queryKeys } from '@/lib/query-keys';
import type { DashboardSummary } from '@/types/api';

export const DASHBOARD_RANGES = {
  '7d': { label: '7 days', long: 'the last 7 days', days: 7 },
  '30d': { label: '30 days', long: 'the last 30 days', days: 30 },
  '90d': { label: '90 days', long: 'the last 90 days', days: 90 },
  '12m': { label: '12 months', long: 'the last 12 months', months: 12 },
} as const;
export type DashboardRange = keyof typeof DASHBOARD_RANGES;

export const DASHBOARD_DEFAULTS = { range: '30d' };

export const toRange = (value: string): DashboardRange => (value in DASHBOARD_RANGES ? (value as DashboardRange) : '30d');

/** Calendar days in the viewer's timezone, from the start of the first to the end of today. */
export function dashboardDates(range: DashboardRange, tz: string) {
  const r = DASHBOARD_RANGES[range];
  const today = todayIn(tz);
  const start = 'months' in r ? addMonths(today, -r.months) : addDays(today, -(r.days - 1));
  return { from: zonedDayToIso(start, 'start', tz)!, to: zonedDayToIso(today, 'end', tz)! };
}

export const dashboardQueries = {
  summary: (request: Requester, range: DashboardRange, tz: string) =>
    queryOptions({
      queryKey: [...queryKeys.dashboard.all, 'summary', range, tz] as const,
      queryFn: async ({ signal }) =>
        (await request<DashboardSummary>('/dashboard/summary', { query: { ...dashboardDates(range, tz), tz, topDoctors: 8 }, signal })).data,
      staleTime: 60_000,
    }),
};
