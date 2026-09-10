import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NewSearch, Property, UnitSizeUnit } from '@sweep/types';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Button, Card, Checkbox, PinnedFooter, Spinner, colors } from '@sweep/ui';

import { HowItWorksRow } from '@/marketplace/HowItWorksRow';
import { ScreenHeader } from '@/navigation/ScreenHeader';
import { Field, ReadOnlyField, SegmentedToggle, SelectField } from '@/properties/fields';

const COUNTS = ['1', '2', '3', '4', '5', '6', '7', '8'];

/** The checklist the cleaning-needs step offers. Nothing consumes it; the PoC has no checklists. */
const CHECKLISTS = ['Default Checklist', 'Deep Clean Checklist'];
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

/**
 * How long the dialog stays up before the Congrats screen, even if the post lands sooner.
 *
 * The wait has to happen where the navigation does — `onSubmit` replaces this screen, so anything
 * awaited after it delays nothing anybody sees.
 */
export const SEARCHING_MS = 1000;

/**
 * Shown while the search is posted, in place of screenshot `13`'s teal "Congrats!" panel: a
 * centred white card over a dimmed scrim, the app's teal spinner where an alert would put its
 * icon, and no button — nothing here is dismissible, it leads straight to the bids.
 */
function SearchingDialog() {
  return (
    <View
      testID="search-form.searching"
      className="absolute inset-0 items-center justify-center bg-black/40 px-10"
    >
      <Card className="w-full items-center px-6 py-8">
        <Spinner size={48} />
        <Text className="pt-5 text-[20px] font-bold text-ink">Loading</Text>
        <Text className="pt-1 text-[15px] text-inkMuted">Searching for cleaners</Text>
      </Card>
    </View>
  );
}

/**
 * The two-step New Cleaner Search wizard — screenshots `11`, `12`, `13`.
 *
 * The inputs are the property form's field primitives, so the whole app speaks one field
 * vocabulary; see DECISIONS for where that reads differently from the reference.
 */
/**
 * The grey rounded select of `poc/screenshots/4/34-search-cleaning-needs.png` — value on the
 * left, teal chevron on the right, options opening underneath. `SelectField` is the underlined
 * form row; this is the boxed one, and only this step draws it.
 */
function Dropdown({
  value,
  options,
  onChange,
  testID,
}: {
  value: string;
  options: string[];
  onChange: (next: string) => void;
  testID: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View className="overflow-hidden rounded bg-surfaceMuted">
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((was) => !was)}
        className="h-[52px] flex-row items-center justify-between px-4"
      >
        <Text className="text-[16px] text-ink">{value}</Text>
        <MaterialCommunityIcons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={26}
          color={colors.primary}
        />
      </Pressable>
      {open
        ? options.map((option) => (
            <Pressable
              key={option}
              testID={`${testID}.option.${option}`}
              accessibilityRole="button"
              accessibilityState={{ selected: option === value }}
              onPress={() => {
                onChange(option);
                setOpen(false);
              }}
              className="border-t border-border px-4 py-3"
            >
              <Text className={`text-[16px] ${option === value ? 'text-primaryInk' : 'text-ink'}`}>
                {option}
              </Text>
            </Pressable>
          ))
        : null}
    </View>
  );
}

/** A bold question over a regular hint over its dropdown. */
function Question({
  title,
  hint,
  value,
  options,
  onChange,
  testID,
}: {
  title: string;
  hint: string;
  value: string;
  options: string[];
  onChange: (next: string) => void;
  testID: string;
}) {
  return (
    <View className="pt-5">
      <Text className="text-[16px] font-bold text-ink">{title}</Text>
      <Text className="pb-2 text-[16px] text-ink">{hint}</Text>
      <Dropdown value={value} options={options} onChange={onChange} testID={testID} />
    </View>
  );
}

export function NewSearchWizard({
  properties,
  onSubmit,
  onClose,
}: {
  properties: Property[];
  onSubmit: (input: NewSearch) => Promise<void>;
  onClose: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [property, setProperty] = useState<Property | undefined>(properties[0]);
  const [details, setDetails] = useState<Details>(
    properties[0] ? detailsOf(properties[0]) : detailsOf(EMPTY_PROPERTY)
  );
  const [turnovers, setTurnovers] = useState('1');
  const [cleanHours, setCleanHours] = useState('3');
  const [needs, setNeeds] = useState({ supplies: true, linen: true, checklist: true });
  const [checklist, setChecklist] = useState(CHECKLISTS[0] as string);
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
      <ScreenHeader
        title="New Cleaner Search"
        onBack={() => (step === 1 ? onClose() : setStep(step === 3 ? 2 : 1))}
        testID="search-form.header"
      >
        <View className="h-[5px] bg-background">
          <View
            testID="search-form.progress"
            className={`h-full bg-primary ${
              step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'
            }`}
          />
        </View>
      </ScreenHeader>

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
        ) : step === 2 ? (
          <View className="gap-3">
            <HowItWorksRow title="How the Sweep Marketplace works" testID="search-form.needs-info" />
            <Card className="px-4 pb-5 pt-4">
              <Text testID="search-form.step-title" className="text-[18px] font-bold text-ink">
                Describe your cleaning needs
              </Text>

              <Question
                title="How many guest turnovers per month?"
                hint="Estimated:"
                value={turnovers}
                options={COUNTS}
                onChange={setTurnovers}
                testID="search-form.turnovers"
              />
              <Question
                title="How long does it take to clean your unit?"
                hint="Estimated hours:"
                value={cleanHours}
                options={COUNTS}
                onChange={setCleanHours}
                testID="search-form.clean-hours"
              />

              <Text className="pt-5 text-[16px] font-bold text-ink">The cleaner needs to</Text>
              <View className="gap-2 pt-2">
                <Checkbox
                  label="Provide Cleaning Supplies"
                  checked={needs.supplies}
                  onChange={(next) => setNeeds((n) => ({ ...n, supplies: next }))}
                  large
                  testID="search-form.needs.supplies"
                />
                <Checkbox
                  label="Wash and dry linen and towels"
                  checked={needs.linen}
                  onChange={(next) => setNeeds((n) => ({ ...n, linen: next }))}
                  large
                  testID="search-form.needs.linen"
                />
                <Checkbox
                  label="Use this checklist (Optional)"
                  checked={needs.checklist}
                  onChange={(next) => setNeeds((n) => ({ ...n, checklist: next }))}
                  large
                  testID="search-form.needs.checklist"
                />
                {needs.checklist ? (
                  <View className="pl-7 pt-1">
                    <Dropdown
                      value={checklist}
                      options={CHECKLISTS}
                      onChange={setChecklist}
                      testID="search-form.checklist"
                    />
                  </View>
                ) : null}
              </View>
            </Card>
          </View>
        ) : (
          <Card className="px-4 pb-5 pt-4">
            <Text testID="search-form.step-title" className="text-[18px] font-bold text-ink">
              Add a note
            </Text>
            <Text className="pt-3 text-[15px] font-bold text-ink">
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

      <PinnedFooter className="px-3 pt-3">
        {step === 1 ? (
          <Button
            label="Next: Describe your cleaning needs"
            onPress={() => setStep(2)}
            testID="search-form.next"
          />
        ) : step === 2 ? (
          <Button
            label="Next: Add a note"
            onPress={() => setStep(3)}
            testID="search-form.next-note"
          />
        ) : (
          <Button
            label="Find cleaners"
            onPress={() => void submit()}
            loading={submitting}
            testID="search-form.submit"
          />
        )}
      </PinnedFooter>

      {submitting ? <SearchingDialog /> : null}
    </View>
  );
}
