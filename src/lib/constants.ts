import { Activity, CircleCheck, DoorOpen, Eye, TriangleAlert, type LucideIcon } from 'lucide-react';
import type { BloodGroup, Condition, Gender } from '@/types/api';

export interface ConditionMeta {
  value: Condition;
  label: string;
  /** CSS variable so light/dark each use their own validated step. */
  color: string;
  icon: LucideIcon;
}

/** Order is fixed (the census bar, legends and filters all follow it). */
export const CONDITIONS: ConditionMeta[] = [
  { value: 'stable', label: 'Stable', color: 'var(--c-stable)', icon: CircleCheck },
  { value: 'recovering', label: 'Recovering', color: 'var(--c-recovering)', icon: Activity },
  { value: 'under_observation', label: 'Under observation', color: 'var(--c-observation)', icon: Eye },
  { value: 'critical', label: 'Critical', color: 'var(--c-critical)', icon: TriangleAlert },
  { value: 'discharged', label: 'Discharged', color: 'var(--c-discharged)', icon: DoorOpen },
];

export const CONDITION_META = Object.fromEntries(CONDITIONS.map((c) => [c.value, c])) as Record<Condition, ConditionMeta>;

export const GENDERS: { value: Gender; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
];

export const GENDER_LABEL = Object.fromEntries(GENDERS.map((g) => [g.value, g.label])) as Record<Gender, string>;

export const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

/** Suggestions for the doctor form (free text is still allowed). */
export const SPECIALIZATIONS = [
  'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology', 'General Medicine', 'Gynecology',
  'Nephrology', 'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Psychiatry', 'Pulmonology',
];

export const PAGE_SIZES = [10, 20, 50];

export const AGE_GROUPS = [
  { value: '0-17', label: 'Under 18', min: 0, max: 17 },
  { value: '18-39', label: '18–39', min: 18, max: 39 },
  { value: '40-59', label: '40–59', min: 40, max: 59 },
  { value: '60-130', label: '60 and over', min: 60, max: 130 },
];
