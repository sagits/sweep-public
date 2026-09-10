import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useRef, useState } from 'react';
import type { ImageSourcePropType, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { FlatList, Image, Pressable, Text, View, useWindowDimensions } from 'react-native';

import { colors } from '@sweep/ui';

/**
 * Full-screen photo viewer: swipe between photos, or step with the arrows.
 *
 * An absolutely positioned overlay rather than a React Native `Modal` — `Modal` renders nothing
 * under jest-expo (DECISIONS 03), so a modal here would be untestable at the component seam. It
 * is the same call `ConfirmDialog` made.
 */
export function PhotoGallery({
  photos,
  initialIndex,
  onClose,
  testID = 'gallery',
}: {
  photos: ImageSourcePropType[];
  initialIndex: number;
  onClose: () => void;
  testID?: string;
}) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(initialIndex);
  const list = useRef<FlatList<ImageSourcePropType>>(null);

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(next, photos.length - 1));
      setIndex(clamped);
      list.current?.scrollToIndex({ index: clamped, animated: true });
    },
    [photos.length]
  );

  // Which photo a swipe landed on. `width` is the page size, so the offset divides straight out.
  const onMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(event.nativeEvent.contentOffset.x / Math.max(width, 1));
    setIndex(Math.max(0, Math.min(page, photos.length - 1)));
  };

  return (
    <View testID={testID} className="absolute inset-0 bg-black">
      <FlatList
        ref={list}
        testID={`${testID}.pager`}
        data={photos}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onMomentumScrollEnd={onMomentumEnd}
        keyExtractor={(_, i) => `photo-${i}`}
        renderItem={({ item, index: i }) => (
          <View style={{ width }} className="flex-1 items-center justify-center">
            <Image
              testID={`${testID}.photo.${i}`}
              source={item}
              resizeMode="contain"
              className="h-full w-full"
            />
          </View>
        )}
      />

      <View className="absolute inset-x-0 top-0 flex-row items-center justify-between px-4 pt-14">
        <Text testID={`${testID}.counter`} className="text-[16px] font-bold text-white">
          {`${index + 1} / ${photos.length}`}
        </Text>
        <Pressable
          testID={`${testID}.close`}
          accessibilityRole="button"
          accessibilityLabel="Close gallery"
          onPress={onClose}
          hitSlop={12}
        >
          <MaterialCommunityIcons name="close" size={30} color={colors.surface} />
        </Pressable>
      </View>

      {/* The arrows are for the web target and for anyone who would rather tap than swipe. Each
          disappears at its end of the set rather than sitting there inert. */}
      {index > 0 ? (
        <Pressable
          testID={`${testID}.prev`}
          accessibilityRole="button"
          accessibilityLabel="Previous photo"
          onPress={() => goTo(index - 1)}
          className="absolute left-3 top-1/2 h-11 w-11 items-center justify-center rounded-full bg-black/50"
        >
          <MaterialCommunityIcons name="chevron-left" size={32} color={colors.surface} />
        </Pressable>
      ) : null}

      {index < photos.length - 1 ? (
        <Pressable
          testID={`${testID}.next`}
          accessibilityRole="button"
          accessibilityLabel="Next photo"
          onPress={() => goTo(index + 1)}
          className="absolute right-3 top-1/2 h-11 w-11 items-center justify-center rounded-full bg-black/50"
        >
          <MaterialCommunityIcons name="chevron-right" size={32} color={colors.surface} />
        </Pressable>
      ) : null}
    </View>
  );
}
