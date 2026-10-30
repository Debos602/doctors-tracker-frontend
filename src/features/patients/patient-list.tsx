'use client';

import { useCallback, useState } from 'react';
import { FilterX, Plus, SearchX, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { EmptyState, ErrorState, FetchingBar } from '@/components/ui/states';
import { ConditionFilter } from '@/components/filters/condition-filter';
import { DateRangeFilter } from '@/components/filters/date-range-filter';
import { FilterSelect } from '@/components/filters/filter-select';
import { DoctorPicker } from '@/features/doctors/doctor-picker';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useUrlState } from '@/hooks/use-url-state';
import { AGE_GROUPS, GENDERS } from '@/lib/constants';
import type { DoctorRef, Patient } from '@/types/api';
import { useDeletePatient, usePatients } from './api';
import { PatientFormDialog } from './patient-form-dialog';
import { PatientsTable, PatientsTableSkeleton } from './patients-table';
import { PATIENT_LIST_DEFAULTS, PATIENT_SORTS } from './queries';

interface PatientListProps {
  /** Scope the list to one doctor (doctor detail page). */
  doctor?: Pick<DoctorRef, '_id' | 'name'>;
}

/**
 * The patients list with search, filters, pagination and edit/delete —
 * shared by the Patients page and each doctor's page.
 */
export function PatientList({ doctor }: PatientListProps) {
  const { isAdmin } = useCurrentUser();
  const { state, setState, reset, activeCount, isPending: navigating } = useUrlState(PATIENT_LIST_DEFAULTS);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [deleting, setDeleting] = useState<Patient | null>(null);
  const deletePatient = useDeletePatient();

  const { data, isPending, isError, error, refetch, isFetching, isPlaceholderData } = usePatients(state, doctor?._id);

  const busy = navigating || (isFetching && isPlaceholderData);
  const onSearch = useCallback((search: string) => setState({ search }), [setState]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deletePatient.mutateAsync({ id: deleting._id, doctorId: doctor?._id });
      toast.success(doctor ? `${deleting.name} removed from ${doctor.name}’s list` : `${deleting.name} deleted`);
      setDeleting(null);
      // Step back if we just emptied the last page.
      const page = Number(state.page) || 1;
      if (data && data.items.length === 1 && page > 1) setState({ page: String(page - 1) });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const filtered = activeCount > 0;

  return (
    <section aria-label={doctor ? `${doctor.name}’s patients` : 'Patients'}>
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <SearchInput value={state.search} onChange={onSearch} placeholder="Search by name, phone, email or diagnosis" className="flex-1" />
          <Button onClick={openCreate} className="sm:order-last">
            <Plus /> Add patient
          </Button>
        </div>
        <ConditionFilter value={state.condition} onChange={(condition) => setState({ condition })} />
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <DateRangeFilter label="Admitted" from={state.from} to={state.to} onChange={(r) => setState(r)} />
          {!doctor && (
            <div className="col-span-2 sm:w-60">
              <DoctorPicker mode="filter" value={state.doctor} onChange={(id) => setState({ doctor: id })} />
            </div>
          )}
          <FilterSelect label="Gender" value={state.gender} onChange={(gender) => setState({ gender })} allLabel="Any gender" options={GENDERS} className="sm:w-36" />
          <FilterSelect label="Age" value={state.age} onChange={(age) => setState({ age })} allLabel="Any age" options={AGE_GROUPS} className="sm:w-36" />
          <FilterSelect
            label="Sort by"
            value={state.sort}
            onChange={(sort) => setState({ sort })}
            options={Object.entries(PATIENT_SORTS).map(([value, s]) => ({ value, label: s.label }))}
            className="col-span-2 sm:ml-auto sm:w-48"
          />
          {filtered && (
            <Button variant="ghost" onClick={reset} className="col-span-2">
              <FilterX /> Clear filters
            </Button>
          )}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-line bg-surface">
        <FetchingBar active={busy} />
        {isPending ? (
          <PatientsTableSkeleton rows={Math.min(10, Number(state.limit) || 10)} />
        ) : isError ? (
          <ErrorState message={error.message} onRetry={() => refetch()} />
        ) : data.items.length === 0 ? (
          filtered ? (
            <EmptyState
              icon={SearchX}
              title="No patients match these filters"
              description="Try a different search, or widen the date range."
              action={<Button variant="secondary" onClick={reset}>Clear filters</Button>}
            />
          ) : (
            <EmptyState
              icon={Users}
              title={doctor ? `${doctor.name} has no patients yet` : 'No patients yet'}
              description="Patients you add appear here with their condition and admission date."
              action={<Button onClick={openCreate}><Plus /> Add patient</Button>}
            />
          )
        ) : (
          <div aria-busy={busy} className={busy ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            <PatientsTable
              patients={data.items}
              showDoctor={!doctor}
              canDelete={isAdmin}
              deleteMode={doctor ? 'remove' : 'delete'}
              onEdit={(patient) => {
                setEditing(patient);
                setFormOpen(true);
              }}
              onDelete={setDeleting}
            />
            <Pagination
              meta={data.meta}
              noun="patients"
              onPageChange={(page) => setState({ page: String(page) })}
              onLimitChange={(limit) => setState({ limit: String(limit) })}
            />
          </div>
        )}
      </div>

      <PatientFormDialog open={formOpen} onOpenChange={setFormOpen} patient={editing} doctor={editing ? undefined : doctor} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={doctor ? 'Remove this patient?' : 'Delete this patient?'}
        description={
          deleting && (
            <>
              <strong className="font-medium text-ink">{deleting.name}</strong>
              {doctor ? ` will be removed from ${doctor.name}’s patient list and deleted.` : ' and their records will be deleted.'} This can’t be undone.
            </>
          )
        }
        confirmLabel={doctor ? 'Remove patient' : 'Delete patient'}
        onConfirm={confirmDelete}
        pending={deletePatient.isPending}
      />
    </section>
  );
}
