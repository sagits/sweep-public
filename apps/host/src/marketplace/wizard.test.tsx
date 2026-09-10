import { seededProperties } from '@sweep/mocks';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { flush } from '@/testing/flush';

import { NewSearchWizard } from './NewSearchWizard';

const insets = { top: 47, bottom: 34, left: 0, right: 0 };

const open = () =>
  render(
    <SafeAreaInsetsContext.Provider value={insets}>
      <NewSearchWizard properties={seededProperties} onSubmit={jest.fn()} onClose={jest.fn()} />
    </SafeAreaInsetsContext.Provider>,
  );

describe('NewSearchWizard', () => {
  it('walks property details -> cleaning needs -> note', async () => {
    await open();

    expect(screen.getByTestId('search-form.step-title')).toHaveTextContent(
      'Confirm the Property Details',
    );
    // Removed on request — the address is fixed in the PoC, so the escape hatch said nothing.
    expect(screen.queryByTestId('search-form.cant-find-address')).toBeNull();

    fireEvent.press(screen.getByTestId('search-form.next'));
    await flush();

    expect(screen.getByTestId('search-form.step-title')).toHaveTextContent(
      'Describe your cleaning needs',
    );
    expect(screen.getByText('How many guest turnovers per month?')).toBeTruthy();
    expect(screen.getByText('How long does it take to clean your unit?')).toBeTruthy();
    expect(screen.getByText('The cleaner needs to')).toBeTruthy();
    expect(screen.getByTestId('search-form.needs.supplies')).toBeTruthy();
    // The checklist dropdown only shows while its box is ticked.
    expect(screen.getByTestId('search-form.checklist')).toBeTruthy();

    fireEvent.press(screen.getByTestId('search-form.next-note'));
    await flush();

    expect(screen.getByTestId('search-form.step-title')).toHaveTextContent('Add a note');
    expect(screen.getByTestId('search-form.notes')).toBeTruthy();
  });

  it('picks an estimate from a dropdown, and hides the checklist when unticked', async () => {
    await open();
    fireEvent.press(screen.getByTestId('search-form.next'));
    await flush();

    fireEvent.press(screen.getByTestId('search-form.turnovers'));
    await flush();
    fireEvent.press(screen.getByTestId('search-form.turnovers.option.4'));
    await flush();
    // The trailing chevron is a glyph inside the same node, so match the value at the start.
    expect(screen.getByTestId('search-form.turnovers')).toHaveTextContent(/^4/);

    fireEvent.press(screen.getByTestId('search-form.needs.checklist'));
    await flush();
    expect(screen.queryByTestId('search-form.checklist')).toBeNull();
  });
});
