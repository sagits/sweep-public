import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@sweep/ui';

import { dayKey, monthLabel, weekOf } from './days';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * The month navigator, weekday row and week strip from screenshot `04`. The selected day sits in
 * a dark rounded square; the grey bar under it is the drag handle that would expand the strip
 * into a month grid — inert here, as the PRD only shows the week.
 */
export function CalendarStrip({
  selected,
  onSelect,
  onStepMonth,
}: {
  selected: Date;
  onSelect: (date: Date) => void;
  onStepMonth: (step: -1 | 1) => void;
}) {
  const week = weekOf(selected);
  const selectedKey = dayKey(selected);

  return (
    <View testID="projects.calendar" className="bg-surface pb-2 pt-3">
      <View className="flex-row items-center justify-between px-5">
        <Pressable
          testID="projects.month-prev"
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          onPress={() => onStepMonth(-1)}
          hitSlop={12}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={colors.primary} />
        </Pressable>
        <Text testID="projects.month" className="text-[17px] font-bold text-ink">
          {monthLabel(selected)}
        </Text>
        <Pressable
          testID="projects.month-next"
          accessibilityRole="button"
          accessibilityLabel="Next month"
          onPress={() => onStepMonth(1)}
          hitSlop={12}
        >
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.primary} />
        </Pressable>
      </View>

      <View className="flex-row pt-4">
        {WEEKDAYS.map((weekday) => (
          <Text key={weekday} className="flex-1 text-center text-[13px] text-inkMuted">
            {weekday}
          </Text>
        ))}
      </View>

      <View className="flex-row pt-2">
        {week.map((date) => {
          const isSelected = dayKey(date) === selectedKey;
          return (
            <View key={dayKey(date)} className="flex-1 items-center">
              <Pressable
                testID={`projects.day.${dayKey(date)}`}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => onSelect(date)}
                className={`h-[52px] w-[52px] items-center justify-center rounded-lg ${
                  isSelected ? 'bg-ink' : ''
                }`}
              >
                <Text className={`text-[16px] ${isSelected ? 'text-white' : 'text-ink'}`}>
                  {date.getDate()}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      <View className="items-center pt-2">
        <View testID="projects.drag-handle" className="h-[5px] w-20 rounded-full bg-skeleton" />
      </View>
    </View>
  );
}
