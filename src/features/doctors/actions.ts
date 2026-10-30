'use server';

import 'server-only';
import { z } from 'zod';
import { doctorSchema } from '@/lib/validations';
import { parseInput, runAction, serverApi } from '@/server/api';
import { requireSession } from '@/server/session';
import type { Doctor } from '@/types/api';

/**
 * Doctor mutations. Each action is a public endpoint, so it re-checks the
 * session (and role where needed) and validates its input before calling the API.
 */

const doctorId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid doctor id');

export async function createDoctorAction(input: unknown) {
  return runAction(async () => {
    await requireSession();
    const body = parseInput(doctorSchema, input);
    return (await serverApi<Doctor>('/doctors', { method: 'POST', body })).data;
  });
}

export async function updateDoctorAction(id: unknown, input: unknown) {
  return runAction(async () => {
    await requireSession();
    const doctor = parseInput(doctorId, id);
    const body = parseInput(doctorSchema.partial(), input);
    return (await serverApi<Doctor>(`/doctors/${doctor}`, { method: 'PATCH', body })).data;
  });
}

export async function deleteDoctorAction(id: unknown) {
  return runAction(async () => {
    await requireSession('admin');
    const doctor = parseInput(doctorId, id);
    const { data } = await serverApi<{ _id: string; deletedPatients: number }>(`/doctors/${doctor}`, { method: 'DELETE' });
    return { deletedPatients: data.deletedPatients };
  });
}
