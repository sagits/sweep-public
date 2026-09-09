import { by, device, element, expect, waitFor } from 'detox';

/** The seeded projects, from `packages/mocks/src/projects.ts`. */
const SEEDED = [
  { id: '38261465', alias: 'Beach apartment', cleaner: 'Unassigned' },
  { id: '38261466', alias: 'Lake house', cleaner: 'Ramona' },
  { id: '38261467', alias: 'Downtown loft', cleaner: 'Unassigned' },
];

const visible = (id: string, timeout = 10000) =>
  waitFor(element(by.id(id))).toBeVisible().withTimeout(timeout);

/**
 * Containers assert existence, not visibility: Detox scores a view's visible area over everything
 * drawn on top of it, its own children included, so a packed container never reaches 75%.
 */
const exists = (id: string, timeout = 10000) =>
  waitFor(element(by.id(id))).toExist().withTimeout(timeout);

const gone = (id: string, timeout = 10000) =>
  waitFor(element(by.id(id))).not.toExist().withTimeout(timeout);

const scrolledToText = (text: string, scrollID = 'projects.scroll') =>
  waitFor(element(by.text(text)))
    .toBeVisible()
    .whileElement(by.id(scrollID))
    .scroll(300, 'down');

const openProjectsTab = async () => {
  await waitFor(element(by.id('tabs.projects'))).toBeVisible().withTimeout(30000);
  await element(by.id('tabs.projects')).tap();
};

/** The section key `src/projects/days.ts` builds, for a day `offset` days from today. */
const dayKey = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

describe('projects', () => {
  beforeEach(async () => {
    await device.launchApp({ delete: true });
    await openProjectsTab();
  });

  it('rules off a day with nothing scheduled, so a run of empty dates reads apart', async () => {
    await exists('projects.scroll');

    // The seed fills today, tomorrow and day 4 — days 2 and 3 are empty, and each gets a rule
    // under its date instead of the heading sitting straight on the next one.
    await exists(`projects.section.${dayKey(2)}`);
    await exists(`projects.empty-day.${dayKey(2)}`);
    await exists(`projects.empty-day.${dayKey(3)}`);
  });

  it('opens on the calendar: header icons, month navigator, week strip and day sections', async () => {
    await exists('projects.title');
    await exists('projects.add');
    await exists('projects.filter');
    await exists('projects.refresh');

    await exists('projects.calendar');
    await visible('projects.month');
    for (const weekday of ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']) {
      await expect(element(by.text(weekday))).toBeVisible();
    }
    await exists('projects.drag-handle');

    // The first two sections are always Today and Tomorrow — the seed is relative to boot.
    await exists(`projects.row.${SEEDED[0]!.id}`);
    await expect(element(by.text(SEEDED[0]!.alias)).atIndex(0)).toBeVisible();
    await scrolledToText(SEEDED[1]!.cleaner);
    await exists(`projects.row.${SEEDED[1]!.id}`);
  });

  it('loads the day sections behind skeleton rows', async () => {
    // Detox waits out JS timers, and the mock delay is one, so a synchronized launch never sees
    // a skeleton. This is the one test that watches the calendar load, so it drives its own launch.
    await device.launchApp({
      delete: true,
      newInstance: true,
      launchArgs: { detoxEnableSynchronization: 0 },
    });
    await openProjectsTab();

    await exists('projects.skeleton', 20000);
    await gone('projects.skeleton');

    await device.enableSynchronization();

    await exists(`projects.row.${SEEDED[0]!.id}`);
  });

  it('opens the automatic-vs-manual dialog from +, with its "don\'t show again" checkbox', async () => {
    await element(by.id('projects.add')).tap();

    await exists('projects.manual-dialog');
    await expect(element(by.text('Automatic vs. Manual Projects'))).toBeVisible();
    await expect(element(by.text("Don't show this message again"))).toBeVisible();
    await expect(element(by.text('Create Manual Project'))).toBeVisible();

    await element(by.id('projects.manual-dialog.cancel')).tap();
    await gone('projects.manual-dialog');
  });

  it('creates a manual project against a registered property and lands back on Home', async () => {
    await element(by.id('projects.add')).tap();
    await exists('projects.manual-dialog');
    await element(by.id('projects.manual-dialog.create')).tap();

    await exists('screen.new-project');
    await expect(element(by.id('project-form.title'))).toHaveText('New Manual Project');

    // The picker lists the registered properties.
    await element(by.id('project-form.property')).tap();
    await exists('project-form.property.options');
    await element(by.id('project-form.property.option.Downtown loft')).tap();

    await element(by.id('project-form.submit')).tap();

    // Back on Home, with the new project in the Projects card.
    await exists('screen.home', 20000);
    await exists('home.projects-card');
    // The seed already holds a Downtown loft project, and the card is appended to, so the row
    // this test created is the *second* one — and it only exists if the form worked. The card is
    // below the fold, and the Cleaner Search card above it names the property too, hence the
    // ancestor.
    await waitFor(
      element(by.text('Downtown loft').withAncestor(by.id('home.projects-card'))).atIndex(1)
    )
      .toBeVisible()
      .whileElement(by.id('home.scroll'))
      .scroll(300, 'down');
  });

  it('opens project detail from a row, with its pills and detail rows', async () => {
    await element(by.id(`projects.row.${SEEDED[0]!.id}`)).tap();

    await exists('screen.project-detail');
    await expect(element(by.id('project.number'))).toHaveText(`Project #${SEEDED[0]!.id}`);
    await expect(element(by.id('project.property'))).toHaveText(SEEDED[0]!.alias);
    await expect(element(by.id('project.assignment'))).toHaveText('Unassigned Project');
    await expect(element(by.text('Cleaning'))).toBeVisible();
    await exists('project.times');

    for (const pill of ['manual', 'unassigned', 'visible', 'no-teammates']) {
      await exists(`project.pill.${pill}`);
    }
    await expect(element(by.text('Manual Project'))).toBeVisible();

    await scrolledToText('Private Notes:', 'project.scroll');
    for (const row of ['history', 'address', 'problems', 'checklist', 'inventory', 'name', 'notes']) {
      await exists(`project.row.${row}`);
    }

    await element(by.id('project.back')).tap();
    await exists('screen.projects');
  });
});
