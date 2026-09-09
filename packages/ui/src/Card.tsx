import type { ReactNode } from 'react';
import { View } from 'react-native';

import { shadow } from '../tokens';

/**
 * The white card every screen stacks: ~8px radius and the PRD's soft shadow. Cards separate
 * from the page by their shadow alone, so this is the only place that shadow is defined.
 */
export function Card({
  children,
  className = '',
  background = 'bg-surface',
  testID,
}: {
  children?: ReactNode;
  /** Layout classes. Set the fill through `background`, so two `bg-` classes never collide. */
  className?: string;
  background?: string;
  testID?: string;
}) {
  return (
    <View
      testID={testID}
      className={`overflow-hidden rounded-card ${background} ${className}`}
      style={shadow.card}
    >
      {children}
    </View>
  );
}
