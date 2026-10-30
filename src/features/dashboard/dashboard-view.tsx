'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Segmented } from '@/components/ui/segmented';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState, FetchingBar } from '@/components/ui/states';
import { Avatar } from '@/components/ui/avatar';
import { ConditionBadge } from '@/features/patients/condition-badge';
import { useUrlState } from '@/hooks/use-url-state';
import { GENDERS } from '@/lib/constants';
import { cn, formatDate, formatNumber } from '@/lib/utils';
import type { DashboardSummary } from '@/types/api';
import { useDashboard } from './api';
import { BarList } from './bar-list';
import { CensusBar } from './census-bar';
import { AdmissionsChart, AgeChart } from './charts';
import { DASHBOARD_DEFAULTS, DASHBOARD_RANGES, toRange, type DashboardRange } from './queries';

export function DashboardView() {
  const { state, setState, isPending: navigating } = useUrlState(DASHBOARD_DEFAULTS);
  const rangeKey = toRange(state.range);
  const range = DASHBOARD_RANGES[rangeKey];
  const { data, isPending, isError, error, refetch, isFetching, isPlaceholderData } = useDashboard(rangeKey);
  const busy = navigating || (isFetching && isPlaceholderData);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Hospital-wide patient picture, with admissions over ${range.long}`}
        actions={
          <Segmented
            label="Time range"
            value={rangeKey}
            onChange={(next) => setState({ range: next })}
            options={Object.entries(DASHBOARD_RANGES).map(([value, r]) => ({ value: value as DashboardRange, label: r.label }))}
          />
        }
      />
      {isPending ? (
        <DashboardSkeleton />
      ) : isError ? (
        <div className="rounded-xl border border-line bg-surface">
          <ErrorState message={error.message} onRetry={() => refetch()} />
        </div>
      ) : (
        <div aria-busy={busy} className={cn('relative grid gap-5 transition-opacity', busy && 'opacity-70')}>
          <FetchingBar active={busy} />
          <Census data={data} />
          <Kpis data={data} rangeLabel={range.label} />
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <Panel title="Admissions over time" description={`Patients admitted each ${data.range.granularity}, ${range.long}`}>
              <AdmissionsChart data={data.admissionsTimeline} />
            </Panel>
            <Panel
              title="Patients per doctor"
              description="Doctors with the most patients"
              action={<Link href="/doctors" className="text-[13px] font-medium text-primary hover:underline">All doctors</Link>}
            >
              {data.patientsPerDoctor.length ? (
                <BarList
                  label="Patients per doctor"
                  items={data.patientsPerDoctor.map((d) => ({
                    key: d.doctorId,
                    label: d.name,
                    sublabel: d.specialization,
                    value: d.count,
                    href: `/doctors/${d.doctorId}`,
                  }))}
                />
              ) : (
                <Empty>No patients assigned yet.</Empty>
              )}
            </Panel>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            <Panel title="Age groups" description="All current patients">
              <AgeChart data={data.patientsByAgeGroup} />
            </Panel>
            <Panel title="Doctors by specialization" description={`${formatNumber(data.totals.doctors)} doctors`}>
              {data.doctorsBySpecialization.length ? (
                <div className="max-h-56 overflow-y-auto pr-1">
                  <BarList
                    label="Doctors by specialization"
                    items={data.doctorsBySpecialization.map((s) => ({
                      key: s.specialization,
                      label: s.specialization,
                      value: s.count,
                      href: `/doctors?specialization=${encodeURIComponent(s.specialization)}`,
                    }))}
                  />
                </div>
              ) : (
                <Empty>No doctors yet.</Empty>
              )}
            </Panel>
            <Panel title="Gender" description="All current patients">
              <BarList
                label="Patients by gender"
                items={GENDERS.map((g) => ({
                  key: g.value,
                  label: g.label,
                  value: data.patientsByGender.find((x) => x.gender === g.value)?.count ?? 0,
                  href: `/patients?gender=${g.value}`,
                }))}
              />
            </Panel>
          </div>
          <RecentPatients patients={data.recentPatients} />
        </div>
      )}
    </>
  );
}

function Census({ data }: { data: DashboardSummary }) {
  return (
    <section aria-labelledby="census-title" className="rounded-xl border border-line bg-surface p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 id="census-title" className="text-[15px] font-semibold">
          Patients by condition
        </h2>
        <p className="text-sm text-muted">
          <span className="text-2xl font-semibold text-ink tabular-nums">{formatNumber(data.totals.patients)}</span> patients across{' '}
          {formatNumber(data.totals.doctors)} doctors
        </p>
      </div>
      <CensusBar data={data.patientsByCondition} linkTo={(c) => `/patients?condition=${c}`} animate />
    </section>
  );
}

function Trend({ pct }: { pct: number }) {
  const Icon = pct > 0 ? ArrowUpRight : pct < 0 ? ArrowDownRight : Minus;
  return (
    <span className="inline-flex items-center gap-0.5 text-ink-2">
      <Icon className={cn('size-4', pct > 0 ? 'text-positive' : pct < 0 ? 'text-danger' : 'text-muted')} aria-hidden />
      <span className="tabular-nums">{pct > 0 ? '+' : ''}{pct}%</span>
    </span>
  );
}

function Kpis({ data, rangeLabel }: { data: DashboardSummary; rangeLabel: string }) {
  const t = data.totals;
  const items: { label: string; value: number; detail: ReactNode; href?: string }[] = [
    { label: 'Total doctors', value: t.doctors, detail: <>{formatNumber(t.newDoctorsInRange)} added in the last {rangeLabel}</>, href: '/doctors' },
    { label: 'Total patients', value: t.patients, detail: <>{t.avgPatientsPerDoctor} per doctor on average</>, href: '/patients' },
    { label: `Admitted, last ${rangeLabel}`, value: t.admissionsInRange, detail: <><Trend pct={t.admissionsChangePct} /> vs the {rangeLabel} before</> },
    { label: 'Critical right now', value: t.criticalPatients, detail: <>{t.patients ? Math.round((t.criticalPatients / t.patients) * 100) : 0}% of all patients</>, href: '/patients?condition=critical' },
  ];

  return (
    <section aria-label="Key figures" className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
      {items.map((item) => {
        const body = (
          <>
            <p className="text-[13px] text-muted">{item.label}</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">{formatNumber(item.value)}</p>
            <p className="mt-1 text-[13px] text-ink-2">{item.detail}</p>
          </>
        );
        return item.href ? (
          <Link key={item.label} href={item.href} className="bg-surface p-4 transition-colors hover:bg-surface-2 sm:p-5">
            {body}
          </Link>
        ) : (
          <div key={item.label} className="bg-surface p-4 sm:p-5">
            {body}
          </div>
        );
      })}
    </section>
  );
}

function Panel({ title, description, action, children }: { title: string; description?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="min-w-0 rounded-xl border border-line bg-surface p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[15px] font-semibold">{title}</h2>
          {description && <p className="text-[13px] text-muted">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="py-10 text-center text-sm text-muted">{children}</p>;
}

function RecentPatients({ patients }: { patients: DashboardSummary['recentPatients'] }) {
  return (
    <Panel
      title="Recently added patients"
      action={<Link href="/patients" className="text-[13px] font-medium text-primary hover:underline">All patients</Link>}
    >
      {patients.length ? (
        <ul className="-mx-5 divide-y divide-line border-t border-line">
          {patients.map((p) => (
            <li key={p._id} className="flex items-center gap-3 px-5 py-3">
              <Avatar name={p.name} className="size-8" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="truncate text-[13px] text-muted">
                  {p.doctor ? (
                    <Link href={`/doctors/${p.doctor._id}`} className="hover:text-primary">{p.doctor.name}</Link>
                  ) : (
                    'No doctor'
                  )}
                </p>
              </div>
              <ConditionBadge condition={p.condition} className="hidden sm:inline-flex" />
              <span className="w-24 text-right text-[13px] text-muted tabular-nums">{formatDate(p.createdAt, 'd MMM')}</span>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>Patients you add will show up here.</Empty>
      )}
    </Panel>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="grid gap-5" role="status" aria-label="Loading dashboard">
      <div className="rounded-xl border border-line bg-surface p-6">
        <Skeleton className="mb-5 h-5 w-48" />
        <Skeleton className="h-12 w-full" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-5" />)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="space-y-2 bg-surface p-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}
