'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, callAction } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { useTimezone } from '@/lib/timezone';
import type { PatientInput } from '@/types/api';
import { addPatientToDoctorAction, createPatientAction, deletePatientAction, updatePatientAction } from './actions';
import { patientQueries, type PatientListState } from './queries';

/** All patients, or one doctor's patients when `doctorId` is given. */
export function usePatients(state: PatientListState, doctorId?: string) {
  const tz = useTimezone();
  return useQuery({ ...patientQueries.list(api, state, { tz, doctorId }), placeholderData: keepPreviousData });
}

/** Patient changes move doctor counts and every dashboard number too. */
function useInvalidate() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
    ]);
}

export function useCreatePatient() {
  const invalidate = useInvalidate();
  return useMutation({
    /** With `underDoctor`, the patient is added through that doctor's list. */
    mutationFn: ({ input, underDoctor }: { input: PatientInput; underDoctor?: string }) => {
      if (!underDoctor) return callAction(createPatientAction(input));
      const { doctor: _doctor, ...body } = input; // eslint-disable-line @typescript-eslint/no-unused-vars
      return callAction(addPatientToDoctorAction(underDoctor, body));
    },
    onSuccess: invalidate,
  });
}

export function useUpdatePatient() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<PatientInput> }) => callAction(updatePatientAction(id, input)),
    onSuccess: invalidate,
  });
}

export function useDeletePatient() {
  const invalidate = useInvalidate();
  return useMutation({
    /** With `doctorId`, removes the patient from that doctor's list. */
    mutationFn: ({ id, doctorId }: { id: string; doctorId?: string }) => callAction(deletePatientAction(id, doctorId)),
    onSuccess: invalidate,
  });
}
