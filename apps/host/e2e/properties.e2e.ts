import { by, device, element, expect, waitFor } from 'detox';

/** The seeded aliases, from `packages/mocks/src/properties.ts`. */
const SEEDED = ['Beach apartment', 'Lake house', 'Downtown loft'];
const NEW_ALIAS = 'Beach house';

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

const openPropertiesTab = async () => {
  await waitFor(element(by.id('tabs.properties'))).toBeVisible().withTimeout(30000);
  await element(by.id('tabs.properties')).tap();
};

describe('properties', () => {
  beforeEach(async () => {
    await device.launchApp({ delete: true });
    await openPropertiesTab();
  });

  it('lists the seeded properties under the search field and the New Property button', async () => {
    // by.id, not by.text: the active tab renders the word "Properties" too.
    await expect(element(by.id('properties.title'))).toHaveText('Properties');
    await exists('properties.search-input');
    await exists('properties.search-button');
    await exists('properties.page-size');
    await visible('properties.new');
    await expect(element(by.text('You have 3 properties'))).toBeVisible();
    await expect(element(by.text('Edit property groups'))).toBeVisible();
    await exists('properties.group-checkbox');

    await exists('properties.card.property-1');
    for (const alias of SEEDED) {
      await expect(element(by.text(alias))).toBeVisible();
    }
    await exists('properties.card.property-1.overflow');
    await expect(element(by.text('Add teammates')).atIndex(0)).toBeVisible();
  });

  it('loads the list behind skeleton cards', async () => {
    // Detox waits out JS timers, and the mock delay is one, so a synchronized launch never sees
    // a skeleton. This is the one test that watches the list load, so it drives its own launch.
    await device.launchApp({
      delete: true,
      newInstance: true,
      launchArgs: { detoxEnableSynchronization: 0 },
    });
    await openPropertiesTab();

    await exists('properties.skeleton', 20000);
    await gone('properties.skeleton');

    await device.enableSynchronization();

    await expect(element(by.text('Beach apartment'))).toBeVisible();
  });

  it('registers a fourth property: skip the calendar, fill the form, save', async () => {
    await element(by.id('properties.new')).tap();
    await exists('screen.new-property');
    await expect(element(by.id('property-form.step-title'))).toHaveText('Reservations Calendar');

    // The provider tiles render but do nothing: Skip → Yes is the only path forward.
    for (const provider of ['airbnb', 'vrbo', 'booking', 'tripadvisor']) {
      await exists(`property-form.provider.${provider}`);
    }
    await element(by.id('property-form.skip')).tap();

    await exists('property-form.skip-confirm');
    await expect(element(by.text('Are you sure?'))).toBeVisible();
    await element(by.id('property-form.skip-confirm.confirm')).tap();

    await expect(element(by.id('property-form.step-title'))).toHaveText(
      'Name, address and details'
    );
    // No address API: the address is fixed and cannot be edited.
    await expect(element(by.id('property-form.address'))).toHaveText('Los Angeles, CA 90001, USA');

    await element(by.id('property-form.alias')).typeText(NEW_ALIAS);
    await element(by.id('property-form.alias')).tapReturnKey();
    await element(by.id('property-form.next')).tap();

    await expect(element(by.id('property-form.step-title'))).toHaveText('Details and times');
    await element(by.id('property-form.bedrooms')).tap();
    await element(by.id('property-form.bedrooms.option.3')).tap();
    await element(by.id('property-form.unit-size-toggle.second')).tap();

    await element(by.id('property-form.save')).tap();

    // Back on the list, with the new property in it.
    await exists('screen.properties');
    await waitFor(element(by.text('You have 4 properties')))
      .toBeVisible()
      .withTimeout(10000);
    await waitFor(element(by.text(NEW_ALIAS)))
      .toBeVisible()
      .whileElement(by.id('properties.scroll'))
      .scroll(300, 'down');
  });
});
