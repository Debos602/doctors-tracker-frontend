import { queryOptions } from '@tanstack/react-query';
import type { Requester } from '@/lib/api-error';
import { zonedDayToIso } from '@/lib/dates';
import { queryKeys } from '@/lib/query-keys';
import type { Doctor, DoctorListParams } from '@/types/api';

/**
 * Query definitions shared by Server Components (prefetch with `serverApi`)
 * and Client Components (`api`). Same state + same timezone → same key, so the
 * browser picks up the server's data instead of fetching again.
 */

export const DOCTOR_SORTS = {
  newest: { sortBy: 'createdAt', order: 'desc', label: 'Recently added' },
  oldest: { sortBy: 'createdAt', order: 'asc', label: 'Oldest first' },
  name_asc: { sortBy: 'name', order: 'asc', label: 'Name: A to Z' },
  name_desc: { sortBy: 'name', order: 'desc', label: 'Name: Z to A' },
  specialization: { sortBy: 'specialization', order: 'asc', label: 'Specialization' },
} as const;

export const DOCTOR_LIST_DEFAULTS = {
  page: '1',
  limit: '10',
  q: '',
  specialization: '',
  hospital: '',
  from: '',
  to: '',
  sort: 'newest',
};
export type DoctorListState = typeof DOCTOR_LIST_DEFAULTS;

export function toDoctorParams(state: DoctorListState, tz: string): DoctorListParams {
  const sort = DOCTOR_SORTS[state.sort as keyof typeof DOCTOR_SORTS] ?? DOCTOR_SORTS.newest;
  return {
    page: Math.max(1, Number(state.page) || 1),
    limit: Math.min(100, Math.max(1, Number(state.limit) || 10)),
    q: state.q || undefined,
    specialization: state.specialization || undefined,
    hospital: state.hospital || undefined,
    from: zonedDayToIso(state.from, 'start', tz),
    to: zonedDayToIso(state.to, 'end', tz),
    sortBy: sort.sortBy,
    order: sort.order,
  };
}

export const doctorQueries = {
  list: (request: Requester, state: DoctorListState, tz: string) =>
    queryOptions({
      queryKey: [...queryKeys.doctors.all, 'list', state, tz] as const,
      queryFn: async ({ signal }) => {
        const res = await request<Doctor[]>('/doctors', { query: toDoctorParams(state, tz), signal });
        return { items: res.data, meta: res.meta! };
      },
    }),

  detail: (request: Requester, id: string) =>
    queryOptions({
      queryKey: queryKeys.doctors.detail(id),
      queryFn: async ({ signal }) => (await request<Doctor>(`/doctors/${id}`, { signal })).data,
    }),

  filters: (request: Requester) =>
    queryOptions({
      queryKey: [...queryKeys.doctors.all, 'filters'] as const,
      queryFn: async ({ signal }) =>
        (await request<{ specializations: string[]; hospitals: string[] }>('/doctors/filters', { signal })).data,
      staleTime: 5 * 60_000,
    }),
};
