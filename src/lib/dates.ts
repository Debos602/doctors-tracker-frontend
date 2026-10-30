/**
 * Timezone-aware calendar helpers that give the same answer on the server and
 * in the browser, so server-prefetched queries match the client's cache keys.
 * Days are plain "YYYY-MM-DD" strings.
 */

export function isValidTimezone(tz: string | undefined | null): tz is string {
  if (!tz) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** "+06:00" for Asia/Dhaka on that date. */
function offsetFor(tz: string, date: Date) {
  const name = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longOffset' })
    .formatToParts(date)
    .find((p) => p.type === 'timeZoneName')?.value;
  return name?.match(/GMT([+-]\d{2}:\d{2})/)?.[1] ?? '+00:00';
}

/** Start or end of a calendar day in `tz`, as an ISO instant for the API. */
export function zonedDayToIso(day: string | undefined, edge: 'start' | 'end', tz: string) {
  if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return undefined;
  const offset = offsetFor(tz, new Date(`${day}T12:00:00Z`));
  const time = edge === 'start' ? '00:00:00.000' : '23:59:59.999';
  return new Date(`${day}T${time}${offset}`).toISOString();
}

export function todayIn(tz: string) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

const toDay = (d: Date) => d.toISOString().slice(0, 10);

export function addDays(day: string, days: number) {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return toDay(d);
}

export function addMonths(day: string, months: number) {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + months);
  return toDay(d);
}
