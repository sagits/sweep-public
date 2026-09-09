import { View } from 'react-native';

/**
 * Grey placeholder block for lists and cards while a mock resolver is in flight.
 *
 * ponytail: deliberately static. A pulsing skeleton would be an endless animation, and Detox
 * waits for animations to settle — every spec that mounts a list would have to drop
 * synchronization. Only the Quality center's permanent spinner pays that cost.
 */
export function Skeleton({
  className = '',
  testID,
}: {
  /** Size and shape, e.g. "h-4 w-32 rounded". */
  className?: string;
  testID?: string;
}) {
  return <View testID={testID} className={`rounded bg-skeleton ${className}`} />;
}
