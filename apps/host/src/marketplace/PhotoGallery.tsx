import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ImageSourcePropType,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ViewStyle,
} from 'react-native';
import { FlatList, Image, Platform, Pressable, Text, View } from 'react-native';

import { colors } from '@sweep/ui';

/**
 * On web the gallery renders inside `Screen`'s centred, `max-w-content` column, so an absolutely
 * positioned overlay is trapped at 720px with the page showing around it. `fixed` takes it back
 * to the viewport. React Native has no `fixed` position, hence the cast and the platform switch;
 * on native `absolute inset-0` already means the whole screen.
 */
const OVERLAY = Platform.select({
  web: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 } as unknown as ViewStyle,
  default: undefined,
});

/**
 * Full-screen photo viewer: swipe between photos, or step with the arrows.
 *
 * An absolutely positioned overlay rather than a React Native `Modal` — `Modal` renders nothing
 * under jest-expo (DECISIONS 03), so a modal here would be untestable at the component seam. It
 * is the same call `ConfirmDialog` made.
 *
 * The page size is measured from this overlay rather than read off `useWindowDimensions`. The
 * window is not the pager: on web the two differ by the sidebar and the content cap, and
 * DECISIONS 01 already recorded that `useWindowDimensions` misreports in the web export anyway.
 * A page laid out at the wrong width scrolls out of the pager's own bounds and leaves the
 * viewer black.
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
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [index, setIndex] = useState(initialIndex);
  const list = useRef<FlatList<ImageSourcePropType>>(null);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize((current) =>
      current.width === width && current.height === height ? current : { width, height }
    );
  };

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(next, photos.length - 1));
      setIndex(clamped);
      list.current?.scrollToIndex({ index: clamped, animated: true });
    },
    [photos.length]
  );

  // A resize (or a rotation) changes the page size under the pager, which would otherwise leave
  // it parked between two photos.
  useEffect(() => {
    if (size.width === 0) return;
    list.current?.scrollToOffset({ offset: index * size.width, animated: false });
    // `index` is deliberately not a dependency: this realigns on resize, and `goTo` already
    // scrolls when the index itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width]);

  // Which photo a swipe landed on. The page size is the pager's own width, so the offset
  // divides straight out.
  const onMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(event.nativeEvent.contentOffset.x / Math.max(size.width, 1));
    setIndex(Math.max(0, Math.min(page, photos.length - 1)));
  };

  return (
    <View testID={testID} onLayout={onLayout} className="absolute inset-0 bg-black" style={OVERLAY}>
      {/* Nothing to lay out until the overlay has been measured; one frame of black beats a
          pager built around a width that is not its own. */}
      {size.width > 0 ? (
        <FlatList
          ref={list}
          testID={`${testID}.pager`}
          data={photos}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, i) => ({ length: size.width, offset: size.width * i, index: i })}
          onMomentumScrollEnd={onMomentumEnd}
          keyExtractor={(_, i) => `photo-${i}`}
          renderItem={({ item, index: i }) => (
            <View
              style={{ width: size.width, height: size.height }}
              className="items-center justify-center"
            >
              <Image
                testID={`${testID}.photo.${i}`}
                source={item}
                resizeMode="contain"
                style={{ width: size.width, height: size.height }}
              />
            </View>
          )}
        />
      ) : null}

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
          disappears at its end of the set rather than sitting there inert. The negative margin is
          half the button's height, so `top-1/2` centres the button rather than its top edge. */}
      {index > 0 ? (
        <Pressable
          testID={`${testID}.prev`}
          accessibilityRole="button"
          accessibilityLabel="Previous photo"
          onPress={() => goTo(index - 1)}
          className="absolute left-3 top-1/2 -mt-[22px] h-11 w-11 items-center justify-center rounded-full bg-black/50"
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
          className="absolute right-3 top-1/2 -mt-[22px] h-11 w-11 items-center justify-center rounded-full bg-black/50"
        >
          <MaterialCommunityIcons name="chevron-right" size={32} color={colors.surface} />
        </Pressable>
      ) : null}
    </View>
  );
}
