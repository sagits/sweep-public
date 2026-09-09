import { fireEvent, render, screen } from '@testing-library/react-native';

import { PromoCard } from './PromoCard';
import { QualityCenterCard } from './QualityCenterCard';

describe('Home cards', () => {
  it('dismisses the promo through its "Don\'t show this anymore" checkbox', async () => {
    const onDismiss = jest.fn();
    await render(<PromoCard onDismiss={onDismiss} />);

    expect(screen.getByText('Invite a Host and get $100 in Credits')).toBeTruthy();
    fireEvent.press(screen.getByTestId('home.promo-dismiss'));

    expect(onDismiss).toHaveBeenCalled();
  });

  it('mounts the Quality center spinner', async () => {
    // Guards the whole @sweep/ui hook surface: a duplicate React under packages/ui gives it its
    // own copy of the hooks, and every one of them throws. Spinner is the first to call one.
    await render(<QualityCenterCard />);

    expect(screen.getByTestId('home.quality-center-spinner')).toBeTruthy();
  });
});
