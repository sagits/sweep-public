import { fireEvent, render, screen } from '@testing-library/react-native';

import { Spinner } from '@sweep/ui';

import { PromoCard } from './PromoCard';

describe('Home cards', () => {
  it('dismisses the promo through its "Don\'t show this anymore" checkbox', async () => {
    const onDismiss = jest.fn();
    await render(<PromoCard onDismiss={onDismiss} />);

    expect(screen.getByText('Invite a Host and get $100 in Credits')).toBeTruthy();
    fireEvent.press(screen.getByTestId('home.promo-dismiss'));

    expect(onDismiss).toHaveBeenCalled();
  });

  it('mounts a Spinner from @sweep/ui', async () => {
    // Guards the whole @sweep/ui hook surface: a duplicate React under packages/ui gives it its
    // own copy of the hooks, and every one of them throws. Spinner is the first to call one.
    // It used to guard this through Home's Quality center card, which has since been removed.
    await render(<Spinner testID="ui.spinner" />);

    expect(screen.getByTestId('ui.spinner')).toBeTruthy();
  });
});
