import { by, device, element, expect } from 'detox';

const TABS = [
  { tab: 'tabs.home', screen: 'screen.home' },
  { tab: 'tabs.projects', screen: 'screen.projects' },
  { tab: 'tabs.marketplace', screen: 'screen.marketplace' },
  { tab: 'tabs.payments', screen: 'screen.payments' },
  { tab: 'tabs.properties', screen: 'screen.properties' },
  { tab: 'tabs.more', screen: 'screen.more' },
];

describe('navigation', () => {
  beforeAll(async () => {
    await device.launchApp({ delete: true });
  });

  it('boots straight into Home with all six tabs on screen', async () => {
    await expect(element(by.id('screen.home'))).toBeVisible();
    for (const { tab } of TABS) {
      await expect(element(by.id(tab))).toBeVisible();
    }
  });

  it('switches to every tab, and only the active one carries its label', async () => {
    for (const { tab, screen } of TABS) {
      await element(by.id(tab)).tap();
      await expect(element(by.id(screen))).toBeVisible();
      await expect(element(by.id(`${tab}.label`))).toBeVisible();

      for (const other of TABS) {
        if (other.tab === tab) continue;
        await expect(element(by.id(`${other.tab}.label`))).not.toExist();
      }
    }
  });
});
