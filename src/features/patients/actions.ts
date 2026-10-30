'use server';

import 'server-only';
import { z } from 'zod';
import { patientSchema } from '@/lib/validations';
import { parseInput, runAction, serverApi } from '@/server/api';
import { requireSession } from '@/server/session';
import type { Patient } from '@/types/api';

/**
 * Patient mutations. Each action re-checks the session (and role for deletes)
 * and validates its input — the page-level guard doesn't cover direct POSTs.
 */

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const patientInput = patientSchema.extend({ admissionDate: z.iso.datetime({ message: 'Pick the admission date' }) });

export async function createPatientAction(input: unknown) {
  return runAction(async () => {
    await requireSession();
    const body = parseInput(patientInput, input);
    return (await serverApi<Patient>('/patients', { method: 'POST', body })).data;
  });
}

/** Adds a patient under a doctor: POST /doctors/:id/patients. */
export async function addPatientToDoctorAction(doctorId: unknown, input: unknown) {
  return runAction(async () => {
    await requireSession();
    const doctor = parseInput(objectId, doctorId);
    const body = parseInput(patientInput.omit({ doctor: true }), input);
    return (await serverApi<Patient>(`/doctors/${doctor}/patients`, { method: 'POST', body })).data;
  });
}

export async function updatePatientAction(id: unknown, input: unknown) {
  return runAction(async () => {
    await requireSession();
    const patient = parseInput(objectId, id);
    const body = parseInput(patientInput.partial(), input);
    return (await serverApi<Patient>(`/patients/${patient}`, { method: 'PATCH', body })).data;
  });
}

/** With a doctor id, removes the patient from that doctor's list (DELETE /doctors/:id/patients/:patientId). */
export async function deletePatientAction(id: unknown, doctorId?: unknown) {
  return runAction(async () => {
    await requireSession('admin');
    const patient = parseInput(objectId, id);
    const doctor = doctorId === undefined ? undefined : parseInput(objectId, doctorId);
    const path = doctor ? `/doctors/${doctor}/patients/${patient}` : `/patients/${patient}`;
    await serverApi<{ _id: string }>(path, { method: 'DELETE' });
    return { _id: patient };
  });
}
