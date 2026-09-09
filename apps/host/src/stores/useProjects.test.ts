import { MAX_DELAY_MS, seededProjects } from '@sweep/mocks';
import type { NewProject } from '@sweep/types';

import { addDays, dayKey, groupByDay, sectionLabel } from '@/projects/days';
import { useProjects } from './useProjects';

const reset = () =>
  useProjects.setState({
    projects: [],
    loading: false,
    loaded: false,
    manualDialogHidden: false,
  });

/** What the New Manual Project form hands the store, against a real seeded property. */
const manualProject = (startsAt: Date): NewProject => ({
  propertyAlias: 'Lake house',
  propertyAddress: '815 Lakeshore Dr, Big Bear Lake',
  cleanerName: null,
  startsAt: startsAt.toISOString(),
  endsAt: new Date(startsAt.getTime() + 4 * 3_600_000).toISOString(),
  name: 'Manual Project',
  manual: true,
  visible: true,
});

describe('useProjects', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    reset();
  });
  afterEach(() => jest.useRealTimers());

  it('is loading before the mock delay passes, so Home can show its skeleton', async () => {
    const pending = useProjects.getState().load();

    expect(useProjects.getState().loading).toBe(true);

    jest.advanceTimersByTime(MAX_DELAY_MS);
    await pending;

    expect(useProjects.getState().loading).toBe(false);
    expect(useProjects.getState().projects).toEqual(seededProjects);
  });

  it('does not re-seed over what was added when the tab is re-entered', async () => {
    const first = useProjects.getState().load();
    jest.advanceTimersByTime(MAX_DELAY_MS);
    await first;

    const adding = useProjects.getState().add(manualProject(new Date()));
    jest.advanceTimersByTime(MAX_DELAY_MS);
    await adding;

    await useProjects.getState().load();

    expect(useProjects.getState().projects).toHaveLength(seededProjects.length + 1);
  });

  it('keeps a project the host added when the header refresh re-fetches', async () => {
    const first = useProjects.getState().load();
    jest.advanceTimersByTime(MAX_DELAY_MS);
    await first;

    const adding = useProjects.getState().add(manualProject(new Date()));
    jest.advanceTimersByTime(MAX_DELAY_MS);
    const created = await adding;

    const refreshing = useProjects.getState().reload();
    jest.advanceTimersByTime(MAX_DELAY_MS);
    await refreshing;

    expect(useProjects.getState().projects.map((project) => project.id)).toContain(created.id);
  });

  it('remembers the dialog was dismissed for good', () => {
    expect(useProjects.getState().manualDialogHidden).toBe(false);
    useProjects.getState().hideManualDialog();
    expect(useProjects.getState().manualDialogHidden).toBe(true);
  });

  describe('a created project lands on the right calendar day, and on Home', () => {
    it('places it in the section for the day it starts', async () => {
      const load = useProjects.getState().load();
      jest.advanceTimersByTime(MAX_DELAY_MS);
      await load;

      const startsAt = addDays(new Date(), 3);
      startsAt.setHours(9, 0, 0, 0);

      const adding = useProjects.getState().add(manualProject(startsAt));
      jest.advanceTimersByTime(MAX_DELAY_MS);
      const created = await adding;

      const sections = groupByDay(useProjects.getState().projects, new Date());
      const section = sections.find((day) => day.key === dayKey(startsAt));

      expect(section?.projects.map((project) => project.id)).toContain(created.id);
      // …and nowhere else on the calendar.
      const elsewhere = sections.filter(
        (day) =>
          day.key !== dayKey(startsAt) &&
          day.projects.some((project) => project.id === created.id)
      );
      expect(elsewhere).toEqual([]);
    });

    it('puts the seeded three under Today, Tomorrow and a later day', async () => {
      const load = useProjects.getState().load();
      jest.advanceTimersByTime(MAX_DELAY_MS);
      await load;

      const sections = groupByDay(useProjects.getState().projects, new Date());
      const populated = sections.filter((day) => day.projects.length > 0);

      expect(populated).toHaveLength(3);
      expect(sectionLabel(populated[0]!.date)).toMatch(/^Today - /);
      expect(sectionLabel(populated[1]!.date)).toMatch(/^Tomorrow - /);
      expect(sectionLabel(populated[2]!.date)).not.toMatch(/^(Today|Tomorrow) - /);
    });

    it("shows up in the list Home's Projects card renders", async () => {
      const load = useProjects.getState().load();
      jest.advanceTimersByTime(MAX_DELAY_MS);
      await load;

      const adding = useProjects.getState().add(manualProject(new Date()));
      jest.advanceTimersByTime(MAX_DELAY_MS);
      const created = await adding;

      expect(useProjects.getState().projects.at(-1)).toEqual(created);
    });
  });
});
