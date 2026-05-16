// apps/web/src/store/useDashboardStore.ts

import { create } from 'zustand'

type DashboardHeatmapMonths = 6 | 12

interface DashboardStore {
  activityMonths: DashboardHeatmapMonths
  dailyInsightDismissed: boolean
  setActivityMonths: (months: DashboardHeatmapMonths) => void
  dismissDailyInsight: () => void
  restoreDailyInsight: () => void
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  activityMonths: 12,
  dailyInsightDismissed: false,

  setActivityMonths: (months) => {
    set({ activityMonths: months })
  },

  dismissDailyInsight: () => {
    set({ dailyInsightDismissed: true })
  },

  restoreDailyInsight: () => {
    set({ dailyInsightDismissed: false })
  },
}))