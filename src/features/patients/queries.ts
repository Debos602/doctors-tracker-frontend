import { queryOptions } from '@tanstack/react-query';
import type { Requester } from '@/lib/api-error';
import { AGE_GROUPS } from '@/lib/constants';
import { zonedDayToIso } from '@/lib/dates';
import { queryKeys } from '@/lib/query-keys';
import type { Patient, PatientListParams } from '@/types/api';

export const PATIENT_SORTS = {
  newest: { sortBy: 'createdAt', order: 'desc', label: 'Recently added' },
  admitted_desc: { sortBy: 'admissionDate', order: 'desc', label: 'Admitted: newest' },
  admitted_asc: { sortBy: 'admissionDate', order: 'asc', label: 'Admitted: oldest' },
  name_asc: { sortBy: 'name', order: 'asc', label: 'Name: A to Z' },
  age_desc: { sortBy: 'age', order: 'desc', label: 'Age: oldest first' },
  age_asc: { sortBy: 'age', order: 'asc', label: 'Age: youngest first' },
} as const;

export const PATIENT_LIST_DEFAULTS = {
  page: '1',
  limit: '10',
  q: '',
  condition: '',
  gender: '',
  age: '',
  doctor: '',
  from: '',
  to: '',
  sort: 'newest',
};
export type PatientListState = typeof PATIENT_LIST_DEFAULTS;

interface Scope {
  tz: string;
  /** Lists one doctor's patients through GET /doctors/:id/patients. */
  doctorId?: string;
}

export function toPatientParams(state: PatientListState, { tz, doctorId }: Scope): PatientListParams {
  const sort = PATIENT_SORTS[state.sort as keyof typeof PATIENT_SORTS] ?? PATIENT_SORTS.newest;
  const age = AGE_GROUPS.find((g) => g.value === state.age);
  return {
    page: Math.max(1, Number(state.page) || 1),
    limit: Math.min(100, Math.max(1, Number(state.limit) || 10)),
    q: state.q || undefined,
    condition: state.condition || undefined,
    gender: (state.gender || undefined) as PatientListParams['gender'],
    minAge: age?.min,
    maxAge: age?.max,
    doctor: doctorId ? undefined : state.doctor || undefined,
    from: zonedDayToIso(state.from, 'start', tz),
    to: zonedDayToIso(state.to, 'end', tz),
    sortBy: sort.sortBy,
    order: sort.order,
  };
}

export const patientQueries = {
  list: (request: Requester, state: PatientListState, scope: Scope) =>
    queryOptions({
      queryKey: [...queryKeys.patients.all, 'list', state, scope.tz, scope.doctorId ?? null] as const,
      queryFn: async ({ signal }) => {
        const query = toPatientParams(state, scope);
        const path = scope.doctorId ? `/doctors/${scope.doctorId}/patients` : '/patients';
        const res = await request<Patient[]>(path, { query, signal });
        return { items: res.data, meta: res.meta! };
      },
    }),
};
