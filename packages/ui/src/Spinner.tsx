import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

import { colors } from '../tokens';

const BLADES = 12;

/**
 * The teal starburst the real app spins: twelve rounded blades on an opacity ramp, rotating.
 * Used for full-screen loads, in-button pending states and the Quality center card.
 *
 * ponytail: `animating={false}` renders the starburst still. Detox waits for animations to
 * settle, so a spinner that never stops makes the app permanently "busy" and every spec in the
 * suite times out — not just the one looking at it. A spinner tied to a mock resolver finishes
 * on its own and is safe to animate; only a permanent one has to hold still. If a live rotation
 * there ever matters, drive it with Reanimated, whose UI-thread animations Detox does not track.
 */
export function Spinner({
  size = 32,
  color = colors.primary,
  animating = true,
  testID,
}: {
  size?: number;
  color?: string;
  animating?: boolean;
  testID?: string;
}) {
  const turn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animating) return;

    const loop = Animated.loop(
      Animated.timing(turn, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [animating, turn]);

  const bladeWidth = Math.max(2, Math.round(size * 0.14));
  const bladeHeight = Math.round(size * 0.3);
  const radius = size / 2 - bladeHeight / 2;

  return (
    <Animated.View
      testID={testID}
      accessibilityRole="progressbar"
      style={{
        width: size,
        height: size,
        transform: [
          { rotate: turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
        ],
      }}
    >
      {Array.from({ length: BLADES }, (_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: (size - bladeWidth) / 2,
            top: (size - bladeHeight) / 2,
            width: bladeWidth,
            height: bladeHeight,
            borderRadius: bladeWidth / 2,
            backgroundColor: color,
            opacity: 0.2 + (i / BLADES) * 0.7,
            transform: [{ rotate: `${i * (360 / BLADES)}deg` }, { translateY: -radius }],
          }}
        />
      ))}
    </Animated.View>
  );
}
