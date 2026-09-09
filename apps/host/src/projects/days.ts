import type { Project } from '@sweep/types';

/** How many day sections the calendar lists below the week strip, starting at the selected day. */
export const SECTION_DAYS = 14;

export const startOfDay = (date: Date): Date => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

export const addDays = (date: Date, days: number): Date => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

/** Local calendar day, `YYYY-MM-DD`. Not `toISOString()`, which shifts across the UTC boundary. */
export const dayKey = (value: Date | string): string => {
  const date = typeof value === 'string' ? new Date(value) : value;
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

/** "Wed, Sep 9 2026" — the reference has no comma before the year, so the year is appended. */
export const longDay = (date: Date): string =>
  `${date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })} ${date.getFullYear()}`;

/** "Today - Wed, Sep 9 2026", "Tomorrow - Thu, Sep 10 2026", then the bare date. */
export const sectionLabel = (date: Date, today = new Date()): string => {
  const offset = Math.round(
    (startOfDay(date).getTime() - startOfDay(today).getTime()) / 86_400_000
  );
  if (offset === 0) return `Today - ${longDay(date)}`;
  if (offset === 1) return `Tomorrow - ${longDay(date)}`;
  return longDay(date);
};

/** "September 2026", the month navigator's label. */
export const monthLabel = (date: Date): string =>
  date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

/** "Sep 26", the header's date label. */
export const shortMonthLabel = (date: Date): string =>
  `${date.toLocaleDateString('en-US', { month: 'short' })} ${`${date.getFullYear()}`.slice(-2)}`;

/** Sunday through Saturday of the week the given day falls in. */
export const weekOf = (date: Date): Date[] => {
  const sunday = addDays(startOfDay(date), -date.getDay());
  return Array.from({ length: 7 }, (_, i) => addDays(sunday, i));
};

export type DaySection = { key: string; date: Date; projects: Project[] };

/**
 * The list under the week strip: one section per day from `from` forward, each holding that day's
 * projects in start order. Days with nothing still get a section — screenshot `04` is a calendar
 * of empty days.
 */
export const groupByDay = (
  projects: Project[],
  from: Date,
  days = SECTION_DAYS
): DaySection[] => {
  const start = startOfDay(from);
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(start, i);
    const key = dayKey(date);
    return {
      key,
      date,
      projects: projects
        .filter((project) => dayKey(project.startsAt) === key)
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    };
  });
};
