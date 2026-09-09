import { by, device, element, expect, waitFor } from 'detox';

/** The ten rows of screenshot 23: testID suffix and visible label. */
const ROWS = [
  ['properties', 'Properties'],
  ['property-problems', 'Property Problems'],
  ['quality-center', 'Quality center'],
  ['checklists', 'Checklists'],
  ['inventories', 'Inventories'],
  ['my-teammates', 'My Teammates'],
  ['my-co-hosts', 'My co-hosts'],
  ['guest-checkout-feedback', 'Guest Checkout Feedback'],
  ['guest-center', 'Guest Center'],
  ['host-services', 'Host Services'],
];

const visible = (id: string, timeout = 10000) =>
  waitFor(element(by.id(id))).toBeVisible().withTimeout(timeout);

/** Containers assert existence, text asserts visibility — see DECISIONS 02. */
const exists = (id: string, timeout = 10000) =>
  waitFor(element(by.id(id))).toExist().withTimeout(timeout);

describe('more', () => {
  beforeEach(async () => {
    await device.launchApp({ delete: true });
    await element(by.id('tabs.more')).tap();
    await visible('more.name', 30000);
  });

  it('renders the teal header and the hardcoded profile', async () => {
    await exists('more.header');
    await exists('more.help');
    await exists('more.settings');
    await exists('more.logout');

    await exists('more.avatar');
    await exists('more.avatar-edit');
    await expect(element(by.id('more.name'))).toHaveText('Renato Probst');
    await expect(element(by.id('more.email'))).toHaveText('renatopprobst@gmail.com');
  });

  it('renders all ten menu rows and the footer', async () => {
    await exists('more.menu');
    for (const [id, label] of ROWS) {
      await exists(`more.row.${id}`);
      await expect(element(by.text(label))).toBeVisible();
    }

    await expect(element(by.text('Check for updates'))).toBeVisible();
    await expect(element(by.id('more.version'))).toHaveText('v1.44.3');
  });

  it('does nothing when a row other than Properties is tapped', async () => {
    for (const [id] of ROWS.slice(1)) {
      await element(by.id(`more.row.${id}`)).tap();
    }
    await element(by.id('more.check-updates')).tap();

    // Still on More: nothing navigated, nothing changed.
    await expect(element(by.id('more.name'))).toBeVisible();
    await expect(element(by.id('tabs.more.label'))).toBeVisible();
  });

  it('opens the Properties tab from the Properties row', async () => {
    await element(by.id('more.row.properties')).tap();

    await exists('screen.properties');
    await visible('tabs.properties.label');
  });
});
