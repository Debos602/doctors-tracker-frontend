'use client';

import Link from 'next/link';
import { MoreHorizontal, Pencil, Trash2, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { CONDITION_META, GENDER_LABEL } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import type { Patient } from '@/types/api';
import { ConditionBadge } from './condition-badge';

interface PatientsTableProps {
  patients: Patient[];
  /** Hide the doctor column on a doctor's own page. */
  showDoctor?: boolean;
  canDelete: boolean;
  /** "Delete" on the patients page, "Remove from list" on a doctor's page. */
  deleteMode?: 'delete' | 'remove';
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}

function Actions({ patient, canDelete, deleteMode, onEdit, onDelete }: Omit<PatientsTableProps, 'patients' | 'showDoctor'> & { patient: Patient }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${patient.name}`}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem icon={<Pencil />} onSelect={() => onEdit(patient)}>
          Edit patient
        </DropdownMenuItem>
        {canDelete && (
          <DropdownMenuItem danger icon={deleteMode === 'remove' ? <UserMinus /> : <Trash2 />} onSelect={() => onDelete(patient)}>
            {deleteMode === 'remove' ? 'Remove from list' : 'Delete patient'}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Coloured edge marks each row's condition at a glance (the badge repeats it in words). */
const edge = (patient: Patient) => ({ boxShadow: `inset 3px 0 0 ${CONDITION_META[patient.condition].color}` });

export function PatientsTable({ patients, showDoctor = true, ...actions }: PatientsTableProps) {
  return (
    <>
      {/* Desktop */}
      <table className="hidden w-full text-sm md:table">
        <thead>
          <tr className="border-b border-line text-left text-[13px] text-muted">
            <th scope="col" className="py-3 pr-3 pl-5 font-medium">Patient</th>
            <th scope="col" className="px-3 py-3 font-medium">Age</th>
            <th scope="col" className="px-3 py-3 font-medium">Condition</th>
            <th scope="col" className="hidden px-3 py-3 font-medium xl:table-cell">Diagnosis</th>
            {showDoctor && <th scope="col" className="px-3 py-3 font-medium">Doctor</th>}
            <th scope="col" className="px-3 py-3 font-medium">Admitted</th>
            <th scope="col" className="w-12 py-3 pr-4"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {patients.map((patient) => (
            <tr key={patient._id} className="transition-colors hover:bg-surface-2" style={edge(patient)}>
              <td className="py-3 pr-3 pl-5">
                <div className="font-medium text-ink">{patient.name}</div>
                <div className="text-[13px] text-muted">{patient.email || patient.phone}</div>
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-ink-2 tabular-nums">
                {patient.age} <span className="text-muted">· {GENDER_LABEL[patient.gender]}</span>
              </td>
              <td className="px-3 py-3">
                <ConditionBadge condition={patient.condition} />
              </td>
              <td className="hidden max-w-56 truncate px-3 py-3 text-ink-2 xl:table-cell">{patient.diagnosis || '—'}</td>
              {showDoctor && (
                <td className="px-3 py-3">
                  {patient.doctor ? (
                    <Link href={`/doctors/${patient.doctor._id}`} className="text-ink-2 underline-offset-4 hover:text-primary hover:underline">
                      {patient.doctor.name}
                    </Link>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                  {patient.doctor && <div className="text-[13px] text-muted">{patient.doctor.specialization}</div>}
                </td>
              )}
              <td className="px-3 py-3 whitespace-nowrap text-ink-2 tabular-nums">{formatDate(patient.admissionDate)}</td>
              <td className="py-3 pr-4 text-right">
                <Actions patient={patient} {...actions} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Phone */}
      <ul className="divide-y divide-line md:hidden">
        {patients.map((patient) => (
          <li key={patient._id} className="flex gap-3 py-3.5 pr-2 pl-4" style={edge(patient)}>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">{patient.name}</span>
                <span className="shrink-0 text-[13px] text-muted tabular-nums">
                  {patient.age}, {GENDER_LABEL[patient.gender]}
                </span>
              </div>
              {patient.diagnosis && <div className="truncate text-[13px] text-ink-2">{patient.diagnosis}</div>}
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-muted">
                <ConditionBadge condition={patient.condition} />
                <span>Admitted {formatDate(patient.admissionDate, 'd MMM')}</span>
                {showDoctor && patient.doctor && (
                  <Link href={`/doctors/${patient.doctor._id}`} className="truncate hover:text-primary">
                    {patient.doctor.name}
                  </Link>
                )}
              </div>
            </div>
            <Actions patient={patient} {...actions} />
          </li>
        ))}
      </ul>
    </>
  );
}

export function PatientsTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="divide-y divide-line" aria-label="Loading patients" role="status">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="hidden h-5 w-24 rounded-full sm:block" />
          <Skeleton className="hidden h-4 w-28 md:block" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
