import { useCallback, useState } from 'react';
import { RefreshControl } from 'react-native';

import { colors } from '@sweep/ui';

/**
 * Pull-to-refresh for a screen's scroll view. Hands back the `refreshControl` element itself,
 * so a screen wires it in one line and the spinner colour stays in one place.
 *
 * The store's `reload` is deliberately not the guarded `load`: that one answers from the
 * in-flight promise and would make the gesture a no-op after the first fetch.
 */
export function useRefreshControl(reload: () => Promise<unknown>, testID?: string) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void Promise.resolve(reload()).finally(() => setRefreshing(false));
  }, [reload]);

  return (
    <RefreshControl
      testID={testID}
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={colors.primary}
      colors={[colors.primary]}
    />
  );
}
