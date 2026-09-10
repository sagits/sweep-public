import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

import { colors } from '../tokens';

/**
 * Eight spokes on a fade, decoded from `poc/screenshots/4/33-spinner.png`: measured against a
 * 120px render, a spoke is 17px wide and 43px long and the ring's inner edge sits 17.5px out,
 * which is `size * 0.142` by `size * 0.358` centred `size * 0.32` from the middle.
 *
 * The opacity ramp is the reference's own: four spokes sit flat at the tail and the last four
 * climb to the head, rather than fading evenly the whole way round. Index 0 is the top spoke and
 * the ramp runs clockwise, so the head leads the rotation.
 */
const SPOKES = [0.28, 0.28, 0.28, 0.28, 0.46, 0.56, 0.83, 1];

/** One turn. The reference reads as a slow spinner, and this is half the speed it used to be. */
const TURN_MS = 2000;

/**
 * The teal starburst the real app spins. Used for full-screen loads, in-button pending states
 * and anywhere else a mock resolver is still running.
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
        duration: TURN_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [animating, turn]);

  const spokeWidth = Math.max(2, Math.round(size * 0.142));
  const spokeLength = Math.round(size * 0.358);
  const radius = size / 2 - spokeLength / 2;

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
      {SPOKES.map((opacity, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: (size - spokeWidth) / 2,
            top: (size - spokeLength) / 2,
            width: spokeWidth,
            height: spokeLength,
            borderRadius: spokeWidth / 2,
            backgroundColor: color,
            opacity,
            transform: [{ rotate: `${i * (360 / SPOKES.length)}deg` }, { translateY: -radius }],
          }}
        />
      ))}
    </Animated.View>
  );
}
