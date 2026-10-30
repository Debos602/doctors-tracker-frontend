'use client';

import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { plural } from '@/lib/utils';
import type { Doctor } from '@/types/api';
import { useDeleteDoctor } from './api';

export function DeleteDoctorDialog({ doctor, onClose, onDeleted }: { doctor: Doctor | null; onClose: () => void; onDeleted?: () => void }) {
  const remove = useDeleteDoctor();
  const count = doctor?.patientCount ?? 0;

  return (
    <ConfirmDialog
      open={Boolean(doctor)}
      onOpenChange={(open) => !open && onClose()}
      title="Delete this doctor?"
      description={
        doctor && (
          <>
            <strong className="font-medium text-ink">{doctor.name}</strong> will be deleted
            {count > 0 ? <>, together with their {plural(count, 'patient')}</> : null}. This can’t be undone.
          </>
        )
      }
      confirmLabel="Delete doctor"
      pending={remove.isPending}
      onConfirm={async () => {
        if (!doctor) return;
        try {
          const result = await remove.mutateAsync(doctor._id);
          toast.success(
            result.deletedPatients ? `${doctor.name} and ${plural(result.deletedPatients, 'patient')} deleted` : `${doctor.name} deleted`,
          );
          onClose();
          onDeleted?.();
        } catch (e) {
          toast.error((e as Error).message);
        }
      }}
    />
  );
}
