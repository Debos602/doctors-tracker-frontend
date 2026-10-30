'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Dialog, DialogClose, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea, errorProps } from '@/components/ui/input';
import { BLOOD_GROUPS, CONDITIONS, GENDERS } from '@/lib/constants';
import { patientSchema, type PatientValues } from '@/lib/validations';
import { applyServerErrors } from '@/lib/form-errors';
import { cn, dayToIso, toDateInput } from '@/lib/utils';
import { DoctorPicker } from '@/features/doctors/doctor-picker';
import type { DoctorRef, Patient, PatientInput } from '@/types/api';
import { useCreatePatient, useUpdatePatient } from './api';

interface PatientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Edit this patient; omit to create. */
  patient?: Patient | null;
  /** Create under this doctor (the doctor field is fixed and hidden). */
  doctor?: Pick<DoctorRef, '_id' | 'name'>;
}

const FIELDS = Object.keys(patientSchema.shape);

function defaults(patient?: Patient | null, doctorId?: string): PatientValues {
  return {
    name: patient?.name ?? '',
    age: patient?.age ?? (undefined as unknown as number),
    gender: patient?.gender ?? '',
    phone: patient?.phone ?? '',
    email: patient?.email ?? '',
    condition: patient?.condition ?? 'stable',
    diagnosis: patient?.diagnosis ?? '',
    bloodGroup: patient?.bloodGroup ?? '',
    admissionDate: patient ? toDateInput(patient.admissionDate) : toDateInput(new Date()),
    address: patient?.address ?? '',
    notes: patient?.notes ?? '',
    doctor: patient?.doctor?._id ?? doctorId ?? '',
  };
}

export function PatientFormDialog({ open, onOpenChange, patient, doctor }: PatientFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <DialogContent
          size="lg"
          title={patient ? 'Edit patient' : 'Add patient'}
          description={doctor && !patient ? `This patient will be added to ${doctor.name}’s list.` : undefined}
        >
          {/* Mounted only while open, so every opening starts from fresh values. */}
          <PatientForm patient={patient} doctor={doctor} onDone={() => onOpenChange(false)} />
        </DialogContent>
      )}
    </Dialog>
  );
}

function PatientForm({ patient, doctor, onDone }: { patient?: Patient | null; doctor?: Pick<DoctorRef, '_id' | 'name'>; onDone: () => void }) {
  const isEdit = Boolean(patient);
  const create = useCreatePatient();
  const update = useUpdatePatient();
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<PatientValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: defaults(patient, doctor?._id),
  });

  const onSubmit = handleSubmit(async (values) => {
    const input: PatientInput = {
      ...values,
      gender: values.gender as PatientInput['gender'],
      condition: values.condition as PatientInput['condition'],
      admissionDate: dayToIso(values.admissionDate),
    };
    try {
      if (patient) {
        await update.mutateAsync({ id: patient._id, input });
        toast.success('Patient updated');
      } else {
        const created = await create.mutateAsync({ input, underDoctor: doctor?._id });
        toast.success(`${created.name} added`);
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
      <fieldset disabled={pending} className="grid gap-4 sm:grid-cols-6">
        <Field label="Full name" htmlFor="name" error={errors.name?.message} required className="sm:col-span-4">
          <Input {...register('name')} {...errorProps('name', errors.name?.message)} autoComplete="off" autoFocus />
        </Field>
        <Field label="Age" htmlFor="age" error={errors.age?.message} required className="sm:col-span-2">
          <Input type="number" inputMode="numeric" min={0} max={130} {...register('age', { valueAsNumber: true })} {...errorProps('age', errors.age?.message)} />
        </Field>

        <Field label="Gender" htmlFor="gender-female" error={errors.gender?.message} required className="sm:col-span-6">
          <Controller
            control={control}
            name="gender"
            render={({ field }) => (
              <div role="radiogroup" aria-label="Gender" className="grid grid-cols-3 gap-2">
                {GENDERS.map((g) => (
                  <label
                    key={g.value}
                    className={cn(
                      'flex h-10 cursor-pointer items-center justify-center rounded-lg border text-sm font-medium transition-colors has-focus-visible:ring-3 has-focus-visible:ring-primary/20',
                      field.value === g.value ? 'border-primary bg-primary-soft text-primary' : 'border-line text-ink-2 hover:border-line-strong',
                    )}
                  >
                    <input
                      id={`gender-${g.value}`}
                      type="radio"
                      className="sr-only"
                      name={field.name}
                      value={g.value}
                      checked={field.value === g.value}
                      onChange={() => field.onChange(g.value)}
                    />
                    {g.label}
                  </label>
                ))}
              </div>
            )}
          />
        </Field>

        <Field label="Phone" htmlFor="phone" error={errors.phone?.message} required className="sm:col-span-3">
          <Input type="tel" placeholder="+8801711000000" {...register('phone')} {...errorProps('phone', errors.phone?.message)} />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email?.message} className="sm:col-span-3">
          <Input type="email" placeholder="Optional" {...register('email')} {...errorProps('email', errors.email?.message)} />
        </Field>

        {!doctor && (
          <Field label="Doctor" htmlFor="doctor" error={errors.doctor?.message} required className="sm:col-span-6">
            <Controller
              control={control}
              name="doctor"
              render={({ field }) => <DoctorPicker id="doctor" value={field.value} onChange={field.onChange} invalid={Boolean(errors.doctor)} />}
            />
          </Field>
        )}

        <Field label="Condition" htmlFor="condition" error={errors.condition?.message} required className="sm:col-span-3">
          <Select {...register('condition')} {...errorProps('condition', errors.condition?.message)}>
            {CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Admitted on" htmlFor="admissionDate" error={errors.admissionDate?.message} required className="sm:col-span-3">
          <Input type="date" max={toDateInput(new Date())} {...register('admissionDate')} {...errorProps('admissionDate', errors.admissionDate?.message)} />
        </Field>

        <Field label="Diagnosis" htmlFor="diagnosis" error={errors.diagnosis?.message} className="sm:col-span-4">
          <Input placeholder="e.g. Hypertension" {...register('diagnosis')} {...errorProps('diagnosis', errors.diagnosis?.message)} />
        </Field>
        <Field label="Blood group" htmlFor="bloodGroup" error={errors.bloodGroup?.message} className="sm:col-span-2">
          <Select {...register('bloodGroup')} {...errorProps('bloodGroup', errors.bloodGroup?.message)}>
            <option value="">Unknown</option>
            {BLOOD_GROUPS.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Address" htmlFor="address" error={errors.address?.message} className="sm:col-span-6">
          <Input placeholder="Optional" autoComplete="off" {...register('address')} {...errorProps('address', errors.address?.message)} />
        </Field>
        <Field label="Notes" htmlFor="notes" error={errors.notes?.message} className="sm:col-span-6">
          <Textarea rows={3} placeholder="Treatment plan, follow-ups, allergies…" {...register('notes')} {...errorProps('notes', errors.notes?.message)} />
        </Field>
      </fieldset>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="secondary" disabled={pending}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" loading={pending}>
          {isEdit ? 'Save changes' : 'Add patient'}
        </Button>
      </DialogFooter>
    </form>
  );
}
