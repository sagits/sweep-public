import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NewProject, Property } from '@sweep/types';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';

import { Button, Card, colors, timeLabel } from '@sweep/ui';

import { Field } from '@/properties/fields';
import { addDays, startOfDay } from './days';

const PROJECT_TYPES = ['Cleaning'];
const FREQUENCIES = ['Single'];
const CHECKLISTS = ['Default Checklist'];
const PRICES = ['Teammate rate for the property', 'Custom Price'];

/** The presets the PRD lets a date picker be simplified to: the next two weeks. */
const DATE_PRESET_DAYS = 14;
/** …and an hourly working day for the time picker. */
const TIME_PRESET_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

/** "Sep 09, 2026" — the chip label in screenshots `07` and `08`, zero-padded day. */
const dateLabel = (date: Date) =>
  `${date.toLocaleDateString('en-US', { month: 'short' })} ${`${date.getDate()}`.padStart(
    2,
    '0'
  )}, ${date.getFullYear()}`;

/** "11:00 AM" */
const hourLabel = (hour: number) => {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return timeLabel(date);
};

const atHour = (day: Date, hour: number) => {
  const date = startOfDay(day);
  date.setHours(hour, 0, 0, 0);
  return date;
};

/**
 * The inline option list every picker on this form drops open.
 *
 * ponytail: inline rather than a `Modal`, for the reasons ticket 03 recorded — a modal inside a
 * ScrollView is clipped, and `Modal` renders nothing under jest-expo, which would put every
 * picker out of reach of the TDD seam.
 */
function Options({
  options,
  value,
  onChange,
  testID,
}: {
  options: string[];
  value: string;
  onChange: (next: string) => void;
  testID: string;
}) {
  return (
    <View testID={`${testID}.options`} className="rounded bg-surfaceMuted">
      {options.map((option) => (
        <Pressable
          key={option}
          testID={`${testID}.option.${option}`}
          accessibilityRole="button"
          accessibilityState={{ selected: option === value }}
          onPress={() => onChange(option)}
          className="px-4 py-3"
        >
          <Text className={`text-[15px] ${option === value ? 'text-primaryInk' : 'text-ink'}`}>
            {option}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

/** "Select property … Beach apartment ›" — label left, value right, chevron. */
function PickerRow({
  label,
  value,
  options,
  onChange,
  testID,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (next: string) => void;
  testID: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        onPress={() => setOpen((was) => !was)}
        className="flex-row items-center justify-between py-4"
      >
        <Text className="text-[16px] text-ink">{label}</Text>
        <View className="flex-row items-center">
          <Text numberOfLines={1} className="max-w-[180px] text-[16px] text-inkMuted">
            {value}
          </Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.inkMuted} />
        </View>
      </Pressable>
      {open ? (
        <Options
          options={options}
          value={value}
          onChange={(next) => {
            onChange(next);
            setOpen(false);
          }}
          testID={testID}
        />
      ) : null}
    </View>
  );
}

/** One of the two grey chips under "Start date & time". */
function PresetChip({
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
    <View>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        onPress={() => setOpen((was) => !was)}
        className="rounded bg-surfaceMuted px-4 py-3"
      >
        <Text className="text-[16px] text-ink">{value}</Text>
      </Pressable>
      {open ? (
        <View className="absolute left-0 top-[52px] z-10 w-[220px] rounded bg-surfaceMuted">
          <ScrollView style={{ maxHeight: 220 }} nestedScrollEnabled>
            <Options
              options={options}
              value={value}
              onChange={(next) => {
                onChange(next);
                setOpen(false);
              }}
              testID={testID}
            />
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

function RadioRow({
  label,
  selected,
  onPress,
  testID,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID: string;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      className="flex-row items-center gap-3 py-3"
    >
      <View
        className={`h-7 w-7 items-center justify-center rounded-full border ${
          selected ? 'border-primary' : 'border-inkMuted'
        }`}
      >
        {selected ? <View className="h-[18px] w-[18px] rounded-full bg-primary" /> : null}
      </View>
      <Text className="text-[16px] text-ink">{label}</Text>
    </Pressable>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
  testID,
}: {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
  testID: string;
}) {
  return (
    <View className="flex-row items-center justify-between py-3">
      <Text className="text-[16px] text-ink">{label}</Text>
      <Switch
        testID={testID}
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.inkMuted, true: colors.primary }}
      />
    </View>
  );
}

function SectionLabel({ label }: { label: string }) {
  return <Text className="px-4 pb-2 pt-6 text-[14px] text-inkMuted">{label}</Text>;
}

const Rule = () => <View className="h-px bg-border" />;

/**
 * "New Manual Project", screenshots `06`–`08`: four sections of rows over a sticky footer that
 * carries the Visible toggle and the teal submit button.
 */
export function NewManualProjectForm({
  properties,
  onCreate,
  onCancel,
}: {
  properties: Property[];
  onCreate: (input: NewProject) => Promise<void>;
  onCancel: () => void;
}) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const dates = useMemo(
    () => Array.from({ length: DATE_PRESET_DAYS }, (_, i) => addDays(today, i)),
    [today]
  );
  const dateOptions = dates.map(dateLabel);
  const timeOptions = TIME_PRESET_HOURS.map(hourLabel);

  const [projectType, setProjectType] = useState(PROJECT_TYPES[0]!);
  const [alias, setAlias] = useState<string | null>(null);
  const [name, setName] = useState('Manual Project');
  const [price, setPrice] = useState(PRICES[0]!);
  const [frequency, setFrequency] = useState(FREQUENCIES[0]!);
  const [startDate, setStartDate] = useState(dateOptions[0]!);
  const [startTime, setStartTime] = useState(hourLabel(11));
  const [endDate, setEndDate] = useState(dateOptions[0]!);
  const [endTime, setEndTime] = useState(hourLabel(15));
  const [guestSameDay, setGuestSameDay] = useState(false);
  const [restrict, setRestrict] = useState(false);
  const [checklist, setChecklist] = useState(CHECKLISTS[0]!);
  const [visible, setVisible] = useState(true);
  const [saving, setSaving] = useState(false);

  // The picker opens on the first registered property until the host chooses another.
  const property = properties.find((one) => one.alias === alias) ?? properties[0];

  const submit = async () => {
    if (!property) return;
    setSaving(true);
    const startsAt = atHour(
      dates[dateOptions.indexOf(startDate)] ?? today,
      TIME_PRESET_HOURS[timeOptions.indexOf(startTime)] ?? 11
    );
    const endsAt = atHour(
      dates[dateOptions.indexOf(endDate)] ?? today,
      TIME_PRESET_HOURS[timeOptions.indexOf(endTime)] ?? 15
    );

    await onCreate({
      propertyAlias: property.alias,
      propertyAddress: property.unit
        ? `${property.address} #${property.unit}`
        : property.address,
      cleanerName: null,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      name: name.trim() === '' ? 'Manual Project' : name.trim(),
      manual: true,
      visible,
    });
    setSaving(false);
  };

  return (
    <View className="flex-1">
      <View className="flex-row items-center bg-surface px-4 py-3">
        <Pressable
          testID="project-form.cancel"
          accessibilityRole="button"
          onPress={onCancel}
          hitSlop={10}
        >
          <Text className="text-[16px] text-primary">Cancel</Text>
        </Pressable>
        <Text testID="project-form.title" className="flex-1 text-center text-[18px] font-bold text-ink">
          New Manual Project
        </Text>
        {/* Balances the centred title against the Cancel link. */}
        <View className="w-[62px]" />
      </View>

      <ScrollView
        testID="project-form.scroll"
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <SectionLabel label="Project and Property" />
        <Card className="mx-4 px-4">
          <PickerRow
            label="Select Project Type"
            value={projectType}
            options={PROJECT_TYPES}
            onChange={setProjectType}
            testID="project-form.type"
          />
          <Rule />
          <PickerRow
            label="Select property"
            value={property?.alias ?? 'No properties yet'}
            options={properties.map((one) => one.alias)}
            onChange={setAlias}
            testID="project-form.property"
          />
          <Rule />
          <View className="pb-4">
            <Field
              label="Project Name (optional)"
              value={name}
              onChangeText={setName}
              placeholder="Manual Project"
              testID="project-form.name"
            />
          </View>
        </Card>

        <SectionLabel label="Payment" />
        <Card className="mx-4 px-4 py-3">
          <Text className="text-[16px] text-ink">Price</Text>
          {PRICES.map((option) => (
            <RadioRow
              key={option}
              label={option}
              selected={option === price}
              onPress={() => setPrice(option)}
              testID={`project-form.price.${option === PRICES[0] ? 'teammate' : 'custom'}`}
            />
          ))}
        </Card>

        <SectionLabel label="Project Details" />
        <Card className="mx-4 px-4">
          <PickerRow
            label="Frequency"
            value={frequency}
            options={FREQUENCIES}
            onChange={setFrequency}
            testID="project-form.frequency"
          />
          <Rule />
          <View className="py-4">
            <Text className="text-[16px] text-ink">Start date & time</Text>
            <View className="flex-row gap-3 pt-3">
              <PresetChip
                value={startDate}
                options={dateOptions}
                onChange={setStartDate}
                testID="project-form.start-date"
              />
              <PresetChip
                value={startTime}
                options={timeOptions}
                onChange={setStartTime}
                testID="project-form.start-time"
              />
            </View>
          </View>
          <Rule />
          <View className="py-4">
            <Text className="text-[16px] text-ink">End Date & Time*</Text>
            <View className="flex-row gap-3 pt-3">
              <PresetChip
                value={endDate}
                options={dateOptions}
                onChange={setEndDate}
                testID="project-form.end-date"
              />
              <PresetChip
                value={endTime}
                options={timeOptions}
                onChange={setEndTime}
                testID="project-form.end-time"
              />
            </View>
          </View>
          <Rule />
          <ToggleRow
            label="Guest arrives same day"
            value={guestSameDay}
            onChange={setGuestSameDay}
            testID="project-form.guest-same-day"
          />
        </Card>

        <SectionLabel label="About the Cleaning" />
        <Card className="mx-4 mb-4 px-4">
          <ToggleRow
            label="Restrict to specific teammates"
            value={restrict}
            onChange={setRestrict}
            testID="project-form.restrict"
          />
          <Rule />
          <PickerRow
            label="Checklist"
            value={checklist}
            options={CHECKLISTS}
            onChange={setChecklist}
            testID="project-form.checklist"
          />
        </Card>
      </ScrollView>

      <View className="bg-background px-4 pb-4 pt-3">
        <View className="flex-row items-center justify-center gap-3 pb-3">
          <Text className="text-[16px] text-ink">Visible</Text>
          <Switch
            testID="project-form.visible"
            value={visible}
            onValueChange={setVisible}
            trackColor={{ false: colors.inkMuted, true: colors.primary }}
          />
        </View>
        <Button
          label="Add manual project"
          onPress={() => void submit()}
          loading={saving}
          disabled={!property}
          testID="project-form.submit"
        />
      </View>
    </View>
  );
}
