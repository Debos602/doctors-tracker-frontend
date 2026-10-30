/** Key families, so a mutation can invalidate everything it affects in one call. */
export const queryKeys = {
  doctors: {
    all: ['doctors'] as const,
    detail: (id: string) => ['doctors', 'detail', id] as const,
    options: (q: string) => ['doctors', 'options', q] as const,
  },
  patients: {
    all: ['patients'] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
  },
};
