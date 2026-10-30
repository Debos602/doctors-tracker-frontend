import 'server-only';
import { cache } from 'react';
import { ApiError } from '@/lib/api-error';
import type { Doctor } from '@/types/api';
import { serverApi } from './api';

export const isObjectId = (id: string) => /^[a-f\d]{24}$/i.test(id);

/**
 * One doctor, fetched at most once per request — generateMetadata and the
 * page both call it. `null` means the doctor doesn't exist.
 */
export const getDoctor = cache(async (id: string): Promise<Doctor | null> => {
  if (!isObjectId(id)) return null;
  try {
    return (await serverApi<Doctor>(`/doctors/${id}`)).data;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null;
    throw error;
  }
});
