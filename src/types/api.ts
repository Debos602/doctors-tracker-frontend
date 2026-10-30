export type Role = 'admin' | 'staff';
export type Gender = 'male' | 'female' | 'other';
export type Condition = 'stable' | 'recovering' | 'under_observation' | 'critical' | 'discharged';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type SortOrder = 'asc' | 'desc';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
}

export interface ConditionCount {
  condition: Condition;
  count: number;
}

export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  patientCount?: number;
  conditionBreakdown?: ConditionCount[];
}

export interface DoctorRef {
  _id: string;
  name: string;
  specialization: string;
  hospital?: string;
}

export interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  email?: string;
  condition: Condition;
  diagnosis?: string;
  bloodGroup?: BloodGroup;
  address?: string;
  admissionDate: string;
  notes?: string;
  doctor: DoctorRef | null;
  createdAt: string;
  updatedAt: string;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: PageMeta;
  message?: string;
}

export interface Paginated<T> {
  items: T[];
  meta: PageMeta;
}

export interface FieldError {
  field: string | null;
  message: string;
}

// ── Query params ───────────────────────────────────────────────────────────
export interface DoctorListParams {
  page: number;
  limit: number;
  q?: string;
  specialization?: string;
  hospital?: string;
  from?: string;
  to?: string;
  sortBy?: 'createdAt' | 'name' | 'specialization' | 'hospital';
  order?: SortOrder;
}

export interface PatientListParams {
  page: number;
  limit: number;
  q?: string;
  doctor?: string;
  condition?: string;
  gender?: Gender;
  minAge?: number;
  maxAge?: number;
  from?: string;
  to?: string;
  sortBy?: 'createdAt' | 'admissionDate' | 'name' | 'age';
  order?: SortOrder;
}

// ── Payloads ───────────────────────────────────────────────────────────────
export interface DoctorInput {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
}

export interface PatientInput {
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  email?: string;
  condition: Condition;
  diagnosis?: string;
  bloodGroup?: BloodGroup | '';
  address?: string;
  admissionDate?: string;
  notes?: string;
  doctor?: string;
}

// ── Dashboard ──────────────────────────────────────────────────────────────
export interface DashboardSummary {
  range: { from: string; to: string; granularity: 'day' | 'month'; timezone: string };
  totals: {
    doctors: number;
    patients: number;
    criticalPatients: number;
    avgPatientsPerDoctor: number;
    admissionsInRange: number;
    admissionsPrevRange: number;
    admissionsChangePct: number;
    newDoctorsInRange: number;
  };
  patientsByCondition: ConditionCount[];
  patientsByGender: { gender: Gender; count: number }[];
  patientsByAgeGroup: { ageGroup: string; count: number }[];
  patientsPerDoctor: { doctorId: string; name: string; specialization: string; count: number }[];
  doctorsBySpecialization: { specialization: string; count: number }[];
  admissionsTimeline: { date: string; admissions: number; critical: number; discharged: number }[];
  recentPatients: (Pick<Patient, '_id' | 'name' | 'age' | 'gender' | 'condition' | 'admissionDate' | 'createdAt'> & {
    doctor: Pick<DoctorRef, '_id' | 'name' | 'specialization'> | null;
  })[];
}
