import { fireEvent, render, screen } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';

import { FIXED_ADDRESS } from '@sweep/mocks';

import { flush } from '@/testing/flush';

import { NewPropertyForm } from './NewPropertyForm';

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

const picker = jest.mocked(ImagePicker);

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

  it('opens on the calendar step, where Skip → Yes is a way forward', async () => {
    await render(<NewPropertyForm onSave={jest.fn()} onClose={jest.fn()} />);

    expect(screen.getByTestId('property-form.step-title')).toHaveTextContent(
      'Reservations Calendar'
    );
    for (const provider of ['airbnb', 'vrbo', 'booking', 'tripadvisor']) {
      expect(screen.getByTestId(`property-form.provider.${provider}`)).toBeTruthy();
    }
    // Next never opens — a provider tile or Skip is the way through.
    expect(screen.getByTestId('property-form.next')).toBeDisabled();

    await skipTheCalendar();

    expect(screen.getByTestId('property-form.step-title')).toHaveTextContent(
      'Name, address and details'
    );
  });

  it.each(['airbnb', 'vrbo', 'booking', 'tripadvisor'])(
    'sends the %s tile to manual registration, where Skip leads',
    async (provider) => {
      await render(<NewPropertyForm onSave={jest.fn()} onClose={jest.fn()} />);

      fireEvent.press(screen.getByTestId(`property-form.provider.${provider}`));
      await screen.findByTestId('property-form.alias');

      expect(screen.getByTestId('property-form.step-title')).toHaveTextContent(
        'Name, address and details'
      );
      // Straight there: no calendar to lose, so Skip's "Are you sure?" would be a non-sequitur.
      expect(screen.queryByTestId('property-form.skip-confirm.confirm')).toBeNull();
    }
  );

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
  describe('the property photo', () => {
    beforeEach(() => {
      // The refused-permission test asserts the library was never opened, so the previous
      // tests' calls have to go.
      jest.clearAllMocks();
      picker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true } as never);
    });

    const pickPhoto = async (base64: string) => {
      picker.launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [{ base64, mimeType: 'image/png' }],
      } as never);

      fireEvent.press(screen.getByTestId('property-form.image'));
      await screen.findByTestId('property-form.image-preview');
    };

    it('previews the picked photo in place of the upload prompt', async () => {
      await render(<NewPropertyForm onSave={jest.fn()} onClose={jest.fn()} />);
      await skipTheCalendar();

      expect(screen.queryByTestId('property-form.image-preview')).toBeNull();
      await pickPhoto('AAAA');

      expect(screen.queryByText('Tap to upload an image')).toBeNull();
    });

    it('saves the photo as a base64 data uri on the property', async () => {
      const onSave = jest.fn().mockResolvedValue(undefined);
      await render(<NewPropertyForm onSave={onSave} onClose={jest.fn()} />);
      await skipTheCalendar();
      await pickPhoto('AAAA');
      await fillTheAddressStep('Photo house');

      fireEvent.press(screen.getByTestId('property-form.save'));
      await flush();

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ image: 'data:image/png;base64,AAAA' })
      );
    });

    it('leaves the property without a photo when the picker is cancelled', async () => {
      picker.launchImageLibraryAsync.mockResolvedValue({ canceled: true, assets: null } as never);
      await render(<NewPropertyForm onSave={jest.fn()} onClose={jest.fn()} />);
      await skipTheCalendar();

      fireEvent.press(screen.getByTestId('property-form.image'));
      await flush();

      expect(screen.getByText('Tap to upload an image')).toBeTruthy();
    });

    it('does not open the library when photo permission is refused', async () => {
      picker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: false } as never);
      await render(<NewPropertyForm onSave={jest.fn()} onClose={jest.fn()} />);
      await skipTheCalendar();

      fireEvent.press(screen.getByTestId('property-form.image'));
      await flush();

      expect(picker.launchImageLibraryAsync).not.toHaveBeenCalled();
    });
  });
});
