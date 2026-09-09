import { fireEvent, render, screen } from '@testing-library/react-native';

import { MoreMenu } from './MoreMenu';

/** Screenshot 23, top to bottom. */
const LABELS = [
  'Properties',
  'Property Problems',
  'Quality center',
  'Checklists',
  'Inventories',
  'My Teammates',
  'My co-hosts',
  'Guest Checkout Feedback',
  'Guest Center',
  'Host Services',
];

describe('MoreMenu', () => {
  it('renders the ten rows of screenshot 23', async () => {
    await render(<MoreMenu onOpenProperties={jest.fn()} />);

    for (const label of LABELS) {
      expect(screen.getByText(label)).toBeTruthy();
    }
  });

  it('opens Properties, and leaves every other row inert', async () => {
    const onOpenProperties = jest.fn();
    await render(<MoreMenu onOpenProperties={onOpenProperties} />);

    fireEvent.press(screen.getByTestId('more.row.properties'));
    expect(onOpenProperties).toHaveBeenCalledTimes(1);

    for (const id of [
      'more.row.property-problems',
      'more.row.quality-center',
      'more.row.checklists',
      'more.row.inventories',
      'more.row.my-teammates',
      'more.row.my-co-hosts',
      'more.row.guest-checkout-feedback',
      'more.row.guest-center',
      'more.row.host-services',
    ]) {
      fireEvent.press(screen.getByTestId(id));
    }
    expect(onOpenProperties).toHaveBeenCalledTimes(1);
  });
});
