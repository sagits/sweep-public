import type { NewSearch, Property, UnitSizeUnit } from '@sweep/types';
import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

import { Button, Card, Checkbox, colors } from '@sweep/ui';

import { HowItWorksRow } from '@/marketplace/HowItWorksRow';
import { MarketplaceHeader } from '@/marketplace/MarketplaceHeader';
import { Field, ReadOnlyField, SegmentedToggle, SelectField } from '@/properties/fields';

const COUNTS = ['1', '2', '3', '4', '5', '6', '7', '8'];
const UNITS: readonly UnitSizeUnit[] = ['sq. ft.', 'sq. mt.'];

type Details = {
  unit: string;
  bedrooms: string;
  beds: string;
  bathrooms: string;
  unitSize: string;
  unitSizeUnit: UnitSizeUnit;
};

/** Nothing is registered yet: the wizard still renders, with empty details. */
const EMPTY_PROPERTY: Property = {
  id: '',
  alias: '',
  address: '',
  unit: '',
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  unitSize: null,
  unitSizeUnit: 'sq. ft.',
  currency: 'USD',
  checkoutTime: '',
  checkinTime: '',
  description: '',
};

const detailsOf = (property: Property): Details => ({
  unit: property.unit,
  bedrooms: String(property.bedrooms),
  beds: String(property.beds),
  bathrooms: String(property.bathrooms),
  unitSize: property.unitSize === null ? '' : String(property.unitSize),
  unitSizeUnit: property.unitSizeUnit,
});

/** The teal "Congrats!" panel over a scrim, while the search is being posted — screenshot `13`. */
function CongratsOverlay() {
  return (
    <View
      testID="search-form.congrats"
      className="absolute inset-0 items-center justify-center bg-black/30"
    >
      <View className="h-1/2 w-1/2 items-center justify-center bg-primary">
        <Text className="text-[44px]">🎉</Text>
        <Text className="pt-2 text-[17px] font-bold text-white">Congrats!</Text>
      </View>
    </View>
  );
}

/**
 * The two-step New Cleaner Search wizard — screenshots `11`, `12`, `13`.
 *
 * The inputs are the property form's field primitives, so the whole app speaks one field
 * vocabulary; see DECISIONS for where that reads differently from the reference.
 */
export function NewSearchWizard({
  properties,
  onSubmit,
  onClose,
}: {
  properties: Property[];
  onSubmit: (input: NewSearch) => Promise<void>;
  onClose: () => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [property, setProperty] = useState<Property | undefined>(properties[0]);
  const [details, setDetails] = useState<Details>(
    properties[0] ? detailsOf(properties[0]) : detailsOf(EMPTY_PROPERTY)
  );
  const [cantFindAddress, setCantFindAddress] = useState(false);
  const [notes, setNotes] = useState('');
  const [saveNotes, setSaveNotes] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const set = (patch: Partial<Details>) => setDetails((current) => ({ ...current, ...patch }));

  const selectProperty = (alias: string) => {
    const next = properties.find((candidate) => candidate.alias === alias);
    if (!next) return;
    setProperty(next);
    setDetails(detailsOf(next));
  };

  const submit = async () => {
    if (!property || submitting) return;
    setSubmitting(true);
    await onSubmit({
      propertyId: property.id,
      propertyAlias: property.alias,
      unit: details.unit,
      bedrooms: Number(details.bedrooms),
      beds: Number(details.beds),
      bathrooms: Number(details.bathrooms),
      unitSize: details.unitSize === '' ? null : Number(details.unitSize),
      unitSizeUnit: details.unitSizeUnit,
      notes: notes.trim(),
    });
  };

  return (
    <View className="flex-1">
      <MarketplaceHeader
        title="New Cleaner Search"
        onBack={() => (step === 1 ? onClose() : setStep(1))}
        testID="search-form.header"
      >
        <View className="h-[5px] bg-background">
          <View
            testID="search-form.progress"
            className={`h-full bg-primary ${step === 1 ? 'w-1/2' : 'w-full'}`}
          />
        </View>
      </MarketplaceHeader>

      <ScrollView
        testID="search-form.scroll"
        className="flex-1 bg-background"
        contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 ? (
          <View className="gap-3">
            <HowItWorksRow title="How the Sweep Marketplace works" testID="search-form.info" />
            <Card className="px-4 pb-5 pt-4">
              <Text testID="search-form.step-title" className="text-[22px] font-bold text-ink">
                Confirm the Property Details
              </Text>

              <SelectField
                label="Property *"
                value={property?.alias ?? ''}
                options={properties.map((candidate) => candidate.alias)}
                onChange={selectProperty}
                testID="search-form.property"
              />
              <ReadOnlyField
                label="Property Address *"
                value={property?.address ?? ''}
                testID="search-form.address"
              />
              <View className="pt-4">
                <Checkbox
                  label="I can't find my address"
                  checked={cantFindAddress}
                  onChange={setCantFindAddress}
                  testID="search-form.cant-find-address"
                />
              </View>

              <Field
                label="Unit #, Building Name, etc."
                value={details.unit}
                onChangeText={(unit) => set({ unit })}
                testID="search-form.unit"
              />
              <SelectField
                label="Bedrooms"
                value={details.bedrooms}
                options={COUNTS}
                onChange={(bedrooms) => set({ bedrooms })}
                testID="search-form.bedrooms"
              />
              <SelectField
                label="Beds"
                value={details.beds}
                options={COUNTS}
                onChange={(beds) => set({ beds })}
                testID="search-form.beds"
              />
              <SelectField
                label="Bathrooms"
                value={details.bathrooms}
                options={COUNTS}
                onChange={(bathrooms) => set({ bathrooms })}
                testID="search-form.bathrooms"
              />
              <Field
                label="Unit Size *"
                value={details.unitSize}
                onChangeText={(unitSize) => set({ unitSize })}
                keyboardType="numeric"
                maxLength={6}
                testID="search-form.unit-size"
              />
              <View className="flex-row justify-end pt-3">
                <SegmentedToggle
                  options={UNITS}
                  value={details.unitSizeUnit}
                  onChange={(unit) => set({ unitSizeUnit: unit as UnitSizeUnit })}
                  testID="search-form.unit-size-toggle"
                />
              </View>
            </Card>
          </View>
        ) : (
          <Card className="px-4 pb-5 pt-4">
            <Text testID="search-form.step-title" className="text-[22px] font-bold text-ink">
              Describe your cleaning needs
            </Text>
            <Text className="pt-3 text-[17px] font-bold text-ink">
              Add a note below about any special requirements.{' '}
              <Text className="font-normal">(Optional)</Text>
            </Text>

            <TextInput
              testID="search-form.notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Explain how you want the cleaning to be done on your property."
              placeholderTextColor={colors.inkMuted}
              multiline
              textAlignVertical="top"
              className="mt-3 h-[110px] rounded bg-surfaceMuted p-3 text-[15px] text-ink"
            />

            <View className="pt-4">
              <Checkbox
                label="Save this text for future notes"
                checked={saveNotes}
                onChange={setSaveNotes}
                testID="search-form.save-notes"
              />
            </View>

            <View
              testID="search-form.warning"
              className="mt-4 flex-row gap-2 rounded bg-slate p-3.5"
            >
              <Text className="text-[17px]">☝️</Text>
              <Text className="flex-1 text-[15px] leading-6 text-white">
                <Text className="font-bold">Important:</Text> For your safety, do not include
                personally identifying information, such as phone number, email or property
                address.
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>

      <View className="border-t border-border bg-surface p-3">
        {step === 1 ? (
          <Button
            label="Next: Describe your cleaning needs"
            onPress={() => setStep(2)}
            testID="search-form.next"
          />
        ) : (
          <Button
            label="Find cleaners"
            onPress={() => void submit()}
            loading={submitting}
            testID="search-form.submit"
          />
        )}
      </View>

      {submitting ? <CongratsOverlay /> : null}
    </View>
  );
}
