import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiError } from './api-client';

/**
 * Puts API validation errors (422) and duplicates (409) on the matching form fields.
 * Returns the message to show as a toast when nothing could be mapped.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly string[],
): string | null {
  if (!(error instanceof ApiError)) return 'Something went wrong. Try again.';

  let mapped = false;
  for (const e of error.errors ?? []) {
    if (e.field && fields.includes(e.field)) {
      const message = error.code === 'DUPLICATE' ? `Another record already uses this ${e.field}` : e.message;
      setError(e.field as Path<T>, { type: 'server', message });
      mapped = true;
    }
  }
  return mapped ? null : error.message;
}
