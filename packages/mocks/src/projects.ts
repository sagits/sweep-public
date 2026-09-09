import type { NewProject, Project } from '@sweep/types';

import { resolve } from './resolve';

/**
 * Seeded days are relative to whenever the app boots, not fixed ISO strings: the calendar's first
 * two sections are "Today" and "Tomorrow", and a hard-coded date would drift out of them the day
 * after this was written.
 */
const at = (daysFromToday: number, hour: number, minute = 0): string => {
  const when = new Date();
  when.setDate(when.getDate() + daysFromToday);
  when.setHours(hour, minute, 0, 0);
  return when.toISOString();
};

/**
 * One project per seeded property, spread over the next few days so the calendar is not all on
 * one section, with the three states the PRD asks for: unassigned today, assigned to a cleaner
 * tomorrow, and one scheduled further out.
 */
export const seededProjects: Project[] = [
  {
    id: '38261465',
    propertyAlias: 'Beach apartment',
    propertyAddress: '1100 Ocean Front Walk, Los Angeles #22',
    cleanerName: null,
    startsAt: at(0, 11),
    endsAt: at(0, 15),
    name: 'Manual Project',
    manual: true,
    visible: true,
  },
  {
    id: '38261466',
    propertyAlias: 'Lake house',
    propertyAddress: '815 Lakeshore Dr, Big Bear Lake',
    cleanerName: 'Ramona',
    startsAt: at(1, 10),
    endsAt: at(1, 14),
    name: 'Checkout cleaning',
    manual: false,
    visible: true,
  },
  {
    id: '38261467',
    propertyAlias: 'Downtown loft',
    propertyAddress: '600 S Spring St, Los Angeles #1204',
    cleanerName: null,
    startsAt: at(4, 13),
    endsAt: at(4, 17),
    name: 'Manual Project',
    manual: true,
    visible: true,
  },
];

/**
 * ponytail: the same one-line seed switch `properties.ts` uses, until ticket 09 generalises it.
 * `EXPO_PUBLIC_SEED=false pnpm dev` boots every list on its empty state.
 */
declare const process: { env: Record<string, string | undefined> };

const seedEnabled = process.env.EXPO_PUBLIC_SEED !== 'false';

export const fetchProjects = (): Promise<Project[]> => resolve(seedEnabled ? seededProjects : []);

/** Project ids are the digits the detail header prints, so they stay short rather than a uuid. */
export const createProject = (input: NewProject): Promise<Project> =>
  resolve({ ...input, id: String(Date.now()).slice(-8) });
