import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { FIXED_ADDRESS, seededProperties } from '@sweep/mocks';

import PropertiesScreen from '../../app/(tabs)/properties';
import { useProperties } from '@/stores/useProperties';
import { NewPropertyForm } from './NewPropertyForm';

jest.mock('react-native-safe-area-context', () =>
  // A jest.mock factory is hoisted above the imports, so it has to require.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('react-native-safe-area-context/jest/mock').default
);

const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ navigate: mockNavigate, canGoBack: () => true }),
}));

describe('Properties list', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    useProperties.setState({ properties: [], loading: false, loaded: false });
  });

  it('mounts into skeleton cards, then shows the seeded properties', async () => {
    await render(<PropertiesScreen />);

    expect(screen.getByTestId('properties.skeleton')).toBeTruthy();

    await waitFor(() => expect(screen.queryByTestId('properties.skeleton')).toBeNull(), {
      timeout: 3000,
    });

    for (const property of seededProperties) {
      expect(screen.getByTestId(`properties.card.${property.id}`)).toBeTruthy();
      expect(screen.getByText(property.alias)).toBeTruthy();
    }
    expect(screen.getByText(`You have ${seededProperties.length} properties`)).toBeTruthy();
  });

  it('shows the empty state when there is nothing to list', async () => {
    useProperties.setState({ loaded: true });
    await render(<PropertiesScreen />);

    expect(screen.getByTestId('properties.empty')).toBeTruthy();
    expect(screen.getByText("You don't have any properties yet.")).toBeTruthy();
    expect(screen.getByText('You have 0 properties')).toBeTruthy();
  });

  it('opens the New Property flow', async () => {
    useProperties.setState({ loaded: true });
    await render(<PropertiesScreen />);

    fireEvent.press(screen.getByTestId('properties.new'));

    expect(mockNavigate).toHaveBeenCalledWith('/property/new');
  });
});

/**
 * RNTL 14 on React 19: a state update from `fireEvent` only lands on the next async flush, and
 * two events fired back to back without one wedge the render loop — every later update is
 * dropped. So each interaction is followed by a flush, either this one or a `findBy*`/`waitFor`.
 */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('New Property form', () => {
  const skipTheCalendar = async () => {
    fireEvent.press(screen.getByTestId('property-form.skip'));
    await screen.findByTestId('property-form.skip-confirm.confirm');
    expect(
      screen.getByText(
        'Keep in mind that you will not be able to accept a bid from a Marketplace teammate until you sync a calendar.'
      )
    ).toBeTruthy();

    fireEvent.press(screen.getByTestId('property-form.skip-confirm.confirm'));
    await screen.findByTestId('property-form.alias');
  };

  const fillTheAddressStep = async (alias: string) => {
    fireEvent.changeText(screen.getByTestId('property-form.unit'), '22');
    await flush();
    fireEvent.changeText(screen.getByTestId('property-form.alias'), alias);
    await flush();
    fireEvent.press(screen.getByTestId('property-form.next'));
    await screen.findByTestId('property-form.description');
  };

  it('opens on the calendar step, where Skip → Yes is the only way forward', async () => {
    await render(<NewPropertyForm onSave={jest.fn()} onClose={jest.fn()} />);

    expect(screen.getByTestId('property-form.step-title')).toHaveTextContent(
      'Reservations Calendar'
    );
    for (const provider of ['airbnb', 'vrbo', 'booking', 'tripadvisor']) {
      expect(screen.getByTestId(`property-form.provider.${provider}`)).toBeTruthy();
    }
    // The provider tiles are inert and Next never opens: Skip is the way through.
    expect(screen.getByTestId('property-form.next')).toBeDisabled();

    await skipTheCalendar();

    expect(screen.getByTestId('property-form.step-title')).toHaveTextContent(
      'Name, address and details'
    );
  });

  it('keeps the address fixed and read-only', async () => {
    await render(<NewPropertyForm onSave={jest.fn()} onClose={jest.fn()} />);
    await skipTheCalendar();

    const address = screen.getByTestId('property-form.address');
    expect(address).toHaveTextContent(FIXED_ADDRESS);
    // A Text, not a TextInput: there is nothing to type into.
    expect(address.props.onChangeText).toBeUndefined();
  });

  it('switches the unit size between sq. ft. and sq. mt. and counts the description', async () => {
    await render(<NewPropertyForm onSave={jest.fn()} onClose={jest.fn()} />);
    await skipTheCalendar();
    await fillTheAddressStep('Beach house');

    expect(screen.getByTestId('property-form.unit-size-toggle.first')).toBeSelected();
    fireEvent.press(screen.getByTestId('property-form.unit-size-toggle.second'));
    await flush();
    expect(screen.getByTestId('property-form.unit-size-toggle.second')).toBeSelected();
    expect(screen.getByTestId('property-form.unit-size-toggle.first')).not.toBeSelected();

    expect(screen.getByTestId('property-form.description-counter')).toHaveTextContent('0 / 1000');
    fireEvent.changeText(screen.getByTestId('property-form.description'), 'Sandy');
    await flush();
    expect(screen.getByTestId('property-form.description-counter')).toHaveTextContent('5 / 1000');
  });

  it('spins the save button, then hands the filled property over', async () => {
    let release: (() => void) | undefined;
    const onSave = jest.fn(
      () =>
        new Promise<void>((done) => {
          release = done;
        })
    );
    await render(<NewPropertyForm onSave={onSave} onClose={jest.fn()} />);
    await skipTheCalendar();
    await fillTheAddressStep('Beach house');

    fireEvent.press(screen.getByTestId('property-form.bedrooms'));
    await flush();
    fireEvent.press(screen.getByTestId('property-form.bedrooms.option.3'));
    await flush();
    fireEvent.changeText(screen.getByTestId('property-form.unit-size'), '200');
    await flush();
    fireEvent.press(screen.getByTestId('property-form.save'));
    await flush();

    expect(screen.getByTestId('property-form.save.spinner')).toBeTruthy();
    expect(onSave).toHaveBeenCalledWith({
      alias: 'Beach house',
      address: FIXED_ADDRESS,
      unit: '22',
      bedrooms: 3,
      beds: 2,
      bathrooms: 2,
      unitSize: 200,
      unitSizeUnit: 'sq. ft.',
      currency: 'USD',
      checkoutTime: '11:00 am',
      checkinTime: '3:00 pm',
      description: '',
    });

    release?.();
    await flush();
  });
});
