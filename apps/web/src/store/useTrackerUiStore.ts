// apps/web/src/store/useTrackerUiStore.ts

import { create } from 'zustand'
import type { TrackerStatusFilter } from '../modules/trackers/types/tracker.types'

type TrackerUiStore = {
  status: TrackerStatusFilter

  setStatus: (status: TrackerStatusFilter) => void
}

export const useTrackerUiStore = create<TrackerUiStore>((set) => ({
  status: 'all',

  setStatus: (status) => set({ status }),
}))