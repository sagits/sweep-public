import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { ScrollView, View } from 'react-native';

import { Screen } from '@sweep/ui';

import { CleanerSearchCard } from '@/home/CleanerSearchCard';
import { HomeHeader } from '@/home/HomeHeader';
import { NotificationsCard } from '@/home/NotificationsCard';
import { ProjectsCard } from '@/home/ProjectsCard';
import { PromoCard } from '@/home/PromoCard';
import { PromptCard } from '@/home/PromptCard';
import { QualityCenterCard } from '@/home/QualityCenterCard';
import { useRefreshControl } from '@/refresh';
import { useMarketplace } from '@/stores/useMarketplace';
import { useNotifications } from '@/stores/useNotifications';
import { useProjects } from '@/stores/useProjects';
import { usePromo } from '@/stores/usePromo';

export default function HomeScreen() {
  const router = useRouter();
  const notifications = useNotifications((state) => state.notifications);
  const notificationsLoading = useNotifications((state) => state.loading);
  const loadNotifications = useNotifications((state) => state.load);
  const projects = useProjects((state) => state.projects);
  const projectsLoading = useProjects((state) => state.loading);
  const loadProjects = useProjects((state) => state.load);
  const promoDismissed = usePromo((state) => state.dismissed);
  const dismissPromo = usePromo((state) => state.dismiss);
  const searches = useMarketplace((state) => state.searches);
  const searchesLoaded = useMarketplace((state) => state.loaded);
  const loadSearches = useMarketplace((state) => state.load);
  const reloadNotifications = useNotifications((state) => state.reload);
  const reloadProjects = useProjects((state) => state.reload);
  const reloadSearches = useMarketplace((state) => state.reload);

  // Home is three cards over three stores, so the gesture refreshes all three at once.
  const refresh = useCallback(
    () => Promise.all([reloadNotifications(), reloadProjects(), reloadSearches()]),
    [reloadNotifications, reloadProjects, reloadSearches],
  );

  useEffect(() => {
    void loadNotifications();
    void loadProjects();
    void loadSearches();
  }, [loadNotifications, loadProjects, loadSearches]);

  return (
    <Screen testID="screen.home" insetTop={false} surface>
      <HomeHeader
        unreadCount={notifications.length}
        showCreditPill={!promoDismissed}
        onOpenPayments={() => router.navigate('/payments')}
      />
      <ScrollView
        refreshControl={useRefreshControl(refresh, 'home.refresh')}
        testID="home.scroll"
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* The teal band runs behind these two, so they stay tight together. */}
        <View className="gap-2 px-2">
          {searchesLoaded && searches.length === 0 ? (
            <PromptCard
              title="Search for New Cleaners"
              subtitle="Search on our Marketplace for local, reliable cleaners"
              onPress={() => router.navigate('/marketplace')}
              testID="home.search-cleaners-card"
            />
          ) : (
            <CleanerSearchCard
              searches={searches}
              loading={!searchesLoaded}
              onSeeAll={() => router.navigate('/marketplace')}
              onOpenSearch={(id) => router.navigate(`/search/${id}`)}
              onFindCleaners={() => router.navigate('/search/new')}
            />
          )}
          <PromptCard
            title="Invite Current Teammates"
            subtitle="Work with your current teammates on Sweep"
            testID="home.invite-teammates-card"
          />
        </View>
        <View className="gap-[14px] px-2 pt-[14px]">
          {promoDismissed ? null : <PromoCard onDismiss={dismissPromo} />}
          <ProjectsCard
            projects={projects}
            loading={projectsLoading}
            onSeeAll={() => router.navigate('/projects')}
            onOpen={(project) =>
              router.navigate({ pathname: '/project/[id]', params: { id: project.id } })
            }
          />
          <NotificationsCard notifications={notifications} loading={notificationsLoading} />
          <QualityCenterCard />
        </View>
      </ScrollView>
    </Screen>
  );
}
