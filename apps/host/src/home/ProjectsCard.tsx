import { Text, View } from 'react-native';

import { Card, SectionHeader, Skeleton } from '@sweep/ui';

/**
 * Home's Projects card. Empty until the Projects feature seeds the store; the rows themselves
 * are that feature's to add.
 */
export function ProjectsCard({ loading, onSeeAll }: { loading: boolean; onSeeAll: () => void }) {
  return (
    <Card testID="home.projects-card" className="p-[14px]">
      <SectionHeader
        title="Projects"
        actionLabel="See all"
        onAction={onSeeAll}
        actionTestID="home.projects-see-all"
      />
      {loading ? (
        <View testID="home.projects-skeleton" className="gap-3 py-6">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </View>
      ) : (
        <Text testID="home.projects-empty" className="py-8 text-center text-[15px] text-ink">
          There are no projects right now.
        </Text>
      )}
    </Card>
  );
}
