'use client';

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatNumber } from '@/lib/utils';
import type { DashboardSummary } from '@/types/api';

const axisTick = { fill: 'var(--chart-axis)', fontSize: 12 };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-10-04" → "4 Oct", "2026-10" → "Oct 26" — parsed by hand so no timezone can shift it. */
function bucketLabel(key: string, long = false) {
  const [y, m, d] = key.split('-').map(Number);
  if (d) return long ? `${d} ${MONTHS[m - 1]} ${y}` : `${d} ${MONTHS[m - 1]}`;
  return long ? `${MONTHS[m - 1]} ${y}` : `${MONTHS[m - 1]} ${String(y).slice(2)}`;
}

interface TooltipEntry {
  name?: string | number;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
}

function ChartTooltip({ active, payload, label, long }: { active?: boolean; payload?: TooltipEntry[]; label?: string | number; long?: boolean }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-40 rounded-lg border border-line bg-surface px-3 py-2 text-[13px] shadow-lg">
      <div className="mb-1.5 font-medium text-ink">{long ? bucketLabel(String(label), true) : label}</div>
      {payload.map((entry) => (
        <div key={String(entry.dataKey)} className="flex items-center gap-2 text-ink-2">
          <span className="size-2 rounded-full" style={{ backgroundColor: entry.color }} aria-hidden />
          {entry.name}
          <span className="ml-auto pl-4 font-medium text-ink tabular-nums">{formatNumber(Number(entry.value))}</span>
        </div>
      ))}
    </div>
  );
}

export function AdmissionsChart({ data }: { data: DashboardSummary['admissionsTimeline'] }) {
  return (
    <div>
      <ul className="mb-3 flex gap-5 text-[13px] text-ink-2" aria-label="Legend">
        <li className="flex items-center gap-2">
          <span className="h-0.5 w-4 rounded-full bg-primary" aria-hidden /> All admissions
        </li>
        <li className="flex items-center gap-2">
          <span className="h-0.5 w-4 rounded-full bg-(--c-critical)" aria-hidden /> Admitted critical
        </li>
      </ul>
      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
            <XAxis dataKey="date" tickFormatter={(v) => bucketLabel(String(v))} tick={axisTick} tickLine={false} axisLine={false} minTickGap={28} tickMargin={8} />
            <YAxis allowDecimals={false} tick={axisTick} tickLine={false} axisLine={false} width={44} />
            <Tooltip content={<ChartTooltip long />} cursor={{ stroke: 'var(--line-strong)', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="admissions"
              name="All admissions"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="var(--primary)"
              fillOpacity={0.1}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--surface)' }}
            />
            <Area
              type="monotone"
              dataKey="critical"
              name="Admitted critical"
              stroke="var(--c-critical)"
              strokeWidth={2}
              fillOpacity={0}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--surface)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AgeChart({ data }: { data: DashboardSummary['patientsByAgeGroup'] }) {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis dataKey="ageGroup" tick={axisTick} tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis allowDecimals={false} tick={axisTick} tickLine={false} axisLine={false} width={44} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--surface-2)' }} />
          <Bar dataKey="count" name="Patients" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
