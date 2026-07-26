import type { ReactNode } from 'react';

import { AppPageSkeleton } from '../../components/feedback/RouteSkeleton';
import ErrorState from '../../components/feedback/ErrorState';
import { AppShellBoundary } from '../../components/layout/AppShell';
import PageContainer from '../../components/layout/PageContainer';
import type { FeatureKey } from '../../config/feature-availability';
import { useFeatureAvailability } from '../../hooks/useFeatureAvailability';
import FeatureUnavailablePage from '../../pages/FeatureUnavailablePage';

export function FeatureAvailabilityGate({
  feature,
  children,
}: {
  feature: FeatureKey | readonly FeatureKey[];
  children: ReactNode;
}) {
  const query = useFeatureAvailability();
  const requiredFeatures: readonly FeatureKey[] = typeof feature === 'string' ? [feature] : feature;

  if (!query.data && query.isPending) {
    return (
      <AppShellBoundary>
        <AppPageSkeleton label="Checking feature availability" />
      </AppShellBoundary>
    );
  }

  if (!query.data || query.isError) {
    return (
      <AppShellBoundary>
        <PageContainer>
          <ErrorState
            title="Availability could not be checked"
            error={query.error}
            onRetry={() => void query.refetch()}
          />
        </PageContainer>
      </AppShellBoundary>
    );
  }

  const pausedFeature = requiredFeatures.find((item) => !query.data[item]);
  if (pausedFeature) return <FeatureUnavailablePage feature={pausedFeature} />;

  return <>{children}</>;
}
