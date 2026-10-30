'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, callAction } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { useTimezone } from '@/lib/timezone';
import type { Doctor, DoctorInput } from '@/types/api';
import { createDoctorAction, deleteDoctorAction, updateDoctorAction } from './actions';
import { doctorQueries, type DoctorListState } from './queries';

export function useDoctors(state: DoctorListState) {
  const tz = useTimezone();
  // keepPreviousData: the current page stays on screen while the next one loads.
  return useQuery({ ...doctorQueries.list(api, state, tz), placeholderData: keepPreviousData });
}

export function useDoctor(id: string, { enabled = true } = {}) {
  return useQuery({ ...doctorQueries.detail(api, id), enabled: enabled && Boolean(id) });
}

export function useDoctorFilterOptions() {
  return useQuery(doctorQueries.filters(api));
}

/** Small, name-sorted result set for the doctor picker. */
export function useDoctorOptions(q: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.doctors.options(q),
    queryFn: async ({ signal }) =>
      (await api<Doctor[]>('/doctors', { query: { q, limit: 20, sortBy: 'name', order: 'asc' }, signal })).data,
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

/** Doctor changes move patient lists (doctor names) and dashboard numbers too. */
function useInvalidateAll() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
    ]);
}

export function useCreateDoctor() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (input: DoctorInput) => callAction(createDoctorAction(input)),
    onSuccess: invalidate,
  });
}

export function useUpdateDoctor() {
  const invalidate = useInvalidateAll();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<DoctorInput> }) => callAction(updateDoctorAction(id, input)),
    onSuccess: (doctor) => {
      // Show the edit at once on the detail page, keeping the patient counts we already have.
      queryClient.setQueryData<Doctor>(queryKeys.doctors.detail(doctor._id), (old) => (old ? { ...old, ...doctor } : old));
      return invalidate();
    },
  });
}

export function useDeleteDoctor() {
  const invalidate = useInvalidateAll();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => callAction(deleteDoctorAction(id)),
    onSuccess: (_result, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.doctors.detail(id) });
      return invalidate();
    },
  });
}
