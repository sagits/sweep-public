import { MAX_DELAY_MS, MIN_DELAY_MS } from './resolve';
import { createProject, fetchProjects, seededProjects } from './projects';

const dayOf = (iso: string) => new Date(iso).toDateString();

describe('fetchProjects', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('holds the list back until the mock delay has passed, so the skeleton is observable', async () => {
    let settled = false;
    void fetchProjects().then(() => {
      settled = true;
    });

    jest.advanceTimersByTime(MIN_DELAY_MS - 1);
    await Promise.resolve();
    expect(settled).toBe(false);

    jest.advanceTimersByTime(MAX_DELAY_MS);
    await Promise.resolve();
    expect(settled).toBe(true);
  });

  it('resolves the seeded projects', async () => {
    const pending = fetchProjects();
    jest.advanceTimersByTime(MAX_DELAY_MS);
    await expect(pending).resolves.toEqual(seededProjects);
  });
});

describe('seededProjects', () => {
  it('is one project per seeded property', () => {
    expect(seededProjects.map((project) => project.propertyAlias)).toEqual([
      'Beach apartment',
      'Lake house',
      'Downtown loft',
    ]);
  });

  it('varies the status: unassigned, assigned to a cleaner, and one scheduled further out', () => {
    const [today, tomorrow, later] = seededProjects;

    expect(today?.cleanerName).toBeNull();
    expect(tomorrow?.cleanerName).toBe('Ramona');
    expect(later?.cleanerName).toBeNull();

    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    const daysOut = (iso: string) =>
      Math.round((new Date(iso).getTime() - midnight.getTime()) / 86_400_000);

    expect(daysOut(today!.startsAt)).toBe(0);
    expect(daysOut(tomorrow!.startsAt)).toBe(1);
    expect(daysOut(later!.startsAt)).toBeGreaterThan(1);
  });

  it('spreads them across different days, so the calendar is not one section', () => {
    const days = seededProjects.map((project) => dayOf(project.startsAt));
    expect(new Set(days).size).toBe(seededProjects.length);
  });

  it('ends every project after it starts', () => {
    for (const project of seededProjects) {
      expect(new Date(project.endsAt).getTime()).toBeGreaterThan(new Date(project.startsAt).getTime());
    }
  });
});

describe('createProject', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('assigns an id and hands back everything the form collected', async () => {
    const input = {
      propertyAlias: 'Beach apartment',
      propertyAddress: '1100 Ocean Front Walk, Los Angeles #22',
      cleanerName: null,
      startsAt: seededProjects[0]!.startsAt,
      endsAt: seededProjects[0]!.endsAt,
      name: 'Manual Project',
      manual: true,
      visible: true,
    };

    const pending = createProject(input);
    jest.advanceTimersByTime(MAX_DELAY_MS);
    const created = await pending;

    expect(created).toMatchObject(input);
    expect(created.id).toMatch(/^\d+$/);
  });
});
