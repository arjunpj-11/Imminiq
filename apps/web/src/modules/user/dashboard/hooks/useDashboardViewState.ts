import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router';

import { STORAGE_KEYS } from '../../../../lib/storage/storage-keys';
import { safeSessionStorage } from '../../../../lib/storage/safe-storage';

export type DashboardHeatmapMonths = 6 | 12;

const DEFAULT_ACTIVITY_MONTHS: DashboardHeatmapMonths = 12;

function prefersCompactHeatmap() {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches;
}

function parseActivityMonths(value: string | null): DashboardHeatmapMonths {
  if (value === '6') return 6;
  if (value === '12') return 12;
  return prefersCompactHeatmap() ? 6 : DEFAULT_ACTIVITY_MONTHS;
}

export function useDashboardViewState() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activityMonths = parseActivityMonths(searchParams.get('months'));
  const [dailyInsightDismissed, setDailyInsightDismissed] = useState(
    () => safeSessionStorage.get(STORAGE_KEYS.dashboardInsightDismissed) === 'true'
  );

  const setActivityMonths = useCallback(
    (months: DashboardHeatmapMonths) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);

          if (months === DEFAULT_ACTIVITY_MONTHS && !prefersCompactHeatmap()) {
            next.delete('months');
          } else {
            next.set('months', String(months));
          }

          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const dismissDailyInsight = useCallback(() => {
    safeSessionStorage.set(STORAGE_KEYS.dashboardInsightDismissed, 'true');
    setDailyInsightDismissed(true);
  }, []);

  return {
    activityMonths,
    setActivityMonths,
    dailyInsightDismissed,
    dismissDailyInsight,
  };
}
