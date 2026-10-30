'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Dialog, DialogClose, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Field, Input, errorProps } from '@/components/ui/input';
import { SPECIALIZATIONS } from '@/lib/constants';
import { doctorSchema, type DoctorValues } from '@/lib/validations';
import { applyServerErrors } from '@/lib/form-errors';
import type { Doctor } from '@/types/api';
import { useCreateDoctor, useDoctorFilterOptions, useUpdateDoctor } from './api';

const FIELDS = Object.keys(doctorSchema.shape);

interface DoctorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor?: Doctor | null;
  onCreated?: (doctor: Doctor) => void;
}

export function DoctorFormDialog({ open, onOpenChange, doctor, onCreated }: DoctorFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <DialogContent title={doctor ? 'Edit doctor' : 'Add doctor'} description={doctor ? undefined : 'You can add their patients right after.'}>
          <DoctorForm doctor={doctor} onDone={() => onOpenChange(false)} onCreated={onCreated} />
        </DialogContent>
      )}
    </Dialog>
  );
}

function DoctorForm({ doctor, onDone, onCreated }: { doctor?: Doctor | null; onDone: () => void; onCreated?: (doctor: Doctor) => void }) {
  const create = useCreateDoctor();
  const update = useUpdateDoctor();
  const { data: options } = useDoctorFilterOptions();
  const specializations = Array.from(new Set([...(options?.specializations ?? []), ...SPECIALIZATIONS])).sort();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<DoctorValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: doctor?.name ?? '',
      specialization: doctor?.specialization ?? '',
      hospital: doctor?.hospital ?? '',
      phone: doctor?.phone ?? '',
      email: doctor?.email ?? '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (doctor) {
        await update.mutateAsync({ id: doctor._id, input: values });
        toast.success('Doctor updated');
      } else {
        const created = await create.mutateAsync(values);
        toast.success(`${created.name} added`);
        onCreated?.(created);
      }
      onDone();
    } catch (error) {
      const message = applyServerErrors(error, setError, FIELDS);
      if (message) toast.error(message);
    }
  });

  const pending = create.isPending || update.isPending;

  return (
    <form onSubmit={onSubmit} noValidate>
      <fieldset disabled={pending} className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="name" error={errors.name?.message} required className="sm:col-span-2">
          <Input placeholder="Dr. Ayesha Rahman" autoFocus autoComplete="off" {...register('name')} {...errorProps('name', errors.name?.message)} />
        </Field>
        <Field label="Specialization" htmlFor="specialization" error={errors.specialization?.message} required>
          <Input list="specialization-options" autoComplete="off" {...register('specialization')} {...errorProps('specialization', errors.specialization?.message)} />
          <datalist id="specialization-options">
            {specializations.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </Field>
        <Field label="Hospital" htmlFor="hospital" error={errors.hospital?.message} required>
          <Input list="hospital-options" autoComplete="off" {...register('hospital')} {...errorProps('hospital', errors.hospital?.message)} />
          <datalist id="hospital-options">
            {(options?.hospitals ?? []).map((h) => (
              <option key={h} value={h} />
            ))}
          </datalist>
        </Field>
        <Field label="Phone" htmlFor="phone" error={errors.phone?.message} required>
          <Input type="tel" placeholder="+8801711000000" {...register('phone')} {...errorProps('phone', errors.phone?.message)} />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email?.message} required>
          <Input type="email" placeholder="name@hospital.com" {...register('email')} {...errorProps('email', errors.email?.message)} />
        </Field>
      </fieldset>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="secondary" disabled={pending}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" loading={pending} disabled={Boolean(doctor) && !isDirty}>
          {doctor ? 'Save changes' : 'Add doctor'}
        </Button>
      </DialogFooter>
    </form>
  );
}
