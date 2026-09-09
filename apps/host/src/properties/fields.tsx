import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { colors } from '@sweep/ui';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

/**
 * The form's underlined field, straight off screenshots `25`–`28`: a small icon and label above
 * the value, a hairline under it. A filled field turns its label and rule teal.
 */
function FieldFrame({
  icon,
  label,
  active,
  children,
}: {
  icon?: IconName;
  label: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <View className="pt-4">
      <View className="flex-row items-center gap-1.5">
        {icon ? (
          <MaterialCommunityIcons
            name={icon}
            size={14}
            color={active ? colors.primaryInk : colors.ink}
          />
        ) : null}
        <Text
          numberOfLines={1}
          className={`text-[14px] ${active ? 'text-primaryInk' : 'text-ink'}`}
        >
          {label}
        </Text>
      </View>
      {children}
      <View className={`h-px ${active ? 'bg-primary' : 'bg-border'}`} />
    </View>
  );
}

export function Field({
  icon,
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  maxLength,
  multiline,
  testID,
}: {
  icon?: IconName;
  label: string;
  value: string;
  onChangeText: (next: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric';
  maxLength?: number;
  multiline?: boolean;
  testID?: string;
}) {
  return (
    <FieldFrame icon={icon} label={label} active={value.length > 0}>
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkMuted}
        keyboardType={keyboardType}
        maxLength={maxLength}
        multiline={multiline}
        className="py-1 text-[17px] text-ink"
      />
    </FieldFrame>
  );
}

/** Property Address: no address API in the PoC, so the value is fixed and cannot be edited. */
export function ReadOnlyField({
  icon,
  label,
  value,
  testID,
}: {
  icon?: IconName;
  label: string;
  value: string;
  testID?: string;
}) {
  return (
    <FieldFrame icon={icon} label={label} active={false}>
      <Text testID={testID} className="py-1 text-[17px] text-ink">
        {value}
      </Text>
    </FieldFrame>
  );
}

/**
 * The form's dropdowns (Bedroom(s), Currency, "Show N properties"). A native picker is one of the
 * controls the PRD lets us simplify: this is the same underlined field, expanding its options
 * in place.
 *
 * ponytail: expands inline rather than into a `Modal`. A modal would have to be hoisted out of
 * the ScrollView to avoid being clipped, and React Native's `Modal` renders nothing at all under
 * jest-expo — the options would drop straight out of the TDD seam.
 */
export function SelectField({
  icon,
  label,
  value,
  options,
  onChange,
  testID,
}: {
  icon?: IconName;
  label?: string;
  value: string;
  options: string[];
  onChange: (next: string) => void;
  testID: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <FieldFrame icon={icon} label={label ?? ''} active={false}>
        <Pressable
          testID={testID}
          accessibilityRole="button"
          onPress={() => setOpen(true)}
          className="flex-row items-center justify-between py-1"
        >
          <Text className="text-[17px] text-ink">{value}</Text>
          <MaterialCommunityIcons
            name={open ? 'menu-up' : 'menu-down'}
            size={22}
            color={colors.ink}
          />
        </Pressable>
      </FieldFrame>
      {open ? (
        <View testID={`${testID}.options`} className="rounded-b bg-surfaceMuted">
          {options.map((option) => (
            <Pressable
              key={option}
              testID={`${testID}.option.${option}`}
              accessibilityRole="button"
              accessibilityState={{ selected: option === value }}
              onPress={() => {
                onChange(option);
                setOpen(false);
              }}
              className="px-4 py-3"
            >
              <Text className={`text-[17px] ${option === value ? 'text-primaryInk' : 'text-ink'}`}>
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </>
  );
}

/** The sq. ft. / sq. mt. pair next to Unit Size. */
export function SegmentedToggle({
  options,
  value,
  onChange,
  testID,
}: {
  options: readonly string[];
  value: string;
  onChange: (next: string) => void;
  testID: string;
}) {
  return (
    <View className="flex-row overflow-hidden rounded">
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            testID={`${testID}.${option === options[0] ? 'first' : 'second'}`}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option)}
            className={`px-3 py-2 ${selected ? 'bg-primary' : 'bg-background'}`}
          >
            <Text className={`text-[15px] ${selected ? 'text-white' : 'text-ink'}`}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** The gray "Adding Properties" / "Reservations Calendar" strip with its teal ⓘ. */
export function InfoRow({ label, testID }: { label: string; testID?: string }) {
  return (
    <View
      testID={testID}
      className="flex-row items-center justify-between rounded bg-surfaceMuted px-4 py-3"
    >
      <Text className="text-[17px] font-semibold text-ink">{label}</Text>
      <MaterialCommunityIcons name="information" size={18} color={colors.primary} />
    </View>
  );
}
