import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';

import { FIXED_ADDRESS } from '@sweep/mocks';
import type { NewProperty, UnitSizeUnit } from '@sweep/types';
import { Button, Card, Checkbox, colors } from '@sweep/ui';

import { ConfirmDialog } from './ConfirmDialog';
import { Field, InfoRow, ReadOnlyField, SegmentedToggle, SelectField } from './fields';

const STEPS = ['Reservations Calendar', 'Name, address and details', 'Details and times'];

/**
 * No provider is actually wired to a calendar, so all four lead where Skip leads: manual
 * registration. They go straight there rather than through Skip's "Are you sure?" — that
 * dialog warns about *not* syncing a calendar, which is not what picking a provider says.
 */
const PROVIDERS = [
  { id: 'airbnb', label: 'Airbnb' },
  { id: 'vrbo', label: 'HomeAway / Vrbo' },
  { id: 'booking', label: 'Booking.com' },
  { id: 'tripadvisor', label: 'TripAdvisor' },
];

const COUNTS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const DEFAULT_CURRENCY = 'USD (US DOLLAR)';
const CURRENCIES = [DEFAULT_CURRENCY, 'EUR (EURO)', 'BRL (BRAZILIAN REAL)'];
const UNITS: readonly UnitSizeUnit[] = ['sq. ft.', 'sq. mt.'];
const DESCRIPTION_LIMIT = 1000;

const ID = 'property-form';

/**
 * New Property, rebuilt natively from screenshots `25`–`29`: the reservations calendar step, then
 * name and address, then details and times. Saving spins the button and hands the new property to
 * the store, which the list is already reading.
 */
export function NewPropertyForm({
  onSave,
  onClose,
}: {
  onSave: (input: NewProperty) => Promise<void>;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [confirmingSkip, setConfirmingSkip] = useState(false);
  const [saving, setSaving] = useState(false);
  const [unit, setUnit] = useState('');
  const [alias, setAlias] = useState('');
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);

  const [bedrooms, setBedrooms] = useState('2');
  const [beds, setBeds] = useState('2');
  const [bathrooms, setBathrooms] = useState('2');
  const [unitSize, setUnitSize] = useState('');
  const [unitSizeUnit, setUnitSizeUnit] = useState<UnitSizeUnit>('sq. ft.');
  const [unknownUnitSize, setUnknownUnitSize] = useState(false);
  const [checkoutTime, setCheckoutTime] = useState('11:00 am');
  const [checkinTime, setCheckinTime] = useState('3:00 pm');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);

  /**
   * `base64: true` rather than the asset's file URI: there is no server and no persistent file
   * store here, so the photo has to travel inside the property itself. A data URI renders the
   * same on both targets — on web the picker is a file input and its URI is a blob that dies
   * with the page.
   */
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo access needed', 'Allow photo access to add a picture of the property.');
      return;
    }

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      // The whole thing is held in memory as text, so it is downscaled hard on the way in.
      quality: 0.4,
      base64: true,
    });

    const asset = picked.assets?.[0];
    if (picked.canceled || !asset?.base64) return;
    setImage(`data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}`);
  };

  const save = async () => {
    setSaving(true);
    await onSave({
      alias: alias.trim(),
      address: FIXED_ADDRESS,
      unit: unit.trim(),
      bedrooms: Number(bedrooms),
      beds: Number(beds),
      bathrooms: Number(bathrooms),
      unitSize: unknownUnitSize || unitSize === '' ? null : Number(unitSize),
      unitSizeUnit,
      currency: currency.split(' ')[0] ?? currency,
      checkoutTime,
      checkinTime,
      description,
      image,
    });
  };

  return (
    <View className="flex-1">
      <View className="flex-row items-center gap-2 px-4 py-3">
        <Pressable
          testID={`${ID}.back`}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => (step === 0 ? onClose() : setStep(step - 1))}
        >
          <MaterialCommunityIcons name="chevron-left" size={30} color={colors.primary} />
        </Pressable>
        <Text testID={`${ID}.title`} className="text-[24px] font-semibold text-ink">
          New Property
        </Text>
      </View>

      <ScrollView
        testID={`${ID}.scroll`}
        className="flex-1"
        contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
      >
        <Card testID={`${ID}.card`}>
          <View className="h-1.5 bg-surfaceMuted">
            <View
              className="h-1.5 rounded-full bg-primary"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </View>
          <View className="p-4">
            <Text testID={`${ID}.step-title`} className="pb-4 text-[24px] text-ink">
              {STEPS[step] ?? ''}
            </Text>

            {step === 0 ? (
              <View className="gap-4">
                <InfoRow label="Reservations Calendar" testID={`${ID}.calendar-info`} />
                {PROVIDERS.map((provider) => (
                  <Pressable
                    key={provider.id}
                    testID={`${ID}.provider.${provider.id}`}
                    accessibilityRole="button"
                    accessibilityLabel={`Register manually with ${provider.label}`}
                    onPress={() => setStep(1)}
                    className="items-center justify-center rounded border border-border py-5"
                  >
                    <Text className="text-[19px] text-inkMuted">{provider.label}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            {step === 1 ? (
              <View>
                <InfoRow label="Adding Properties" testID={`${ID}.adding-info`} />
                <ReadOnlyField
                  icon="map-marker"
                  label="Property Address"
                  value={FIXED_ADDRESS}
                  testID={`${ID}.address`}
                />
                <View className="flex-row items-center gap-2 pt-2">
                  <MaterialCommunityIcons name="information" size={16} color={colors.accent} />
                  <Text className="text-[14px] text-accent">
                    Can&apos;t find your address? Contact us
                  </Text>
                </View>
                <Field
                  icon="map-marker"
                  label="Unit #, Building Name, etc"
                  value={unit}
                  onChangeText={setUnit}
                  testID={`${ID}.unit`}
                />
                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Field
                      icon="office-building"
                      label="Alias"
                      value={alias}
                      onChangeText={setAlias}
                      testID={`${ID}.alias`}
                    />
                    <SelectField
                      icon="currency-usd"
                      label="Currency"
                      value={currency}
                      options={CURRENCIES}
                      onChange={setCurrency}
                      testID={`${ID}.currency`}
                    />
                  </View>
                  <Pressable
                    testID={`${ID}.image`}
                    accessibilityRole="button"
                    accessibilityLabel={image ? 'Change property photo' : 'Add a property photo'}
                    onPress={() => void pickImage()}
                    className="mt-4 h-[130px] w-[130px] items-center justify-center overflow-hidden rounded border-2 border-dashed border-primary px-2"
                  >
                    {image ? (
                      <Image
                        testID={`${ID}.image-preview`}
                        source={{ uri: image }}
                        resizeMode="cover"
                        className="h-full w-full"
                      />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="plus" size={36} color={colors.primary} />
                        <Text className="pt-2 text-center text-[15px] text-ink">
                          Tap to upload an image
                        </Text>
                      </>
                    )}
                  </Pressable>
                </View>
              </View>
            ) : null}

            {step === 2 ? (
              <View>
                <InfoRow label="Adding Properties" testID={`${ID}.details-info`} />
                <SelectField
                  label="Bedroom(s)"
                  value={bedrooms}
                  options={COUNTS}
                  onChange={setBedrooms}
                  testID={`${ID}.bedrooms`}
                />
                <SelectField
                  label="Bed(s)"
                  value={beds}
                  options={COUNTS}
                  onChange={setBeds}
                  testID={`${ID}.beds`}
                />
                <SelectField
                  label="Bathroom(s)"
                  value={bathrooms}
                  options={COUNTS}
                  onChange={setBathrooms}
                  testID={`${ID}.bathrooms`}
                />
                <View className="flex-row items-end gap-3">
                  <View className="flex-1">
                    <Field
                      icon="ruler"
                      label="Unit Size*"
                      value={unitSize}
                      onChangeText={setUnitSize}
                      placeholder="Unit Size"
                      keyboardType="numeric"
                      testID={`${ID}.unit-size`}
                    />
                  </View>
                  <SegmentedToggle
                    options={UNITS}
                    value={unitSizeUnit}
                    onChange={(next) => setUnitSizeUnit(next as UnitSizeUnit)}
                    testID={`${ID}.unit-size-toggle`}
                  />
                </View>
                <View className="pt-3">
                  <Checkbox
                    label="I don't know the Unit Size"
                    checked={unknownUnitSize}
                    onChange={setUnknownUnitSize}
                    testID={`${ID}.unknown-unit-size`}
                  />
                </View>
                <View className="flex-row gap-6">
                  <View className="flex-1">
                    <Field
                      icon="clock-outline"
                      label="Checkout time"
                      value={checkoutTime}
                      onChangeText={setCheckoutTime}
                      testID={`${ID}.checkout-time`}
                    />
                  </View>
                  <View className="flex-1">
                    <Field
                      icon="clock-outline"
                      label="Check-in time"
                      value={checkinTime}
                      onChangeText={setCheckinTime}
                      testID={`${ID}.checkin-time`}
                    />
                  </View>
                </View>
                <Field
                  icon="file-document-outline"
                  label="Property Description (visible to teammates)"
                  value={description}
                  onChangeText={setDescription}
                  maxLength={DESCRIPTION_LIMIT}
                  multiline
                  testID={`${ID}.description`}
                />
                <Text
                  testID={`${ID}.description-counter`}
                  className="pt-1 text-right text-[14px] text-ink"
                >
                  {description.length} / {DESCRIPTION_LIMIT}
                </Text>
              </View>
            ) : null}
          </View>
        </Card>
      </ScrollView>

      <View className="gap-2 border-t border-border bg-surface px-3 pb-2 pt-3">
        {step === 0 ? (
          <>
            {/* Nothing can be selected, so Next never opens: Skip → Yes is the way forward. */}
            <Button label="Next" disabled testID={`${ID}.next`} />
            <Pressable
              testID={`${ID}.skip`}
              accessibilityRole="button"
              onPress={() => setConfirmingSkip(true)}
              className="items-center py-3"
            >
              <Text className="text-[16px] text-primaryInk">Skip</Text>
            </Pressable>
          </>
        ) : (
          <>
            {step === 1 ? (
              <Button
                label="Next"
                onPress={() => setStep(2)}
                disabled={alias.trim() === ''}
                testID={`${ID}.next`}
              />
            ) : (
              <Button
                label="Save Property"
                onPress={save}
                loading={saving}
                testID={`${ID}.save`}
              />
            )}
            <Pressable
              testID={`${ID}.back-link`}
              accessibilityRole="button"
              onPress={() => setStep(step - 1)}
              className="items-center py-3"
            >
              <Text className="text-[16px] text-primaryInk">‹ Back</Text>
            </Pressable>
          </>
        )}
      </View>

      <ConfirmDialog
        visible={confirmingSkip}
        title="Are you sure?"
        message="Keep in mind that you will not be able to accept a bid from a Marketplace teammate until you sync a calendar."
        onConfirm={() => {
          setConfirmingSkip(false);
          setStep(1);
        }}
        onCancel={() => setConfirmingSkip(false)}
        testID={`${ID}.skip-confirm`}
      />
    </View>
  );
}
