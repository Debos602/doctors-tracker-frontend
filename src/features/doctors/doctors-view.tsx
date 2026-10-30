'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, FilterX, MoreHorizontal, Pencil, Plus, SearchX, Stethoscope, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DoctorAvatar } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/ui/page-header';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState, FetchingBar } from '@/components/ui/states';
import { DateRangeFilter } from '@/components/filters/date-range-filter';
import { FilterSelect } from '@/components/filters/filter-select';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useUrlState } from '@/hooks/use-url-state';
import { cn, formatDate, formatNumber, plural } from '@/lib/utils';
import type { Doctor } from '@/types/api';
import { useDoctorFilterOptions, useDoctors } from './api';
import { DeleteDoctorDialog } from './delete-doctor-dialog';
import { DoctorFormDialog } from './doctor-form-dialog';
import { DOCTOR_LIST_DEFAULTS, DOCTOR_SORTS } from './queries';

/** Keeps the row menu in view even if a very long name makes the table scroll sideways. */
const PINNED = 'sticky right-0 bg-surface transition-colors group-hover:bg-surface-2';

export function DoctorsView() {
  const router = useRouter();
  const { isAdmin } = useCurrentUser();
  const { state, setState, reset, activeCount, isPending: navigating } = useUrlState(DOCTOR_LIST_DEFAULTS);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [deleting, setDeleting] = useState<Doctor | null>(null);
  const { data: options } = useDoctorFilterOptions();

  const { data, isPending, isError, error, refetch, isFetching, isPlaceholderData } = useDoctors(state);
  const busy = navigating || (isFetching && isPlaceholderData);
  const onSearch = useCallback((search: string) => setState({ search }), [setState]);
  const maxPatients = Math.max(1, ...(data?.items.map((d) => d.patientCount ?? 0) ?? []));
  const filtered = activeCount > 0;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const menu = (doctor: Doctor) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${doctor.name}`} onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem icon={<Users />} onSelect={() => router.push(`/doctors/${doctor._id}`)}>
          View patients
        </DropdownMenuItem>
        <DropdownMenuItem
          icon={<Pencil />}
          onSelect={() => {
            setEditing(doctor);
            setFormOpen(true);
          }}
        >
          Edit doctor
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem danger icon={<Trash2 />} onSelect={() => setDeleting(doctor)}>
            Delete doctor
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <PageHeader
        title="Doctors"
        description={data ? `${plural(data.meta.total, 'doctor')}${filtered ? ' match your filters' : ' on record'}` : 'Everyone on staff and the patients they look after'}
        actions={
          <Button onClick={openCreate}>
            <Plus /> Add doctor
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-2 lg:flex lg:flex-wrap">
        <SearchInput value={state.search} onChange={onSearch} placeholder="Search name, specialization, hospital, email or phone" className="col-span-2 lg:min-w-80 lg:flex-1" />
        <FilterSelect
          label="Specialization"
          value={state.specialization}
          onChange={(specialization) => setState({ specialization })}
          allLabel="All specializations"
          options={(options?.specializations ?? []).map((s) => ({ value: s, label: s }))}
          className="lg:w-52"
        />
        <FilterSelect
          label="Hospital"
          value={state.hospital}
          onChange={(hospital) => setState({ hospital })}
          allLabel="All hospitals"
          options={(options?.hospitals ?? []).map((h) => ({ value: h, label: h }))}
          className="lg:w-56"
        />
        <DateRangeFilter label="Added" from={state.from} to={state.to} onChange={(r) => setState(r)} />
        <FilterSelect
          label="Sort by"
          value={state.sort}
          onChange={(sort) => setState({ sort })}
          options={Object.entries(DOCTOR_SORTS).map(([value, s]) => ({ value, label: s.label }))}
          className="lg:w-44"
        />
        {filtered && (
          <Button variant="ghost" onClick={reset} className="col-span-2 lg:col-span-1">
            <FilterX /> Clear filters
          </Button>
        )}
      </div>

      <div className="relative overflow-hidden rounded-xl border border-line bg-surface">
        <FetchingBar active={busy} />
        {isPending ? (
          <DoctorsSkeleton rows={Math.min(10, Number(state.limit) || 10)} />
        ) : isError ? (
          <ErrorState message={error.message} onRetry={() => refetch()} />
        ) : data.items.length === 0 ? (
          filtered ? (
            <EmptyState
              icon={SearchX}
              title="No doctors match these filters"
              description="Check the spelling, or clear a filter to see more doctors."
              action={<Button variant="secondary" onClick={reset}>Clear filters</Button>}
            />
          ) : (
            <EmptyState
              icon={Stethoscope}
              title="No doctors yet"
              description="Add your first doctor, then add the patients they look after."
              action={<Button onClick={openCreate}><Plus /> Add doctor</Button>}
            />
          )
        ) : (
          <div aria-busy={busy} className={busy ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            {/* Desktop. Columns that don't fit fold into the row on narrower screens; the menu column is pinned. */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-[13px] text-muted">
                    <th scope="col" className="py-3 pr-3 pl-5 font-medium">Doctor</th>
                    <th scope="col" className="px-3 py-3 font-medium">
                      Specialization<span className="xl:hidden"> and hospital</span>
                    </th>
                    <th scope="col" className="hidden px-3 py-3 font-medium xl:table-cell">Hospital</th>
                    <th scope="col" className="hidden px-3 py-3 font-medium 2xl:table-cell">Phone</th>
                    <th scope="col" className="px-3 py-3 font-medium xl:w-36">Patients</th>
                    <th scope="col" className="px-3 py-3 font-medium">Added</th>
                    <th scope="col" className={cn(PINNED, 'w-12 py-3 pr-4')}>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.items.map((doctor) => (
                    <tr
                      key={doctor._id}
                      onClick={() => router.push(`/doctors/${doctor._id}`)}
                      className="group cursor-pointer transition-colors hover:bg-surface-2"
                    >
                      <td className="py-3 pr-3 pl-5">
                        {/* max-width only works on a block inside a cell, never on the <td> itself */}
                        <div className="flex max-w-60 items-center gap-3">
                          <DoctorAvatar />
                          <div className="min-w-0">
                            <Link
                              href={`/doctors/${doctor._id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="block truncate font-medium text-ink hover:text-primary"
                            >
                              {doctor.name}
                            </Link>
                            <div className="truncate text-[13px] text-muted" title={doctor.email}>{doctor.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="max-w-40 truncate text-ink-2 xl:max-w-48" title={doctor.specialization}>{doctor.specialization}</div>
                        <div className="max-w-40 truncate text-[13px] text-muted xl:hidden" title={doctor.hospital}>{doctor.hospital}</div>
                      </td>
                      <td className="hidden px-3 py-3 text-ink-2 xl:table-cell">
                        <div className="max-w-52 truncate" title={doctor.hospital}>{doctor.hospital}</div>
                      </td>
                      <td className="hidden px-3 py-3 whitespace-nowrap text-ink-2 tabular-nums 2xl:table-cell">{doctor.phone}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 text-right font-medium tabular-nums">{formatNumber(doctor.patientCount ?? 0)}</span>
                          <span className="hidden h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2 xl:block" aria-hidden>
                            <span className="block h-full rounded-full bg-primary/70" style={{ width: `${((doctor.patientCount ?? 0) / maxPatients) * 100}%` }} />
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-ink-2 tabular-nums">{formatDate(doctor.createdAt)}</td>
                      <td className={cn(PINNED, 'py-3 pr-4 text-right')}>{menu(doctor)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Phone */}
            <ul className="divide-y divide-line md:hidden">
              {data.items.map((doctor) => (
                <li key={doctor._id} className="flex items-start gap-3 py-3.5 pr-2 pl-4">
                  <DoctorAvatar className="mt-0.5" />
                  <Link href={`/doctors/${doctor._id}`} className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{doctor.name}</span>
                    <span className="block truncate text-[13px] text-ink-2">{doctor.specialization}</span>
                    <span className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-muted">
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3.5" aria-hidden /> {plural(doctor.patientCount ?? 0, 'patient')}
                      </span>
                      <span className="inline-flex min-w-0 items-center gap-1">
                        <Building2 className="size-3.5 shrink-0" aria-hidden /> <span className="truncate">{doctor.hospital}</span>
                      </span>
                    </span>
                  </Link>
                  {menu(doctor)}
                </li>
              ))}
            </ul>

            <Pagination
              meta={data.meta}
              noun="doctors"
              onPageChange={(page) => setState({ page: String(page) })}
              onLimitChange={(limit) => setState({ limit: String(limit) })}
            />
          </div>
        )}
      </div>

      <DoctorFormDialog open={formOpen} onOpenChange={setFormOpen} doctor={editing} onCreated={(d) => router.push(`/doctors/${d._id}`)} />
      <DeleteDoctorDialog doctor={deleting} onClose={() => setDeleting(null)} />
    </>
  );
}

export function DoctorsSkeleton({ rows }: { rows: number }) {
  return (
    <div className="divide-y divide-line" role="status" aria-label="Loading doctors">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-3.5">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="hidden h-4 w-28 md:block" />
          <Skeleton className="hidden h-4 w-36 lg:block" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

