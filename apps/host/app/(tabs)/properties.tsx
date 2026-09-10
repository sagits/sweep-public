import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Button, Card, Checkbox, Screen, Skeleton, colors } from '@sweep/ui';

import { PropertyCard } from '@/properties/PropertyCard';
import { SelectField } from '@/properties/fields';
import { useRefreshControl } from '@/refresh';
import { useProperties } from '@/stores/useProperties';

const PAGE_SIZES = [5, 10, 25];
const pageSizeLabel = (size: number) => `Show ${size} properties`;

function SkeletonCard({ testID }: { testID: string }) {
  return (
    <Card testID={testID} className="gap-3 p-[14px]">
      <Skeleton className="h-5 w-1/2" />
      <View className="flex-row gap-3">
        <Skeleton className="h-[68px] w-[76px]" />
        <View className="flex-1 gap-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </View>
      </View>
    </Card>
  );
}

export default function PropertiesScreen() {
  const router = useRouter();
  const properties = useProperties((state) => state.properties);
  const loading = useProperties((state) => state.loading);
  const load = useProperties((state) => state.load);
  const reload = useProperties((state) => state.reload);

  const [term, setTerm] = useState('');
  const [query, setQuery] = useState('');
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0] ?? 5);
  const [grouped, setGrouped] = useState(true);

  useEffect(() => {
    void load();
  }, [load]);

  const needle = query.trim().toLowerCase();
  const matches = properties.filter(
    (property) =>
      needle === '' ||
      property.alias.toLowerCase().includes(needle) ||
      property.address.toLowerCase().includes(needle)
  );
  const visible = matches.slice(0, pageSize);

  // Declared here, not inline in the JSX: a hook must never sit in an attribute that a
  // later refactor could move behind a branch.
  const refreshControl = useRefreshControl(reload, 'properties.refresh');

  return (
    <Screen testID="screen.properties">
      <ScrollView
        refreshControl={refreshControl}
        testID="properties.scroll"
        className="flex-1"
        contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row items-center gap-2">
          <MaterialCommunityIcons name="home" size={26} color={colors.primary} />
          <Text testID="properties.title" className="text-[26px] text-ink">
            Properties
          </Text>
        </View>

        <View className="flex-row pt-4">
          <TextInput
            testID="properties.search-input"
            value={term}
            onChangeText={setTerm}
            onSubmitEditing={() => setQuery(term)}
            placeholder="I'm looking for..."
            placeholderTextColor={colors.inkMuted}
            returnKeyType="search"
            className="h-[52px] flex-1 rounded-l border border-border bg-surface px-4 text-[16px] text-ink"
          />
          <Pressable
            testID="properties.search-button"
            accessibilityRole="button"
            accessibilityLabel="Search properties"
            onPress={() => setQuery(term)}
            className="h-[52px] w-[62px] items-center justify-center rounded-r bg-primary"
          >
            <MaterialCommunityIcons name="magnify" size={24} color={colors.surface} />
          </Pressable>
        </View>

        <SelectField
          value={pageSizeLabel(pageSize)}
          options={PAGE_SIZES.map(pageSizeLabel)}
          onChange={(label) =>
            setPageSize(PAGE_SIZES.find((size) => pageSizeLabel(size) === label) ?? pageSize)
          }
          testID="properties.page-size"
        />

        <View className="pt-6">
          <Button
            label="New Property"
            onPress={() => router.navigate('/property/new')}
            testID="properties.new"
          />
        </View>

        <Text testID="properties.count" className="pt-5 text-[17px] font-bold text-ink">
          {properties.length === 1
            ? 'You have 1 property'
            : `You have ${properties.length} properties`}
        </Text>

        <Pressable
          testID="properties.edit-groups"
          accessibilityRole="button"
          hitSlop={8}
          className="flex-row items-center gap-2 pt-4"
        >
          <MaterialCommunityIcons name="pencil" size={18} color={colors.primary} />
          <Text className="text-[17px] text-primaryInk">Edit property groups</Text>
        </Pressable>

        <View className="pt-4">
          <Checkbox
            label="Show sub-units grouped"
            checked={grouped}
            onChange={setGrouped}
            testID="properties.group-checkbox"
          />
        </View>

        <View className="gap-3 pt-5">
          {loading ? (
            <View testID="properties.skeleton" className="gap-3">
              <SkeletonCard testID="properties.skeleton-card-1" />
              <SkeletonCard testID="properties.skeleton-card-2" />
              <SkeletonCard testID="properties.skeleton-card-3" />
            </View>
          ) : visible.length === 0 ? (
            <Card testID="properties.empty" className="items-center gap-3 px-4 py-10">
              <MaterialCommunityIcons name="home-outline" size={56} color={colors.inkMuted} />
              <Text className="text-center text-[17px] text-ink">
                {properties.length === 0
                  ? "You don't have any properties yet."
                  : 'No properties match your search.'}
              </Text>
              {properties.length === 0 ? (
                <Text className="text-center text-[15px] text-inkMuted">
                  Register one with New Property to start cleaning projects for it.
                </Text>
              ) : null}
            </Card>
          ) : (
            visible.map((property) => <PropertyCard key={property.id} property={property} />)
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
