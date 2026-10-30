import { z } from 'zod';
import { BLOOD_GROUPS, CONDITIONS, GENDERS } from './constants';

const phone = z
  .string()
  .trim()
  .regex(/^\+?[\d\s()-]{7,20}$/, 'Enter a valid phone number, e.g. +8801711000000');

const email = z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address').max(150));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password'),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const doctorSchema = z.object({
  name: z.string().trim().min(2, 'Enter the doctor’s full name').max(100),
  specialization: z.string().trim().min(2, 'Enter a specialization').max(100),
  hospital: z.string().trim().min(2, 'Enter a hospital').max(150),
  phone,
  email,
});
export type DoctorValues = z.infer<typeof doctorSchema>;

export const patientSchema = z.object({
  name: z.string().trim().min(2, 'Enter the patient’s full name').max(100),
  age: z.number({ error: 'Enter an age between 0 and 130' }).int('Use whole years').min(0).max(130, 'Enter an age between 0 and 130'),
  gender: z.enum(GENDERS.map((g) => g.value) as [string, ...string[]], { error: 'Choose a gender' }),
  phone,
  email: z.union([z.literal(''), email]),
  condition: z.enum(CONDITIONS.map((c) => c.value) as [string, ...string[]]),
  diagnosis: z.string().trim().max(200),
  bloodGroup: z.union([z.literal(''), z.enum(BLOOD_GROUPS)]),
  admissionDate: z.string().min(1, 'Pick the admission date'),
  address: z.string().trim().max(250),
  notes: z.string().trim().max(1000),
  doctor: z.string().min(1, 'Choose the doctor responsible'),
});
export type PatientValues = z.infer<typeof patientSchema>;
