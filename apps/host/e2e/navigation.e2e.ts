import { by, device, element, expect } from 'detox';

// Screens assert `toExist`, not `toBeVisible`: a screen container is fully covered by its own
// content, and Detox scores visibility over everything a view's subviews cover.
const TABS = [
  { tab: 'tabs.home', screen: 'screen.home' },
  { tab: 'tabs.projects', screen: 'screen.projects' },
  { tab: 'tabs.marketplace', screen: 'screen.marketplace' },
  { tab: 'tabs.properties', screen: 'screen.properties' },
  { tab: 'tabs.more', screen: 'screen.more' },
];

describe('navigation', () => {
  beforeAll(async () => {
    await device.launchApp({ delete: true });
  });

  it('boots straight into Home with all five tabs on screen', async () => {
    await expect(element(by.id('screen.home'))).toExist();
    for (const { tab } of TABS) {
      await expect(element(by.id(tab))).toBeVisible();
    }
  });

  it('switches to every tab', async () => {
    for (const { tab, screen } of TABS) {
      await element(by.id(tab)).tap();
      await expect(element(by.id(screen))).toExist();
    }
  });

  it('labels every tab, not only the active one', async () => {
    for (const { tab } of TABS) {
      await expect(element(by.id(`${tab}.label`))).toBeVisible();
    }
  });

  it('has no Payments tab — it is reached from Home instead', async () => {
    await expect(element(by.id('tabs.payments'))).not.toExist();
    await element(by.id('tabs.home')).tap();
    await element(by.id('home.payments')).tap();
    await expect(element(by.id('screen.payments'))).toExist();
  });
});
